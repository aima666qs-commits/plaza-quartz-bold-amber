import { useMemo, useState } from "react";
import { Check, ChevronLeft, ChevronRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { phaseLabel, weekByN, WEEKS } from "@/lib/quran/curriculum.ts";
import { HARAKAT, HEAVY, LETTERS, TAJWEED_CARDS } from "@/lib/quran/letters.ts";
import { COURSES, FACULTIES, type Course } from "@/lib/learn/catalog.ts";
import { TeacherDesk } from "@/components/mizan/teacher-desk.tsx";
import { SURAHS, surahOf } from "@/lib/quran/surahs.ts";
import type { DrillKind, LessonDay } from "@/lib/quran/types.ts";
import { cn } from "@/lib/utils.ts";
import { TOTAL_STUDY_DAYS, useLearn } from "@/stores/learn-store.ts";
import { useMizan } from "@/stores/mizan-store.ts";
import { useQuran } from "@/stores/quran-store.ts";

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

export function LearnView() {
  const weekN = useLearn((s) => s.week);
  const setWeek = useLearn((s) => s.setWeek);
  const courseId = useLearn((s) => s.course);
  const setCourse = useLearn((s) => s.setCourse);
  const count = useLearn((s) => s.completedCount());
  const playAt = useQuran((s) => s.playAt);
  const setTab = useMizan((s) => s.setAppTab);
  const week = weekByN(weekN);
  const [drill, setDrill] = useState<DrillKind | null>(week.days.find((d) => d.drill)?.drill ?? "letters");
  const pct = Math.round((count / TOTAL_STUDY_DAYS) * 100);
  const course = COURSES.find((c) => c.id === courseId) ?? null;

  function openCourse(c: Course) {
    setCourse(c.id);
    if (c.action === "hisn") {
      setTab("hisn");
      return;
    }
    if (c.action === "quran") {
      setTab("quran");
    }
    if (c.action === "tafsir") {
      useQuran.getState().openTafsir(12, 1);
      setTab("quran");
    }
  }

  if (!course) {
    return (
      <div className="page-pad mx-auto grid max-w-3xl gap-6 px-4 pt-6">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--muted)]">جامعة · факультет</p>
          <h1 className="font-display mt-2 text-3xl tracking-tight">Обучение</h1>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Учитель ведёт урок: слушает, отвечает, держит метод. Иджазу даёт живой шейх, не это окно.
          </p>
        </div>
        <TeacherDesk course={null} />
        {FACULTIES.map((f) => {
          const list = COURSES.filter((c) => c.faculty === f.id);
          if (!list.length) return null;
          return (
            <section key={f.id} className="grid gap-2">
              <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--muted)]">
                {f.nameAr} · {f.name}
              </p>
              {list.map((c) => (
                <button key={c.id} type="button" className="door text-start" onClick={() => openCourse(c)}>
                  <span className="ayah-ar block text-lg" lang="ar">
                    {c.nameAr}
                  </span>
                  <span className="font-display mt-1 block text-xl leading-tight">{c.name}</span>
                  <span className="mt-1 block text-sm text-[var(--muted)]">{c.inventor}</span>
                </button>
              ))}
            </section>
          );
        })}
      </div>
    );
  }

  const showArabic = course.action === "arabic";
  const showTajweed = course.action === "tajweed";
  const showHifz = course.action === "hifz";
  const showItqan = course.action === "itqan";

  return (
    <div className="page-pad mx-auto grid max-w-3xl gap-5 px-4 pt-6">
      <button
        type="button"
        className="inline-flex min-h-11 items-center gap-1 text-sm text-[var(--muted)]"
        onClick={() => setCourse(null)}
      >
        <ChevronLeft className="size-4" /> Все методы
      </button>

      <header className="rounded-[28px] border border-[var(--line)] bg-[var(--bg-elev)] p-5">
        <p className="ayah-ar text-2xl" lang="ar">
          {course.nameAr}
        </p>
        <h1 className="font-display mt-2 text-3xl tracking-tight">{course.name}</h1>
        <p className="mt-3 text-sm">
          <span className="text-[var(--muted)]">Кто: </span>
          {course.inventor}
        </p>
        <p className="mt-1 text-sm">
          <span className="text-[var(--muted)]">Откуда: </span>
          {course.origin}
        </p>
        <p className="mt-3 text-sm">{course.what}</p>
        <p className="mt-2 text-sm text-[var(--muted)]">{course.how}</p>
        <p className="mt-3 text-xs text-[var(--muted)]">{course.honest}</p>
      </header>

      <TeacherDesk course={course} />

      {showArabic ? (
        <section className="rounded-[28px] border border-[var(--line)] bg-[var(--surface)] p-5">
          <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--muted)]">Зал арабского</p>
          <div className="mt-3 flex flex-wrap gap-2">
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
          <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--muted)]">Карточки Хафс</p>
          <div className="mt-4">
            <DrillPanel kind="tajweed" />
          </div>
        </section>
      ) : null}

      {showHifz ? (
        <section className="grid gap-2">
          <p className="text-sm text-[var(--muted)]">
            {course.id === "three-ten-one"
              ? "Сура: 3 раза Хусари, 10 раз сами, 1 раз вчерашняя."
              : course.id === "murajaa"
                ? "Сегодняшняя сура и пять предыдущих."
                : "Джуз Амма, суры 78–114."}
          </p>
          {SURAHS.filter((s) => s.n >= 78).map((s) => (
            <div key={s.n} className="flex items-center justify-between gap-2 rounded-2xl border border-[var(--line)] px-3 py-3">
              <button
                type="button"
                className="min-w-0 text-left"
                onClick={() => {
                  useQuran.getState().setRef(s.n, 1);
                  setTab("quran");
                }}
              >
                <span className="ayah-ar block text-lg" lang="ar">
                  {s.ar}
                </span>
                <span className="text-xs text-[var(--muted)]">
                  {s.n}. {s.ru} · {s.ayahs} аятов
                </span>
              </button>
              <Button
                variant="ghost"
                className="pill shrink-0"
                onClick={() => {
                  useQuran.getState().setReciter("ar.husary");
                  playAt(s.n, 1, s.ayahs);
                }}
              >
                <Play className="size-4" />
              </Button>
            </div>
          ))}
        </section>
      ) : null}

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

          <p className="text-sm">{week.goal}</p>
          <p className="text-sm text-[var(--muted)]">{week.kuliev}</p>
          <p className="text-xs text-[var(--muted)]">Зачёт: {week.checkpoint}</p>

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
            <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--muted)]">Тренажёр</p>
            <div className="mt-3 flex flex-wrap gap-2">
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

          <div className="flex gap-2 overflow-x-auto pb-1">
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
  );
}

