import type { HisnChapter, HisnDua } from "@/lib/hisn/types.ts";
import type { Locale } from "@/lib/i18n/dict.ts";

const MEM_FAIL = /MYMEMORY|WARNING: YOU USED ALL|USAGE LIMITS/i;

export function looksForeignFor(locale: Locale, text: string): boolean {
  if (!text || MEM_FAIL.test(text)) return true;
  const latin = (text.match(/[A-Za-z]/g) || []).length;
  const cyr = (text.match(/[А-Яа-яЁёІіҒғҚқҢңҮүҰұҺһӮӯҶҷҲҳ]/g) || []).length;
  const arab = (text.match(/[\u0600-\u06FF]/g) || []).length;
  if (locale === "en") return false;
  if (locale === "ar") return latin > 8 && latin > arab;
  if (locale === "tr" || locale === "uz") {
    if (MEM_FAIL.test(text)) return true;
    return latin > 40 && /the |and |you |what to say/i.test(text);
  }
  return latin >= 8 && latin > cyr;
}

function clean(text: string): string {
  return text.replace(/^Смысл:\s*/i, "").replace(/\s+/g, " ").trim();
}

export function chapterTitle(chapter: HisnChapter, locale: Locale): string {
  if (locale === "en") return chapter.titleEn;
  if (locale === "ar") return "";
  if (locale === "tr") {
    const tr = chapter.titleTr ?? "";
    if (tr && !looksForeignFor("tr", tr)) return tr;
    return chapter.titleRu ?? "";
  }
  const ru = chapter.titleRu ?? "";
  if (ru && !looksForeignFor("ru", ru)) return ru;
  return "";
}

export function duaMeaning(dua: HisnDua, locale: Locale): string {
  if (locale === "en") return clean(dua.en || "");
  if (locale === "ar") return "";
  if (locale === "tr") {
    const tr = clean(dua.tr || "");
    if (tr && !looksForeignFor("tr", tr)) return tr;
    const ru = clean(dua.ru || "");
    if (ru && !looksForeignFor("ru", ru)) return ru;
    return "";
  }
  const ru = clean(dua.ru || "");
  if (ru && !looksForeignFor("ru", ru)) return ru;
  return "";
}
