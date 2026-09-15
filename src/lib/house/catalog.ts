import type { LucideIcon } from "lucide-react";
import {
  Badge,
  Bell,
  BookOpen,
  Building2,
  CalendarDays,
  GraduationCap,
  Headphones,
  HelpCircle,
  Landmark,
  Languages,
  Library,
  Lightbulb,
  MessagesSquare,
  Scale,
  ScrollText,
  Shield,
  Signpost,
  Sparkles,
} from "lucide-react";

export type HouseRoomId =
  | "names"
  | "nawawi"
  | "index"
  | "alphabet"
  | "quiz"
  | "dict"
  | "reminder"
  | "wisdom"
  | "calendar"
  | "recite"
  | "tajweed"
  | "books"
  | "mecca"
  | "madina";

export type HouseTile = {
  id: string;
  label: string;
  icon: LucideIcon;
  tab?: "zakat" | "quran" | "hisn" | "learn";
  room?: HouseRoomId;
  hisn?: true;
};

export const HOUSE_MAIN: HouseTile[] = [
  { id: "names", label: "Имена", icon: Badge, room: "names" },
  { id: "quran", label: "Коран", icon: BookOpen, tab: "quran" },
  { id: "hisn", label: "Крепость", icon: Shield, tab: "hisn", hisn: true },
  { id: "nawawi", label: "40 хадисов", icon: Landmark, room: "nawawi" },
  { id: "index", label: "Указатели", icon: Signpost, room: "index" },
  { id: "zakat", label: "Закят", icon: Scale, tab: "zakat" },
];

export const HOUSE_MORE: HouseTile[] = [
  { id: "alphabet", label: "Алфавит", icon: Languages, room: "alphabet" },
  { id: "quiz", label: "Викторина", icon: HelpCircle, room: "quiz" },
  { id: "dict", label: "Словарь", icon: MessagesSquare, room: "dict" },
  { id: "reminder", label: "Напоминание", icon: Bell, room: "reminder" },
  { id: "wisdom", label: "Мудрость", icon: Lightbulb, room: "wisdom" },
  { id: "calendar", label: "Календарь", icon: CalendarDays, room: "calendar" },
  { id: "recite", label: "Красивое чтение", icon: Headphones, room: "recite" },
  { id: "tajweed", label: "Таджвид", icon: Sparkles, room: "tajweed" },
  { id: "tafsir", label: "Тафсир", icon: ScrollText, tab: "quran" },
  { id: "books", label: "9 сборников", icon: Library, room: "books" },
  { id: "mecca", label: "Мекка", icon: Landmark, room: "mecca" },
  { id: "madina", label: "Медина", icon: Building2, room: "madina" },
  { id: "learn", label: "Учить", icon: GraduationCap, tab: "learn" },
];

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
