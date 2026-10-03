const KAABA = { lat: 21.422487, lng: 39.826206 };

export type SalahMethod = { method: number; school: 0 | 1; label: string; key: string };

export const SALAH_METHODS: SalahMethod[] = [
  { method: 5, school: 0, label: "Египет", key: "salah.m.egypt" },
  { method: 4, school: 0, label: "Мекка, Умм аль-Кура", key: "salah.m.mecca" },
  { method: 14, school: 1, label: "Россия", key: "salah.m.russia" },
  { method: 13, school: 1, label: "Турция", key: "salah.m.turkey" },
  { method: 3, school: 1, label: "Лига исламского мира", key: "salah.m.mwl" },
  { method: 3, school: 0, label: "Лига, шафиитский аср", key: "salah.m.league" },
];

export type PrayerName = "Fajr" | "Sunrise" | "Dhuhr" | "Asr" | "Maghrib" | "Isha";

export type DayTimings = {
  date: string;
  timezone: string;
  methodName: string;
  method: number;
  school: 0 | 1;
  timings: Record<PrayerName, string>;
};

const NAMES: { id: PrayerName; ru: string }[] = [
  { id: "Fajr", ru: "Фаджр" },
  { id: "Sunrise", ru: "Восход" },
  { id: "Dhuhr", ru: "Зухр" },
  { id: "Asr", ru: "Аср" },
  { id: "Maghrib", ru: "Магриб" },
  { id: "Isha", ru: "Иша" },
];

export const PRAYER_LABELS = NAMES;

export function qiblaBearing(lat: number, lng: number) {
  const φ1 = (lat * Math.PI) / 180;
  const φ2 = (KAABA.lat * Math.PI) / 180;
  const Δλ = ((KAABA.lng - lng) * Math.PI) / 180;
  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

export function methodFromZone(tz: string): Pick<SalahMethod, "method" | "school"> {
  if (/Cairo/.test(tz)) return { method: 5, school: 0 };
  if (/Riyadh|Makkah|Mecca|Qatar|Kuwait|Bahrain|Aden/.test(tz)) return { method: 4, school: 0 };
  if (/Istanbul/.test(tz)) return { method: 13, school: 1 };
  if (/Moscow|Samara|Yekaterinburg|Omsk|Novosibirsk|Krasnoyarsk|Irkutsk|Yakutsk|Vladivostok|Kaliningrad/.test(tz)) return { method: 14, school: 1 };
  if (/Almaty|Aqtobe|Aqtau|Qyzylorda|Oral|Astana|Qostanay/.test(tz)) return { method: 3, school: 1 };
  if (/Tashkent|Samarkand/.test(tz)) return { method: 3, school: 1 };
  if (/Dushanbe/.test(tz)) return { method: 3, school: 1 };
  return { method: 3, school: 0 };
}

export async function loadIpPlace(): Promise<{ lat: number; lng: number } | null> {
  try {
    const r = await fetch("https://get.geojs.io/v1/ip/geo.json");
    if (!r.ok) return null;
    const j = (await r.json()) as { latitude?: string; longitude?: string };
    const lat = Number(j.latitude);
    const lng = Number(j.longitude);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
    return { lat, lng };
  } catch {
    return null;
  }
}

function clean(t: string) {
  return t.split(" ")[0] ?? t;
}

export async function loadTimings(lat: number, lng: number, method: number, school: 0 | 1): Promise<DayTimings> {
  const url = `https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lng}&method=${method}&school=${school}`;
  const r = await fetch(url);
  if (!r.ok) throw new Error("salah");
  const body = (await r.json()) as {
    data?: {
      timings?: Record<string, string>;
      date?: { readable?: string };
      meta?: { timezone?: string; method?: { name?: string; id?: number } };
    };
  };
  const t = body.data?.timings;
  if (!t?.Fajr || !t.Dhuhr || !t.Asr || !t.Maghrib || !t.Isha) throw new Error("salah");
  return {
    date: body.data?.date?.readable ?? "",
    timezone: body.data?.meta?.timezone ?? "",
    methodName: body.data?.meta?.method?.name ?? "",
    method,
    school,
    timings: {
      Fajr: clean(t.Fajr),
      Sunrise: clean(t.Sunrise ?? ""),
      Dhuhr: clean(t.Dhuhr),
      Asr: clean(t.Asr),
      Maghrib: clean(t.Maghrib),
      Isha: clean(t.Isha),
    },
  };
}

export function nextPrayer(timings: Record<PrayerName, string>, now = new Date()) {
  const cur = now.getHours() * 60 + now.getMinutes();
  const order: PrayerName[] = ["Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha"];
  for (const id of order) {
    const [h, m] = timings[id].split(":").map(Number);
    if (!Number.isFinite(h) || !Number.isFinite(m)) continue;
    if (h * 60 + m > cur) return id;
  }
  return "Fajr" as const;
}
