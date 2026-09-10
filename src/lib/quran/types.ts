export type Place = "M" | "D";

export type SurahMeta = {
  n: number;
  ayahs: number;
  ar: string;
  tr: string;
  ru: string;
  place: Place;
};

export type Ayah = {
  i: number;
  g: number;
  ar: string;
  ru: string;
};

export type MushafSurah = {
  n: number;
  ayahs: Ayah[];
};

export type Reciter = {
  id: string;
  name: string;
  nameAr: string;
  style: string;
  bitrate: 64 | 128 | 192;
  everyayah?: string;
  blurb: string;
};

export type RepeatMode = "off" | "ayah" | "surah";

export type DrillKind = "letters" | "connect" | "harakat" | "tajweed" | "hifz" | "listen";

export type LessonDay = {
  d: number;
  title: string;
  minutes: number;
  task: string;
  drill?: DrillKind;
  surah?: number;
  from?: number;
  to?: number;
};

export type Phase = "nuraniyah" | "tajweed" | "hifz" | "tafsir";

export type WeekPlan = {
  n: number;
  phase: Phase;
  title: string;
  goal: string;
  days: LessonDay[];
  listen: { surah: number; from: number; to: number };
  kuliev: string;
  checkpoint: string;
  letters?: string[];
};
