import namesJson from "@/lib/house/names.json";
import nawawiJson from "@/lib/house/nawawi.json";
import { NAWAWI_RU } from "@/lib/house/nawawi-ru.ts";
import type { Locale } from "@/lib/i18n/dict.ts";

export type AllahName = { n: number; ar: string; tr: string; en: string; ru: string };
export type NawawiHadith = {
  n: number;
  title: string;
  titleEn: string;
  ar: string;
  core: string;
  en: string;
  ru: string;
  ref: string;
  refRu: string;
};
export type HadithPaper = "mushaf" | "folio" | "night" | "vellum";
export type HadithArFont = "naskh" | "amiri" | "kufi" | "scheherazade";
export type HadithMeanFont = "literata" | "fraunces" | "newsreader" | "plex";

export const NAMES_META = namesJson as { source: string; count: number; items: AllahName[] };
export const NAMES = NAMES_META.items;

type RawHadith = { n: number; title: string; ar: string; en: string; ru?: string; ref: string };

function cleanAr(s: string) {
  return s
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/‫‬/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

const rawItems = (nawawiJson as { items: RawHadith[] }).items;

export const NAWAWI: NawawiHadith[] = rawItems.map((h) => {
  const extra = NAWAWI_RU[h.n];
  return {
    n: h.n,
    title: h.title,
    titleEn: extra?.titleEn ?? h.title,
    ar: cleanAr(h.ar),
    core: extra?.core ?? cleanAr(h.ar).slice(0, 80),
    en: h.en,
    ru: extra?.ru ?? h.ru ?? h.title,
    ref: h.ref,
    refRu: extra?.refRu ?? h.ref,
  };
});

export function nawawiSource(locale: Locale): string {
  if (locale === "en") return "Forty Hadith of Imam an-Nawawi. The English meaning is for study, not a legal ruling.";
  if (locale === "ar") return "الأربعون النووية. المتن العربي من الروايات المشهورة.";
  return "Сорок хадисов имама ан-Навави. Русский смысл учебный, не выдаётся за канон.";
}

export function hadithTitle(h: NawawiHadith, locale: Locale): string {
  if (locale === "en") return h.titleEn;
  if (locale === "ar") return `الحديث ${h.n}`;
  return h.title;
}

export function hadithMeaning(h: NawawiHadith, locale: Locale): string {
  if (locale === "en") return h.en;
  if (locale === "ar") return "";
  return h.ru;
}

export function hadithRef(h: NawawiHadith, locale: Locale): string {
  if (locale === "en") return h.ref.replace(/^sunnah\.com\/nawawi40:/, "an-Nawawi ");
  if (locale === "ar") return `النووي ${h.n}`;
  return h.refRu;
}

export function speakLang(locale: Locale): string {
  if (locale === "en") return "en-US";
  if (locale === "ar") return "ar-SA";
  if (locale === "tr") return "tr-TR";
  return "ru-RU";
}

export function hadithOfDay(): NawawiHadith {
  return NAWAWI[dayIndex(NAWAWI.length)] ?? NAWAWI[0];
}

export function hijriLabel(d = new Date(), locale: Locale = "ru"): { hijri: string; greg: string } {
  const tag = locale === "ar" ? "ar-SA" : locale === "en" ? "en-GB" : locale === "tr" ? "tr-TR" : "ru-RU";
  const hijri = new Intl.DateTimeFormat(`${tag}-u-ca-islamic-umalqura`, {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
  const greg = new Intl.DateTimeFormat(tag, { day: "numeric", month: "long", year: "numeric" }).format(d);
  return { hijri, greg };
}

export function dayIndex(mod: number): number {
  const start = Date.UTC(2024, 0, 1);
  const now = Date.now();
  const days = Math.floor((now - start) / 86400000);
  return ((days % mod) + mod) % mod;
}
