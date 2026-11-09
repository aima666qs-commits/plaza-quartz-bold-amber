import type { HouseRoomId } from "@/lib/nav/catalog.ts";
import { pushRecent } from "@/lib/nav/recents.ts";
import { askSalah } from "@/lib/salah/boot.ts";
import { useMizan } from "@/stores/mizan-store.ts";
import { useQuran } from "@/stores/quran-store.ts";

const ROOMS = new Set<HouseRoomId>([
  "names",
  "nawawi",
  "index",
  "alphabet",
  "quiz",
  "dict",
  "reminder",
  "wisdom",
  "calendar",
  "recite",
  "tajweed",
  "mecca",
  "madina",
  "tasbih",
  "books",
]);

function isRoom(id: string): id is HouseRoomId {
  return ROOMS.has(id as HouseRoomId);
}

function scrollTop() {
  if (typeof window === "undefined") return;
  window.scrollTo(0, 0);
}

export function goNav(id: string) {
  const m = useMizan.getState();
  const q = useQuran.getState();
  m.setNavSheet(false);
  if (id !== "search") m.closeSearch(false);

  if (id === "search") {
    m.openSearch("");
    return;
  }
  if (id.startsWith("hisn:")) {
    const chapter = Number(id.slice(5));
    if (Number.isFinite(chapter) && chapter > 0) m.setHisnChapter(chapter);
    pushRecent("hisn");
    scrollTop();
    return;
  }
  if (id === "namaz-method") {
    m.openNamaz(false);
    window.setTimeout(() => document.getElementById("salah-methods")?.scrollIntoView({ block: "center" }), 60);
    return;
  }
  if (id === "place") {
    void askSalah(true);
    m.openNamaz(false);
    return;
  }
  if (id === "save-zakat") {
    m.saveDraft();
    m.setAppTab("zakat");
    return;
  }
  switch (id) {
    case "home":
      m.setAppTab("home");
      break;
    case "namaz":
      m.openNamaz(false);
      break;
    case "qibla":
      m.openNamaz(true);
      break;
    case "quran":
      m.setAppTab("quran");
      break;
    case "hadith":
      m.setHouseNav("books");
      pushRecent("hadith");
      break;
    case "books":
      m.setHouseNav("books");
      pushRecent("books");
      break;
    case "zakat":
      m.setAppTab("zakat");
      break;
    case "hisn":
      m.setAppTab("hisn");
      break;
    case "learn":
      m.setAppTab("learn");
      break;
    case "finance":
      m.setAppTab("finance");
      break;
    case "tasbih":
      m.setHouseNav("tasbih");
      pushRecent("tasbih");
      break;
    case "tafsir":
      q.openTafsir(q.surah || 1, q.ayah || 1);
      m.setAppTab("quran");
      pushRecent("tafsir");
      break;
    case "settings":
    case "install":
      m.setSettingsOpen(true);
      pushRecent(id);
      break;
    case "cabinet":
      m.setCabinetOpen(true);
      pushRecent("cabinet");
      break;
    case "bookmarks": {
      const mark = q.bookmarks[0];
      m.setAppTab("quran");
      if (mark) q.setRef(mark.surah, mark.ayah);
      pushRecent("bookmarks");
      break;
    }
    default:
      if (isRoom(id)) {
        m.setHouseNav(id);
        pushRecent(id);
      }
      break;
  }
  scrollTop();
}
