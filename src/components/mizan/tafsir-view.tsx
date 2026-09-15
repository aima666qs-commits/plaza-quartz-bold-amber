import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { loadAyah } from "@/lib/quran/mushaf.ts";
import { loadTafsir, TAFSIR_BOOKS, type TafsirHit } from "@/lib/quran/tafsir.ts";
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
  const [hit, setHit] = useState<TafsirHit | null>(null);
  const [err, setErr] = useState("");
  const [ayahRow, setAyahRow] = useState<Ayah | null>(null);

  const meta = surahOf(surah);
  const bookMeta = TAFSIR_BOOKS.find((b) => b.id === bookId) ?? TAFSIR_BOOKS[0];

  useEffect(() => {
    let live = true;
    setErr("");
    setHit(null);
    void loadTafsir(bookId, surah, ayah)
      .then((row) => {
        if (live) setHit(row);
      })
      .catch(() => {
        if (live) setErr("Не удалось открыть тафсир. Проверь сеть.");
      });
    return () => {
      live = false;
    };
  }, [bookId, surah, ayah]);

  useEffect(() => {
    void loadAyah(surah, ayah).then(setAyahRow);
  }, [surah, ayah]);

  const arBook = bookMeta.lang === "ar";

  return (
    <div className="page-pad mx-auto grid max-w-2xl gap-4 px-4 pt-2">
      <div className="flex items-center gap-2">
        <button type="button" className="inline-flex min-h-11 items-center gap-1 text-sm text-[var(--muted)]" onClick={close}>
          <ChevronLeft className="size-4" /> Мусхаф
        </button>
        <p className="min-w-0 flex-1 truncate text-center text-[11px] uppercase tracking-[0.14em] text-[var(--muted)]">
          Тафсир · весь Коран
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
          {meta.place === "M" ? "Мекканская" : "Мединская"} · {meta.ayahs} аятов · {ayah} / {meta.ayahs}. Не фетва.
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
          {surah}:{ayah}
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
        <Button className="mt-3 pill" variant="secondary" onClick={() => playAt(surah, ayah, ayah)}>
          <Play className="size-4" /> Слушать
        </Button>
      </article>

      <article className="rounded-[24px] border border-[var(--line)] bg-[var(--surface)] p-4">
        <p className="text-[11px] uppercase tracking-[0.14em] text-[var(--muted)]">{hit?.name ?? bookMeta.ru}</p>
        {hit?.text ? (
          <div
            className={cn("mt-3 grid gap-3 text-sm leading-relaxed whitespace-pre-wrap", arBook && "ayah-ar text-xl")}
            lang={arBook ? "ar" : "ru"}
            dir={arBook ? "rtl" : "ltr"}
          >
            {hit.text}
          </div>
        ) : err ? null : (
          <p className="mt-3 text-sm text-[var(--muted)]">Открываю тафсир…</p>
        )}
      </article>

      <div className="flex items-center justify-between gap-2">
        <Button
          variant="ghost"
          className="pill"
          disabled={ayah <= 1 && surah <= 1}
          onClick={() => {
            if (ayah > 1) setRef(surah, ayah - 1);
            else if (surah > 1) {
              const prev = surahOf(surah - 1);
              setRef(surah - 1, prev.ayahs);
            }
          }}
        >
          <ChevronLeft className="size-4" /> Назад
        </Button>
        <p className="text-xs tabular-nums text-[var(--muted)]">
          {surah}:{ayah}
        </p>
        <Button
          variant="ghost"
          className="pill"
          disabled={surah >= 114 && ayah >= meta.ayahs}
          onClick={() => {
            if (ayah < meta.ayahs) setRef(surah, ayah + 1);
            else if (surah < 114) setRef(surah + 1, 1);
          }}
        >
          Дальше <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
