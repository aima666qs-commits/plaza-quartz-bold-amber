import type { Reciter } from "@/lib/quran/types.ts";

const QURAN_API = "https://api.quran.com/api/v4";
const WBW_CDN = "https://audio.qurancdn.com/";

export type SyncWord = {
  i: number;
  ar: string;
  tr: string;
  gloss: string;
  audio: string;
};

export type WordSeg = { i: number; start: number; end: number };

export type AyahSync = {
  surah: number;
  ayah: number;
  words: SyncWord[];
  segs: WordSeg[];
  audioUrl: string;
  exact: boolean;
};

const cache = new Map<string, AyahSync>();

export function splitAyahWords(ar: string): SyncWord[] {
  return ar
    .split(/\s+/)
    .filter(Boolean)
    .map((w, i) => ({ i, ar: w, tr: "", gloss: "", audio: "" }));
}

export function estimateSegs(words: SyncWord[], durationMs: number): WordSeg[] {
  if (!words.length || durationMs <= 0) return [];
  const weights = words.map((w) => {
    const letters = w.ar.replace(/[^\u0621-\u064A\u0670\u0671\u06D5]/g, "");
    let wgt = Math.max(2, letters.length);
    if (/[اآويىٰ]/.test(w.ar)) wgt += 2;
    return wgt;
  });
  const total = weights.reduce((a, b) => a + b, 0) || 1;
  const lead = durationMs * 0.03;
  const usable = durationMs * 0.94;
  let t = lead;
  return words.map((w, i) => {
    const start = t;
    t += (weights[i] / total) * usable;
    return { i: w.i, start, end: t };
  });
}

export function wordIndexAt(segs: WordSeg[], ms: number): number {
  if (!segs.length) return -1;
  let idx = -1;
  for (let i = 0; i < segs.length; i++) {
    if (ms + 50 >= segs[i].start) idx = i;
    if (ms >= segs[i].start && ms < segs[i].end) return i;
  }
  if (ms >= segs[segs.length - 1].end) return segs.length - 1;
  return idx;
}

function parseSegs(raw: unknown, wordCount: number): WordSeg[] {
  if (!Array.isArray(raw)) return [];
  const out: WordSeg[] = [];
  for (const row of raw) {
    if (!Array.isArray(row)) continue;
    const nums = row.map(Number).filter((n) => Number.isFinite(n));
    if (nums.length < 3) continue;
    let i: number;
    let start: number;
    let end: number;
    if (nums.length >= 4) {
      i = nums[0];
      start = nums[2];
      end = nums[3];
    } else {
      i = nums[0];
      start = nums[1];
      end = nums[2];
    }
    if (i < 0 || i >= wordCount) continue;
    if (end > start) out.push({ i, start, end });
  }
  return out;
}

export function resolveVerseAudioUrl(url: string): string {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  if (url.startsWith("//")) return `https:${url}`;
  return `https://verses.quran.com/${url.replace(/^\//, "")}`;
}

type ApiWord = {
  char_type_name?: string;
  text_uthmani?: string;
  text?: string;
  audio_url?: string | null;
  translation?: { text?: string };
  transliteration?: { text?: string | null };
};

type ApiVerse = {
  words?: ApiWord[];
  audio?: { url?: string; segments?: unknown };
};

export async function loadAyahSync(
  surah: number,
  ayah: number,
  rec: Reciter,
  localAr: string,
): Promise<AyahSync> {
  const key = `${rec.qdc ?? "w"}:${surah}:${ayah}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const localWords = splitAyahWords(localAr);
  const fallback: AyahSync = {
    surah,
    ayah,
    words: localWords,
    segs: [],
    audioUrl: "",
    exact: false,
  };
  try {
    const audioQ = rec.qdc ? `&audio=${rec.qdc}` : "";
    const url = `${QURAN_API}/verses/by_key/${surah}:${ayah}?words=true&word_fields=text_uthmani,audio_url,translation,transliteration${audioQ}`;
    const r = await fetch(url, { headers: { Accept: "application/json" } });
    if (!r.ok) throw new Error("sync");
    const data = (await r.json()) as { verse?: ApiVerse };
    const rawWords = (data.verse?.words ?? []).filter((w) => w.char_type_name !== "end");
    const words: SyncWord[] = rawWords.length
      ? rawWords.map((w, i) => ({
          i,
          ar: w.text_uthmani || w.text || localWords[i]?.ar || "",
          tr: w.transliteration?.text || "",
          gloss: w.translation?.text || "",
          audio: w.audio_url ? `${WBW_CDN}${w.audio_url}` : "",
        }))
      : localWords;
    const segs = parseSegs(data.verse?.audio?.segments, words.length);
    const audioUrl = resolveVerseAudioUrl(data.verse?.audio?.url || "");
    const sync: AyahSync = {
      surah,
      ayah,
      words,
      segs,
      audioUrl,
      exact: segs.length > 0,
    };
    cache.set(key, sync);
    return sync;
  } catch {
    return fallback;
  }
}

export function prefetchAyahSync(surah: number, ayah: number, rec: Reciter, localAr: string) {
  void loadAyahSync(surah, ayah, rec, localAr);
}
