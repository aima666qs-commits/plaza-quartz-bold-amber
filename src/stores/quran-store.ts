import { create } from "zustand";
import { ayahAudioFallback, ayahAudioUrl, DEFAULT_RECITER, reciterById } from "@/lib/quran/reciters.ts";
import { refToGlobal, surahOf } from "@/lib/quran/surahs.ts";
import type { RepeatMode } from "@/lib/quran/types.ts";

const KEY = "mizan.v1.quran";

type Bookmark = { surah: number; ayah: number };

interface QuranStore {
  reciterId: string;
  surah: number;
  ayah: number;
  playing: boolean;
  session: boolean;
  repeat: RepeatMode;
  bookmarks: Bookmark[];
  rangeTo: number | null;
  lastError: string;
  setReciter: (id: string) => void;
  setRef: (surah: number, ayah: number) => void;
  setRepeat: (r: RepeatMode) => void;
  toggleBookmark: () => void;
  play: () => void;
  playAt: (surah: number, ayah: number, to?: number | null) => void;
  pause: () => void;
  toggle: () => void;
  next: () => void;
  prev: () => void;
}

let audio: HTMLAudioElement | null = null;
let fallbackUsed = false;

function getAudio(): HTMLAudioElement | null {
  if (typeof window === "undefined") return null;
  if (!audio) {
    audio = new Audio();
    audio.addEventListener("ended", () => {
      const s = useQuran.getState();
      if (s.repeat === "ayah") {
        fallbackUsed = false;
        audio!.currentTime = 0;
        void audio!.play();
        return;
      }
      s.next();
    });
    audio.addEventListener("error", () => {
      const s = useQuran.getState();
      const rec = reciterById(s.reciterId);
      const g = refToGlobal(s.surah, s.ayah);
      if (!fallbackUsed) {
        fallbackUsed = true;
        audio!.src = ayahAudioFallback(rec, g, s.surah, s.ayah);
        void audio!.play().catch(() => {
          useQuran.setState({ lastError: "Аудио недоступно", playing: false });
        });
      } else {
        useQuran.setState({ lastError: "Аудио недоступно", playing: false });
      }
    });
  }
  return audio;
}

function persist(partial: Partial<QuranStore>) {
  try {
    const cur = useQuran.getState();
    localStorage.setItem(
      KEY,
      JSON.stringify({
        reciterId: partial.reciterId ?? cur.reciterId,
        surah: partial.surah ?? cur.surah,
        ayah: partial.ayah ?? cur.ayah,
        repeat: partial.repeat ?? cur.repeat,
        bookmarks: partial.bookmarks ?? cur.bookmarks,
      }),
    );
  } catch {
    /* ignore */
  }
}

function loadSrc(surah: number, ayah: number, reciterId: string) {
  const el = getAudio();
  if (!el) return;
  const rec = reciterById(reciterId);
  const g = refToGlobal(surah, ayah);
  fallbackUsed = false;
  el.src = ayahAudioUrl(rec, g, surah, ayah);
}

export const useQuran = create<QuranStore>((set, get) => ({
  reciterId: DEFAULT_RECITER.id,
  surah: 1,
  ayah: 1,
  playing: false,
  session: false,
  repeat: "off",
  bookmarks: [],
  rangeTo: null,
  lastError: "",
  setReciter: (id) => {
    persist({ reciterId: id });
    set({ reciterId: id });
    if (get().playing) get().play();
  },
  setRef: (surah, ayah) => {
    persist({ surah, ayah });
    set({ surah, ayah });
  },
  setRepeat: (repeat) => {
    persist({ repeat });
    set({ repeat });
  },
  toggleBookmark: () => {
    const { surah, ayah, bookmarks } = get();
    const exists = bookmarks.some((b) => b.surah === surah && b.ayah === ayah);
    const next = exists
      ? bookmarks.filter((b) => !(b.surah === surah && b.ayah === ayah))
      : [{ surah, ayah }, ...bookmarks].slice(0, 80);
    persist({ bookmarks: next });
    set({ bookmarks: next });
  },
  play: () => {
    const { surah, ayah, reciterId } = get();
    loadSrc(surah, ayah, reciterId);
    const el = getAudio();
    if (!el) return;
    void el.play().then(
      () => set({ playing: true, session: true, lastError: "" }),
      () => set({ lastError: "Не удалось начать чтение", playing: false }),
    );
  },
  playAt: (surah, ayah, to = null) => {
    persist({ surah, ayah });
    set({ surah, ayah, rangeTo: to, session: true });
    get().play();
  },
  pause: () => {
    getAudio()?.pause();
    set({ playing: false });
  },
  toggle: () => {
    if (get().playing) get().pause();
    else get().play();
  },
  next: () => {
    const { surah, ayah, repeat, rangeTo } = get();
    const meta = surahOf(surah);
    let ns = surah;
    let na = ayah + 1;
    if (rangeTo && ayah >= rangeTo) {
      if (repeat === "surah") {
        na = ayah; // stay handled below
      }
    }
    if (na > meta.ayahs) {
      if (repeat === "surah") {
        na = 1;
      } else if (surah >= 114) {
        get().pause();
        return;
      } else {
        ns = surah + 1;
        na = 1;
      }
    }
    if (rangeTo && ayah >= rangeTo && repeat !== "surah") {
      get().pause();
      return;
    }
    persist({ surah: ns, ayah: na });
    set({ surah: ns, ayah: na });
    get().play();
  },
  prev: () => {
    const { surah, ayah } = get();
    let ns = surah;
    let na = ayah - 1;
    if (na < 1) {
      if (surah <= 1) return;
      ns = surah - 1;
      na = surahOf(ns).ayahs;
    }
    persist({ surah: ns, ayah: na });
    set({ surah: ns, ayah: na });
    if (get().playing || get().session) get().play();
  },
}));

export function hydrateQuran() {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return;
    const data = JSON.parse(raw) as Partial<QuranStore>;
    useQuran.setState({
      reciterId: data.reciterId ?? DEFAULT_RECITER.id,
      surah: data.surah ?? 1,
      ayah: data.ayah ?? 1,
      repeat: data.repeat ?? "off",
      bookmarks: data.bookmarks ?? [],
    });
  } catch {
    /* ignore */
  }
}
