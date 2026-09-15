import { Bookmark, Pause, Play, Repeat, SkipBack, SkipForward } from "lucide-react";
import { reciterById } from "@/lib/quran/reciters.ts";
import { surahOf } from "@/lib/quran/surahs.ts";
import { cn } from "@/lib/utils.ts";
import { useQuran } from "@/stores/quran-store.ts";

export function PlayerBar() {
  const session = useQuran((s) => s.session);
  const playing = useQuran((s) => s.playing);
  const surah = useQuran((s) => s.surah);
  const ayah = useQuran((s) => s.ayah);
  const reciterId = useQuran((s) => s.reciterId);
  const repeat = useQuran((s) => s.repeat);
  const bookmarks = useQuran((s) => s.bookmarks);
  const toggle = useQuran((s) => s.toggle);
  const next = useQuran((s) => s.next);
  const prev = useQuran((s) => s.prev);
  const setRepeat = useQuran((s) => s.setRepeat);
  const toggleBookmark = useQuran((s) => s.toggleBookmark);
  const lastError = useQuran((s) => s.lastError);
  const audioMs = useQuran((s) => s.audioMs);
  const durationMs = useQuran((s) => s.durationMs);
  const waiting = useQuran((s) => s.waiting);
  const continueLearn = useQuran((s) => s.continueLearn);
  const replayUnit = useQuran((s) => s.replayUnit);
  const seekRatio = useQuran((s) => s.seekRatio);
  const learnMode = useQuran((s) => s.learnMode);
  if (!session) return null;
  const meta = surahOf(surah);
  const rec = reciterById(reciterId);
  const marked = bookmarks.some((b) => b.surah === surah && b.ayah === ayah);
  const ratio = durationMs > 0 ? Math.min(1, audioMs / durationMs) : 0;

  return (
    <div className="player-dock rounded-[28px] border border-[var(--line)] bg-[var(--bg-elev)] px-3 py-2 shadow-[0_12px_40px_rgba(0,0,0,0.35)]">
      <button
        type="button"
        className="mb-2 block h-1.5 w-full overflow-hidden rounded-full bg-[var(--surface)]"
        aria-label="Положение в аяте"
        onClick={(e) => {
          const box = e.currentTarget.getBoundingClientRect();
          const x = (e.clientX - box.left) / Math.max(1, box.width);
          const rtl = document.documentElement.dir === "rtl";
          seekRatio(rtl ? 1 - x : x);
        }}
      >
        <span
          className="block h-full rounded-full bg-[var(--accent)]"
          style={{ width: `${ratio * 100}%` }}
        />
      </button>
      {waiting ? (
        <div className="mb-2 flex gap-2">
          <button
            type="button"
            className="min-h-10 flex-1 rounded-full border border-[var(--line)] text-xs"
            onClick={replayUnit}
          >
            Ещё раз
          </button>
          <button
            type="button"
            data-learn-next
            className="btn-glow min-h-10 flex-1 rounded-full text-xs"
            onClick={continueLearn}
          >
            {learnMode === "word" ? "Следующее слово" : "Дальше"}
          </button>
        </div>
      ) : null}
      <div className="flex items-center gap-2">
        <button type="button" className="grid size-11 place-items-center" onClick={prev} aria-label="Предыдущий аят">
          <SkipBack className="size-4" />
        </button>
        <button
          type="button"
          className="btn-glow grid size-12 place-items-center p-0"
          onClick={toggle}
          aria-label={playing ? "Пауза" : waiting ? "Дальше" : "Слушать"}
        >
          {playing ? <Pause className="size-5" /> : <Play className="size-5 translate-x-px" />}
        </button>
        <button type="button" className="grid size-11 place-items-center" onClick={next} aria-label="Следующий аят">
          <SkipForward className="size-4" />
        </button>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">
            {meta.ru} {surah}:{ayah}
          </p>
          <p className="truncate text-[11px] text-[var(--muted)]">
            {lastError || (waiting ? "Повтори" : rec.name)}
          </p>
        </div>
        <button
          type="button"
          className={cn("grid size-11 place-items-center", repeat !== "off" && "text-[var(--accent)]")}
          onClick={() => setRepeat(repeat === "off" ? "ayah" : repeat === "ayah" ? "surah" : "off")}
          aria-label="Повтор"
        >
          <Repeat className="size-4" />
        </button>
        <button
          type="button"
          className={cn("grid size-11 place-items-center", marked && "text-[var(--accent)]")}
          onClick={toggleBookmark}
          aria-label="Закладка"
        >
          <Bookmark className={cn("size-4", marked && "fill-current")} />
        </button>
      </div>
    </div>
  );
}
