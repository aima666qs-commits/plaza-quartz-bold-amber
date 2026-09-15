import type { Locale } from "@/lib/i18n/dict.ts";

/** Grade as given in the Forty themselves (Bukhari/Muslim vs. the compiler’s hasan notes). Not a new hukm. */
export type HadithGrade = "sahih" | "hasan_sahih" | "hasan";

const HASAN = new Set([12, 18, 30, 31, 32, 33, 39, 41]);
const HASAN_SAHIH = new Set([11, 19, 28, 29, 42]);

export function hadithGrade(n: number): HadithGrade {
  if (HASAN.has(n)) return "hasan";
  if (HASAN_SAHIH.has(n)) return "hasan_sahih";
  return "sahih";
}

export function isSahih(n: number) {
  return hadithGrade(n) === "sahih";
}

export function gradeLabel(n: number, locale: Locale): string {
  const g = hadithGrade(n);
  if (locale === "ar") {
    if (g === "sahih") return "صحيح";
    if (g === "hasan_sahih") return "حسن صحيح";
    return "حسن";
  }
  if (locale === "en") {
    if (g === "sahih") return "sahih";
    if (g === "hasan_sahih") return "hasan sahih";
    return "hasan";
  }
  if (g === "sahih") return "сахих";
  if (g === "hasan_sahih") return "хасан сахих";
  return "хасан";
}

export function gradeNote(n: number, locale: Locale): string {
  const g = hadithGrade(n);
  if (locale === "en") {
    if (g === "sahih") return "In al-Bukhari and/or Muslim, as cited in the Forty.";
    if (g === "hasan_sahih") return "at-Tirmidhi: hasan sahih, as cited in the Forty.";
    if (n === 41) return "an-Nawawi: sahih chain in al-Hujjah. Not in the two Sahihs.";
    return "Graded hasan in the Forty (Tirmidhi, Ibn Majah or others).";
  }
  if (g === "sahih") return "В «Сахихе» аль-Бухари и/или Муслима — так в сорока ан-Навави.";
  if (g === "hasan_sahih") return "ат-Тирмизи: хасан сахих — так в сорока ан-Навави.";
  if (n === 41) return "Ан-Навави: достоверная цепь в «аль-Худжже». В двух «Сахихах» нет.";
  return "В сорока ан-Навави отмечен как хасан (ат-Тирмизи, Ибн Маджа или другие).";
}
