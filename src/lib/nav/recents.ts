export type RecentItem = { id: string; at: number };

const KEY = "mizan.v1.navRecents";
const SEEN = "mizan.v1.salahSeen";

export function readRecents(): RecentItem[] {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return [];
    const list = JSON.parse(raw) as RecentItem[];
    if (!Array.isArray(list)) return [];
    return list.filter((x) => x && typeof x.id === "string").slice(0, 5);
  } catch {
    return [];
  }
}

export function pushRecent(id: string) {
  if (!id || typeof window === "undefined") return;
  try {
    const prev = readRecents().filter((x) => x.id !== id);
    const next = [{ id, at: Date.now() }, ...prev].slice(0, 5);
    sessionStorage.setItem(KEY, JSON.stringify(next));
    window.dispatchEvent(new Event("mizan-recents"));
  } catch {
    /* ignore */
  }
}

export function markSalahSeen() {
  try {
    sessionStorage.setItem(SEEN, "1");
    window.dispatchEvent(new Event("mizan-salah-seen"));
  } catch {
    /* ignore */
  }
}

export function salahWasSeen() {
  try {
    return sessionStorage.getItem(SEEN) === "1";
  } catch {
    return false;
  }
}
