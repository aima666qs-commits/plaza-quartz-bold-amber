import { create } from "zustand";
import { COURSES, type CourseId } from "@/lib/learn/catalog.ts";
import type { ArabicMethodId } from "@/lib/learn/arabic-methods.ts";
import type { TrackId } from "@/lib/learn/tracks.ts";
import { WEEKS } from "@/lib/quran/curriculum.ts";
import { pushProgress } from "@/lib/study/server.ts";

const KEY = "mizan.v1.learn";

interface LearnStore {
  week: number;
  track: TrackId;
  course: CourseId | null;
  lane: "quran" | "arabic" | "hifz" | null;
  arabicMethod: ArabicMethodId | null;
  lessonN: number;
  sabaqSurah: number;
  tikrarNeed: 10 | 21;
  completed: Record<string, true>;
  startedAt: string;
  lastStudy: string;
  setWeek: (n: number) => void;
  setTrack: (t: TrackId) => void;
  setCourse: (c: CourseId | null) => void;
  setLane: (l: LearnStore["lane"]) => void;
  setArabicMethod: (id: ArabicMethodId | null) => void;
  setLessonN: (n: number) => void;
  setSabaq: (n: number) => void;
  setTikrarNeed: (n: 10 | 21) => void;
  toggleDay: (week: number, day: number) => void;
  isDone: (week: number, day: number) => boolean;
  completedCount: () => number;
}

function snapshot() {
  const s = useLearn.getState();
  return {
    week: s.week,
    track: s.track,
    course: s.course,
    lane: s.lane,
    arabicMethod: s.arabicMethod,
    lessonN: s.lessonN,
    sabaqSurah: s.sabaqSurah,
    tikrarNeed: s.tikrarNeed,
    completed: s.completed,
    startedAt: s.startedAt,
    lastStudy: s.lastStudy,
  };
}

let saveTimer: ReturnType<typeof setTimeout> | undefined;

function persist() {
  try {
    const snap = snapshot();
    localStorage.setItem(KEY, JSON.stringify(snap));
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      void pushProgress({
        data: {
          lane: snap.lane ?? "none",
          payload: JSON.stringify(snap),
        },
      }).catch(() => {});
    }, 900);
  } catch {
    /* ignore */
  }
}

function key(week: number, day: number) {
  return `${week}-${day}`;
}

function clampSurah(n: number) {
  if (!Number.isFinite(n)) return 114;
  return Math.min(114, Math.max(78, Math.round(n)));
}

function mapCourse(id: unknown): CourseId | null {
  if (!id || typeof id !== "string") return null;
  if (id === "hifz") return "juz-amma";
  return COURSES.some((c) => c.id === id) ? (id as CourseId) : null;
}

export const TOTAL_STUDY_DAYS = WEEKS.length * 5;

export const useLearn = create<LearnStore>((set, get) => ({
  week: 1,
  track: "itqan",
  course: null,
  lane: null,
  arabicMethod: null,
  lessonN: 0,
  sabaqSurah: 114,
  tikrarNeed: 10,
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
  setCourse: (course) => {
    set({ course: mapCourse(course) });
    persist();
  },
  setLane: (lane) => {
    set({
      lane,
      course: lane ? get().course : null,
      arabicMethod: lane === "arabic" ? get().arabicMethod : null,
      lessonN: lane === "arabic" ? get().lessonN : 0,
    });
    persist();
  },
  setArabicMethod: (arabicMethod) => {
    set({ arabicMethod, lessonN: 0 });
    persist();
  },
  setLessonN: (n) => {
    set({ lessonN: Math.max(0, Math.round(n)) });
    persist();
  },
  setSabaq: (n) => {
    set({ sabaqSurah: clampSurah(n) });
    persist();
  },
  setTikrarNeed: (n) => {
    set({ tikrarNeed: n === 21 ? 21 : 10 });
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
    const data = JSON.parse(raw) as Partial<LearnStore> & { course?: unknown };
    useLearn.setState({
      week: data.week ?? 1,
      track: (data.track as TrackId | undefined) ?? "itqan",
      course: mapCourse(data.course),
      lane: data.lane === "quran" || data.lane === "arabic" || data.lane === "hifz" ? data.lane : null,
      arabicMethod: data.arabicMethod ?? null,
      lessonN: data.lessonN ?? 0,
      sabaqSurah: clampSurah(data.sabaqSurah ?? 114),
      tikrarNeed: data.tikrarNeed === 21 ? 21 : 10,
      completed: data.completed ?? {},
      startedAt: data.startedAt ?? "",
      lastStudy: data.lastStudy ?? "",
    });
  } catch {
    /* ignore */
  }
}

export function applyServerProgress(payload: string) {
  try {
    const data = JSON.parse(payload) as Partial<LearnStore> & { course?: unknown };
    const local = useLearn.getState();
    if (local.lastStudy) return;
    useLearn.setState({
      week: data.week ?? local.week,
      track: (data.track as TrackId | undefined) ?? local.track,
      course: mapCourse(data.course) ?? local.course,
      lane: data.lane === "quran" || data.lane === "arabic" || data.lane === "hifz" ? data.lane : local.lane,
      arabicMethod: data.arabicMethod ?? local.arabicMethod,
      lessonN: data.lessonN ?? local.lessonN,
      sabaqSurah: clampSurah(data.sabaqSurah ?? local.sabaqSurah),
      tikrarNeed: data.tikrarNeed === 21 ? 21 : local.tikrarNeed,
      completed: data.completed ?? local.completed,
      startedAt: data.startedAt ?? local.startedAt,
      lastStudy: data.lastStudy ?? local.lastStudy,
    });
  } catch {
    /* ignore */
  }
}
