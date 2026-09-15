import { useEffect, useMemo, useState } from "react";
import { Check, ChevronLeft, ChevronRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { phaseLabel, weekByN, WEEKS } from "@/lib/quran/curriculum.ts";
import { HARAKAT, HEAVY, LETTERS, TAJWEED_CARDS } from "@/lib/quran/letters.ts";
import { ARABIC_METHODS, methodById } from "@/lib/learn/arabic-methods.ts";
import { COURSES, type Course, type CourseId } from "@/lib/learn/catalog.ts";
import { TeacherDesk } from "@/components/mizan/teacher-desk.tsx";
import { loadAyah } from "@/lib/quran/mushaf.ts";
import { SURAHS, surahOf } from "@/lib/quran/surahs.ts";
import type { Ayah, DrillKind, LessonDay } from "@/lib/quran/types.ts";
import { cn } from "@/lib/utils.ts";
import { TOTAL_STUDY_DAYS, useLearn } from "@/stores/learn-store.ts";
import { useMizan } from "@/stores/mizan-store.ts";
import { useQuran } from "@/stores/quran-store.ts";

const AMMA = SURAHS.filter((s) => s.n >= 78);

function LettersDrill({ filter }: { filter?: string[] }) {
  const pool = filter?.length ? LETTERS.filter((l) => filter.includes(l.ar)) : LETTERS;
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const letter = pool[idx % pool.length];
  const options = useMemo(() => {
    const rest = LETTERS.filter((l) => l.ar !== letter.ar).sort(() => Math.random() - 0.5).slice(0, 3);
    return [letter, ...rest].sort(() => Math.random() - 0.5);
  }, [letter]);
  const ok = picked === letter.name;
  return (
    <div className="grid gap-4">
      <p className="ayah-ar text-center text-6xl" lang="ar">
        {letter.ar}
      </p>
      <p className="text-center text-xs text-[var(--muted)]">{letter.nameAr}</p>
      <div className="grid grid-cols-2 gap-2">
        {options.map((o) => (
          <button
            key={o.ar}
            type="button"
            onClick={() => setPicked(o.name)}
            className={cn(
              "min-h-12 rounded-2xl border px-3 text-sm",
              picked && o.name === letter.name && "border-[var(--ok)] text-[var(--ok)]",
              picked && o.name === picked && o.name !== letter.name && "border-[var(--danger)] text-[var(--danger)]",
              !picked && "border-[var(--line)]",
            )}
          >
            {o.name}
          </button>
        ))}
      </div>
      {picked ? (
        <Button
          variant="secondary"
          className="pill"
          onClick={() => {
            setPicked(null);
            setIdx((i) => i + 1);
          }}
        >
          {ok ? "Дальше" : "Ещё раз"}
        </Button>
      ) : null}
    </div>
  );
}

function ConnectDrill() {
  const [i, setI] = useState(0);
  const [ans, setAns] = useState<boolean | null>(null);
  const letter = LETTERS[i % LETTERS.length];
  return (
    <div className="grid gap-3">
      <p className="ayah-ar text-center text-5xl" lang="ar">
        {letter.ar}
      </p>
      <p className="text-center text-sm">Соединяется влево?</p>
      <div className="grid grid-cols-2 gap-2">
        <Button variant="secondary" onClick={() => setAns(true)}>
          Да
        </Button>
        <Button variant="secondary" onClick={() => setAns(false)}>
          Нет
        </Button>
      </div>
      {ans !== null ? (
        <>
          <p className={ans === letter.joins ? "text-[var(--ok)]" : "text-[var(--danger)]"}>
            {letter.joins ? "Да, пишется с хвостом." : "Нет: ا د ذ ر ز و не идут влево."}
          </p>
          <Button
            className="pill"
            variant="ghost"
            onClick={() => {
              setAns(null);
              setI((x) => x + 1);
            }}
          >
            Следующая
          </Button>
        </>
      ) : null}
    </div>
  );
}

function HarakatDrill() {
  const base = "ب";
  const [i, setI] = useState(0);
  const [show, setShow] = useState(false);
  const h = HARAKAT[i % HARAKAT.length];
  return (
    <div className="grid gap-3 text-center">
      <p className="ayah-ar text-6xl" lang="ar">
        {base}
        {h.mark}
      </p>
      {show ? (
        <p>
          {h.name} · {h.sound}
        </p>
      ) : (
        <Button variant="secondary" className="pill" onClick={() => setShow(true)}>
          Показать
        </Button>
      )}
      <Button
        variant="ghost"
        onClick={() => {
          setShow(false);
          setI((x) => x + 1);
        }}
      >
        Дальше
      </Button>
      <p className="text-xs text-[var(--muted)]">Тяжёлые буквы истиʻля: {[...HEAVY].join(" ")}</p>
    </div>
  );
}

function TajweedDrill() {
  const [i, setI] = useState(0);
  const [open, setOpen] = useState(false);
  const card = TAJWEED_CARDS[i % TAJWEED_CARDS.length];
  return (
    <div className="grid gap-3">
      <p className="font-display text-2xl">{card.title}</p>
      <p className="ayah-ar text-2xl" lang="ar">
        {card.example}
      </p>
      {open ? <p className="text-sm leading-relaxed">{card.rule}</p> : (
        <Button variant="secondary" className="pill" onClick={() => setOpen(true)}>
          Правило
        </Button>
      )}
      <Button
        variant="ghost"
        onClick={() => {
          setOpen(false);
          setI((x) => x + 1);
        }}
      >
        Следующая карточка
      </Button>
    </div>
  );
}

function DrillPanel({ kind, letters }: { kind: DrillKind; letters?: string[] }) {
  if (kind === "letters") return <LettersDrill filter={letters} />;
  if (kind === "connect") return <ConnectDrill />;
  if (kind === "harakat") return <HarakatDrill />;
  if (kind === "tajweed") return <TajweedDrill />;
  if (kind === "hifz") {
    return <p className="text-sm text-[var(--muted)]">Откройте аяты в мусхафе, скройте перевод, читайте, затем сверьте Кулиева.</p>;
  }
  return <p className="text-sm text-[var(--muted)]">Включите Хусари в плеере и ведите пальцем по аяту.</p>;
}

function DayRow({ week, day }: { week: number; day: LessonDay }) {
  const done = useLearn((s) => s.isDone(week, day.d));
  const toggle = useLearn((s) => s.toggleDay);
  const playAt = useQuran((s) => s.playAt);
  const setTab = useMizan((s) => s.setAppTab);
  return (
    <div className="rounded-[22px] border border-[var(--line)] bg-[var(--surface)] p-4">
      <div className="flex items-start gap-3">
        <button
          type="button"
          aria-pressed={done}
          onClick={() => toggle(week, day.d)}
          className={cn(
            "grid size-11 shrink-0 place-items-center rounded-full border",
            done ? "border-[var(--ok)] bg-[var(--ok)] text-[var(--accent-fg)]" : "border-[var(--line)]",
          )}
        >
          <Check className="size-4" />
        </button>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] uppercase tracking-[0.14em] text-[var(--muted)]">
            День {day.d} · {day.minutes} мин
          </p>
          <p className="font-medium">{day.title}</p>
          <p className="mt-1 text-sm text-[var(--muted)]">{day.task}</p>
          {day.surah ? (
            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                variant="secondary"
                className="pill"
                onClick={() => {
                  useQuran.getState().setReciter("ar.husary");
                  playAt(day.surah!, day.from ?? 1, day.to ?? null);
                }}
              >
                <Play className="size-4" /> Хусари
              </Button>
              <Button
                variant="ghost"
                className="pill"
                onClick={() => {
                  useQuran.getState().setRef(day.surah!, day.from ?? 1);
                  setTab("quran");
                }}
              >
                {surahOf(day.surah).ru} {day.from ?? 1}–{day.to ?? surahOf(day.surah).ayahs}
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function playHusary(surah: number, from = 1, to?: number | null) {
  useQuran.getState().setReciter("ar.husary");
  useQuran.getState().playAt(surah, from, to ?? null);
}

function openMushaf(surah: number, ayah = 1) {
  useQuran.getState().setRef(surah, ayah);
  useMizan.getState().setAppTab("quran");
}

function SurahRow({
  n,
  extra,
  onPick,
  picked,
}: {
  n: number;
  extra?: string;
  onPick?: () => void;
  picked?: boolean;
}) {
  const s = surahOf(n);
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-2 rounded-2xl border px-3 py-3",
        picked ? "border-[var(--accent)]" : "border-[var(--line)]",
      )}
    >
      <button type="button" className="min-w-0 text-left" onClick={() => (onPick ? onPick() : openMushaf(s.n))}>
        <span className="ayah-ar block text-lg" lang="ar">
          {s.ar}
        </span>
        <span className="text-xs text-[var(--muted)]">
          {s.n}. {s.ru} · {s.ayahs} аятов{extra ? ` · ${extra}` : ""}
        </span>
      </button>
      <div className="flex shrink-0 gap-1">
        <Button variant="ghost" className="pill size-11 p-0" aria-label="Хусари" onClick={() => playHusary(s.n, 1, s.ayahs)}>
          <Play className="size-4" />
        </Button>
      </div>
    </div>
  );
}

function TalaqqiBoard() {
  const [n, setN] = useState(114);
  const [heard, setHeard] = useState(0);
  const [said, setSaid] = useState(0);
  const s = surahOf(n);
  return (
    <section className="grid gap-3">
      <p className="text-center text-sm text-[var(--muted)]">Слушай, затем верни. Три круга — обычный минимум урока.</p>
      <div className="flex items-center justify-center gap-2">
        <Button variant="secondary" className="pill size-11 p-0" aria-label="Предыдущая сура" onClick={() => setN((x) => (x >= 114 ? 78 : x + 1))}>
          <ChevronLeft className="size-5" />
        </Button>
        <p className="min-w-0 text-center">
          <span className="ayah-ar block text-2xl" lang="ar">
            {s.ar}
          </span>
          <span className="text-xs text-[var(--muted)]">
            {s.n}. {s.ru}
          </span>
        </p>
        <Button variant="secondary" className="pill size-11 p-0" aria-label="Следующая сура" onClick={() => setN((x) => (x <= 78 ? 114 : x - 1))}>
          <ChevronRight className="size-5" />
        </Button>
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        <Button
          variant="glow"
          className="pill"
          onClick={() => {
            playHusary(s.n, 1, s.ayahs);
            setHeard((h) => h + 1);
          }}
        >
          <Play className="size-4" /> Слух · {heard}/3
        </Button>
        <Button variant="secondary" className="pill" onClick={() => setSaid((v) => v + 1)}>
          Повторил · {said}/3
        </Button>
        <Button variant="ghost" className="pill" onClick={() => openMushaf(s.n)}>
          Мусхаф
        </Button>
      </div>
    </section>
  );
}

function TikrarBoard() {
  const need = useLearn((s) => s.tikrarNeed);
  const setNeed = useLearn((s) => s.setTikrarNeed);
  const [n, setN] = useState(114);
  const [ayah, setAyah] = useState(1);
  const [count, setCount] = useState(0);
  const [text, setText] = useState<Ayah | null>(null);
  const s = surahOf(n);

  useEffect(() => {
    let live = true;
    void loadAyah(n, ayah).then((a) => {
      if (live) setText(a);
    });
    return () => {
      live = false;
    };
  }, [n, ayah]);

  function nextAyah() {
    setCount(0);
    if (ayah >= s.ayahs) {
      const nx = n <= 78 ? 114 : n - 1;
      setN(nx);
      setAyah(1);
      return;
    }
    setAyah((a) => a + 1);
  }

  return (
    <section className="grid gap-3">
      <p className="text-center text-sm text-[var(--muted)]">Один аят. Пока не сядет на язык.</p>
      <div className="flex justify-center gap-2">
        {([10, 21] as const).map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => {
              setNeed(k);
              setCount(0);
            }}
            className={cn("min-h-11 rounded-full border px-4 text-sm", need === k ? "border-[var(--accent)] text-[var(--accent)]" : "border-[var(--line)]")}
          >
            {k} раз
          </button>
        ))}
      </div>
      <p className="ayah-ar text-center text-3xl leading-relaxed" lang="ar">
        {text?.ar ?? "…"}
      </p>
      <p className="text-center text-xs text-[var(--muted)]">
        {s.n}. {s.ru} · аят {ayah}/{s.ayahs}
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        <Button
          variant="glow"
          className="pill"
          onClick={() => {
            playHusary(n, ayah, ayah);
            setCount((c) => Math.min(need, c + 1));
          }}
        >
          <Play className="size-4" /> Ещё · {count}/{need}
        </Button>
        <Button variant="secondary" className="pill" onClick={nextAyah}>
          Следующий аят
        </Button>
        <Button
          variant="ghost"
          className="pill"
          onClick={() => {
            setN((x) => (x <= 78 ? 114 : x - 1));
            setAyah(1);
            setCount(0);
          }}
        >
          Другая сура
        </Button>
      </div>
    </section>
  );
}

function SabaqBoard() {
  const sabaq = useLearn((s) => s.sabaqSurah);
  const setSabaq = useLearn((s) => s.setSabaq);
  const sabaqi = AMMA.filter((s) => s.n > sabaq && s.n <= Math.min(114, sabaq + 5)).reverse();
  const manzil = AMMA.filter((s) => s.n > Math.min(114, sabaq + 5)).reverse().slice(0, 6);
  return (
    <section className="grid gap-4">
      <p className="text-center text-sm text-[var(--muted)]">Сабак — новое. Сабаки — недавнее. Манзиль — старое.</p>
      <div>
        <p className="mb-2 text-center text-[11px] uppercase tracking-[0.16em] text-[var(--muted)]">Сабак</p>
        <SurahRow n={sabaq} extra="сегодня" picked />
      </div>
      <div className="grid gap-2">
        <p className="text-center text-[11px] uppercase tracking-[0.16em] text-[var(--muted)]">Сабаки</p>
        {sabaqi.length ? sabaqi.map((s) => <SurahRow key={s.n} n={s.n} extra="недавнее" />) : <p className="text-center text-xs text-[var(--muted)]">Пока пусто — это первый урок.</p>}
      </div>
      <div className="grid gap-2">
        <p className="text-center text-[11px] uppercase tracking-[0.16em] text-[var(--muted)]">Манзиль</p>
        {manzil.length ? manzil.map((s) => <SurahRow key={s.n} n={s.n} extra="старое" />) : <p className="text-center text-xs text-[var(--muted)]">Старого ещё нет.</p>}
      </div>
      <p className="text-center text-[11px] uppercase tracking-[0.16em] text-[var(--muted)]">Назначить сабак</p>
      <div className="grid gap-2">
        {AMMA.map((s) => (
          <SurahRow key={s.n} n={s.n} picked={s.n === sabaq} onPick={() => setSabaq(s.n)} extra={s.n === sabaq ? "сабак" : undefined} />
        ))}
      </div>
    </section>
  );
}

function AmmaList({ hint }: { hint: string }) {
  return (
    <section className="grid gap-2">
      <p className="text-center text-sm text-[var(--muted)]">{hint}</p>
      {AMMA.map((s) => (
        <SurahRow key={s.n} n={s.n} />
      ))}
    </section>
  );
}

function HifzBoard({ id }: { id: CourseId }) {
  if (id === "talaqqi") return <TalaqqiBoard />;
  if (id === "tikrar") return <TikrarBoard />;
  if (id === "sabaq") return <SabaqBoard />;
  if (id === "three-ten-one") return <AmmaList hint="Сура: 3 раза Хусари, 10 раз сами, 1 раз вчерашняя." />;
  if (id === "murajaa") return <AmmaList hint="Сегодняшняя сура и пять предыдущих." />;
  return <AmmaList hint="Джуз Амма, суры 78–114." />;
}

export function LearnView() {
  const weekN = useLearn((s) => s.week);
  const setWeek = useLearn((s) => s.setWeek);
  const courseId = useLearn((s) => s.course);
  const setCourse = useLearn((s) => s.setCourse);
  const lane = useLearn((s) => s.lane);
  const setLane = useLearn((s) => s.setLane);
  const arabicMethod = useLearn((s) => s.arabicMethod);
  const setArabicMethod = useLearn((s) => s.setArabicMethod);
  const lessonN = useLearn((s) => s.lessonN);
  const setLessonN = useLearn((s) => s.setLessonN);
  const count = useLearn((s) => s.completedCount());
  const playAt = useQuran((s) => s.playAt);
  const week = weekByN(weekN);
  const [drill, setDrill] = useState<DrillKind | null>(week.days.find((d) => d.drill)?.drill ?? "letters");
  const pct = Math.round((count / TOTAL_STUDY_DAYS) * 100);
  const course = COURSES.find((c) => c.id === courseId) ?? null;
  const method = methodById(arabicMethod);
  const lesson = method?.lessons.find((x) => x.n === lessonN) ?? method?.lessons[0];

  function openCourse(c: Course) {
    if (c.action === "hisn") {
      useMizan.getState().setAppTab("hisn");
      return;
    }
    if (c.action === "quran") {
      useMizan.getState().setAppTab("quran");
      return;
    }
    if (c.action === "tafsir") {
      useQuran.getState().openTafsir();
      useMizan.getState().setAppTab("quran");
      return;
    }
    setCourse(c.id);
  }

  if (!lane) {
    return (
      <div className="page-pad mx-auto grid max-w-3xl gap-4 px-4 pt-6">
        <div className="text-center">
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--muted)]">ماذا ندرس</p>
          <h1 className="font-display mt-2 text-3xl tracking-tight">Что учим</h1>
          <p className="mx-auto mt-2 max-w-md text-sm text-[var(--muted)]">Сначала путь. Потом метод. Потом урок.</p>
        </div>
        {(
          [
            { id: "quran" as const, ru: "Коран", ar: "القرآن", hint: "Мусхаф, таджвид, тафсир, Иткан." },
            { id: "arabic" as const, ru: "Арабский язык", ar: "اللغة العربية", hint: "Топ-методики мира, уроки по порядку." },
            { id: "hifz" as const, ru: "Хифз", ar: "الحفظ", hint: "Заучивание со слухом Хусари. Главный путь." },
          ]
        ).map((p) => (
          <button key={p.id} type="button" className="door text-start" onClick={() => setLane(p.id)}>
            <span className="ayah-ar block text-2xl" lang="ar">
              {p.ar}
            </span>
            <span className="font-display mt-1 block text-2xl">{p.ru}</span>
            <span className="mt-1 block text-sm text-[var(--muted)]">{p.hint}</span>
          </button>
        ))}
      </div>
    );
  }

  if (lane === "arabic" && !method) {
    return (
      <div className="page-pad mx-auto grid max-w-3xl gap-4 px-4 pt-6">
        <h1 className="font-display text-3xl">Методика арабского</h1>
        <p className="text-sm text-[var(--muted)]">Пять рабочих школ. Не реклама издательства — как реально учат.</p>
        {ARABIC_METHODS.map((m) => (
          <button key={m.id} type="button" className="door text-start" onClick={() => setArabicMethod(m.id)}>
            <span className="ayah-ar block text-lg" lang="ar">
              {m.ar}
            </span>
            <span className="font-display mt-1 block text-xl">{m.ru}</span>
            <span className="mt-1 block text-sm">{m.origin}</span>
            <span className="mt-1 block text-xs text-[var(--muted)]">{m.why}</span>
            <span className="mt-2 block text-xs text-[var(--muted)]">{m.honest}</span>
          </button>
        ))}
      </div>
    );
  }

  if (lane === "arabic" && method && !course) {
    return (
      <div className="page-pad mx-auto grid max-w-3xl gap-4 px-4 pt-6">
        <header className="rounded-[28px] border border-[var(--line)] bg-[var(--bg-elev)] p-5">
          <p className="ayah-ar text-2xl" lang="ar">
            {method.ar}
          </p>
          <h1 className="font-display mt-2 text-3xl">{method.ru}</h1>
          <p className="mt-2 text-sm text-[var(--muted)]">{method.honest}</p>
        </header>
        <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--muted)]">Уроки</p>
        {method.lessons.map((ls) => (
          <button
            key={ls.n}
            type="button"
            className={cn("door text-start", lessonN === ls.n && "border-[var(--accent)]")}
            onClick={() => setLessonN(ls.n)}
          >
            <span className="text-[11px] text-[var(--muted)]">
              Урок {ls.n} · {ls.minutes} мин
            </span>
            <span className="mt-1 block font-display text-xl">{ls.title}</span>
            <span className="mt-1 block text-sm text-[var(--muted)]">{ls.goal}</span>
          </button>
        ))}
        {lesson ? (
          <article className="rounded-[28px] border border-[var(--line)] bg-[var(--surface)] p-5">
            <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--muted)]">
              Урок {lesson.n}
            </p>
            <h2 className="font-display mt-1 text-2xl">{lesson.title}</h2>
            <p className="mt-3 text-sm">{lesson.teach}</p>
            <p className="ayah-ar mt-4 text-3xl" lang="ar">
              {lesson.exampleAr}
            </p>
            <p className="mt-2 text-sm text-[var(--muted)]">{lesson.exampleRu}</p>
            <div className="mt-4">
              <DrillPanel kind={lesson.drill === "read" ? "letters" : lesson.drill} />
            </div>
            <div className="mt-4 flex gap-2">
              <Button variant="secondary" className="pill" disabled={lesson.n <= 1} onClick={() => setLessonN(lesson.n - 1)}>
                Назад
              </Button>
              <Button
                variant="glow"
                className="pill flex-1"
                onClick={() => {
                  const next = method.lessons.find((x) => x.n === lesson.n + 1);
                  if (next) setLessonN(next.n);
                }}
                disabled={!method.lessons.some((x) => x.n === lesson.n + 1)}
              >
                Урок {lesson.n + 1}
              </Button>
            </div>
            <Button className="mt-3 w-full" variant="ghost" onClick={() => useMizan.getState().setAppTab("quran")}>
              Открыть мусхаф
            </Button>
          </article>
        ) : null}
      </div>
    );
  }

  if (!course) {
    const list = COURSES.filter((c) => {
      if (lane === "hifz") return c.faculty === "hifz";
      if (lane === "quran") return c.faculty === "quran" || c.faculty === "tajweed" || c.id === "itqan" || c.id === "tafsir";
      return true;
    });
    return (
      <div className="page-pad mx-auto grid max-w-3xl gap-6 px-4 pt-6">
        <div className="text-center">
          <h1 className="font-display mt-2 text-3xl tracking-tight">{lane === "hifz" ? "Хифз" : "Коран"}</h1>
          <p className="mx-auto mt-2 max-w-md text-sm text-[var(--muted)]">
            {lane === "hifz" ? "Слух, повтор, сокрытие. Иджазу даёт живой шейх." : "Мусхаф, таджвид, программа Иткан."}
          </p>
        </div>
        {list.map((c) => (
          <button key={c.id} type="button" className="door text-start" onClick={() => openCourse(c)} data-go={`course-${c.id}`}>
            <span className="ayah-ar block text-lg" lang="ar">
              {c.nameAr}
            </span>
            <span className="font-display mt-1 block text-xl leading-tight">{c.name}</span>
            <span className="mt-1 block text-sm text-[var(--muted)]">{c.inventor}</span>
          </button>
        ))}
      </div>
    );
  }

  const showArabic = course.action === "arabic";
  const showTajweed = course.action === "tajweed";
  const showHifz = course.action === "hifz";
  const showItqan = course.action === "itqan";

  return (
    <div className="method-page" data-go="method-page">
      <div className="method-inner">
        <button type="button" className="method-back" onClick={() => setCourse(null)} data-go="methods-back">
          <ChevronLeft className="size-4" /> Все методы
        </button>

        <header className="rounded-[28px] border border-[var(--line)] bg-[var(--bg-elev)] p-5 text-center">
          <p className="ayah-ar text-2xl" lang="ar">
            {course.nameAr}
          </p>
          <h1 className="font-display mt-2 text-3xl tracking-tight">{course.name}</h1>
          <p className="mt-3 text-sm">{course.inventor}</p>
          <p className="mt-2 text-sm text-[var(--muted)]">{course.how}</p>
          <p className="mt-3 text-xs text-[var(--muted)]">{course.honest}</p>
        </header>

        <TeacherDesk course={course} />

        {showArabic ? (
          <section className="rounded-[28px] border border-[var(--line)] bg-[var(--surface)] p-5">
            <p className="text-center text-[11px] uppercase tracking-[0.16em] text-[var(--muted)]">Зал арабского</p>
            <div className="mt-3 flex flex-wrap justify-center gap-2">
              {(["letters", "connect", "harakat"] as DrillKind[]).map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setDrill(k)}
                  className={cn(
                    "min-h-11 rounded-full border px-4 text-sm",
                    drill === k ? "border-[var(--accent)] text-[var(--accent)]" : "border-[var(--line)]",
                  )}
                >
                  {k === "letters" ? "Буквы" : k === "connect" ? "Связки" : "Огласовки"}
                </button>
              ))}
            </div>
            <div className="mt-4">
              <DrillPanel kind={drill === "tajweed" ? "letters" : drill ?? "letters"} />
            </div>
          </section>
        ) : null}

        {showTajweed ? (
          <section className="rounded-[28px] border border-[var(--line)] bg-[var(--surface)] p-5">
            <p className="text-center text-[11px] uppercase tracking-[0.16em] text-[var(--muted)]">Карточки Хафс</p>
            <div className="mt-4">
              <DrillPanel kind="tajweed" />
            </div>
          </section>
        ) : null}

        {showHifz ? <HifzBoard id={course.id} /> : null}

        {showItqan ? (
          <>
            <div className="rounded-[28px] border border-[var(--line)] bg-[var(--bg-elev)] p-5">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--muted)]">Прогресс</p>
                <p className="tabular-nums text-sm">{pct}%</p>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--surface)]">
                <div className="h-full rounded-full bg-[var(--accent)]" style={{ width: `${pct}%` }} />
              </div>
              <p className="mt-2 text-xs text-[var(--muted)]">
                {count} из {TOTAL_STUDY_DAYS} учебных дней · 40 недель
              </p>
            </div>

            <div className="flex items-center justify-between gap-2">
              <Button variant="secondary" className="pill size-11 p-0" onClick={() => setWeek(weekN - 1)} aria-label="Предыдущая неделя">
                <ChevronLeft className="size-5" />
              </Button>
              <div className="min-w-0 text-center">
                <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--muted)]">
                  Неделя {week.n} · {phaseLabel(week.phase)}
                </p>
                <p className="font-display text-xl leading-tight">{week.title}</p>
              </div>
              <Button variant="secondary" className="pill size-11 p-0" onClick={() => setWeek(weekN + 1)} aria-label="Следующая неделя">
                <ChevronRight className="size-5" />
              </Button>
            </div>

            <p className="text-center text-sm">{week.goal}</p>
            <p className="text-center text-sm text-[var(--muted)]">{week.kuliev}</p>
            <p className="text-center text-xs text-[var(--muted)]">Зачёт: {week.checkpoint}</p>

            <Button
              variant="glow"
              onClick={() => {
                useQuran.getState().setReciter("ar.husary");
                playAt(week.listen.surah, week.listen.from, week.listen.to);
              }}
            >
              <Play className="size-4" /> Слушание недели · {surahOf(week.listen.surah).ru} {week.listen.from}–{week.listen.to}
            </Button>

            <div className="grid gap-3">
              {week.days.map((day) => (
                <DayRow key={day.d} week={week.n} day={day} />
              ))}
            </div>

            <section className="rounded-[28px] border border-[var(--line)] bg-[var(--surface)] p-5">
              <p className="text-center text-[11px] uppercase tracking-[0.16em] text-[var(--muted)]">Тренажёр</p>
              <div className="mt-3 flex flex-wrap justify-center gap-2">
                {(["letters", "connect", "harakat", "tajweed"] as DrillKind[]).map((k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setDrill(k)}
                    className={cn(
                      "min-h-11 rounded-full border px-3 py-2 text-xs",
                      drill === k ? "border-[var(--accent)] text-[var(--accent)]" : "border-[var(--line)]",
                    )}
                  >
                    {k === "letters" ? "Буквы" : k === "connect" ? "Связки" : k === "harakat" ? "Огласовки" : "Таджвид"}
                  </button>
                ))}
              </div>
              <div className="mt-4">{drill ? <DrillPanel kind={drill} letters={week.letters} /> : null}</div>
            </section>

            <div className="flex justify-center gap-2 overflow-x-auto pb-1">
              {WEEKS.map((w) => (
                <button
                  key={w.n}
                  type="button"
                  onClick={() => setWeek(w.n)}
                  className={cn(
                    "grid size-11 shrink-0 place-items-center rounded-full border text-xs tabular-nums",
                    w.n === weekN ? "border-[var(--accent)] text-[var(--accent)]" : "border-[var(--line)]",
                  )}
                >
                  {w.n}
                </button>
              ))}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
