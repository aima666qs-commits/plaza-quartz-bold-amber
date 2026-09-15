import namesJson from "@/lib/house/names.json";
import nawawiJson from "@/lib/house/nawawi.json";
import { NAWAWI_RU } from "@/lib/house/nawawi-ru.ts";
import { hadithGrade, isSahih } from "@/lib/house/nawawi-grade.ts";
import type { Locale } from "@/lib/i18n/dict.ts";
import { markSalawat } from "@/lib/voice/adab.ts";

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

export const NAWAWI_SAHIH = NAWAWI.filter((h) => isSahih(h.n));

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

export function hadithAr(h: NawawiHadith): string {
  return markSalawat(h.ar, "ar");
}

export function hadithMeaning(h: NawawiHadith, locale: Locale): string {
  if (locale === "en") return markSalawat(h.en, "en");
  if (locale === "ar") return "";
  return markSalawat(h.ru, "ru");
}

export function hadithRef(h: NawawiHadith, locale: Locale): string {
  if (locale === "en") return h.ref.replace(/^sunnah\.com\/nawawi40:/, "an-Nawawi ");
  if (locale === "ar") return `النووي ${h.n}`;
  return h.refRu;
}

export type HadithChain = {
  narrator: string;
  narratorAr: string;
  prophet: string;
  books: string;
  collection: string;
  gradeKey: number;
};

export function hadithChain(h: NawawiHadith, locale: Locale): HadithChain {
  const ruMatch = h.ru.match(/со слов\s+(.+?)(?=\s*,\s*да будет|\s*:\s|\s+я слышал|\s+что\s)/i);
  let narrator = (ruMatch?.[1] ?? "").replace(/\s+/g, " ").trim();
  if (!narrator) narrator = h.refRu;
  const arMatch = h.ar.match(/عَنْ[\s\u00a0]+(.+?)[\s\u00a0]+(?:رَضِيَ|قَالَ)/);
  const narratorAr = (arMatch?.[1] ?? "").replace(/\s+/g, " ").trim();
  const books =
    locale === "ar"
      ? h.ar.match(/رَوَاهُ[\s\S]{0,180}/)?.[0]?.replace(/\s+/g, " ").trim() || h.ref
      : h.refRu;
  const collection =
    locale === "ar" ? `الأربعون النووية، الحديث ${h.n}` : locale === "en" ? `an-Nawawi, hadith ${h.n}` : `ан-Навави, хадис ${h.n}`;
  const prophet = locale === "ar" ? "رسول الله ﷺ" : locale === "en" ? "the Messenger of Allah ﷺ" : "Посланник Аллаха ﷺ";
  return { narrator, narratorAr, prophet, books, collection, gradeKey: h.n };
}

export function speakLang(locale: Locale): string {
  if (locale === "en") return "en-US";
  if (locale === "ar") return "ar-SA";
  if (locale === "tr") return "tr-TR";
  return "ru-RU";
}

export function hadithOfDay(): NawawiHadith {
  const pool = NAWAWI_SAHIH.length ? NAWAWI_SAHIH : NAWAWI;
  return pool[dayIndex(pool.length)] ?? pool[0];
}

export function hijriLabel(d = new Date(), locale: Locale = "ru"): { hijri: string; greg: string } {
  const gregTag = locale === "ar" ? "ar-SA" : locale === "en" ? "en-GB" : locale === "tr" ? "tr-TR" : "ru-RU";
  const greg = new Intl.DateTimeFormat(gregTag, { day: "numeric", month: "long", year: "numeric" }).format(d);
  let day = 1;
  let month = 1;
  let year = 1447;
  try {
    const parts = new Intl.DateTimeFormat("en-u-ca-islamic-umalqura", {
      day: "numeric",
      month: "numeric",
      year: "numeric",
    }).formatToParts(d);
    day = Number(parts.find((p) => p.type === "day")?.value) || day;
    month = Number(parts.find((p) => p.type === "month")?.value) || month;
    year = Number(parts.find((p) => p.type === "year")?.value) || year;
  } catch {
    /* keep defaults */
  }
  const months =
    locale === "ar"
      ? ["محرم", "صفر", "ربيع الأول", "ربيع الآخر", "جمادى الأولى", "جمادى الآخرة", "رجب", "شعبان", "رمضان", "شوال", "ذو القعدة", "ذو الحجة"]
      : locale === "en"
        ? ["Muharram", "Safar", "Rabiʿ I", "Rabiʿ II", "Jumada I", "Jumada II", "Rajab", "Shaʿban", "Ramadan", "Shawwal", "Dhu al-Qaʿda", "Dhu al-Hijja"]
        : locale === "tr"
          ? ["Muharrem", "Safer", "Rebiülevvel", "Rebiülahir", "Cemaziyelevvel", "Cemaziyelahir", "Recep", "Şaban", "Ramazan", "Şevval", "Zilkade", "Zilhicce"]
          : ["мухаррам", "сафар", "рабиʿ I", "рабиʿ II", "джумада I", "джумада II", "раджаб", "шаʿбан", "рамадан", "шавваль", "зуль-каʿда", "зуль-хиджжа"];
  const monthName = months[Math.min(11, Math.max(0, month - 1))] ?? months[0];
  const hijri =
    locale === "ar" ? `${day} ${monthName} ${year} هـ` : locale === "en" ? `${day} ${monthName} ${year} AH` : `${day} ${monthName} ${year} г. х.`;
  return { hijri, greg };
}

export function dayIndex(mod: number): number {
  const start = Date.UTC(2024, 0, 1);
  const now = Date.now();
  const days = Math.floor((now - start) / 86400000);
  return ((days % mod) + mod) % mod;
}

export { hadithGrade, isSahih };
