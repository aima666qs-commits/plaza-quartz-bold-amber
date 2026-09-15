export type TafsirHit = {
  bookId: number;
  name: string;
  surah: number;
  ayah: number;
  text: string;
};

export const TAFSIR_BOOKS = [
  { id: 170, ru: "Ас-Саʿди", lang: "ru" as const },
  { id: 169, ru: "Ибн Касир", lang: "en" as const },
  { id: 16, ru: "Муяссар", lang: "ar" as const },
  { id: 14, ru: "Ибн Касир · араб.", lang: "ar" as const },
];

const cache = new Map<string, TafsirHit>();

function stripHtml(s: string) {
  return s
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&/g, "&")
    .replace(/</g, "<")
    .replace(/>/g, ">")
    .replace(/"/g, '"')
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

type YusufSnap = {
  tafsirs: { id: number; name: string; pieces: { from: number; to: number; text: string }[] }[];
};

let yusuf: YusufSnap | null = null;

async function yusufFallback(bookId: number, ayah: number): Promise<TafsirHit | null> {
  try {
    if (!yusuf) {
      const r = await fetch("/quran/tafsir-yusuf.json");
      if (!r.ok) return null;
      yusuf = (await r.json()) as YusufSnap;
    }
    const book = yusuf.tafsirs.find((t) => t.id === bookId) ?? yusuf.tafsirs[0];
    const piece = book?.pieces.find((p) => ayah >= p.from && ayah <= p.to);
    if (!book || !piece) return null;
    return { bookId: book.id, name: book.name, surah: 12, ayah, text: piece.text };
  } catch {
    return null;
  }
}

export async function loadTafsir(bookId: number, surah: number, ayah: number): Promise<TafsirHit> {
  const key = `${bookId}:${surah}:${ayah}`;
  const hit = cache.get(key);
  if (hit) return hit;
  try {
    const url = `https://api.quran.com/api/v4/tafsirs/${bookId}/by_ayah/${surah}:${ayah}`;
    const r = await fetch(url, { headers: { Accept: "application/json" } });
    if (!r.ok) throw new Error("tafsir");
    const data = (await r.json()) as {
      tafsir?: { resource_id?: number; resource_name?: string; text?: string };
    };
    const text = stripHtml(data.tafsir?.text || "");
    if (!text) throw new Error("empty");
    const row: TafsirHit = {
      bookId: data.tafsir?.resource_id ?? bookId,
      name: data.tafsir?.resource_name || TAFSIR_BOOKS.find((b) => b.id === bookId)?.ru || "Тафсир",
      surah,
      ayah,
      text,
    };
    cache.set(key, row);
    return row;
  } catch {
    if (surah === 12) {
      const local = await yusufFallback(bookId, ayah);
      if (local) {
        cache.set(key, local);
        return local;
      }
    }
    throw new Error("tafsir");
  }
}
