const PLACE = "mizan.hadith.place";
const FAV = "mizan.hadith.fav";

export type HadithPlace = {
  id: string;
  section: number;
  n: number;
};

export function readPlace(): HadithPlace | null {
  try {
    const raw = localStorage.getItem(PLACE);
    if (!raw) return null;
    const p = JSON.parse(raw) as HadithPlace;
    if (!p?.id || !Number.isFinite(p.n)) return null;
    return p;
  } catch {
    return null;
  }
}

export function writePlace(p: HadithPlace) {
  try {
    localStorage.setItem(PLACE, JSON.stringify(p));
  } catch {
    /* ignore */
  }
}

export function readFavs(): string[] {
  try {
    const raw = localStorage.getItem(FAV);
    const list = raw ? (JSON.parse(raw) as string[]) : [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export function toggleFav(key: string) {
  const cur = readFavs();
  const next = cur.includes(key) ? cur.filter((k) => k !== key) : [key, ...cur].slice(0, 400);
  try {
    localStorage.setItem(FAV, JSON.stringify(next));
  } catch {
    /* ignore */
  }
  return next;
}
