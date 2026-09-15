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

export function sabrArmed() {
  return armed;
}
