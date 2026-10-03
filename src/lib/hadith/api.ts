import type { Locale } from "@/lib/i18n/dict.ts";
import { collectionById } from "@/lib/hadith/registry.ts";
import sectionsIndex from "@/lib/hadith/sections.json";

const BASE =
  (import.meta.env.VITE_HADITH_API as string | undefined)?.replace(/\/$/, "") ||
  "https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1";

export const HADITH_SOURCE = {
  provider: "fawazahmed0/hadith-api",
  license: "MIT",
  base: BASE,
};

export type HadithGrade = { name: string; grade: string };

export type HadithRow = {
  hadithnumber: number;
  arabicnumber: number;
  text: string;
  grades?: HadithGrade[];
  reference?: { book: number; hadith: number };
};

export type SectionInfo = {
  id: number;
  name: string;
  first: number;
  last: number;
  arFirst: number;
  arLast: number;
};

export type Edition = {
  metadata: {
    name: string;
    sections: Record<string, string>;
    section_details?: Record<
      string,
      { hadithnumber_first: number; hadithnumber_last: number; arabicnumber_first: number; arabicnumber_last: number }
    >;
  };
  hadiths: HadithRow[];
};

const editionCache = new Map<string, Promise<Edition>>();
let infoPromise: Promise<Record<string, { metadata: Edition["metadata"] }>> | null = null;

const LOCALE_CODE: Record<Locale, string> = {
  ru: "rus",
  en: "eng",
  ar: "ara",
  tr: "tur",
  uz: "eng",
  tg: "eng",
  kk: "eng",
};

export function editionFor(collectionId: string, locale: Locale): { code: string; fallback: boolean; lang: string; mt: boolean } {
  const book = collectionById(collectionId);
  const want = LOCALE_CODE[locale] ?? "eng";
  const has = (code: string) => Boolean(book?.locales.includes(code));
  if (has(want)) return { code: `${want}-${collectionId}`, fallback: false, lang: want, mt: false };
  if (locale === "ru" && has("eng")) return { code: `eng-${collectionId}`, fallback: true, lang: "eng", mt: true };
  if (locale === "ar" || has("ara")) return { code: `ara-${collectionId}`, fallback: locale !== "ar", lang: "ara", mt: false };
  return { code: `ara-${collectionId}`, fallback: true, lang: "ara", mt: false };
}

export function langLabel(code: string) {
  if (code === "rus") return "русский";
  if (code === "eng") return "английский";
  if (code === "ara") return "арабский";
  if (code === "tur") return "турецкий";
  return code;
}

async function fetchJson<T>(path: string): Promise<T> {
  const r = await fetch(`${BASE}/${path}`);
  if (!r.ok) throw new Error(path);
  return (await r.json()) as T;
}

export function loadInfo() {
  infoPromise ??= fetchJson("info.json");
  return infoPromise;
}

export function loadEdition(code: string) {
  let hit = editionCache.get(code);
  if (!hit) {
    hit = fetchJson<Edition>(`editions/${code}.min.json`).catch((err) => {
      editionCache.delete(code);
      throw err;
    });
    editionCache.set(code, hit);
  }
  return hit;
}

export async function sectionsOf(collectionId: string): Promise<SectionInfo[]> {
  const rows = (sectionsIndex as Record<string, SectionInfo[]>)[collectionId] ?? [];
  return rows.filter((s) => s.name && s.last >= s.first);
}

export async function loadSection(code: string, sectionId: number): Promise<HadithRow[]> {
  const data = await fetchJson<{ hadiths?: HadithRow[] }>(`editions/${code}/sections/${sectionId}.min.json`);
  return (data.hadiths ?? []).filter((h) => h.text?.trim());
}

export async function loadOne(code: string, n: number): Promise<HadithRow | null> {
  const data = await fetchJson<{ hadiths?: HadithRow[] }>(`editions/${code}/${n}.min.json`);
  return data.hadiths?.find((h) => h.text?.trim()) ?? null;
}

export function hadithsIn(edition: Edition, sectionId: number) {
  return edition.hadiths.filter((h) => (h.reference?.book ?? 0) === sectionId && h.text?.trim());
}

export function findHadith(edition: Edition, n: number) {
  return edition.hadiths.find((h) => h.hadithnumber === n) ?? null;
}

/** Только для поиска. Арабский оригинал в данных не меняется. */
export function foldSearch(s: string) {
  return s
    .normalize("NFKD")
    .replace(/[\u064B-\u0652\u0670\u0640]/g, "")
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

export function rangeLabel(s: SectionInfo) {
  const a = fmtNum(s.arFirst || s.first);
  const b = fmtNum(s.arLast || s.last);
  if (!a && !b) return "";
  return a === b ? a : `${a}–${b}`;
}

function fmtNum(n: number) {
  if (!Number.isFinite(n) || n <= 0) return "";
  return String(Math.trunc(n));
}
