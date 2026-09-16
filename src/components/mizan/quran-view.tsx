import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { BookOpen, GraduationCap, Highlighter, Languages, PauseCircle, Pause, Play, Repeat1, Search, Sparkles, Square, Type } from "lucide-react";
import { AyahLine } from "@/components/mizan/ayah-line.tsx";
import { TafsirView } from "@/components/mizan/tafsir-view.tsx";
import { Button } from "@/components/ui/button.tsx";
import { TextInput } from "@/components/ui/field.tsx";
import { MUSHAF_FONTS } from "@/lib/quran/fonts.ts";
import { MUSHAF_LAYOUTS } from "@/lib/quran/layout.ts";
import { loadMushaf, searchMushaf } from "@/lib/quran/mushaf.ts";
import { RECITERS, reciterById, reciterSurahs } from "@/lib/quran/reciters.ts";
import { JUZ_START, SURAHS, surahOf } from "@/lib/quran/surahs.ts";
import { TAJWEED_KARAOKE_KEY } from "@/lib/quran/tajweed.ts";
import type { Ayah, LearnPlayMode, MushafSurah } from "@/lib/quran/types.ts";
import { cn } from "@/lib/utils.ts";
import { useQuran } from "@/stores/quran-store.ts";

export function QuranView() {
  const tafsirOn = useQuran((s) => s.tafsirOn);
  if (tafsirOn) return <TafsirView />;
  return <MushafView />;
}

const MODES: { id: LearnPlayMode; label: string; hint: string; icon: typeof Play }[] = [
  { id: "listen", label: "Слушать", hint: "Слово светится вместе с чтецом", icon: Play },
  { id: "echo", label: "Повторяй", hint: "Аят — стоп — ты повторяешь", icon: Repeat1 },
  { id: "word", label: "По словам", hint: "Стоп на каждом слове", icon: PauseCircle },
  { id: "hifz", label: "Хифз", hint: "Грядущие слова скрыты, пока чтец не дошёл", icon: Type },
];

const SPEEDS = [0.75, 1, 1.25];
const GAPS = [
  { ms: 0, label: "0" },
  { ms: 1000, label: "1с" },
  { ms: 2000, label: "2с" },
  { ms: 3000, label: "3с" },
];

function MushafView() {
  const surah = useQuran((s) => s.surah);
  const ayah = useQuran((s) => s.ayah);
  const reciterId = useQuran((s) => s.reciterId);
  const setReciter = useQuran((s) => s.setReciter);
  const setRef = useQuran((s) => s.setRef);
  const playAt = useQuran((s) => s.playAt);
  const playing = useQuran((s) => s.playing);
  const lastError = useQuran((s) => s.lastError);
  const openTafsir = useQuran((s) => s.openTafsir);
  const follow = useQuran((s) => s.follow);
  const toggleFollow = useQuran((s) => s.toggleFollow);
  const wbw = useQuran((s) => s.wbw);
  const toggleWbw = useQuran((s) => s.toggleWbw);
  const tajweed = useQuran((s) => s.tajweed);
  const toggleTajweed = useQuran((s) => s.toggleTajweed);
  const viewMode = useQuran((s) => s.viewMode);
  const setViewMode = useQuran((s) => s.setViewMode);
  const mushafFont = useQuran((s) => s.mushafFont);
  const setMushafFont = useQuran((s) => s.setMushafFont);
  const mushafLayout = useQuran((s) => s.mushafLayout);
  const setMushafLayout = useQuran((s) => s.setMushafLayout);
  const stop = useQuran((s) => s.stop);
  const toggle = useQuran((s) => s.toggle);
  const learnMode = useQuran((s) => s.learnMode);
  const setLearnMode = useQuran((s) => s.setLearnMode);
  const speed = useQuran((s) => s.speed);
  const setSpeed = useQuran((s) => s.setSpeed);
  const gapMs = useQuran((s) => s.gapMs);
  const setGapMs = useQuran((s) => s.setGapMs);
  const exactSync = useQuran((s) => s.exactSync);
  const waiting = useQuran((s) => s.waiting);
  const pulse = useQuran((s) => s.pulse);
  const glowHue = useQuran((s) => s.glowHue);
  const [data, setData] = useState<MushafSurah[] | null>(null);
  const [error, setError] = useState("");
  const [q, setQ] = useState("");
  const [listOpen, setListOpen] = useState(false);
  const activeRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    void loadMushaf()
      .then(setData)
      .catch(() => setError("Не удалось загрузить мусхаф."));
  }, []);

  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: "nearest", behavior: "auto" });
  }, [ayah, surah]);

  const current = data?.[surah - 1];
  const hits = useMemo(() => (data && q.trim().length > 1 ? searchMushaf(data, q) : []), [data, q]);
  const meta = surahOf(surah);
  const rec = reciterById(reciterId);
  const recSurahs = reciterSurahs(rec);
  const ayahs = current?.ayahs ?? [];
  const windowed =
    ayahs.length > 40
      ? ayahs.filter((a) => a.i >= Math.max(1, ayah - 6) && a.i <= Math.min(meta.ayahs, ayah + 28))
      : ayahs;
  const modeMeta = MODES.find((m) => m.id === learnMode) ?? MODES[0];

  return (
    <div
      className="page-pad mx-auto grid max-w-6xl gap-4 px-4 pt-4 lg:grid-cols-[260px_minmax(0,1fr)]"
      data-mushaf-font={mushafFont}
      data-mushaf-mode={viewMode}
    >
      <aside className={cn("lg:block", listOpen ? "block" : "hidden")}>
        <div className="mb-3 flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--bg-elev)] px-3">
          <Search className="size-4 text-[var(--muted)]" />
          <TextInput
            className="min-h-11 border-0 bg-transparent px-0"
            placeholder="Сура или поиск по Кулиеву"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <div className="mb-3 flex gap-1 overflow-x-auto pb-1">
          {JUZ_START.map((j) => (
            <button
              key={j.juz}
              type="button"
              className="shrink-0 rounded-full border border-[var(--line)] px-2.5 py-1 text-[11px] text-[var(--muted)]"
              onClick={() => {
                setRef(j.surah, j.ayah);
                setListOpen(false);
              }}
            >
              Дж {j.juz}
            </button>
          ))}
        </div>
        {hits.length ? (
          <ul className="grid gap-1">
            {hits.map((h) => (
              <li key={`${h.surah}-${h.ayah.i}`}>
                <button
                  type="button"
                  className="w-full rounded-2xl px-3 py-2 text-left text-sm hover:bg-[var(--surface)]"
                  onClick={() => {
                    setRef(h.surah, h.ayah.i);
                    setListOpen(false);
                    setQ("");
                  }}
                >
                  <span className="text-[var(--muted)]">
                    {h.surah}:{h.ayah.i}
                  </span>{" "}
                  {h.ayah.ru.slice(0, 90)}
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <ul className="grid max-h-[70dvh] gap-0.5 overflow-y-auto pr-1">
            {SURAHS.map((s) => (
              <li key={s.n}>
                <button
                  type="button"
                  onClick={() => {
                    setRef(s.n, 1);
                    setListOpen(false);
                  }}
                  className={cn(
                    "flex min-h-11 w-full items-center justify-between rounded-2xl px-3 text-left text-sm",
                    s.n === surah ? "bg-[var(--surface)] text-[var(--accent)]" : "hover:bg-[var(--bg-elev)]",
                  )}
                >
                  <span className="truncate">
                    {s.n}. {s.ru}
                  </span>
                  <span className="ms-2 shrink-0" lang="ar">
                    {s.ar}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </aside>

      <div className="min-w-0">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--muted)]">
              {meta.place === "M" ? "Мекканская" : "Мединская"} · {meta.ayahs} аятов
            </p>
            <h1 className="font-display mt-1 text-3xl tracking-tight">
              {meta.ru}{" "}
              <span className="ayah-ar ms-2 inline text-2xl" lang="ar">
                {meta.ar}
              </span>
            </h1>
            <p className="text-sm text-[var(--muted)]">Смысловой перевод Эльмира Кулиева · полный мусхаф</p>
          </div>
          <Button variant="secondary" className="pill lg:hidden" onClick={() => setListOpen((v) => !v)}>
            {listOpen ? "Мусхаф" : "Суры"}
          </Button>
        </div>

        <div className="mt-4 flex gap-2">
          <button
            type="button"
            data-mushaf-mode="read"
            onClick={() => setViewMode("read")}
            className={cn(
              "inline-flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-full border px-3 text-sm",
              viewMode === "read" ? "border-[var(--accent)] text-[var(--accent)]" : "border-[var(--line)] text-[var(--muted)]",
            )}
          >
            <BookOpen className="size-4" /> Чтение
          </button>
          <button
            type="button"
            data-mushaf-mode="learn"
            onClick={() => setViewMode("learn")}
            className={cn(
              "inline-flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-full border px-3 text-sm",
              viewMode === "learn" ? "border-[var(--accent)] text-[var(--accent)]" : "border-[var(--line)] text-[var(--muted)]",
            )}
          >
            <GraduationCap className="size-4" /> Обучение
          </button>
        </div>
        <p className="mt-2 text-xs text-[var(--muted)]">
          {viewMode === "read"
            ? "Связный мусхаф. Слова не рвутся. Выбери шрифт."
            : "Слова отдельно. Таджвид и караоке по чтецу."}
        </p>

        <div className="mt-3 flex gap-2 overflow-x-auto pb-1" data-mushaf-fonts>
          {MUSHAF_FONTS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setMushafFont(f.id)}
              className={cn(
                "inline-flex min-h-11 shrink-0 flex-col items-center justify-center rounded-2xl border px-3 py-1",
                mushafFont === f.id ? "border-[var(--accent)] text-[var(--accent)]" : "border-[var(--line)] text-[var(--muted)]",
              )}
            >
              <span className="text-[11px]">{f.ru}</span>
              <span className="ayah-ar text-base leading-none" lang="ar">
                {f.ar}
              </span>
            </button>
          ))}
        </div>

        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {MUSHAF_LAYOUTS.map((l) => (
            <button
              key={l.id}
              type="button"
              onClick={() => {
                setMushafLayout(l.id);
                if (l.id === "words") setViewMode("learn");
                else setViewMode("read");
              }}
              className={cn(
                "inline-flex min-h-11 shrink-0 flex-col items-start rounded-2xl border px-3 py-2 text-left",
                mushafLayout === l.id ? "border-[var(--accent)] text-[var(--accent)]" : "border-[var(--line)] text-[var(--muted)]",
              )}
            >
              <span className="text-sm">{l.ru}</span>
              <span className="text-[11px] text-[var(--muted)]">{l.hint}</span>
            </button>
          ))}
        </div>

        {viewMode === "learn" ? (
        <>
        <div className="mt-4 flex gap-2 overflow-x-auto pb-1" data-learn-modes>
          {MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              data-learn-mode={m.id}
              onClick={() => setLearnMode(m.id)}
              className={cn(
                "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-2 text-xs",
                m.id === learnMode ? "border-[var(--accent)] text-[var(--accent)]" : "border-[var(--line)] text-[var(--muted)]",
              )}
            >
              <m.icon className="size-3.5" />
              {m.label}
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-[var(--muted)]">{modeMeta.hint}</p>

        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            data-follow
            onClick={toggleFollow}
            className={cn(
              "inline-flex min-h-11 items-center gap-1.5 rounded-full border px-3 text-xs",
              follow ? "border-[var(--accent)] text-[var(--accent)]" : "border-[var(--line)] text-[var(--muted)]",
            )}
          >
            <Highlighter className="size-3.5" />
            Следить
          </button>
          <button
            type="button"
            data-wbw
            onClick={toggleWbw}
            className={cn(
              "inline-flex min-h-11 items-center gap-1.5 rounded-full border px-3 text-xs",
              wbw ? "border-[var(--accent)] text-[var(--accent)]" : "border-[var(--line)] text-[var(--muted)]",
            )}
          >
            <Languages className="size-3.5" />
            Слова
          </button>
          <button
            type="button"
            data-tajweed
            onClick={toggleTajweed}
            className={cn(
              "inline-flex min-h-11 items-center gap-1.5 rounded-full border px-3 text-xs",
              tajweed ? "border-[var(--accent)] text-[var(--accent)]" : "border-[var(--line)] text-[var(--muted)]",
            )}
          >
            <Sparkles className="size-3.5" />
            Таджвид
          </button>
          {SPEEDS.map((sp) => (
            <button
              key={sp}
              type="button"
              onClick={() => setSpeed(sp)}
              className={cn(
                "min-h-11 rounded-full border px-3 text-xs tabular-nums",
                sp === speed ? "border-[var(--accent)] text-[var(--accent)]" : "border-[var(--line)] text-[var(--muted)]",
              )}
            >
              {sp}×
            </button>
          ))}
          {GAPS.map((g) => (
            <button
              key={g.ms}
              type="button"
              onClick={() => setGapMs(g.ms)}
              className={cn(
                "min-h-11 rounded-full border px-3 text-xs",
                g.ms === gapMs ? "border-[var(--accent)] text-[var(--accent)]" : "border-[var(--line)] text-[var(--muted)]",
              )}
            >
              пауза {g.label}
            </button>
          ))}
        </div>
        {tajweed ? (
          <div className="tajweed-legend" data-go="tajweed-legend">
            {TAJWEED_KARAOKE_KEY.map((k) => (
              <span key={k.ru}>
                <i style={{ background: k.color }} />
                {k.ru}
              </span>
            ))}
          </div>
        ) : null}
        </>
        ) : null}

        <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
          {RECITERS.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => {
                setReciter(r.id);
                const first = reciterSurahs(r)?.[0];
                if (first) setRef(first, 1);
              }}
              className={cn(
                "inline-flex min-h-11 shrink-0 flex-col items-start justify-center rounded-2xl border px-3 py-2 text-left text-xs",
                r.id === reciterId ? "border-[var(--accent)] text-[var(--accent)]" : "border-[var(--line)] text-[var(--muted)]",
              )}
            >
              <span className="block font-medium text-[var(--fg)]">{r.name}</span>
              <span>{r.style}{r.qdc ? " · синхрон" : ""}</span>
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-[var(--muted)]">{rec.blurb}</p>

        <div className="mt-3 flex flex-wrap gap-2">
          {playing ? (
            <>
              <Button variant="glow" onClick={toggle}>
                <Pause className="size-4" /> Пауза
              </Button>
              <Button variant="secondary" className="pill" onClick={stop}>
                <Square className="size-3.5 fill-current" /> Стоп
              </Button>
            </>
          ) : (
            <Button variant="glow" onClick={() => playAt(surah, 1, rec.kind === "surah" ? null : meta.ayahs)}>
              <Play className="size-4" /> Слушать суру
            </Button>
          )}
          <Button variant="secondary" className="pill" onClick={() => openTafsir(surah, ayah)}>
            Тафсир
          </Button>
          {recSurahs
            ? recSurahs.map((n) => (
                <button
                  key={n}
                  type="button"
                  className={cn(
                    "rounded-full border px-3 py-2 text-xs",
                    n === surah ? "border-[var(--accent)] text-[var(--accent)]" : "border-[var(--line)]",
                  )}
                  onClick={() => {
                    setRef(n, 1);
                    playAt(n, 1, null);
                  }}
                >
                  {surahOf(n).ru}
                </button>
              ))
            : null}
        </div>

        {error ? <p className="mt-4 text-sm text-[var(--danger)]">{error}</p> : null}
        {lastError ? <p className="mt-2 text-sm text-[var(--muted)]">{lastError}</p> : null}
        {waiting ? (
          <p className="mt-2 text-sm text-[var(--accent)]">
            {learnMode === "word" ? "Повтори слово — затем «Дальше»." : "Повтори аят — затем «Дальше»."}
          </p>
        ) : null}
        {playing && follow ? (
          <p className="mt-2 text-[11px] text-[var(--muted)]">
            {exactSync ? "Слово подсвечивается по записи чтеца." : "Подсветка по длительности аята — нажми слово, чтобы прыгнуть."}
          </p>
        ) : null}

        {mushafLayout === "page" ? (
          <>
            {windowed[0] && windowed[0].i > 1 ? (
              <button
                type="button"
                className="mt-4 text-sm text-[var(--muted)]"
                onClick={() => setRef(surah, Math.max(1, windowed[0].i - 20))}
              >
                Выше
              </button>
            ) : null}
          <article
            className="mushaf-page mt-5"
            lang="ar"
            dir="rtl"
            data-mushaf-font={mushafFont}
          >
            {windowed.map((a: Ayah) => {
              const active = a.i === ayah;
              return (
                <span
                  key={a.g}
                  ref={active ? (el) => { activeRef.current = el; } : undefined}
                  className={cn("mushaf-ayah", active && "is-now")}
                  onClick={() => playAt(surah, a.i, null)}
                >
                  {a.ar}
                  <sup className="ayah-end">{a.i}</sup>
                  {" "}
                </span>
              );
            })}
          </article>
            {windowed.length && windowed[windowed.length - 1].i < meta.ayahs ? (
              <button
                type="button"
                className="mt-3 text-sm text-[var(--muted)]"
                onClick={() => setRef(surah, Math.min(meta.ayahs, windowed[windowed.length - 1].i + 1))}
              >
                Ниже
              </button>
            ) : null}
          </>
        ) : null}

        {mushafLayout === "page" && current ? (
          <div className="mt-4 rounded-[24px] border border-[var(--line)] bg-[var(--surface)] p-4">
            <p className="text-[11px] tabular-nums text-[var(--muted)]">{surah}:{ayah}</p>
            <p className="mt-2 text-sm leading-relaxed">{current.ayahs.find((x) => x.i === ayah)?.ru}</p>
            <button type="button" className="mt-2 text-xs text-[var(--accent)]" onClick={() => openTafsir(surah, ayah)}>
              Тафсир этого аята
            </button>
          </div>
        ) : null}

        {mushafLayout !== "page" ? (
        <ol className="mt-5 grid gap-3">
          {windowed[0] && windowed[0].i > 1 ? (
            <li>
              <button type="button" className="text-sm text-[var(--muted)]" onClick={() => setRef(surah, Math.max(1, windowed[0].i - 20))}>
                Выше
              </button>
            </li>
          ) : null}
          {windowed.map((a: Ayah) => {
            const active = a.i === ayah;
            const live = active && (playing || waiting);
            return (
              <li
                key={a.g}
                ref={active ? (el) => { activeRef.current = el; } : undefined}
                className={cn(
                  "list-item rounded-[24px] border border-[var(--line)] bg-[var(--surface)] p-4",
                  active && "ayah-active",
                  live && "ayah-live",
                )}
                style={
                  live
                    ? ({
                        ["--pulse"]: String(Math.max(0.28, pulse)),
                        ["--glow-hue"]: String(glowHue),
                      } as CSSProperties)
                    : undefined
                }
              >
                <div className="flex items-start justify-between gap-3">
                  <button
                    type="button"
                    className="grid size-8 shrink-0 place-items-center rounded-full border border-[var(--line)] text-xs tabular-nums"
                    onClick={() => playAt(surah, a.i, null)}
                    aria-label={`Слушать аят ${a.i}`}
                  >
                    {a.i}
                  </button>
                  {playing && active ? <span className="live-dot mt-2" /> : null}
                </div>
                <AyahLine ayah={a} active={active} />
                <button type="button" className="mt-3 block w-full text-left" onClick={() => playAt(surah, a.i, null)}>
                  <p className="text-sm leading-relaxed text-[var(--fg)]">{a.ru}</p>
                </button>
                <button type="button" className="mt-2 text-xs text-[var(--accent)]" onClick={() => openTafsir(surah, a.i)}>
                  Тафсир этого аята
                </button>
              </li>
            );
          })}
          {windowed.length && windowed[windowed.length - 1].i < meta.ayahs ? (
            <li>
              <button
                type="button"
                className="text-sm text-[var(--muted)]"
                onClick={() => setRef(surah, Math.min(meta.ayahs, windowed[windowed.length - 1].i + 1))}
              >
                Ниже
              </button>
            </li>
          ) : null}
        </ol>
        ) : null}
      </div>
    </div>
  );
}
