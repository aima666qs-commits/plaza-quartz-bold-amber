export type { HouseRoomId, HouseTile } from "@/lib/nav/catalog.ts";
export { HOUSE_MAIN, HOUSE_MORE } from "@/lib/nav/catalog.ts";

export const HADITH_BOOKS = [
  { id: "bukhari", ar: "صحيح البخاري", ru: "Сахих аль-Бухари", href: "https://sunnah.com/bukhari" },
  { id: "muslim", ar: "صحيح مسلم", ru: "Сахих Муслим", href: "https://sunnah.com/muslim" },
  { id: "abudawud", ar: "سنن أبي داود", ru: "Сунан Абу Дауд", href: "https://sunnah.com/abudawud" },
  { id: "tirmidhi", ar: "جامع الترمذي", ru: "Джами ат-Тирмизи", href: "https://sunnah.com/tirmidhi" },
  { id: "nasai", ar: "سنن النسائي", ru: "Сунан ан-Насаи", href: "https://sunnah.com/nasai" },
  { id: "ibnmajah", ar: "سنن ابن ماجه", ru: "Сунан Ибн Маджа", href: "https://sunnah.com/ibnmajah" },
  { id: "malik", ar: "موطأ مالك", ru: "Муватта Малик", href: "https://sunnah.com/malik" },
  { id: "ahmad", ar: "مسند أحمد", ru: "Муснад Ахмад", href: "https://sunnah.com/ahmad" },
  { id: "darimi", ar: "سنن الدارمي", ru: "Сунан ад-Дарими", href: "https://sunnah.com/darimi" },
] as const;

export const DICT = [
  { ar: "ٱللَّه", ru: "Аллах", note: "Имя Бога в Коране" },
  { ar: "رَبّ", ru: "Господь", note: "Господин, воспитатель" },
  { ar: "رَحْمَٰن", ru: "Милостивый", note: "аль-Фатиха 1:1" },
  { ar: "رَحِيم", ru: "Милосердный", note: "аль-Фатиха 1:1" },
  { ar: "صِرَاط", ru: "Путь", note: "аль-Фатиха 1:6" },
  { ar: "نِعْمَة", ru: "Благо", note: "аль-Фатиха 1:7" },
  { ar: "إِيمَان", ru: "Вера", note: "корень أ م ن" },
  { ar: "صَلَاة", ru: "Молитва", note: "столп ислама" },
  { ar: "زَكَاة", ru: "Закят", note: "очищение имущества" },
  { ar: "صَوْم", ru: "Пост", note: "столп ислама" },
  { ar: "حَجّ", ru: "Хадж", note: "столп ислама" },
  { ar: "تَوْحِيد", ru: "Единобожие", note: "основа религии" },
] as const;
