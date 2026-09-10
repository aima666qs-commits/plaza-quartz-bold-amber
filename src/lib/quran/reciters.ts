import type { Reciter } from "@/lib/quran/types.ts";

export const RECITERS: Reciter[] = [
  {
    id: "ar.husary",
    name: "Махмуд Халиль аль-Хусари",
    nameAr: "محمود خليل الحصري",
    style: "муратталь",
    bitrate: 128,
    everyayah: "Husary_128kbps",
    blurb: "Эталон каттабов Аль-Азхара. Медленный ясный таджвид Хафс — так учат читать.",
  },
  {
    id: "ar.minshawi",
    name: "Мухаммад Сиддик аль-Миншави",
    nameAr: "محمد صدّيق المنشاوي",
    style: "муратталь",
    bitrate: 128,
    everyayah: "Minshawy_Murattal_128kbps",
    blurb: "Мягкий египетский муратталь, второй столп обучения слуху.",
  },
  {
    id: "ar.abdulbasitmurattal",
    name: "Абдуль-Басит Абдус-Самад",
    nameAr: "عبد الباسط عبد الصمد",
    style: "муратталь",
    bitrate: 192,
    everyayah: "Abdul_Basit_Murattal_192kbps",
    blurb: "Классика XX века. Для закрепления маддов и дыхания.",
  },
  {
    id: "ar.hudhaify",
    name: "Али ибн Абдуррахман аль-Хузайфи",
    nameAr: "علي بن عبد الرحمن الحذيفي",
    style: "муратталь",
    bitrate: 128,
    everyayah: "Hudhaify_128kbps",
    blurb: "Имам Масджид ан-Набави. Ровная мединская школа.",
  },
  {
    id: "ar.alafasy",
    name: "Мишари Рашид аль-Афаси",
    nameAr: "مشاري راشد العفاسي",
    style: "муратталь",
    bitrate: 128,
    everyayah: "Alafasy_128kbps",
    blurb: "Современный ясный голос, удобен для ежедневного вирда.",
  },
  {
    id: "ar.mahermuaiqly",
    name: "Махир аль-Муайкли",
    nameAr: "ماهر المعيقلي",
    style: "муратталь",
    bitrate: 128,
    everyayah: "MaherAlMuaiqly128kbps",
    blurb: "Имам аль-Харам. Спокойный хиджазский ритм.",
  },
  {
    id: "ar.sudais",
    name: "Абдуррахман ас-Судейс",
    nameAr: "عبد الرحمن السديس",
    style: "муратталь",
    bitrate: 192,
    everyayah: "Abdurrahmaan_As-Sudais_192kbps",
    blurb: "Имам аль-Харам. Для слушания длинных сур.",
  },
];

export const DEFAULT_RECITER = RECITERS[0];

export function reciterById(id: string): Reciter {
  return RECITERS.find((r) => r.id === id) ?? DEFAULT_RECITER;
}

export function ayahAudioUrl(reciter: Reciter, global: number, surah: number, ayah: number): string {
  return `https://cdn.islamic.network/quran/audio/${reciter.bitrate}/${reciter.id}/${global}.mp3`;
}

export function ayahAudioFallback(reciter: Reciter, global: number, surah: number, ayah: number): string {
  if (reciter.everyayah) {
    const s = String(surah).padStart(3, "0");
    const a = String(ayah).padStart(3, "0");
    return `https://everyayah.com/data/${reciter.everyayah}/${s}${a}.mp3`;
  }
  return `https://cdn.alquran.cloud/media/audio/ayah/${reciter.id}/${global}`;
}
