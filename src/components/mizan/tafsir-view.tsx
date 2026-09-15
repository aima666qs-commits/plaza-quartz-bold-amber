import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { loadAyah } from "@/lib/quran/mushaf.ts";
import { loadYusufTafsir, neighbor, pieceAt, TAFSIR_BOOKS, type TafsirSnap } from "@/lib/quran/tafsir.ts";
import { surahOf } from "@/lib/quran/surahs.ts";
import type { Ayah } from "@/lib/quran/types.ts";
import { cn } from "@/lib/utils.ts";
import { useQuran } from "@/stores/quran-store.ts";

export function TafsirView() {
  const surah = useQuran((s) => s.surah);
  const ayah = useQuran((s) => s.ayah);
  const setRef = useQuran((s) => s.setRef);
  const playAt = useQuran((s) => s.playAt);
  const close = useQuran((s) => s.closeTafsir);
  const bookId = useQuran((s) => s.tafsirBook);
  const setBook = useQuran((s) => s.setTafsirBook);
  const [snap, setSnap] = useState<TafsirSnap | null>(null);
  const [err, setErr] = useState("");
  const [ayahRow, setAyahRow] = useState<Ayah | null>(null);

  useEffect(() => {
    if (surah !== 12) setRef(12, 1);
  }, [surah, setRef]);

  useEffect(() => {
    void loadYusufTafsir()
      .then(setSnap)
      .catch(() => setErr("Не удалось открыть снимок тафсира Йусуф."));
  }, []);

  const n = surah === 12 ? ayah : 1;
  useEffect(() => {
    void loadAyah(12, n).then(setAyahRow);
  }, [n]);

  const book = snap?.tafsirs.find((t) => t.id === bookId) ?? snap?.tafsirs[0];
  const piece = book ? pieceAt(book, n) : undefined;
  const meta = surahOf(12);

  return (
    <div className="page-pad mx-auto grid max-w-2xl gap-4 px-4 pt-2">
      <div className="flex items-center gap-2">
        <button type="button" className="inline-flex min-h-11 items-center gap-1 text-sm text-[var(--muted)]" onClick={close}>
          <ChevronLeft className="size-4" /> Мусхаф
        </button>
        <p className="min-w-0 flex-1 truncate text-center text-[11px] uppercase tracking-[0.14em] text-[var(--muted)]">
          Тафсир · {meta.ru}
        </p>
      </div>

      <header className="text-center">
        <h1 className="font-display text-3xl">
          {meta.ru}{" "}
          <span className="ayah-ar text-2xl" lang="ar">
            {meta.ar}
          </span>
        </h1>
        <p className="mt-1 text-xs text-[var(--muted)]">
          Мекканская · 111 аятов. Снимок Quran.com {snap?.retrievedAt}. Не фетва.
        </p>
      </header>

      <div className="flex flex-wrap justify-center gap-2">
        {TAFSIR_BOOKS.map((b) => (
          <button
            key={b.id}
            type="button"
            className={cn(
              "rounded-full border px-3 py-2 text-sm",
              bookId === b.id ? "border-[var(--accent)] text-[var(--accent)]" : "border-[var(--line)] text-[var(--muted)]",
            )}
            onClick={() => setBook(b.id)}
          >
            {b.ru}
          </button>
        ))}
      </div>

      {err ? <p className="text-sm text-[var(--danger)]">{err}</p> : null}

      <article className="ayah-card">
        <p className="text-[11px] tabular-nums text-[var(--muted)]">
          {piece ? `${piece.from}–${piece.to}` : n} / 111
        </p>
        {ayahRow ? (
          <>
            <p className="ayah-ar mt-2 text-2xl" lang="ar">
              {ayahRow.ar}
            </p>
            <p className="mt-3 text-sm leading-relaxed">{ayahRow.ru}</p>
            <p className="mt-1 text-[11px] text-[var(--muted)]">Кулиев · смысловой перевод</p>
          </>
        ) : (
          <p className="mt-2 text-sm text-[var(--muted)]">Мусхаф…</p>
        )}
        <Button className="mt-3 pill" variant="secondary" onClick={() => playAt(12, n, piece?.to ?? n)}>
          <Play className="size-4" /> Слушать
        </Button>
      </article>

      <article className="rounded-[24px] border border-[var(--line)] bg-[var(--surface)] p-4">
        <p className="text-[11px] uppercase tracking-[0.14em] text-[var(--muted)]">{book?.name}</p>
        {piece?.text ? (
          <div className="mt-3 grid gap-3 text-sm leading-relaxed whitespace-pre-wrap">{piece.text}</div>
        ) : (
          <p className="mt-3 text-sm text-[var(--muted)]">Открываю тафсир…</p>
        )}
      </article>

      <div className="flex items-center justify-between gap-2">
        <Button
          variant="ghost"
          className="pill"
          disabled={!book || n <= 1}
          onClick={() => book && setRef(12, neighbor(book, n, -1))}
        >
          <ChevronLeft className="size-4" /> Назад
        </Button>
        <Button
          variant="ghost"
          className="pill"
          disabled={!book || n >= 111}
          onClick={() => book && setRef(12, neighbor(book, n, 1))}
        >
          Дальше <ChevronRight className="size-4" />
        </Button>
      </div>
      <p className="text-center text-[11px] text-[var(--muted)]">
        {snap?.note} Источник: api.quran.com · {snap?.source}
      </p>
    </div>
  );
}
