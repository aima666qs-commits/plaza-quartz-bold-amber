const KEY = "mizan.v1.studyMs";
export const FREE_MS = 2 * 60 * 60 * 1000;

export function readStudyMs() {
  try {
    const n = Number(localStorage.getItem(KEY) || 0);
    return Number.isFinite(n) && n > 0 ? n : 0;
  } catch {
    return 0;
  }
}

export function addStudyMs(delta: number) {
  const next = readStudyMs() + Math.max(0, delta);
  try {
    localStorage.setItem(KEY, String(next));
  } catch {
    /* ignore */
  }
  return next;
}

export function guestLocked() {
  return readStudyMs() >= FREE_MS;
}
