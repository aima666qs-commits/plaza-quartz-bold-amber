import type { LucideIcon } from "lucide-react";
import {
  Badge,
  Bell,
  BookMarked,
  BookOpen,
  Bookmark,
  Building2,
  CalendarDays,
  CircleDot,
  Clock,
  Compass,
  Download,
  GraduationCap,
  Headphones,
  HelpCircle,
  Home,
  Landmark,
  Languages,
  LayoutGrid,
  Library,
  Lightbulb,
  MessagesSquare,
  Scale,
  ScrollText,
  Settings,
  Shield,
  Signpost,
  Sparkles,
  UserRound,
  Wallet,
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
  | "madina"
  | "tasbih";

export type NavGroup = "today" | "scripture" | "wealth" | "more";

export type NavItem = {
  id: string;
  labelKey: string;
  icon: LucideIcon;
  group: NavGroup;
  tileLabel?: string;
  tab?: "home" | "zakat" | "quran" | "hisn" | "learn" | "namaz" | "finance";
  room?: HouseRoomId;
  hisn?: true;
  home?: "main" | "more";
};

export type HouseTile = {
  id: string;
  label: string;
  icon: LucideIcon;
  tab?: "zakat" | "quran" | "hisn" | "learn" | "namaz" | "finance";
  room?: HouseRoomId;
  hisn?: true;
};

export const NAV_CATALOG: NavItem[] = [
  { id: "home", labelKey: "nav.home", icon: Home, group: "today", tab: "home" },
  { id: "namaz", labelKey: "nav.namaz", icon: Clock, group: "today", tab: "namaz" },
  { id: "qibla", labelKey: "nav.qibla", icon: Compass, group: "today" },
  { id: "tasbih", labelKey: "nav.tasbih", icon: CircleDot, group: "today", room: "tasbih", home: "more", tileLabel: "Тасбих" },

  { id: "quran", labelKey: "nav.quran", icon: BookOpen, group: "scripture", tab: "quran", home: "main", tileLabel: "Коран" },
  { id: "hisn", labelKey: "nav.hisn", icon: Shield, group: "scripture", tab: "hisn", hisn: true, home: "main", tileLabel: "Крепость" },
  { id: "hadith", labelKey: "nav.hadith", icon: Library, group: "scripture" },
  { id: "learn", labelKey: "nav.learn", icon: GraduationCap, group: "scripture", tab: "learn", home: "more", tileLabel: "Учить" },
  { id: "nawawi", labelKey: "tile.nawawi", icon: Landmark, group: "more", room: "nawawi", home: "main", tileLabel: "40 хадисов" },
  { id: "books", labelKey: "tile.books", icon: BookMarked, group: "more", room: "books", home: "more", tileLabel: "9 сборников" },
  { id: "tafsir", labelKey: "tile.tafsir", icon: ScrollText, group: "more", tab: "quran", home: "more", tileLabel: "Тафсир" },

  { id: "zakat", labelKey: "nav.zakat", icon: Scale, group: "wealth", tab: "zakat", home: "main", tileLabel: "Закят" },
  { id: "finance", labelKey: "nav.finance", icon: Wallet, group: "wealth", tab: "finance" },

  { id: "names", labelKey: "tile.names", icon: Badge, group: "more", room: "names", home: "main", tileLabel: "Имена" },
  { id: "index", labelKey: "tile.index", icon: Signpost, group: "more", room: "index", home: "main", tileLabel: "Указатели" },
  { id: "alphabet", labelKey: "tile.alphabet", icon: Languages, group: "more", room: "alphabet", home: "more", tileLabel: "Алфавит" },
  { id: "quiz", labelKey: "tile.quiz", icon: HelpCircle, group: "more", room: "quiz", home: "more", tileLabel: "Викторина" },
  { id: "dict", labelKey: "tile.dict", icon: MessagesSquare, group: "more", room: "dict", home: "more", tileLabel: "Словарь" },
  { id: "reminder", labelKey: "tile.reminder", icon: Bell, group: "more", room: "reminder", home: "more", tileLabel: "Напоминание" },
  { id: "wisdom", labelKey: "tile.wisdom", icon: Lightbulb, group: "more", room: "wisdom", home: "more", tileLabel: "Мудрость" },
  { id: "calendar", labelKey: "tile.calendar", icon: CalendarDays, group: "more", room: "calendar", home: "more", tileLabel: "Календарь" },
  { id: "recite", labelKey: "tile.recite", icon: Headphones, group: "more", room: "recite", home: "more", tileLabel: "Красивое чтение" },
  { id: "tajweed", labelKey: "tile.tajweed", icon: Sparkles, group: "more", room: "tajweed", home: "more", tileLabel: "Таджвид" },
  { id: "mecca", labelKey: "tile.mecca", icon: Landmark, group: "more", room: "mecca", home: "more", tileLabel: "Мекка" },
  { id: "madina", labelKey: "tile.madina", icon: Building2, group: "more", room: "madina", home: "more", tileLabel: "Медина" },
  { id: "bookmarks", labelKey: "nav.bookmarks", icon: Bookmark, group: "more" },
  { id: "cabinet", labelKey: "nav.cabinet", icon: UserRound, group: "more" },
  { id: "settings", labelKey: "settings", icon: Settings, group: "more" },
  { id: "install", labelKey: "nav.install", icon: Download, group: "more" },
];

export const NAV_BY_ID: Record<string, NavItem> = Object.fromEntries(NAV_CATALOG.map((item) => [item.id, item]));

export const PRIMARY_IDS = ["home", "namaz", "quran", "hadith", "zakat"] as const;

export const OVERFLOW_IDS = [
  "hisn",
  "learn",
  "qibla",
  "tasbih",
  "finance",
  "nawawi",
  "books",
  "names",
  "dict",
  "tajweed",
  "tafsir",
  "mecca",
  "madina",
  "index",
  "alphabet",
  "quiz",
  "reminder",
  "wisdom",
  "calendar",
  "recite",
  "bookmarks",
  "cabinet",
  "settings",
  "install",
] as const;

export const SIDEBAR_GROUPS: { id: NavGroup; labelKey: string }[] = [
  { id: "today", labelKey: "nav.group.today" },
  { id: "scripture", labelKey: "nav.group.scripture" },
  { id: "wealth", labelKey: "nav.group.wealth" },
  { id: "more", labelKey: "nav.group.more" },
];

export const LONG_PRESS: Record<string, { id: string; labelKey: string }[]> = {
  home: [
    { id: "search", labelKey: "nav.search" },
    { id: "bookmarks", labelKey: "nav.bookmarks" },
  ],
  namaz: [
    { id: "qibla", labelKey: "nav.qibla" },
    { id: "namaz-method", labelKey: "nav.method" },
  ],
  quran: [
    { id: "tafsir", labelKey: "tile.tafsir" },
    { id: "learn", labelKey: "chip.hifz" },
  ],
  hadith: [
    { id: "nawawi", labelKey: "tile.nawawi" },
    { id: "books", labelKey: "tile.books" },
  ],
  zakat: [{ id: "finance", labelKey: "chip.asset" }],
};

export const MoreIcon = LayoutGrid;

const HOME_MAIN_IDS = ["names", "quran", "hisn", "nawawi", "index", "zakat"];
const HOME_MORE_IDS = [
  "alphabet",
  "quiz",
  "dict",
  "reminder",
  "wisdom",
  "calendar",
  "recite",
  "tajweed",
  "tafsir",
  "books",
  "mecca",
  "madina",
  "learn",
  "tasbih",
];

function toTile(id: string): HouseTile {
  const item = NAV_BY_ID[id];
  return {
    id: item.id,
    label: item.tileLabel ?? item.id,
    icon: item.icon,
    tab: item.tab && item.tab !== "home" ? item.tab : undefined,
    room: item.room,
    hisn: item.hisn,
  };
}

export const HOUSE_MAIN: HouseTile[] = HOME_MAIN_IDS.map(toTile);
export const HOUSE_MORE: HouseTile[] = HOME_MORE_IDS.map(toTile);

export function primaryItems(narrow: boolean): NavItem[] {
  const ids = narrow ? PRIMARY_IDS.filter((id) => id !== "zakat") : PRIMARY_IDS;
  return ids.map((id) => NAV_BY_ID[id]);
}

export function overflowItems(narrow: boolean): NavItem[] {
  const ids = narrow ? ["zakat", ...OVERFLOW_IDS] : [...OVERFLOW_IDS];
  return ids.map((id) => NAV_BY_ID[id]);
}

export function itemsInGroup(group: NavGroup): NavItem[] {
  return NAV_CATALOG.filter((item) => item.group === group);
}

export function labelKeyFor(id: string): string {
  if (id === "namaz-method") return "nav.method";
  if (id === "search") return "nav.search";
  return NAV_BY_ID[id]?.labelKey ?? `nav.${id}`;
}

export function navIsCurrent(
  id: string,
  state: { tab: string; room: string | null; qibla: boolean; tafsir: boolean },
): boolean {
  if (id === "qibla") return state.tab === "namaz" && state.qibla;
  if (id === "namaz") return state.tab === "namaz" && !state.qibla;
  if (id === "hadith") return state.room === "books" || state.room === "nawawi";
  if (id === "books") return state.room === "books";
  if (id === "nawawi") return state.room === "nawawi";
  if (id === "tasbih") return state.room === "tasbih";
  if (id === "tafsir") return state.tafsir;
  if (id === "home") return state.tab === "home" && !state.room;
  if (state.room && id === state.room) return true;
  if (!state.room && !state.qibla && id === state.tab) return true;
  return false;
}
