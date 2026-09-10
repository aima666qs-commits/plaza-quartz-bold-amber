import { create } from "zustand";
import type { HisnChapter } from "@/lib/hisn/types.ts";

const KEY = "mizan.v1.hisn";

type Counts = Record<string, number>;

interface HisnState {
  counts: Counts;
  favorites: number[];
  arabicScale: number;
  showEn: boolean;
  duaIndex: number;
  day: string;
  setDuaIndex: (n: number) => void;
  tap: (chapterId: number, duaId: number, max: number) => void;
  resetChapter: (chapterId: number, duaIds: number[]) => void;
  toggleFav: (chapterId: number) => void;
  setArabicScale: (n: number) => void;
  setShowEn: (v: boolean) => void;
  countOf: (chapterId: number, duaId: number) => number;
  chapterProgress: (ch: HisnChapter) => { have: number; need: number; done: number; total: number };
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function ck(day: string, chapterId: number, duaId: number) {
  return `${day}:${chapterId}:${duaId}`;
}

function persist() {
  try {
    const s = useHisn.getState();
    localStorage.setItem(
      KEY,
      JSON.stringify({
        counts: s.counts,
        favorites: s.favorites,
        arabicScale: s.arabicScale,
        showEn: s.showEn,
        day: s.day,
      }),
    );
  } catch {
    /* ignore */
  }
}

export const useHisn = create<HisnState>((set, get) => ({
  counts: {},
  favorites: [27, 25, 28],
  arabicScale: 1,
  showEn: true,
  duaIndex: 0,
  day: today(),
  setDuaIndex: (n) => set({ duaIndex: Math.max(0, n) }),
  tap: (chapterId, duaId, max) => {
    const day = today();
    const key = ck(day, chapterId, duaId);
    const cur = get().counts[key] ?? 0;
    if (cur >= max) return;
    set({ counts: { ...get().counts, [key]: cur + 1 }, day });
    persist();
  },
  resetChapter: (chapterId, duaIds) => {
    const day = today();
    const counts = { ...get().counts };
    for (const id of duaIds) delete counts[ck(day, chapterId, id)];
    set({ counts, duaIndex: 0, day });
    persist();
  },
  toggleFav: (chapterId) => {
    const favorites = get().favorites.includes(chapterId)
      ? get().favorites.filter((x) => x !== chapterId)
      : [...get().favorites, chapterId];
    set({ favorites });
    persist();
  },
  setArabicScale: (n) => {
    set({ arabicScale: Math.min(1.6, Math.max(0.85, n)) });
    persist();
  },
  setShowEn: (showEn) => {
    set({ showEn });
    persist();
  },
  countOf: (chapterId, duaId) => get().counts[ck(get().day === today() ? get().day : today(), chapterId, duaId)] ?? 0,
  chapterProgress: (ch) => {
    const day = today();
    let have = 0;
    let need = 0;
    let done = 0;
    for (const d of ch.duas) {
      const n = Math.min(get().counts[ck(day, ch.id, d.id)] ?? 0, d.repeat);
      have += n;
      need += d.repeat;
      if (n >= d.repeat) done += 1;
    }
    return { have, need, done, total: ch.duas.length };
  },
}));

export function hydrateHisn() {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) {
      useHisn.setState({ day: today() });
      return;
    }
    const data = JSON.parse(raw) as Partial<HisnState>;
    const day = today();
    useHisn.setState({
      counts: data.counts ?? {},
      favorites: data.favorites ?? [27, 25, 28],
      arabicScale: data.arabicScale ?? 1,
      showEn: data.showEn ?? true,
      day,
    });
  } catch {
    useHisn.setState({ day: today() });
  }
}
