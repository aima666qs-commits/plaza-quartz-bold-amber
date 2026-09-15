export type TafsirPiece = { from: number; to: number; text: string };

export type TafsirBook = {
  id: number;
  slug: string;
  name: string;
  pieces: TafsirPiece[];
};

export type TafsirSnap = {
  surah: number;
  retrievedAt: string;
  source: string;
  note: string;
  tafsirs: TafsirBook[];
};

export const TAFSIR_BOOKS = [
  { id: 170, slug: "ru-tafseer-al-saddi", ru: "Ас-Саʿди", lang: "ru" as const },
  { id: 169, slug: "en-tafisr-ibn-kathir", ru: "Ибн Касир", lang: "en" as const },
];

let snap: TafsirSnap | null = null;
let pending: Promise<TafsirSnap> | null = null;

export function loadYusufTafsir(): Promise<TafsirSnap> {
  if (snap) return Promise.resolve(snap);
  if (!pending) {
    pending = fetch("/quran/tafsir-yusuf.json")
      .then((r) => {
        if (!r.ok) throw new Error("tafsir");
        return r.json() as Promise<TafsirSnap>;
      })
      .then((d) => {
        snap = d;
        return d;
      })
      .catch((e) => {
        pending = null;
        throw e;
      });
  }
  return pending;
}

export function pieceAt(book: TafsirBook, ayah: number): TafsirPiece | undefined {
  return book.pieces.find((p) => ayah >= p.from && ayah <= p.to);
}

export function neighbor(book: TafsirBook, ayah: number, dir: -1 | 1): number {
  const i = book.pieces.findIndex((p) => ayah >= p.from && ayah <= p.to);
  const n = book.pieces[i + dir] ?? book.pieces[i];
  return n?.from ?? ayah;
}
