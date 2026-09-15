export type MushafFontId = "uthmani" | "naskh" | "amiri" | "indopak" | "lateef" | "kufi" | "ruqaa";

export const MUSHAF_FONTS: { id: MushafFontId; ru: string; ar: string }[] = [
  { id: "uthmani", ru: "Усмани", ar: "عثماني" },
  { id: "naskh", ru: "Насх", ar: "نسخ" },
  { id: "amiri", ru: "Амири", ar: "أميري" },
  { id: "indopak", ru: "Индопак", ar: "نستعليق" },
  { id: "lateef", ru: "Латыф", ar: "لطيف" },
  { id: "kufi", ru: "Куфи", ar: "كوفي" },
  { id: "ruqaa", ru: "Рукъа", ar: "رقعة" },
];
