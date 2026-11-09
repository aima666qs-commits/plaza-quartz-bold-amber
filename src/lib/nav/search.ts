import { HADITH_BOOKS } from "@/lib/house/catalog.ts";
import { NAWAWI } from "@/lib/house/data.ts";
import type { Locale } from "@/lib/i18n/dict.ts";
import { translate } from "@/lib/i18n/dict.ts";
import { NAV_BY_ID, NAV_CATALOG, labelKeyFor } from "@/lib/nav/catalog.ts";
import { surahOf, SURAHS } from "@/lib/quran/surahs.ts";

export type SearchKind = "section" | "surah" | "hadith" | "hisn" | "bookmark" | "finance" | "setting";

export type SearchHit = {
  id: string;
  type: SearchKind;
  title: string;
  subtitle: string;
  href: string;
  iconId?: string;
  hay: string;
};

const TASHKEEL = /[\u064B-\u065F\u0670\u06D6-\u06ED]/g;

/** Fold Russian ё/е and optional Arabic vowels. Does not translate scripture. */
export function norm(value: string): string {
  return value
    .toLowerCase()
    .replace(/ё/g, "е")
    .replace(TASHKEEL, "")
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .replace(/\s+/g, " ")
    .trim();
}

const SECTION_HREF: Record<string, string> = {
  home: "#home",
  namaz: "#namaz",
  qibla: "#qibla",
  quran: "#quran",
  hadith: "#house/books",
  zakat: "#zakat",
  hisn: "#hisn",
  learn: "#learn",
  tasbih: "#tasbih",
  finance: "#finance",
  tafsir: "#tafsir",
  settings: "#settings",
  install: "#settings",
  cabinet: "#settings",
  bookmarks: "#quran",
};

function hrefFor(id: string): string {
  if (SECTION_HREF[id]) return SECTION_HREF[id];
  const item = NAV_BY_ID[id];
  if (item?.room) return `#house/${item.room}`;
  if (item?.tab) return `#${item.tab}`;
  return "#home";
}

const FINANCE_TOPICS = ["finance.topic.cash", "finance.topic.gold", "finance.topic.shares", "finance.topic.rent", "finance.topic.trade"] as const;

const FREQUENT = ["home", "namaz", "quran", "hadith", "zakat"];

export function buildSearchDocs(
  locale: Locale,
  bookmarks: { surah: number; ayah: number }[],
  hisnChapters: { id: number; titleAr: string }[] = [],
): SearchHit[] {
  const t = (key: string) => translate(locale, key);
  const docs: SearchHit[] = [];

  for (const item of NAV_CATALOG) {
    const title = t(item.labelKey);
    docs.push({
      id: `section-${item.id}`,
      type: item.id === "settings" || item.id === "install" ? "setting" : item.id === "finance" ? "finance" : "section",
      title,
      subtitle: t("search.kind.section"),
      href: hrefFor(item.id),
      iconId: item.id,
      hay: norm(`${title} ${item.id}`),
    });
  }

  for (const surah of SURAHS) {
    const title = locale === "ar" ? surah.ar : locale === "en" ? surah.tr : surah.ru;
    const subtitle = `${t("search.kind.surah")} ${surah.n}`;
    docs.push({
      id: `surah-${surah.n}`,
      type: "surah",
      title,
      subtitle,
      href: `#quran/${surah.n}`,
      iconId: "quran",
      hay: norm(`${title} ${surah.ru} ${surah.ar} ${surah.tr} ${surah.n}`),
    });
  }

  for (const hadith of NAWAWI) {
    const title = locale === "en" ? hadith.titleEn : locale === "ar" ? hadith.core : hadith.title;
    const subtitle = `${t("search.kind.hadith")} ${hadith.n}`;
    docs.push({
      id: `hadith-${hadith.n}`,
      type: "hadith",
      title,
      subtitle,
      href: `#house/nawawi/${hadith.n}`,
      iconId: "hadith",
      hay: norm(`${title} ${hadith.title} ${hadith.core} ${hadith.n}`),
    });
  }

  for (const book of HADITH_BOOKS) {
    const title = locale === "ar" ? book.ar : book.ru;
    docs.push({
      id: `collection-${book.id}`,
      type: "hadith",
      title,
      subtitle: t("tile.books"),
      href: "#house/books",
      iconId: "books",
      hay: norm(`${title} ${book.ru} ${book.ar} ${book.id}`),
    });
  }

  for (const chapter of hisnChapters) {
    docs.push({
      id: `hisn-${chapter.id}`,
      type: "hisn",
      title: chapter.titleAr,
      subtitle: `${t("hisn.chapter")} ${chapter.id}`,
      href: `#hisn/${chapter.id}`,
      iconId: "hisn",
      hay: norm(`${chapter.titleAr} ${chapter.id}`),
    });
  }

  for (const mark of bookmarks) {
    const surah = surahOf(mark.surah);
    const name = locale === "ar" ? surah.ar : locale === "en" ? surah.tr : surah.ru;
    docs.push({
      id: `mark-${mark.surah}-${mark.ayah}`,
      type: "bookmark",
      title: `${name} · ${mark.ayah}`,
      subtitle: t("search.kind.bookmark"),
      href: `#quran/${mark.surah}/${mark.ayah}`,
      iconId: "bookmarks",
      hay: norm(`${name} ${surah.ru} ${surah.ar} ${mark.surah} ${mark.ayah}`),
    });
  }

  for (const key of FINANCE_TOPICS) {
    const title = t(key);
    docs.push({
      id: `finance-${key}`,
      type: "finance",
      title,
      subtitle: t("finance.title"),
      href: "#finance",
      iconId: "finance",
      hay: norm(`${title} ${t("nav.finance")}`),
    });
  }

  docs.push({
    id: "setting-language",
    type: "setting",
    title: t("language"),
    subtitle: t("settings"),
    href: "#settings",
    iconId: "settings",
    hay: norm(`${t("language")} ${t("settings")}`),
  });

  return docs;
}

export function searchDocs(docs: SearchHit[], query: string, limit = 12): SearchHit[] {
  const q = norm(query);
  if (!q) return [];
  const scored: { hit: SearchHit; score: number }[] = [];
  for (const hit of docs) {
    const title = norm(hit.title);
    const subtitle = norm(hit.subtitle);
    let score = 0;
    if (title.startsWith(q)) score = 4;
    else if (title.includes(q)) score = 3;
    else if (subtitle.includes(q)) score = 2;
    else if (hit.hay.includes(q)) score = 1;
    if (score) scored.push({ hit, score });
  }
  scored.sort((a, b) => b.score - a.score || a.hit.title.localeCompare(b.hit.title));
  return scored.slice(0, limit).map((row) => row.hit);
}

export function frequentDocs(docs: SearchHit[]): SearchHit[] {
  return FREQUENT.map((id) => docs.find((doc) => doc.id === `section-${id}`)).filter((doc): doc is SearchHit => Boolean(doc));
}

export function recentLabelKey(id: string) {
  return labelKeyFor(id);
}
