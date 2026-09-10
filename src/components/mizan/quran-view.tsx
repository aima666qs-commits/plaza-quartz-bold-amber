import { useEffect, useMemo, useRef, useState } from "react";
import { Play, Search } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { TextInput } from "@/components/ui/field.tsx";
import { loadMushaf, searchMushaf } from "@/lib/quran/mushaf.ts";
import { RECITERS } from "@/lib/quran/reciters.ts";
import { SURAHS, surahOf } from "@/lib/quran/surahs.ts";
import type { Ayah, MushafSurah } from "@/lib/quran/types.ts";
import { cn } from "@/lib/utils.ts";
import { useQuran } from "@/stores/quran-store.ts";

export function QuranView() {
  const surah = useQuran((s) => s.surah);
  const ayah = useQuran((s) => s.ayah);
  const reciterId = useQuran((s) => s.reciterId);
  const setReciter = useQuran((s) => s.setReciter);
  const setRef = useQuran((s) => s.setRef);
  const playAt = useQuran((s) => s.playAt);
  const playing = useQuran((s) => s.playing);
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
    activeRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [ayah, surah]);

  const current = data?.[surah - 1];
  const hits = useMemo(() => (data && q.trim().length > 1 ? searchMushaf(data, q) : []), [data, q]);
  const meta = surahOf(surah);

  return (
    <div className="page-pad mx-auto grid max-w-6xl gap-4 px-4 pt-4 lg:grid-cols-[260px_minmax(0,1fr)]">
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

        <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
          {RECITERS.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => setReciter(r.id)}
              className={cn(
                "shrink-0 rounded-full border px-3 py-2 text-left text-xs",
                r.id === reciterId ? "border-[var(--accent)] text-[var(--accent)]" : "border-[var(--line)] text-[var(--muted)]",
              )}
            >
              <span className="block font-medium text-[var(--fg)]">{r.name}</span>
              <span>{r.style}</span>
            </button>
          ))}
        </div>

        <div className="mt-3 flex gap-2">
          <Button variant="glow" onClick={() => playAt(surah, 1, meta.ayahs)}>
            <Play className="size-4" /> Слушать суру
          </Button>
        </div>

        {error ? <p className="mt-4 text-sm text-[var(--danger)]">{error}</p> : null}

        <ol className="mt-5 grid gap-3">
          {(current?.ayahs ?? []).map((a: Ayah) => {
            const active = a.i === ayah;
            return (
              <li
                key={a.g}
                ref={active ? (el) => { activeRef.current = el; } : undefined}
                className={cn("rounded-[24px] border border-[var(--line)] bg-[var(--surface)] p-4", active && "ayah-active")}
              >
                <button type="button" className="block w-full text-left" onClick={() => playAt(surah, a.i, null)}>
                  <div className="flex items-start justify-between gap-3">
                    <span className="grid size-8 shrink-0 place-items-center rounded-full border border-[var(--line)] text-xs tabular-nums">
                      {a.i}
                    </span>
                    {playing && active ? <span className="live-dot mt-2" /> : null}
                  </div>
                  <p className="ayah-ar mt-2" lang="ar">
                    {a.ar}
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-[var(--fg)]">{a.ru}</p>
                </button>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
