export type Letter = {
  ar: string;
  name: string;
  nameAr: string;
  group: number;
  joins: boolean;
};

export const LETTERS: Letter[] = [
  { ar: "ا", name: "Алиф", nameAr: "أَلِف", group: 1, joins: false },
  { ar: "ب", name: "Ба", nameAr: "بَاء", group: 1, joins: true },
  { ar: "ت", name: "Та", nameAr: "تَاء", group: 1, joins: true },
  { ar: "ث", name: "Са", nameAr: "ثَاء", group: 1, joins: true },
  { ar: "ج", name: "Джим", nameAr: "جِيم", group: 2, joins: true },
  { ar: "ح", name: "Ха", nameAr: "حَاء", group: 2, joins: true },
  { ar: "خ", name: "Ха (тяжёлая)", nameAr: "خَاء", group: 2, joins: true },
  { ar: "د", name: "Даль", nameAr: "دَال", group: 2, joins: false },
  { ar: "ذ", name: "Заль", nameAr: "ذَال", group: 2, joins: false },
  { ar: "ر", name: "Ра", nameAr: "رَاء", group: 3, joins: false },
  { ar: "ز", name: "Зай", nameAr: "زَاي", group: 3, joins: false },
  { ar: "س", name: "Син", nameAr: "سِين", group: 3, joins: true },
  { ar: "ش", name: "Шин", nameAr: "شِين", group: 3, joins: true },
  { ar: "ص", name: "Сад", nameAr: "صَاد", group: 3, joins: true },
  { ar: "ض", name: "Дад", nameAr: "ضَاد", group: 4, joins: true },
  { ar: "ط", name: "Та (тяжёлая)", nameAr: "طَاء", group: 4, joins: true },
  { ar: "ظ", name: "За (тяжёлая)", nameAr: "ظَاء", group: 4, joins: true },
  { ar: "ع", name: "Айн", nameAr: "عَيْن", group: 4, joins: true },
  { ar: "غ", name: "Гайн", nameAr: "غَيْن", group: 4, joins: true },
  { ar: "ف", name: "Фа", nameAr: "فَاء", group: 5, joins: true },
  { ar: "ق", name: "Каф", nameAr: "قَاف", group: 5, joins: true },
  { ar: "ك", name: "Кяф", nameAr: "كَاف", group: 5, joins: true },
  { ar: "ل", name: "Лям", nameAr: "لَام", group: 5, joins: true },
  { ar: "م", name: "Мим", nameAr: "مِيم", group: 5, joins: true },
  { ar: "ن", name: "Нун", nameAr: "نُون", group: 6, joins: true },
  { ar: "ه", name: "Ха (лёгкая)", nameAr: "هَاء", group: 6, joins: true },
  { ar: "و", name: "Вав", nameAr: "وَاو", group: 6, joins: false },
  { ar: "ي", name: "Йа", nameAr: "يَاء", group: 6, joins: true },
];

export const HEAVY = new Set(["خ", "ص", "ض", "غ", "ط", "ق", "ظ"]);

export const HARAKAT = [
  { mark: "َ", name: "Фатха", sound: "а" },
  { mark: "ِ", name: "Кясра", sound: "и" },
  { mark: "ُ", name: "Дамма", sound: "у" },
  { mark: "ْ", name: "Сукун", sound: "стоп" },
  { mark: "ً", name: "Фатхатан", sound: "ан" },
  { mark: "ٍ", name: "Кясратан", sound: "ин" },
  { mark: "ٌ", name: "Дамматан", sound: "ун" },
  { mark: "ّ", name: "Шадда", sound: "удвоение" },
];

export const TAJWEED_CARDS = [
  {
    id: "izhar",
    title: "Изхар",
    rule: "Нун сакин / танвин + а, ħ, ʻ, h, ġ, hāʼ (ء ه ع ح غ خ) — буква читается ясно, без гунны.",
    example: "مِنْ خَوْفٍ",
  },
  {
    id: "idgham",
    title: "Идгам",
    rule: "Нун сакин / танвин + ي ر م ل و ن. С гунной: ي ن م و. Без гунны: ل ر.",
    example: "مِن رَّبِّهِمْ",
  },
  {
    id: "iqlab",
    title: "Икляб",
    rule: "Нун сакин / танвин + ب → звук переходит в мим с гунной.",
    example: "مِنۢ بَعْدِ",
  },
  {
    id: "ikhfa",
    title: "Ихфа",
    rule: "Нун сакин / танвин + остальные 15 букв — скрытие с гунной.",
    example: "إِنَّ الْإِنسَانَ",
  },
  {
    id: "qalqala",
    title: "Калькаля",
    rule: "ق ط ب ج د со сукуном — отскок. Кубра на вакфе.",
    example: "أَحَدٌ",
  },
  {
    id: "madd",
    title: "Мадд",
    rule: "Табиʻи 2 харфа. Муттасыль 4–5. Мунфасыль 4–5. Лязим 6. ʻАрид 2–4–6.",
    example: "الضَّآلِّينَ",
  },
  {
    id: "ghunna",
    title: "Гунна",
    rule: "Нун и мим с шаддой — 2 харфа носового звука.",
    example: "إِنَّ",
  },
  {
    id: "ra",
    title: "Ра: тафхим / таркик",
    rule: "Тафхим при фатхе и дамме, таркик при кясре. Исключения на вакфе по предшествующей.",
    example: "رَبِّ",
  },
];
