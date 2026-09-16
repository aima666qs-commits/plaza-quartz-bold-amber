import { create } from "zustand";
import { loadAyah } from "@/lib/quran/mushaf.ts";
import { ayahAudioFallback, ayahAudioUrl, DEFAULT_RECITER, reciterById, reciterSurahs } from "@/lib/quran/reciters.ts";
import { estimateSegs, loadAyahSync, prefetchAyahSync, wordIndexAt, type AyahSync, type SyncWord, type WordSeg } from "@/lib/quran/sync.ts";
import { refToGlobal, surahOf } from "@/lib/quran/surahs.ts";
import type { MushafFontId } from "@/lib/quran/fonts.ts";
import type { MushafLayout } from "@/lib/quran/layout.ts";
import type { LearnPlayMode, RepeatMode } from "@/lib/quran/types.ts";

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
  tafsirOn: boolean;
  tafsirBook: number;
  follow: boolean;
  wbw: boolean;
  tajweed: boolean;
  viewMode: "read" | "learn";
  mushafFont: MushafFontId;
  mushafLayout: MushafLayout;
  learnMode: LearnPlayMode;
  speed: number;
  gapMs: number;
  wordIndex: number;
  audioMs: number;
  durationMs: number;
  waiting: boolean;
  exactSync: boolean;
  words: SyncWord[];
  pulse: number;
  glowHue: number;
  setReciter: (id: string) => void;
  setRef: (surah: number, ayah: number) => void;
  setRepeat: (r: RepeatMode) => void;
  toggleBookmark: () => void;
  openTafsir: (surah?: number, ayah?: number) => void;
  closeTafsir: () => void;
  setTafsirBook: (id: number) => void;
  setFollow: (v: boolean) => void;
  toggleFollow: () => void;
  toggleWbw: () => void;
  toggleTajweed: () => void;
  setViewMode: (m: "read" | "learn") => void;
  setMushafFont: (f: MushafFontId) => void;
  setMushafLayout: (l: MushafLayout) => void;
  setLearnMode: (m: LearnPlayMode) => void;
  setSpeed: (n: number) => void;
  setGapMs: (n: number) => void;
  play: () => void;
  playAt: (surah: number, ayah: number, to?: number | null) => void;
  playWord: (surah: number, ayah: number, index: number) => void;
  continueLearn: () => void;
  replayUnit: () => void;
  pause: () => void;
  stop: () => void;
  toggle: () => void;
  next: () => void;
  prev: () => void;
  seekRatio: (r: number) => void;
}

let audio: HTMLAudioElement | null = null;
let fallbackUsed = false;
let raf = 0;
let gapTimer = 0;
let loadGen = 0;
let pendingWord: number | null = null;
let holdUntil = 0;
let currentSegs: WordSeg[] = [];
let currentSync: AyahSync | null = null;

function clearGap() {
  if (gapTimer) {
    window.clearTimeout(gapTimer);
    gapTimer = 0;
  }
}

function stopTick() {
  if (raf) {
    cancelAnimationFrame(raf);
    raf = 0;
  }
}

function startTick() {
  if (raf) return;
  const loop = () => {
    const el = audio;
    const st = useQuran.getState();
    if (!el || el.paused || !st.playing) {
      raf = 0;
      return;
    }
    const ms = el.currentTime * 1000;
    if (holdUntil > 0 && ms >= holdUntil - 25) {
      el.pause();
      try {
        el.currentTime = holdUntil / 1000;
      } catch {
        /* ignore */
      }
      raf = 0;
      useQuran.setState({
        playing: false,
        waiting: true,
        audioMs: holdUntil,
        wordIndex: wordIndexAt(currentSegs, holdUntil - 15),
      });
      return;
    }
    const idx = st.follow ? wordIndexAt(currentSegs, ms) : st.wordIndex;
    const dur = (el.duration || 0) * 1000;
    let pulse = st.pulse;
    if (idx !== st.wordIndex) {
      pulse = 1;
      if (document.documentElement.dataset.motion !== "off") {
        try {
          navigator.vibrate?.(16);
          const native = (window as Window & { MizanNative?: { vibrate?: (n: number) => void } }).MizanNative;
          native?.vibrate?.(18);
        } catch {
          /* ignore */
        }
      }
    } else {
      pulse = Math.max(0.26, st.pulse * 0.88);
    }
    const hues = [42, 148, 28, 8, 172, 52];
    const glowHue = hues[(((idx < 0 ? 0 : idx) + st.ayah) % hues.length + hues.length) % hues.length] ?? 42;
    if (idx !== st.wordIndex || Math.abs(ms - st.audioMs) > 40 || Math.abs(pulse - st.pulse) > 0.04) {
      useQuran.setState({
        wordIndex: st.follow ? idx : st.wordIndex,
        audioMs: ms,
        durationMs: dur || st.durationMs,
        pulse,
        glowHue,
      });
    }
    raf = requestAnimationFrame(loop);
  };
  raf = requestAnimationFrame(loop);
}

function onEnded() {
  const s = useQuran.getState();
  const rec = reciterById(s.reciterId);
  stopTick();
  if (s.learnMode === "echo" || s.learnMode === "word") {
    useQuran.setState({
      playing: false,
      waiting: true,
      wordIndex: Math.max(0, currentSegs.length - 1),
      audioMs: s.durationMs,
    });
    return;
  }
  if (rec.kind === "surah") {
    const list = reciterSurahs(rec) ?? [];
    const i = list.indexOf(s.surah);
    if (s.repeat === "surah" || s.repeat === "ayah") {
      fallbackUsed = false;
      audio!.currentTime = 0;
      void audio!.play().then(() => startTick());
      return;
    }
    if (i >= 0 && i < list.length - 1) {
      s.playAt(list[i + 1], 1, null);
      return;
    }
    useQuran.setState({ playing: false });
    return;
  }
  const afterGap = () => {
    if (s.repeat === "ayah") {
      fallbackUsed = false;
      if (audio) {
        audio.currentTime = 0;
        void audio.play().then(() => {
          useQuran.setState({ playing: true, waiting: false });
          startTick();
        });
      }
      return;
    }
    s.next();
  };
  if (s.gapMs > 0) {
    useQuran.setState({ playing: false });
    clearGap();
    gapTimer = window.setTimeout(afterGap, s.gapMs);
    return;
  }
  afterGap();
}

function onError() {
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
}

function applyPendingSeek(el: HTMLAudioElement) {
  const st = useQuran.getState();
  const idx = pendingWord ?? (st.learnMode === "word" && holdUntil === 0 ? 0 : null);
  if (idx == null || !currentSegs[idx]) return;
  const seg = currentSegs[idx];
  try {
    el.currentTime = seg.start / 1000;
  } catch {
    /* ignore */
  }
  if (st.learnMode === "word") holdUntil = seg.end;
  useQuran.setState({ wordIndex: idx, audioMs: seg.start });
  pendingWord = null;
}

function onMeta() {
  const el = audio;
  if (!el) return;
  const dur = (el.duration || 0) * 1000;
  const rec = reciterById(useQuran.getState().reciterId);
  if (rec.kind !== "surah" && dur > 0 && currentSync && !currentSync.exact && currentSync.words.length) {
    currentSegs = estimateSegs(currentSync.words, dur);
    currentSync = { ...currentSync, segs: currentSegs };
  }
  useQuran.setState({ durationMs: dur });
  applyPendingSeek(el);
}

function getAudio(): HTMLAudioElement | null {
  if (typeof window === "undefined") return null;
  if (!audio) {
    audio = new Audio();
    audio.preload = "metadata";
    audio.setAttribute("playsinline", "");
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("error", onError);
    audio.addEventListener("loadedmetadata", onMeta);
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
        follow: partial.follow ?? cur.follow,
        wbw: partial.wbw ?? cur.wbw,
        tajweed: partial.tajweed ?? cur.tajweed,
        viewMode: partial.viewMode ?? cur.viewMode,
        mushafFont: partial.mushafFont ?? cur.mushafFont,
        mushafLayout: partial.mushafLayout ?? cur.mushafLayout,
        learnMode: partial.learnMode ?? cur.learnMode,
        speed: partial.speed ?? cur.speed,
        gapMs: partial.gapMs ?? cur.gapMs,
      }),
    );
  } catch {
    /* ignore */
  }
}

function loadSrc(surah: number, ayah: number, reciterId: string, preferred = ""): boolean {
  const el = getAudio();
  if (!el) return false;
  const rec = reciterById(reciterId);
  if (rec.kind === "surah") {
    const file = rec.surahFiles?.[surah];
    if (!file) {
      useQuran.setState({
        playing: false,
        lastError: `${rec.name}: на открытых зеркалах этого файла нет.`,
      });
      return false;
    }
    fallbackUsed = true;
    el.preload = "metadata";
    el.src = file;
    return true;
  }
  const g = refToGlobal(surah, ayah);
  if (preferred) {
    fallbackUsed = false;
    el.preload = "metadata";
    el.src = preferred;
    return true;
  }
  fallbackUsed = false;
  el.preload = "metadata";
  el.src = ayahAudioUrl(rec, g, surah, ayah);
  return true;
}

async function playNow() {
  const { surah, ayah, reciterId, learnMode, speed } = useQuran.getState();
  const rec = reciterById(reciterId);
  const gen = ++loadGen;
  clearGap();
  stopTick();
  holdUntil = 0;
  const local = await loadAyah(surah, ayah);
  if (gen !== loadGen) return;
  const sync = await loadAyahSync(surah, ayah, rec, local?.ar ?? "");
  if (gen !== loadGen) return;
  currentSync = sync;
  currentSegs = sync.segs;
  useQuran.setState({
    words: sync.words,
    exactSync: sync.exact,
    waiting: false,
    wordIndex: pendingWord ?? (learnMode === "word" || useQuran.getState().follow ? 0 : -1),
    audioMs: 0,
  });
  if (!loadSrc(surah, ayah, reciterId, rec.kind === "surah" ? "" : sync.audioUrl)) return;
  const el = getAudio();
  if (!el) return;
  el.playbackRate = speed;
  if (learnMode === "word" && pendingWord == null) pendingWord = 0;
  if (el.readyState >= 1) applyPendingSeek(el);
  void el.play().then(
    () => {
      if (gen !== loadGen) return;
      useQuran.setState({ playing: true, session: true, lastError: "", waiting: false });
      startTick();
    },
    () => useQuran.setState({ lastError: "Не удалось начать чтение", playing: false }),
  );
  const meta = surahOf(surah);
  if (ayah < meta.ayahs) {
    void loadAyah(surah, ayah + 1).then((a) => {
      if (a) prefetchAyahSync(surah, ayah + 1, rec, a.ar);
    });
  }
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
  tafsirOn: false,
  tafsirBook: 170,
  follow: true,
  wbw: false,
  tajweed: true,
  viewMode: "read",
  mushafFont: "uthmani",
  mushafLayout: "page",
  learnMode: "listen",
  speed: 1.2,
  gapMs: 0,
  wordIndex: -1,
  audioMs: 0,
  durationMs: 0,
  waiting: false,
  exactSync: false,
  words: [],
  pulse: 0,
  glowHue: 42,
  setReciter: (id) => {
    persist({ reciterId: id });
    set({ reciterId: id });
    if (get().playing || get().session) get().play();
  },
  setRef: (surah, ayah) => {
    persist({ surah, ayah });
    set({ surah, ayah, wordIndex: -1, waiting: false });
  },
  openTafsir: (surah, ayah) => {
    const s = surah ?? get().surah;
    const a = ayah ?? get().ayah;
    persist({ surah: s, ayah: a });
    set({ surah: s, ayah: a, tafsirOn: true });
  },
  closeTafsir: () => set({ tafsirOn: false }),
  setTafsirBook: (id) => set({ tafsirBook: id }),
  setRepeat: (repeat) => {
    persist({ repeat });
    set({ repeat });
  },
  setFollow: (follow) => {
    persist({ follow });
    set({ follow });
  },
  toggleFollow: () => {
    const follow = !get().follow;
    persist({ follow });
    set({ follow, wordIndex: follow ? get().wordIndex : -1 });
  },
  toggleWbw: () => {
    const wbw = !get().wbw;
    persist({ wbw });
    set({ wbw });
  },
  toggleTajweed: () => {
    const tajweed = !get().tajweed;
    persist({ tajweed });
    set({ tajweed });
  },
  setViewMode: (viewMode) => {
    persist({ viewMode });
    set({ viewMode });
  },
  setMushafFont: (mushafFont) => {
    persist({ mushafFont });
    set({ mushafFont });
  },
  setMushafLayout: (mushafLayout) => {
    persist({ mushafLayout });
    set({ mushafLayout });
  },
  setLearnMode: (learnMode) => {
    persist({ learnMode });
    set({ learnMode, waiting: false });
    if (get().playing) get().play();
  },
  setSpeed: (speed) => {
    persist({ speed });
    set({ speed });
    const el = getAudio();
    if (el) el.playbackRate = speed;
  },
  setGapMs: (gapMs) => {
    persist({ gapMs });
    set({ gapMs });
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
    void playNow();
  },
  playAt: (surah, ayah, to = null) => {
    persist({ surah, ayah });
    pendingWord = null;
    set({ surah, ayah, rangeTo: to, session: true, waiting: false, wordIndex: -1 });
    get().play();
  },
  playWord: (surah, ayah, index) => {
    persist({ surah, ayah });
    pendingWord = index;
    const mode = get().learnMode === "listen" ? "listen" : get().learnMode;
    set({ surah, ayah, session: true, waiting: false, follow: true });
    if (mode === "word") holdUntil = 0;
    get().play();
  },
  continueLearn: () => {
    const { learnMode, wordIndex, surah, ayah, words } = get();
    if (learnMode === "word") {
      const next = wordIndex + 1;
      if (next < (currentSegs.length || words.length)) {
        get().playWord(surah, ayah, next);
        return;
      }
    }
    get().next();
  },
  replayUnit: () => {
    const { learnMode, wordIndex, surah, ayah } = get();
    if (learnMode === "word") get().playWord(surah, ayah, Math.max(0, wordIndex));
    else get().play();
  },
  pause: () => {
    clearGap();
    stopTick();
    getAudio()?.pause();
    set({ playing: false, pulse: 0 });
  },
  stop: () => {
    clearGap();
    stopTick();
    const el = getAudio();
    if (el) {
      el.pause();
      el.removeAttribute("src");
      el.load();
    }
    set({ playing: false, session: false, waiting: false, wordIndex: -1, pulse: 0, audioMs: 0 });
  },
  toggle: () => {
    if (get().waiting) {
      get().continueLearn();
      return;
    }
    if (get().playing) get().pause();
    else get().play();
  },
  next: () => {
    const rec = reciterById(get().reciterId);
    const list = reciterSurahs(rec);
    if (list?.length) {
      const { surah } = get();
      const i = list.indexOf(surah);
      const ns = i >= 0 && i < list.length - 1 ? list[i + 1] : list[0];
      get().playAt(ns, 1, null);
      return;
    }
    const { surah, ayah, repeat, rangeTo } = get();
    const meta = surahOf(surah);
    let ns = surah;
    let na = ayah + 1;
    if (rangeTo && ayah >= rangeTo) {
      if (repeat === "surah") {
        na = ayah;
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
    pendingWord = get().learnMode === "word" ? 0 : null;
    set({ surah: ns, ayah: na, waiting: false, wordIndex: -1 });
    get().play();
  },
  prev: () => {
    const rec = reciterById(get().reciterId);
    const list = reciterSurahs(rec);
    if (list?.length) {
      const { surah } = get();
      const i = list.indexOf(surah);
      const ns = i > 0 ? list[i - 1] : list[list.length - 1];
      get().playAt(ns, 1, null);
      return;
    }
    const { surah, ayah, learnMode, wordIndex } = get();
    if (learnMode === "word" && wordIndex > 0) {
      get().playWord(surah, ayah, wordIndex - 1);
      return;
    }
    let ns = surah;
    let na = ayah - 1;
    if (na < 1) {
      if (surah <= 1) return;
      ns = surah - 1;
      na = surahOf(ns).ayahs;
    }
    persist({ surah: ns, ayah: na });
    set({ surah: ns, ayah: na, waiting: false, wordIndex: -1 });
    if (get().playing || get().session) get().play();
  },
  seekRatio: (r) => {
    const el = getAudio();
    if (!el || !el.duration) return;
    const t = Math.min(1, Math.max(0, r)) * el.duration;
    el.currentTime = t;
    const ms = t * 1000;
    useQuran.setState({
      audioMs: ms,
      wordIndex: get().follow ? wordIndexAt(currentSegs, ms) : get().wordIndex,
      waiting: false,
    });
    if (get().learnMode === "word") {
      const idx = wordIndexAt(currentSegs, ms);
      holdUntil = currentSegs[idx]?.end ?? 0;
    }
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
      follow: data.follow ?? true,
      wbw: data.wbw ?? false,
      tajweed: data.tajweed ?? true,
      viewMode: data.viewMode === "read" || data.viewMode === "learn" ? data.viewMode : "read",
      mushafFont: data.mushafFont ?? "uthmani",
      mushafLayout: data.mushafLayout === "ayah" || data.mushafLayout === "words" || data.mushafLayout === "page" ? data.mushafLayout : "page",
      learnMode: data.learnMode ?? "listen",
      speed: data.speed ?? 1.2,
      gapMs: data.gapMs ?? 0,
    });
  } catch {
    /* ignore */
  }
}
