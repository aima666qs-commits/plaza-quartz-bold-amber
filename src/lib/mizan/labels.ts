import type { CategoryStatus, NisabMode, ReviewStatus, SourceType } from "./types.ts";

export const STATUS_RU: Record<CategoryStatus, string> = {
  not_entered: "не указано",
  incomplete: "не хватает данных",
  below_nisab: "ниже нисаба",
  due: "к уплате",
  exempt: "не входит",
  not_applicable: "не считается",
  unverified_rule: "правило не проверено",
};

export const OVERALL_RU: Record<string, string> = {
  due: "Нужно заплатить",
  mixed: "Часть посчитана, часть ещё нет",
  incomplete: "Не хватает данных — закят пока не считаем",
  not_due_confirmed: "Не подпадает под закят",
};

export const NISAB_MODE_RU: Record<NisabMode, string> = {
  gold: "по золоту",
  silver: "по серебру",
  lower: "по меньшему из двух",
  higher: "по большему из двух",
  separate: "золото и серебро раздельно",
};

export const SOURCE_TYPE_RU: Record<SourceType, string> = {
  quran: "Коран",
  hadith: "хадис",
  fiqh: "фикх",
  institutional: "страница организации",
  market: "рынок",
  metrology: "меры веса",
  math: "расчёт",
};

export const REVIEW_RU: Record<ReviewStatus, string> = {
  primary_text_checked: "первоисточник сверен",
  translation_checked: "перевод сверен",
  institutional_page_checked: "публичная страница сверена",
  unverified: "не сверено",
  scholar_review_absent: "рецензии учёного нет",
};

export const RECIPIENTS = [
  { ar: "الفقراء", ru: "Бедные (фукараʾ)" },
  { ar: "المساкин", ru: "Нищие (масакин)" },
  { ar: "العاملين عليها", ru: "Работающие со сбором" },
  { ar: "المؤلفة قلوبهم", ru: "Те, чьи сердца хотят привлечь" },
  { ar: "في الرقاب", ru: "Выкуп рабов / неволи" },
  { ar: "الغارمين", ru: "Должники" },
  { ar: "في سبيل الله", ru: "На пути Аллаха" },
  { ar: "ابن السبيل", ru: "Путник" },
] as const;
