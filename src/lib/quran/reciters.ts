import type { Reciter } from "@/lib/quran/types.ts";

export const RECITERS: Reciter[] = [
  {
    id: "ar.husary",
    name: "Махмуд Халиль аль-Хусари",
    nameAr: "محمود خليل الحصري",
    style: "муратталь",
    bitrate: 128,
    everyayah: "Husary_128kbps",
    qdc: 6,
    blurb: "Эталон каттабов Аль-Азхара. Медленный ясный таджвид Хафс — так учат читать.",
  },
  {
    id: "ar.husarymuallim",
    name: "Хусари — муаллим",
    nameAr: "الحصري معلم",
    style: "муаллим",
    bitrate: 128,
    everyayah: "Husary_Muallim_128kbps",
    qdc: 12,
    blurb: "Учебное чтение: паузы, ясность, слово за словом. Голос для иткана и хифза.",
  },
  {
    id: "ar.abuhajar",
    name: "Абу Хаджр аль-Ираки",
    nameAr: "أبو هاجر العراقي",
    style: "муджаввад",
    bitrate: 128,
    kind: "surah",
    surahFiles: {
      3: "https://archive.org/download/20250511_20250511_1505/%D8%B3%D9%88%D8%B1%D8%A9%20%D8%A2%D9%84%20%D8%B9%D9%85%D8%B1%D8%A7%D9%86.mp3",
      8: "https://archive.org/download/20250511_20250511_1505/%D8%B3%D9%88%D8%B1%D8%A9%20%D8%A7%D9%84%D8%A3%D9%86%D9%81%D8%A7%D9%84.mp3",
      9: "https://archive.org/download/20250511_20250511_1505/%D8%B3%D9%88%D8%B1%D8%A9%20%D8%A7%D9%84%D8%AA%D9%88%D8%A8%D8%A9.mp3",
    },
    blurb: "Абу Хаджр (Абу Хаджер) аль-Ираки. На открытом архиве — суры 3, 8 и 9 целиком. Аятного мусхафа на зеркалах нет.",
  },
  {
    id: "ar.minshawi",
    name: "Мухаммад Сиддик аль-Миншави",
    nameAr: "محمد صدّيق المنشاوي",
    style: "муратталь",
    bitrate: 128,
    everyayah: "Minshawy_Murattal_128kbps",
    qdc: 9,
    blurb: "Мягкий египетский муратталь, второй столп обучения слуху.",
  },
  {
    id: "ar.abdulbasitmurattal",
    name: "Абдуль-Басит Абдус-Самад",
    nameAr: "عبد الباسط عبد الصمد",
    style: "муратталь",
    bitrate: 192,
    everyayah: "Abdul_Basit_Murattal_192kbps",
    qdc: 2,
    blurb: "Классика XX века. Для закрепления маддов и дыхания.",
  },
  {
    id: "ar.abdulbasitmujawwad",
    name: "Абдуль-Басит — муджаввад",
    nameAr: "عبد الباسط مجود",
    style: "муджаввад",
    bitrate: 128,
    everyayah: "Abdul_Basit_Mujawwad_128kbps",
    qdc: 1,
    blurb: "Певчий муджаввад Абдуль-Басита. Для слуха, не для первого разбора букв.",
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
    qdc: 7,
    blurb: "Современный ясный голос, удобен для ежедневного вирда.",
  },
  {
    id: "ar.shatri",
    name: "Абу Бакр аш-Шатри",
    nameAr: "أبو بكر الشاطري",
    style: "муратталь",
    bitrate: 128,
    everyayah: "Abu_Bakr_Ash-Shaatree_128kbps",
    qdc: 4,
    blurb: "Спокойный йеменский муратталь. Хорошо садится на подсветку слов.",
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
    qdc: 3,
    blurb: "Имам аль-Харам. Для слушания длинных сур.",
  },
  {
    id: "ar.musazemmouri",
    name: "Муса аз-Зиммури",
    nameAr: "موسى الزموري",
    style: "муджаввад",
    bitrate: 128,
    kind: "surah",
    surahFiles: {
      29: "https://archive.org/download/CAGEBr.Musa/CAGE%20-%20Br.%20Musa.mp3",
    },
    blurb: "Муса аз-Зиммури (Zemmouri). На архиве — отрывок суры 29. Полного мусхафа на зеркалах нет.",
  },
  {
    id: "ar.mansourmohiuddin",
    name: "Мансур Мухиддин",
    nameAr: "منصور محي الدين",
    style: "муджаввад",
    bitrate: 128,
    kind: "surah",
    surahFiles: {},
    blurb: "Мансур Мухиддин (Mansour Mohieddine). Аятного мусхафа на islamic.network и mp3quran нет — чужой голос не подставляю.",
  },
];

export const DEFAULT_RECITER = RECITERS[0];

export function reciterById(id: string): Reciter {
  return RECITERS.find((r) => r.id === id) ?? DEFAULT_RECITER;
}

export function ayahAudioUrl(reciter: Reciter, global: number, surah: number, ayah: number): string {
  const surahFile = reciter.surahFiles?.[surah];
  if (surahFile) return surahFile;
  return `https://cdn.islamic.network/quran/audio/${reciter.bitrate}/${reciter.id}/${global}.mp3`;
}

export function reciterSurahs(reciter: Reciter): number[] | null {
  if (!reciter.surahFiles) return null;
  const keys = Object.keys(reciter.surahFiles);
  if (!keys.length) return null;
  return keys.map(Number).sort((a, b) => a - b);
}

export function ayahAudioFallback(reciter: Reciter, global: number, surah: number, ayah: number): string {
  const surahFile = reciter.surahFiles?.[surah];
  if (surahFile) return surahFile;
  if (reciter.everyayah) {
    const s = String(surah).padStart(3, "0");
    const a = String(ayah).padStart(3, "0");
    return `https://everyayah.com/data/${reciter.everyayah}/${s}${a}.mp3`;
  }
  return `https://cdn.alquran.cloud/media/audio/ayah/${reciter.id}/${global}`;
}
