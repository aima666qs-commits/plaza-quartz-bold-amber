import { useEffect, useRef, useState } from "react";
import { Mic, Play, Send, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { askTeacher, localTeach } from "@/lib/assistant/server.ts";
import type { Course } from "@/lib/learn/catalog.ts";
import { intentCourse, matches, nextPrompt, openLesson, type Prompt } from "@/lib/learn/lesson.ts";
import { listenRu, speakAvailable, speakText, stopSpeak, voiceAvailable } from "@/lib/voice.ts";
import { SURAHS } from "@/lib/quran/surahs.ts";
import { useLearn } from "@/stores/learn-store.ts";
import { useMizan } from "@/stores/mizan-store.ts";
import { useQuran } from "@/stores/quran-store.ts";

type Log = { role: "user" | "teacher"; text: string };

const STARTERS = [
  { q: "Как учить Коран?", label: "Как учить" },
  { q: "Буквы", label: "Буквы" },
  { q: "Нурания", label: "Нурания" },
  { q: "Заучивать 3+10+1", label: "3+10+1" },
];

export function TeacherDesk({ course }: { course: Course | null }) {
  const setCourse = useLearn((s) => s.setCourse);
  const playAt = useQuran((s) => s.playAt);
  const [q, setQ] = useState("");
  const [log, setLog] = useState<Log[]>([]);
  const [busy, setBusy] = useState(false);
  const [listening, setListening] = useState(false);
  const [mic, setMic] = useState(false);
  const [canSpeak, setCanSpeak] = useState(false);
  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [heard, setHeard] = useState(0);
  const stopVoice = useRef<(() => void) | null>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const courseRef = useRef(course);
  courseRef.current = course;

  useEffect(() => {
    setMic(voiceAvailable());
    setCanSpeak(speakAvailable());
  }, []);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" });
  }, [log, busy]);

  useEffect(() => {
    stopSpeak();
    const start = openLesson(course);
    setPrompt(start.prompt);
    setHeard(0);
    setLog([{ role: "teacher", text: start.line }]);
  }, [course?.id]);

  function say(text: string, lang = "ru-RU") {
    void speakText(text, lang);
  }

  function toggleMic() {
    if (listening) {
      stopVoice.current?.();
      stopVoice.current = null;
      setListening(false);
      return;
    }
    setListening(true);
    stopVoice.current = listenRu((t, fin) => {
      setQ(t);
      if (fin) {
        setListening(false);
        stopVoice.current = null;
        void onHeard(t);
      }
    });
  }

  function onHeard(text: string) {
    const t = text.trim();
    if (!t) return;
    const p = prompt;
    if (p && matches(t, p.expect)) {
      const nxt = nextPrompt(courseRef.current, p, true);
      const line =
        p.kind === "hifz"
          ? `Мир тебе. Принял. Иджазу не ставлю — только шаг. Дальше: ${nxt?.title ?? "скажи, какую суру"}.`
          : `Верно. ${p.hint} Дальше. ${nxt?.ask ?? ""}`;
      setPrompt(nxt);
      setHeard(0);
      setLog((l) => [...l, { role: "user", text: t }, { role: "teacher", text: line }]);
      setQ("");
      say(line);
      return;
    }
    void send(t);
  }

  async function send(raw?: string) {
    const question = (raw ?? q).trim();
    if (!question || busy) return;
    const want = intentCourse(question);
    if (!courseRef.current && want) {
      setQ("");
      if (want === "hisn") useMizan.getState().setAppTab("hisn");
      if (want === "tafsir") {
        useQuran.getState().openTafsir(12, 1);
        useMizan.getState().setAppTab("quran");
      }
      setCourse(want);
      return;
    }
    setQ("");
    const p = prompt;
    if (p && matches(question, p.expect)) {
      onHeard(question);
      return;
    }
    if (p && p.kind !== "hifz" && p.kind !== "talk" && question.split(/\s+/).length <= 3) {
      const line = `Ещё раз. ${p.ask} Подсказка: ${p.hint}`;
      setLog((l) => [...l, { role: "user", text: question }, { role: "teacher", text: line }]);
      say(line);
      return;
    }
    const nextLog: Log[] = [...log, { role: "user", text: question }];
    setLog(nextLog);
    setBusy(true);
    const payload = {
      question,
      course: courseRef.current
        ? {
            id: courseRef.current.id,
            name: courseRef.current.name,
            nameAr: courseRef.current.nameAr,
            inventor: courseRef.current.inventor,
            origin: courseRef.current.origin,
            what: courseRef.current.what,
            how: courseRef.current.how,
            honest: courseRef.current.honest,
          }
        : null,
      history: nextLog.map((m) => ({ role: m.role === "user" ? ("user" as const) : ("sheikh" as const), text: m.text })),
    };
    try {
      const res = await askTeacher({ data: payload });
      const text = res.ok ? res.text : res.error || localTeach(payload.course, question);
      setLog((l) => [...l, { role: "teacher", text }]);
      say(text);
    } catch {
      const text = localTeach(payload.course, question);
      setLog((l) => [...l, { role: "teacher", text }]);
      say(text);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="rounded-[22px] border border-[var(--line)] bg-[var(--bg-elev)] p-4">
      <div className="flex items-center gap-3">
        <span className="grid size-12 shrink-0 place-items-center rounded-full border border-[var(--accent)] bg-[var(--bg)]" aria-hidden>
          <span className="ayah-ar text-lg leading-none" lang="ar">
            أ
          </span>
        </span>
        <div className="min-w-0">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--muted)]">Учитель · урок</p>
          <p className="font-display text-xl leading-tight">{course ? course.name : "Коран и арабский"}</p>
          <p className="text-xs text-[var(--muted)]">Слушает. Ведёт выбранный метод. Иджазу не ставит.</p>
        </div>
      </div>

      {prompt ? (
        <div className="mt-3 rounded-2xl border border-[var(--line)] bg-[var(--bg)] px-3 py-3 text-center">
          <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--muted)]">{prompt.title}</p>
          <p className="ayah-ar mt-1 text-4xl leading-none" lang="ar">
            {prompt.ar}
          </p>
          <p className="mt-2 text-sm">{prompt.ask}</p>
          {prompt.kind === "hifz" && prompt.surah ? (
            <div className="mt-2 flex flex-wrap justify-center gap-2">
              <Button
                type="button"
                variant="glow"
                className="pill"
                onClick={() => {
                  useQuran.getState().setReciter("ar.husary");
                  const n = SURAHS.find((s) => s.n === prompt.surah)?.ayahs ?? 1;
                  playAt(prompt.surah!, 1, n);
                  setHeard((n) => n + 1);
                }}
              >
                <Play className="size-4" /> Хусари · {heard}/3
              </Button>
              <Button type="button" variant="secondary" className="pill" onClick={() => onHeard("прочитал")}>
                Прочитал
              </Button>
            </div>
          ) : null}
        </div>
      ) : null}

      <div ref={scroller} className="mt-3 max-h-56 overflow-y-auto">
        {log.map((m, i) => (
          <p
            key={i}
            className={m.role === "user" ? "mb-2 text-sm" : "mb-3 whitespace-pre-wrap text-sm leading-relaxed"}
          >
            <span className="text-[11px] uppercase tracking-[0.14em] text-[var(--muted)]">
              {m.role === "user" ? "Вы" : "Учитель"} ·{" "}
            </span>
            {m.text}
          </p>
        ))}
        {busy ? <p className="text-sm text-[var(--muted)]">Слушаю…</p> : null}
      </div>

      {!course ? (
        <div className="mt-2 flex flex-wrap gap-2">
          {STARTERS.map((s) => (
            <button
              key={s.q}
              type="button"
              className="min-h-11 rounded-full border border-[var(--line)] px-3 text-xs"
              onClick={() => void send(s.q)}
            >
              {s.label}
            </button>
          ))}
        </div>
      ) : null}

      <form
        className="mt-3 grid gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          void send();
        }}
      >
        <textarea
          rows={2}
          className="min-h-14 w-full resize-none rounded-2xl border border-[var(--line)] bg-[var(--bg)] px-3 py-2 text-base outline-none"
          value={q}
          placeholder={listening ? "Говорите…" : "Ответьте учителю голосом или текстом"}
          onChange={(e) => setQ(e.target.value)}
        />
        <div className="flex gap-2">
          {mic ? (
            <Button type="button" variant={listening ? "glow" : "secondary"} className="pill" onClick={toggleMic}>
              <Mic className="size-4" />
              {listening ? "Стоп" : "Говорить"}
            </Button>
          ) : null}
          {canSpeak ? (
            <Button
              type="button"
              variant="ghost"
              className="pill size-11 p-0"
              aria-label="Повторить голосом"
              onClick={() => {
                const last = [...log].reverse().find((m) => m.role === "teacher");
                if (last) say(last.text);
              }}
            >
              <Volume2 className="size-4" />
            </Button>
          ) : null}
          <Button type="submit" variant="glow" className="pill flex-1" disabled={busy}>
            <Send className="size-4" /> Учителю
          </Button>
        </div>
      </form>
    </section>
  );
}
