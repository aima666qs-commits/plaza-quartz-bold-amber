import { loadIpPlace, loadTimings, methodFromZone, type DayTimings } from "@/lib/salah/times.ts";

export type SalahBoot = {
  coords: { lat: number; lng: number } | null;
  net: boolean;
  day: DayTimings | null;
  err: string;
  phase: "" | "ask" | "calc";
};

const KEY = "mizan.salah.coords";
const PIN = "mizan.salah.pin";

let state: SalahBoot = { coords: null, net: false, day: null, err: "", phase: "" };
const listeners = new Set<() => void>();
let booted = false;

export function getSalahBoot() {
  return state;
}

export function subscribeSalah(fn: () => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function emit(patch: Partial<SalahBoot>) {
  state = { ...state, ...patch };
  listeners.forEach((fn) => fn());
}

function readPin(): { method: number; school: 0 | 1 } | null {
  try {
    const raw = localStorage.getItem(PIN);
    if (!raw) return null;
    const p = JSON.parse(raw) as { method?: number; school?: 0 | 1 };
    if (!p || !Number.isFinite(p.method)) return null;
    return { method: p.method as number, school: p.school === 1 ? 1 : 0 };
  } catch {
    return null;
  }
}

async function compute(lat: number, lng: number) {
  emit({ phase: "calc" });
  try {
    const pin = readPin();
    const first = await loadTimings(lat, lng, pin?.method ?? 3, pin?.school ?? 0);
    const picked = methodFromZone(first.timezone);
    if (pin || (picked.method === first.method && picked.school === first.school)) {
      emit({ day: first, phase: "", err: state.net ? "salah.net" : "" });
      return;
    }
    const exact = await loadTimings(lat, lng, picked.method, picked.school);
    emit({ day: exact, phase: "", err: state.net ? "salah.net" : "" });
  } catch {
    emit({ phase: "", err: "salah.down" });
  }
}

function onFix(lat: number, lng: number, net: boolean) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ lat, lng, net }));
  } catch {
    /* ignore */
  }
  emit({ coords: { lat, lng }, net, err: net ? "salah.net" : "", phase: "" });
  void compute(lat, lng);
}

function fromIp() {
  void loadIpPlace().then((p) => {
    if (p) onFix(p.lat, p.lng, true);
    else emit({ phase: "", err: state.coords ? "salah.net" : "salah.denied" });
  });
}

export function askSalah(high = true) {
  if (typeof navigator === "undefined" || !navigator.geolocation) {
    fromIp();
    return;
  }
  if (!state.day) emit({ phase: "ask", err: "" });
  navigator.geolocation.getCurrentPosition(
    (pos) => onFix(pos.coords.latitude, pos.coords.longitude, false),
    () => {
      navigator.geolocation.getCurrentPosition(
        (pos) => onFix(pos.coords.latitude, pos.coords.longitude, false),
        () => fromIp(),
        { enableHighAccuracy: false, timeout: 8000, maximumAge: 600000 },
      );
    },
    { enableHighAccuracy: high, timeout: high ? 12000 : 8000, maximumAge: high ? 0 : 120000 },
  );
}

export function bootSalah() {
  if (booted || typeof window === "undefined") return;
  booted = true;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const c = JSON.parse(raw) as { lat?: number; lng?: number; net?: boolean };
      if (Number.isFinite(c.lat) && Number.isFinite(c.lng)) {
        emit({ coords: { lat: c.lat as number, lng: c.lng as number }, net: Boolean(c.net) });
        void compute(c.lat as number, c.lng as number);
      }
    }
  } catch {
    /* ignore */
  }
  askSalah(true);
}

export function pinSalah(method: number, school: 0 | 1) {
  try {
    localStorage.setItem(PIN, JSON.stringify({ method, school }));
  } catch {
    /* ignore */
  }
  if (state.coords) void compute(state.coords.lat, state.coords.lng);
}
