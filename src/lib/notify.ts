import { formatRef, loadAyah } from "@/lib/quran/mushaf.ts";
import { sabrDayKey, sabrOfDay } from "@/lib/quran/sabr.ts";

const SHOWN_KEY = "mizan.v1.sabrShown";
let timer: number | null = null;
let armed = false;
let firstTapBound = false;

export function notifySupported() {
  return typeof window !== "undefined" && "Notification" in window && "serviceWorker" in navigator;
}

export function nextSabrDate(hour: number, from = new Date()) {
  const next = new Date(from);
  next.setHours(hour, 0, 0, 0);
  if (next.getTime() <= from.getTime()) next.setDate(next.getDate() + 1);
  return next;
}

export function nextSabrLabel(hour: number) {
  const n = nextSabrDate(hour);
  const hh = String(n.getHours()).padStart(2, "0");
  const today = new Date();
  const same = n.getDate() === today.getDate() && n.getMonth() === today.getMonth();
  return `${same ? "сегодня" : "завтра"} ${hh}:00`;
}

export async function registerSw() {
  if (!notifySupported()) return null;
  try {
    return await navigator.serviceWorker.register("/sw.js", { scope: "/" });
  } catch {
    return null;
  }
}

export async function requestNotify(): Promise<NotificationPermission | "unsupported"> {
  if (!notifySupported()) return "unsupported";
  await registerSw();
  if (Notification.permission === "granted") return "granted";
  try {
    return await Notification.requestPermission();
  } catch {
    return Notification.permission;
  }
}

async function payload() {
  const ref = sabrOfDay();
  const ayah = await loadAyah(ref.surah, ref.ayah);
  const ru = (ayah?.ru ?? "").replace(/\s+/g, " ").trim();
  return {
    title: "Мизан · аят сабра на сегодня",
    options: {
      body: `${formatRef(ref.surah, ref.ayah)}. ${ru.slice(0, 180)}`,
      lang: "ru",
      tag: "mizan-sabr",
      data: { url: `/#quran/${ref.surah}/${ref.ayah}` },
    },
  };
}

function markShown() {
  try {
    localStorage.setItem(SHOWN_KEY, sabrDayKey());
  } catch {
    /* ignore */
  }
}

export function shownToday() {
  try {
    return localStorage.getItem(SHOWN_KEY) === sabrDayKey();
  } catch {
    return false;
  }
}

export async function showSabrNow() {
  if (!notifySupported() || Notification.permission !== "granted") return false;
  const p = await payload();
  const reg = await navigator.serviceWorker.ready.catch(() => null);
  if (reg) {
    await reg.showNotification(p.title, p.options);
    reg.active?.postMessage({ type: "SAVE_SABR", ...p });
  } else {
    new Notification(p.title, p.options);
  }
  markShown();
  return true;
}

function msUntilHour(hour: number) {
  return nextSabrDate(hour).getTime() - Date.now();
}

export function armSabrTimer(hour: number) {
  if (typeof window === "undefined") return;
  if (timer) window.clearTimeout(timer);
  if (!notifySupported() || Notification.permission !== "granted") return;
  const wait = shownToday() ? msUntilHour(hour) : 400;
  timer = window.setTimeout(() => {
    void showSabrNow().then(() => armSabrTimer(hour));
  }, wait);
}

function bindFirstTap(hour: number) {
  void hour;
}

export async function startSabrDaily(hour: number) {
  armed = true;
  await registerSw();
  if (!notifySupported()) return "unsupported" as const;
  if (Notification.permission === "granted") {
    armSabrTimer(hour);
    return "granted" as const;
  }
  return Notification.permission as NotificationPermission;
}

export async function bootNotify(enabled: boolean, hour: number) {
  if (!enabled) {
    armed = false;
    if (timer) window.clearTimeout(timer);
    return;
  }
  await startSabrDaily(hour);
}

const PREF_KEY = "mizan.v1.adhanPrefs";
const DONE_KEY = "mizan.v1.salahDone";

export type AdhanPref = { on: boolean; full: boolean; days: boolean[] };

function dayIndex(d: Date) {
  return (d.getDay() + 6) % 7;
}

export function readAdhanPrefs(): Record<string, AdhanPref> {
  try {
    const raw = localStorage.getItem(PREF_KEY);
    return raw ? (JSON.parse(raw) as Record<string, AdhanPref>) : {};
  } catch {
    return {};
  }
}

export function writeAdhanPref(name: string, pref: AdhanPref) {
  const all = readAdhanPrefs();
  all[name] = pref;
  localStorage.setItem(PREF_KEY, JSON.stringify(all));
}

export function adhanAllowed(name: string, when = new Date()) {
  const pref = readAdhanPrefs()[name];
  if (!pref) return true;
  if (!pref.on) return false;
  return pref.days[dayIndex(when)] !== false;
}

export function markPrayerDone(name: string) {
  const key = new Date().toISOString().slice(0, 10);
  let all: Record<string, string[]> = {};
  try {
    all = JSON.parse(localStorage.getItem(DONE_KEY) || "{}") as Record<string, string[]>;
  } catch {
    all = {};
  }
  const set = new Set(all[key] ?? []);
  set.add(name);
  all[key] = [...set];
  localStorage.setItem(DONE_KEY, JSON.stringify(all));
  return Object.keys(all).length;
}

export function prayerDays() {
  try {
    return Object.keys(JSON.parse(localStorage.getItem(DONE_KEY) || "{}") as object).length;
  } catch {
    return 0;
  }
}

const ADHAN = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"] as const;
const ADHAN_RU: Record<(typeof ADHAN)[number], string> = {
  Fajr: "Фаджр",
  Dhuhr: "Зухр",
  Asr: "Аср",
  Maghrib: "Магриб",
  Isha: "Иша",
};
let adhanTimers: number[] = [];

function tone() {
  const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctx) return;
  const ctx = new Ctx();
  [392, 494, 587, 494, 392].forEach((freq, i) => {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "sine";
    o.frequency.value = freq;
    const t0 = ctx.currentTime + i * 0.42;
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(0.07, t0 + 0.03);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.38);
    o.connect(g).connect(ctx.destination);
    o.start(t0);
    o.stop(t0 + 0.4);
  });
  window.setTimeout(() => void ctx.close(), 2800);
}

export async function playAdhan(name: string) {
  tone();
  if (!notifySupported() || Notification.permission !== "granted") return;
  const title = "Азан";
  const options = { body: name, tag: "mizan-adhan", lang: "ru" };
  const reg = await navigator.serviceWorker.ready.catch(() => null);
  if (reg) await reg.showNotification(title, options);
  else new Notification(title, options);
}

export function armAdhan(timings: Record<string, string>) {
  if (typeof window === "undefined") return;
  adhanTimers.forEach((id) => window.clearTimeout(id));
  adhanTimers = [];
  const now = new Date();
  for (const name of ADHAN) {
    const hm = timings[name];
    if (!hm || !hm.includes(":")) continue;
    const [h, m] = hm.split(":").map((n) => Number(n));
    if (!Number.isFinite(h) || !Number.isFinite(m)) continue;
    const when = new Date();
    when.setHours(h, m, 0, 0);
    const wait = when.getTime() - now.getTime();
    if (wait < 1500 || wait > 24 * 3600 * 1000) continue;
    if (!adhanAllowed(name, when)) continue;
    const id = window.setTimeout(() => {
      void playAdhan(ADHAN_RU[name]);
    }, wait);
    adhanTimers.push(id);
  }
}
