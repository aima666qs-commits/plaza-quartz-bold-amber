import { create } from "zustand";
import type { TrackId } from "@/lib/learn/tracks.ts";
import { WEEKS } from "@/lib/quran/curriculum.ts";

const KEY = "mizan.v1.learn";

interface LearnStore {
  week: number;
  track: TrackId;
  completed: Record<string, true>;
  startedAt: string;
  lastStudy: string;
  setWeek: (n: number) => void;
  setTrack: (t: TrackId) => void;
  toggleDay: (week: number, day: number) => void;
  isDone: (week: number, day: number) => boolean;
  completedCount: () => number;
}

function persist() {
  try {
    const s = useLearn.getState();
    localStorage.setItem(
      KEY,
      JSON.stringify({
        week: s.week,
        track: s.track,
        completed: s.completed,
        startedAt: s.startedAt,
        lastStudy: s.lastStudy,
      }),
    );
  } catch {
    /* ignore */
  }
}

function key(week: number, day: number) {
  return `${week}-${day}`;
}

export const TOTAL_STUDY_DAYS = WEEKS.length * 5;

export const useLearn = create<LearnStore>((set, get) => ({
  week: 1,
  track: "itqan",
  completed: {},
  startedAt: "",
  lastStudy: "",
  setWeek: (n) => {
    set({ week: Math.min(40, Math.max(1, n)) });
    persist();
  },
  setTrack: (track) => {
    set({ track });
    persist();
  },
  toggleDay: (week, day) => {
    const k = key(week, day);
    const completed = { ...get().completed };
    if (completed[k]) delete completed[k];
    else completed[k] = true;
    const today = new Date().toISOString().slice(0, 10);
    set({
      completed,
      lastStudy: today,
      startedAt: get().startedAt || today,
    });
    persist();
  },
  isDone: (week, day) => Boolean(get().completed[key(week, day)]),
  completedCount: () => Object.keys(get().completed).length,
}));

export function hydrateLearn() {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return;
    const data = JSON.parse(raw) as Partial<LearnStore>;
    useLearn.setState({
      week: data.week ?? 1,
      track: (data.track as TrackId | undefined) ?? "itqan",
      completed: data.completed ?? {},
      startedAt: data.startedAt ?? "",
      lastStudy: data.lastStudy ?? "",
    });
  } catch {
    /* ignore */
  }
}
