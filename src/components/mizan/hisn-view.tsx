import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Heart, Pause, Play, RotateCcw, Type } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { TextInput } from "@/components/ui/field.tsx";
import { HISN_COLLECTIONS } from "@/lib/hisn/collections.ts";
import { chapterOfDay, loadHisn, morningChapter } from "@/lib/hisn/load.ts";
import { chapterTitle, duaMeaning } from "@/lib/hisn/text.ts";
import type { HisnBook, HisnChapter, HisnDua } from "@/lib/hisn/types.ts";
import { translate, type Locale } from "@/lib/i18n/dict.ts";
import { cn } from "@/lib/utils.ts";
import { useHisn } from "@/stores/hisn-store.ts";
import { useMizan } from "@/stores/mizan-store.ts";

function useBook() {
  const [book, setBook] = useState<HisnBook | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    void loadHisn()
      .then(setBook)
      .catch(() => setError("Не удалось открыть снимок Хисн."));
  }, []);
  return { book, error };
}

function useHisnAudio() {
  const audio = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState<string | null>(null);
  useEffect(() => {
    audio.current = new Audio();
    const el = audio.current;
    const onEnd = () => setPlaying(null);
    el.addEventListener("ended", onEnd);
    return () => {
      el.pause();
      el.removeEventListener("ended", onEnd);
    };
  }, []);
  function toggle(url: string) {
    const el = audio.current;
    if (!el || !url) return;
    if (playing === url) {
      el.pause();
      setPlaying(null);
      return;
    }
    el.src = url;
    void el.play().then(() => setPlaying(url)).catch(() => setPlaying(null));
  }
  return { playing, toggle };
}

function Counter({ n, max, onTap }: { n: number; max: number; onTap: () => void }) {
  const locale = useMizan((s) => s.settings.locale);
  const done = n >= max;
  const pct = max > 0 ? Math.min(1, n / max) : 1;
  return (
    <button type="button" className={cn("hisn-count", done && "is-done")} onClick={onTap} aria-label={`${n}/${max}`}>
      <span className="hisn-count-ring" style={{ ["--p" as string]: String(pct) }} />
      <span className="tabular-nums">{done ? translate(locale, "hisn.done") : `${n}/${max}`}</span>
    </button>
  );
}

function HisnReader({ book, chapter }: { book: HisnBook; chapter: HisnChapter }) {
  const setStored = useMizan((s) => s.setHisnChapter);
  const idx = useHisn((s) => s.duaIndex);
  const setIdx = useHisn((s) => s.setDuaIndex);
  const tap = useHisn((s) => s.tap);
  const reset = useHisn((s) => s.resetChapter);
  const counts = useHisn((s) => s.counts);
  const day = useHisn((s) => s.day);
  const fav = useHisn((s) => s.favorites.includes(chapter.id));
  const toggleFav = useHisn((s) => s.toggleFav);
  const scale = useHisn((s) => s.arabicScale);
  const setScale = useHisn((s) => s.setArabicScale);
  const showMeaning = useMizan((s) => s.settings.showMeaning);
  const setShowMeaning = (v: boolean) => useMizan.getState().setSettings({ showMeaning: v });
  const locale = useMizan((s) => s.settings.locale);
  const t = (k: string) => translate(locale, k);
  const progress = useMemo(() => useHisn.getState().chapterProgress(chapter), [counts, day, chapter]);
  const { playing, toggle } = useHisnAudio();
  const title = chapterTitle(chapter, locale);

  const i = Math.min(idx, chapter.duas.length - 1);
  const dua: HisnDua | undefined = chapter.duas[i];
  const n = dua ? (counts[`${day}:${chapter.id}:${dua.id}`] ?? 0) : 0;
  const meaning = dua ? duaMeaning(dua, locale) : "";

  useEffect(() => {
    setIdx(0);
    const first = chapter.duas.findIndex((d) => (useHisn.getState().counts[`${useHisn.getState().day}:${chapter.id}:${d.id}`] ?? 0) < d.repeat);
    if (first >= 0) setIdx(first);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapter.id]);

  if (!dua) return null;

  function bump() {
    if (!dua) return;
    tap(chapter.id, dua.id, dua.repeat);
    const next = useHisn.getState().counts[`${useHisn.getState().day}:${chapter.id}:${dua.id}`] ?? 0;
    if (next >= dua.repeat && i < chapter.duas.length - 1) {
      window.setTimeout(() => setIdx(i + 1), 280);
    }
  }

  return (
    <div className="hisn-reader">
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="inline-flex min-h-11 items-center gap-1 text-sm text-[var(--muted)]"
          onClick={() => setStored(null)}
        >
          <ChevronLeft className="size-4" /> {t("hisn.book")}
        </button>
        <div className="min-w-0 flex-1 text-center">
          <p className="truncate text-[11px] uppercase tracking-[0.14em] text-[var(--muted)]">
            {i + 1}/{chapter.duas.length} · {progress.have}/{progress.need}
          </p>
        </div>
        <button type="button" className="grid size-11 place-items-center" aria-label={t("hisn.fav")} onClick={() => toggleFav(chapter.id)}>
          <Heart className={cn("size-5", fav && "fill-[var(--accent)] text-[var(--accent)]")} />
        </button>
      </div>

      <header className="text-center">
        <h1 className="ayah-ar text-2xl" lang="ar">
          {chapter.titleAr}
        </h1>
        {title ? <p className="mt-1 text-xs text-[var(--muted)]">{title}</p> : null}
      </header>

      <div className="hisn-progress" aria-hidden>
        <i style={{ width: `${progress.need ? (100 * progress.have) / progress.need : 0}%` }} />
      </div>

      <article className="hisn-card" onClick={bump}>
        <p className="hisn-ar" lang="ar" style={{ fontSize: `calc(1.7rem * ${scale})` }}>
          {dua.ar}
        </p>
        {showMeaning && meaning ? <p className="hisn-en">{meaning}</p> : null}
      </article>

      <div className="flex items-center justify-between gap-2">
        <Button variant="ghost" className="pill size-11 p-0" disabled={i === 0} onClick={() => setIdx(i - 1)} aria-label="prev">
          <ChevronLeft className="size-5" />
        </Button>
        <Counter n={n} max={dua.repeat} onTap={bump} />
        <Button
          variant="ghost"
          className="pill size-11 p-0"
          disabled={i >= chapter.duas.length - 1}
          onClick={() => setIdx(i + 1)}
          aria-label="next"
        >
          <ChevronRight className="size-5" />
        </Button>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2">
        {dua.audio ? (
          <Button variant="secondary" className="pill" onClick={() => toggle(dua.audio)}>
            {playing === dua.audio ? <Pause className="size-4" /> : <Play className="size-4" />} {t("hisn.listen")}
          </Button>
        ) : null}
        {chapter.audio ? (
          <Button variant="ghost" className="pill" onClick={() => toggle(chapter.audio)}>
            {playing === chapter.audio ? <Pause className="size-4" /> : <Play className="size-4" />} {t("hisn.chapter")}
          </Button>
        ) : null}
        <Button variant="ghost" className="pill" onClick={() => setShowMeaning(!showMeaning)}>
          {showMeaning ? t("hisn.hide") : t("hisn.show")}
        </Button>
        <Button variant="ghost" className="pill" onClick={() => setScale(scale - 0.1)} aria-label="-">
          <Type className="size-3.5" />−
        </Button>
        <Button variant="ghost" className="pill" onClick={() => setScale(scale + 0.1)} aria-label="+">
          <Type className="size-4" />+
        </Button>
        <Button variant="ghost" className="pill" onClick={() => reset(chapter.id, chapter.duas.map((d) => d.id))}>
          <RotateCcw className="size-4" /> {t("hisn.reset")}
        </Button>
      </div>
      <p className="text-center text-[11px] text-[var(--muted)]">{t("hisn.note")}</p>
      <p className="text-center text-[11px] text-[var(--muted)]">{t("hisn.meaning.src")}</p>
    </div>
  );
}

function ChapterRow({
  chapter,
  locale,
  extra,
  onOpen,
}: {
  chapter: HisnChapter;
  locale: Locale;
  extra?: string;
  onOpen: (id: number) => void;
}) {
  const title = chapterTitle(chapter, locale);
  return (
    <button type="button" className="hisn-row" onClick={() => onOpen(chapter.id)} data-go={`hisn-${chapter.id}`}>
      <span className="w-8 shrink-0 text-[11px] tabular-nums text-[var(--muted)]">{chapter.id}</span>
      <span className="min-w-0 flex-1">
        <span className="ayah-ar block truncate text-right text-lg" lang="ar">
          {chapter.titleAr}
        </span>
        {title ? (
          <span className="block truncate text-[11px] text-[var(--muted)]">
            {title}
            {extra ? ` · ${extra}` : ""}
          </span>
        ) : extra ? (
          <span className="block truncate text-[11px] text-[var(--muted)]">{extra}</span>
        ) : null}
      </span>
    </button>
  );
}

function HisnHome({ book }: { book: HisnBook }) {
  const setStored = useMizan((s) => s.setHisnChapter);
  const locale = useMizan((s) => s.settings.locale);
  const favFirst = useMizan((s) => s.settings.favFirst);
  const favorites = useHisn((s) => s.favorites);
  const counts = useHisn((s) => s.counts);
  const progressFn = useHisn((s) => s.chapterProgress);
  void counts;
  const [q, setQ] = useState("");
  const [allCh, setAllCh] = useState(true);
  const morning = morningChapter(book);
  const daily = chapterOfDay(book);
  const morningP = morning ? progressFn(morning) : null;
  const t = (k: string) => translate(locale, k);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    let list = book.chapters;
    if (needle.length >= 2) {
      list = book.chapters.filter(
        (c) =>
          c.titleAr.includes(q.trim()) ||
          chapterTitle(c, locale).toLowerCase().includes(needle) ||
          (locale === "en" && (c.titleEn ?? "").toLowerCase().includes(needle)) ||
          String(c.id) === needle,
      );
    } else if (favFirst) {
      list = [...book.chapters].sort((a, b) => Number(favorites.includes(b.id)) - Number(favorites.includes(a.id)));
    }
    return list;
  }, [book, q, locale, favFirst, favorites]);

  const favCh = book.chapters.filter((c) => favorites.includes(c.id));

  return (
    <div className="hisn-home">
      <header className="min-w-0 overflow-hidden px-1 text-center">
        <p className="bismillah break-words" lang="ar">
          {book.titleAr}
        </p>
        <h1 className="font-display mt-1 max-w-full text-xl leading-tight break-words">{t("hisn.fortress")}</h1>
        <p className="mt-2 max-w-full text-sm leading-snug break-words text-[var(--muted)]">
          {book.author}. {book.chapters.length} {t("hisn.chapters")} · {book.chapters.reduce((n, c) => n + c.duas.length, 0)} {t("hisn.duas")}
        </p>
      </header>

      {morning ? (
        <button type="button" className="hisn-hero" onClick={() => setStored(morning.id)} data-go="hisn-morning">
          <span className="text-[11px] uppercase tracking-[0.16em] text-[var(--muted)]">{t("hisn.wird")}</span>
          <span className="ayah-ar mt-1 block text-lg leading-snug" lang="ar">
            {morning.titleAr}
          </span>
          <span className="mt-1 block text-sm text-[var(--muted)]">{chapterTitle(morning, locale)}</span>
          {morningP ? (
            <span className="mt-3 block text-sm tabular-nums">
              {t("hisn.today")} {morningP.have} / {morningP.need}
            </span>
          ) : null}
          <span className="hisn-progress mt-3">
            <i style={{ width: `${morningP && morningP.need ? (100 * morningP.have) / morningP.need : 0}%` }} />
          </span>
        </button>
      ) : null}

      <div className="hisn-list">
        {HISN_COLLECTIONS.filter((c) => c.id !== "morning").map((col) => {
          const first = book.chapters.find((ch) => ch.id === col.chapterIds[0]);
          const title = first ? chapterTitle(first, locale) : "";
          return (
            <button key={col.id} type="button" className="hisn-row" onClick={() => first && setStored(first.id)} data-go={`hisn-col-${col.id}`}>
              <span className="min-w-0 flex-1 overflow-hidden text-start">
                <span className="block text-[11px] uppercase tracking-[0.12em] text-[var(--muted)]">{t(col.labelKey)}</span>
                <span className="ayah-ar mt-0.5 block break-words text-base leading-snug" lang="ar">
                  {first?.titleAr}
                </span>
                {title ? <span className="mt-0.5 block text-sm text-[var(--muted)]">{title}</span> : null}
              </span>
            </button>
          );
        })}
      </div>

      {daily && daily.id !== morning?.id ? (
        <button type="button" className="door" onClick={() => setStored(daily.id)} data-go="hisn-day">
          <span className="text-[11px] uppercase tracking-[0.14em] text-[var(--muted)]">{t("hisn.daych")}</span>
          <span className="ayah-ar block text-xl" lang="ar">
            {daily.titleAr}
          </span>
          <span className="text-sm text-[var(--muted)]">{chapterTitle(daily, locale)}</span>
        </button>
      ) : null}

      {favCh.length ? (
        <section>
          <p className="mb-2 text-[11px] uppercase tracking-[0.14em] text-[var(--muted)]">{t("hisn.fav")}</p>
          <div className="grid gap-1">
            {favCh.map((c) => {
              const p = progressFn(c);
              return (
                <button key={c.id} type="button" className="hisn-row" onClick={() => setStored(c.id)} data-go={`hisn-fav-${c.id}`}>
                  <Heart className="size-4 shrink-0 fill-[var(--accent)] text-[var(--accent)]" />
                  <span className="min-w-0 flex-1">
                    <span className="ayah-ar block truncate text-right text-base" lang="ar">
                      {c.titleAr}
                    </span>
                    <span className="block truncate text-[11px] text-[var(--muted)]">{chapterTitle(c, locale)}</span>
                  </span>
                  <span className="shrink-0 text-xs tabular-nums text-[var(--muted)]">
                    {p.have}/{p.need}
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      ) : null}

      <TextInput placeholder={t("hisn.find")} value={q} onChange={(e) => setQ(e.target.value)} />

      <p className="text-[11px] uppercase tracking-[0.14em] text-[var(--muted)]">{t("hisn.all")}</p>
      <ul className="grid gap-1">
        {(q.trim().length >= 2 || allCh ? filtered : filtered.slice(0, 24)).map((c) => (
          <li key={c.id}>
            <ChapterRow chapter={c} locale={locale} extra={String(c.duas.length)} onOpen={setStored} />
          </li>
        ))}
      </ul>
      {q.trim().length < 2 && !allCh && filtered.length > 24 ? (
        <button type="button" className="text-sm text-[var(--muted)]" onClick={() => setAllCh(true)}>
          {t("hisn.more")} · {filtered.length - 24}
        </button>
      ) : null}
    </div>
  );
}

export function HisnView() {
  const { book, error } = useBook();
  const stored = useMizan((s) => s.hisnChapterId);

  if (error) {
    return (
      <div className="page-pad mx-auto max-w-2xl px-4 pt-6">
        <p>{error}</p>
        <p className="mt-2 text-sm text-[var(--muted)]">Книга: сохранённый снимок hisnmuslim.com.</p>
      </div>
    );
  }
  if (!book) return <p className="page-pad px-4 pt-6 text-sm text-[var(--muted)]">Открываю Хисн…</p>;

  const open = stored ? (book.chapters.find((c) => c.id === stored) ?? null) : null;
  if (open) return <HisnReader book={book} chapter={open} />;
  return <HisnHome book={book} />;
}

export function HisnMini({ onOpen }: { onOpen: (id: number) => void }) {
  const [chapter, setChapter] = useState<HisnChapter | null>(null);
  const [note, setNote] = useState("");
  const locale = useMizan((s) => s.settings.locale);
  const counts = useHisn((s) => s.counts);
  const progressFn = useHisn((s) => s.chapterProgress);
  void counts;
  useEffect(() => {
    void loadHisn()
      .then((b) => {
        setChapter(morningChapter(b) ?? chapterOfDay(b));
        setNote(`hisnmuslim.com · ${b.source.retrievedAt.slice(0, 10)}`);
      })
      .catch(() => setNote("книга не загрузилась"));
  }, []);
  if (!chapter) return <p className="text-sm text-[var(--muted)]">{note || "Открываю Хисн…"}</p>;
  const p = progressFn(chapter);
  return (
    <button type="button" className="hisn-hero text-left" onClick={() => onOpen(chapter.id)}>
      <span className="text-[11px] uppercase tracking-[0.14em] text-[var(--muted)]">Хисн · {note}</span>
      <span className="ayah-ar mt-1 block text-right text-xl" lang="ar">
        {chapter.titleAr}
      </span>
      <span className="mt-1 block text-sm text-[var(--muted)]">{chapterTitle(chapter, locale)}</span>
      <span className="mt-2 block text-sm tabular-nums">
        {translate(locale, "hisn.today")} {p.have} из {p.need}
      </span>
    </button>
  );
}
