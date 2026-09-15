/** Аяты терпения и утешения. Номера — Усмани. Текст берём из мусхафа Кулиева, не сочиняем. */
export const SABR_AYAHS: { surah: number; ayah: number }[] = [
  { surah: 2, ayah: 45 },
  { surah: 2, ayah: 153 },
  { surah: 2, ayah: 155 },
  { surah: 2, ayah: 156 },
  { surah: 2, ayah: 157 },
  { surah: 2, ayah: 214 },
  { surah: 2, ayah: 286 },
  { surah: 3, ayah: 139 },
  { surah: 3, ayah: 186 },
  { surah: 3, ayah: 200 },
  { surah: 8, ayah: 46 },
  { surah: 9, ayah: 40 },
  { surah: 9, ayah: 51 },
  { surah: 11, ayah: 11 },
  { surah: 12, ayah: 18 },
  { surah: 12, ayah: 87 },
  { surah: 13, ayah: 28 },
  { surah: 16, ayah: 96 },
  { surah: 16, ayah: 127 },
  { surah: 18, ayah: 28 },
  { surah: 21, ayah: 83 },
  { surah: 29, ayah: 69 },
  { surah: 39, ayah: 10 },
  { surah: 39, ayah: 53 },
  { surah: 40, ayah: 55 },
  { surah: 41, ayah: 30 },
  { surah: 46, ayah: 35 },
  { surah: 65, ayah: 2 },
  { surah: 65, ayah: 3 },
  { surah: 70, ayah: 5 },
  { surah: 76, ayah: 12 },
  { surah: 90, ayah: 17 },
  { surah: 93, ayah: 5 },
  { surah: 94, ayah: 5 },
  { surah: 94, ayah: 6 },
  { surah: 103, ayah: 3 },
];

export function sabrOfDay(date = new Date()) {
  const start = Date.UTC(2024, 0, 1);
  const day = Math.floor((date.getTime() - start) / 86400000);
  const i = ((day % SABR_AYAHS.length) + SABR_AYAHS.length) % SABR_AYAHS.length;
  return SABR_AYAHS[i];
}

export function sabrDayKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}
