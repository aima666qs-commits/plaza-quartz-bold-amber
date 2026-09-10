import { SURAHS, globalToRef, surahOf } from "@/lib/quran/surahs.ts";
import type { Ayah, MushafSurah } from "@/lib/quran/types.ts";

let cache: MushafSurah[] | null = null;
let pending: Promise<MushafSurah[]> | null = null;

export function loadMushaf(): Promise<MushafSurah[]> {
  if (cache) return Promise.resolve(cache);
  if (!pending) {
    pending = fetch("/quran/mushaf.json")
      .then((r) => {
        if (!r.ok) throw new Error("mushaf");
        return r.json() as Promise<MushafSurah[]>;
      })
      .then((data) => {
        cache = data;
        return data;
      })
      .catch((err) => {
        pending = null;
        throw err;
      });
  }
  return pending;
}

export async function loadSurah(n: number): Promise<MushafSurah> {
  const all = await loadMushaf();
  return all[n - 1] ?? all[0];
}

export async function loadAyah(surah: number, ayah: number): Promise<Ayah | null> {
  const s = await loadSurah(surah);
  return s.ayahs.find((a) => a.i === ayah) ?? null;
}

export function dayAyahRef(date = new Date()): { surah: number; ayah: number } {
  const start = Date.UTC(date.getFullYear(), 0, 0);
  const day = Math.floor((date.getTime() - start) / 86400000);
  const g = ((day - 1) % 6236) + 1;
  return globalToRef(g);
}

export function searchMushaf(all: MushafSurah[], q: string, limit = 40): { surah: number; ayah: Ayah }[] {
  const needle = q.trim().toLowerCase();
  if (needle.length < 2) return [];
  const out: { surah: number; ayah: Ayah }[] = [];
  for (const s of all) {
    for (const a of s.ayahs) {
      if (a.ru.toLowerCase().includes(needle) || a.ar.includes(q.trim())) {
        out.push({ surah: s.n, ayah: a });
        if (out.length >= limit) return out;
      }
    }
  }
  return out;
}

export function formatRef(surah: number, ayah: number): string {
  const s = surahOf(surah);
  return `${s.ru} ${surah}:${ayah}`;
}

export { SURAHS };
