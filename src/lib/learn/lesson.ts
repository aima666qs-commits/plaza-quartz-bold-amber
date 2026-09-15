import { COURSES, type Course, type CourseId } from "@/lib/learn/catalog.ts";
import { HARAKAT, LETTERS, type Letter } from "@/lib/quran/letters.ts";
import { SURAHS } from "@/lib/quran/surahs.ts";

export type Prompt = {
  kind: "letter" | "join" | "haraka" | "hifz" | "talk";
  ar: string;
  title: string;
  ask: string;
  expect: string[];
  hint: string;
  surah?: number;
  ayah?: number;
};

function norm(s: string) {
  return s
    .toLowerCase()
    .replace(/ё/g, "е")
    .replace(/[ъь'`ʼ\-]/g, "")
    .replace(/[.,!?]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function matches(spoken: string, expect: string[]) {
  const s = norm(spoken);
  if (!s) return false;
  return expect.some((a) => {
    const n = norm(a);
    if (n.length < 2) return s === n;
    return s === n || s.includes(n) || (n.length >= 4 && n.includes(s) && s.length >= 3);
  });
}

function letterAliases(l: Letter): string[] {
  const base = l.name.toLowerCase().replace(/\(.*?\)/g, "").trim();
  const extra: string[] = [];
  if (base === "ба") extra.push("баа", "баъ");
  if (base === "та") extra.push("таа");
  if (base === "са") extra.push("саа", "са");
  if (l.ar === "ح") extra.push("ха легкая", "хаа");
  if (l.ar === "خ") extra.push("ха тяжелая", "хаа тяжелая");
  if (l.ar === "ه") extra.push("ха круглая", "ха легкая");
  if (base === "алиф") extra.push("алиф", "алеф");
  return [l.name, base, l.nameAr, l.ar, ...extra];
}

export function letterPrompt(i: number): Prompt {
  const l = LETTERS[i % LETTERS.length];
  return {
    kind: "letter",
    ar: l.ar,
    title: "Буква",
    ask: `Смотри на букву. Как она называется?`,
    expect: letterAliases(l),
    hint: `${l.name} · ${l.nameAr}`,
  };
}

export function joinPrompt(i: number): Prompt {
  const l = LETTERS[i % LETTERS.length];
  return {
    kind: "join",
    ar: l.ar,
    title: "Связка",
    ask: `Буква ${l.name}. Соединяется влево? Скажи «да» или «нет».`,
    expect: l.joins ? ["да", "соединяется", "идет влево", "да соединяется"] : ["нет", "не соединяется", "не идет"],
    hint: l.joins ? "Да, пишется с хвостом влево." : "Нет: ا د ذ ر ز و не идут влево.",
  };
}

export function harakaPrompt(i: number): Prompt {
  const h = HARAKAT[i % HARAKAT.length];
  return {
    kind: "haraka",
    ar: `ب${h.mark}`,
    title: "Огласовка",
    ask: `Ба с этой огласовкой. Как называется знак?`,
    expect: [h.name, h.sound, h.name.toLowerCase()],
    hint: `${h.name} · звук «${h.sound}»`,
  };
}

export function hifzPrompt(surah: number): Prompt {
  const s = SURAHS.find((x) => x.n === surah) ?? SURAHS[SURAHS.length - 1];
  return {
    kind: "hifz",
    ar: s.ar,
    title: `${s.n}. ${s.ru}`,
    ask: "Три раза слух Хусари, потом прочитай. Когда прочитал — скажи «прочитал» или нажми кнопку.",
    expect: ["прочитал", "прочёл", "прочел", "готово", "повторил", "выучил"],
    hint: `${s.ayahs} аятов. Слух — Хусари.`,
    surah: s.n,
    ayah: 1,
  };
}

export function openLesson(course: Course | null): { line: string; prompt: Prompt | null } {
  if (!course) {
    return {
      line: "Мир тебе. Я учитель. Коран и арабский — по методу, не с потолка. Скажи «буквы», «нурания», «заучивать» или нажми карточку.",
      prompt: null,
    };
  }
  if (course.action === "arabic") {
    const p = letterPrompt(0);
    return {
      line: `Мир тебе. Метод: ${course.name}. Сначала буква, не сура. ${p.ask}`,
      prompt: p,
    };
  }
  if (course.action === "tajweed") {
    return {
      line: `Мир тебе. Таджвид Хафс: карточки ниже. Спроси «что такое ихфа» — отвечу по правилу. Карточка не заменяет учителя по таджвиду.`,
      prompt: null,
    };
  }
  if (course.action === "hifz") {
    const start = course.id === "juz-amma" || course.id === "three-ten-one" || course.id === "murajaa" ? 114 : 78;
    const p = hifzPrompt(start);
    const how =
      course.id === "three-ten-one"
        ? "3+10+1: три раза слух, десять раз сами, один раз вчерашняя."
        : course.id === "murajaa"
          ? "Сегодняшняя и пять предыдущих."
          : "Джуз Амма, с коротких.";
    return {
      line: `Мир тебе. ${how} Берём ${p.title}. ${p.ask}`,
      prompt: p,
    };
  }
  if (course.action === "itqan") {
    return {
      line: "Мир тебе. Иткан — 40 недель. Открой неделю ниже. Слух Хусари, потом тренажёр. Иджазу я не ставлю.",
      prompt: letterPrompt(0),
    };
  }
  return {
    line: `Мир тебе. Зал «${course.name}». ${course.how} Скажи, с чего начнём.`,
    prompt: null,
  };
}

export function intentCourse(question: string): CourseId | null {
  const s = norm(question);
  if (!s) return null;
  if (/(нуран|хаккан)/.test(s)) return "nuraniyah";
  if (/(букв|арабск|алфавит|огласов)/.test(s)) return "arabic";
  if (/(3\s*\+?\s*10|три плюс|заучив|хифз)/.test(s)) return "three-ten-one";
  if (/(мурадж|повтор)/.test(s)) return "murajaa";
  if (/(джуз|амма|коротк)/.test(s)) return "juz-amma";
  if (/(таджвид|ихфа|идгам|калькал)/.test(s)) return "tajweed";
  if (/(иткан|сорок недель)/.test(s)) return "itqan";
  if (/(хисн|крепост|вирд|дуа)/.test(s)) return "hisn";
  if (/(тафсир|йусуф|юсуф|кулиев|смысл|перевод)/.test(s)) return "tafsir";
  return null;
}

export function nextPrompt(course: Course | null, current: Prompt | null, ok: boolean): Prompt | null {
  if (!course || !current) {
    if (course?.action === "arabic") return letterPrompt(0);
    return current;
  }
  if (!ok) return current;
  if (current.kind === "letter") {
    const i = LETTERS.findIndex((l) => l.ar === current.ar);
    const n = i + 1;
    if (n >= LETTERS.length) return joinPrompt(0);
    return letterPrompt(n);
  }
  if (current.kind === "join") {
    const i = LETTERS.findIndex((l) => l.ar === current.ar);
    const n = i + 1;
    if (n >= LETTERS.length) return harakaPrompt(0);
    return joinPrompt(n);
  }
  if (current.kind === "haraka") {
    const i = HARAKAT.findIndex((h) => current.ar.endsWith(h.mark));
    return harakaPrompt(i + 1);
  }
  if (current.kind === "hifz" && current.surah) {
    const n = current.surah <= 78 ? 114 : current.surah - 1;
    return hifzPrompt(n);
  }
  return current;
}

export function courseById(id: CourseId | null): Course | null {
  if (!id) return null;
  return COURSES.find((c) => c.id === id) ?? null;
}
