import type { HisnBook, HisnChapter } from "@/lib/hisn/types.ts";

let cache: HisnBook | null = null;
let pending: Promise<HisnBook> | null = null;

export function loadHisn(): Promise<HisnBook> {
  if (cache) return Promise.resolve(cache);
  if (!pending) {
    pending = fetch("/hisn/book.json")
      .then((r) => {
        if (!r.ok) throw new Error("hisn");
        return r.json() as Promise<HisnBook>;
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

export function chapterOfDay(book: HisnBook, date = new Date()): HisnChapter {
  const start = Date.UTC(date.getFullYear(), 0, 0);
  const day = Math.floor((date.getTime() - start) / 86400000);
  return book.chapters[(day - 1) % book.chapters.length] ?? book.chapters[0];
}

export function morningChapter(book: HisnBook): HisnChapter | undefined {
  return book.chapters.find((c) => c.id === 27) ?? book.chapters[0];
}
