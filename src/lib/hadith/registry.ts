/** Открытый корпус fawazahmed0/hadith-api (MIT). Текста, которого нет в источнике, здесь нет. */
export type HadithCategory = "primary" | "sunan" | "thematic";

export type HadithCollection = {
  id: string;
  nameAr: string;
  nameRu: string;
  authorAr: string;
  authorRu: string;
  category: HadithCategory;
  /** Коды изданий в API: rus, eng, ara, tur, … */
  locales: string[];
};

export const HADITH_COLLECTIONS: HadithCollection[] = [
  {
    id: "bukhari",
    nameAr: "صحيح البخاري",
    nameRu: "Сахих аль-Бухари",
    authorAr: "محمد بن إسماعيل البخاري",
    authorRu: "Мухаммад ибн Исмаил аль-Бухари",
    category: "primary",
    locales: ["ara", "eng", "rus", "tur", "urd", "fra", "ind", "ben", "tam"],
  },
  {
    id: "muslim",
    nameAr: "صحيح مسلم",
    nameRu: "Сахих Муслим",
    authorAr: "مسلم بن الحجاج",
    authorRu: "Муслим ибн аль-Хаджжадж",
    category: "primary",
    locales: ["ara", "eng", "rus", "tur", "urd", "fra", "ind", "ben", "tam"],
  },
  {
    id: "abudawud",
    nameAr: "سنن أبي داود",
    nameRu: "Сунан Абу Дауда",
    authorAr: "أبو داود السجستاني",
    authorRu: "Абу Дауд ас-Сиджистани",
    category: "sunan",
    locales: ["ara", "eng", "rus", "tur", "urd", "fra", "ind", "ben"],
  },
  {
    id: "tirmidhi",
    nameAr: "جامع الترمذي",
    nameRu: "Джами ат-Тирмизи",
    authorAr: "محمد بن عيسى الترمذي",
    authorRu: "Мухаммад ибн Иса ат-Тирмизи",
    category: "sunan",
    locales: ["ara", "eng", "tur", "urd", "ind", "ben"],
  },
  {
    id: "nasai",
    nameAr: "سنن النسائي",
    nameRu: "Сунан ан-Насаи",
    authorAr: "أحمد بن شعيب النسائي",
    authorRu: "Ахмад ибн Шуайб ан-Насаи",
    category: "sunan",
    locales: ["ara", "eng", "tur", "urd", "fra", "ind", "ben"],
  },
  {
    id: "ibnmajah",
    nameAr: "سنن ابن ماجه",
    nameRu: "Сунан Ибн Маджа",
    authorAr: "محمد بن يزيد ابن ماجه",
    authorRu: "Мухаммад ибн Язид Ибн Маджа",
    category: "sunan",
    locales: ["ara", "eng", "tur", "urd", "fra", "ind", "ben"],
  },
  {
    id: "malik",
    nameAr: "موطأ مالك",
    nameRu: "Муватта имама Малика",
    authorAr: "مالك بن أنس",
    authorRu: "Малик ибн Анас",
    category: "sunan",
    locales: ["ara", "eng", "tur", "urd", "fra", "ind", "ben"],
  },
  {
    id: "nawawi",
    nameAr: "الأربعون النووية",
    nameRu: "40 хадисов ан-Навави",
    authorAr: "يحيى بن شرف النووي",
    authorRu: "Яхья ибн Шараф ан-Навави",
    category: "thematic",
    locales: ["ara", "eng", "tur", "fra", "ben"],
  },
  {
    id: "qudsi",
    nameAr: "الأربعون القدسية",
    nameRu: "40 хадисов кудси",
    authorAr: "يحيى بن شرف النووي",
    authorRu: "Яхья ибн Шараф ан-Навави",
    category: "thematic",
    locales: ["ara", "eng", "fra"],
  },
  {
    id: "dehlawi",
    nameAr: "أربعون الشاه ولي الله",
    nameRu: "40 хадисов Шаха Валиуллаха",
    authorAr: "شاه ولي الله الدهلوي",
    authorRu: "Шах Валиуллах ад-Дехлеви",
    category: "thematic",
    locales: ["ara", "eng", "fra"],
  },
];

export function collectionById(id: string) {
  return HADITH_COLLECTIONS.find((c) => c.id === id) ?? null;
}
