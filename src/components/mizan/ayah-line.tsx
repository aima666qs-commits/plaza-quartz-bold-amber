import { useEffect, useRef } from "react";
import { splitAyahWords, type SyncWord } from "@/lib/quran/sync.ts";
import { ruleClass, wordRule } from "@/lib/quran/tajweed.ts";
import type { Ayah } from "@/lib/quran/types.ts";
import { cn } from "@/lib/utils.ts";
import { useQuran } from "@/stores/quran-store.ts";

export function AyahLine({ ayah, active }: { ayah: Ayah; active: boolean }) {
  const playing = useQuran((s) => s.playing);
  const follow = useQuran((s) => s.follow);
  const wbw = useQuran((s) => s.wbw);
  const wordIndex = useQuran((s) => s.wordIndex);
  const words = useQuran((s) => s.words);
  const learnMode = useQuran((s) => s.learnMode);
  const waiting = useQuran((s) => s.waiting);
  const playWord = useQuran((s) => s.playWord);
  const surah = useQuran((s) => s.surah);
  const tajweed = useQuran((s) => s.tajweed);
  const viewMode = useQuran((s) => s.viewMode);
  const layout = useQuran((s) => s.mushafLayout);
  const nowRef = useRef<HTMLSpanElement | HTMLButtonElement | null>(null);

  const live = active && (playing || waiting);
  const display: SyncWord[] = active && words.length ? words : splitAyahWords(ayah.ar);
  const hi = follow && live ? wordIndex : -1;
  const chips = layout === "words" || viewMode === "learn";
  const split = chips || (live && follow);
  const veil = learnMode === "hifz" && active && follow && chips;

  useEffect(() => {
    if (!active || hi < 0) return;
    nowRef.current?.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "smooth" });
  }, [active, hi]);

  if (!split) {
    return (
      <p className="ayah-ar ayah-ar-read mt-2" lang="ar" dir="rtl">
        {ayah.ar}
      </p>
    );
  }

  if (wbw && chips && active && display.some((w) => w.tr || w.gloss)) {
    return (
      <div className="ayah-wbw mt-2" lang="ar" dir="rtl">
        {display.map((w, i) => {
          const now = hi === i;
          const done = hi > i;
          const next = display[i + 1]?.ar ?? "";
          return (
            <button
              key={i}
              type="button"
              ref={now ? (el) => { nowRef.current = el; } : undefined}
              data-ayah-word={i}
              className={cn(
                "ayah-wbw-cell",
                now && "ayah-word-now",
                done && "ayah-word-done",
                veil && hi < i && "ayah-word-veil",
                tajweed && ruleClass(wordRule(w.ar, next)),
              )}
              onClick={(e) => {
                e.stopPropagation();
                playWord(surah, ayah.i, i);
              }}
            >
              <span className="ayah-word-text">{w.ar}</span>
              {w.tr ? <span className="ayah-tr">{w.tr}</span> : null}
              {w.gloss ? <span className="ayah-gloss">{w.gloss}</span> : null}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <p className={cn("ayah-ar mt-2", chips ? "ayah-ar-learn" : "ayah-ar-read")} lang="ar" dir="rtl">
      {display.map((w, i) => {
        const now = hi === i;
        const done = hi > i;
        const next = display[i + 1]?.ar ?? "";
        return (
          <span key={i}>
            <span
              ref={now ? (el) => { nowRef.current = el; } : undefined}
              data-ayah-word={i}
              className={cn(
                "ayah-word",
                now && "ayah-word-now",
                done && "ayah-word-done",
                veil && hi < i && "ayah-word-veil",
                tajweed && chips && ruleClass(wordRule(w.ar, next)),
              )}
              onClick={(e) => {
                e.stopPropagation();
                playWord(surah, ayah.i, i);
              }}
            >
              {w.ar}
            </span>
            {i < display.length - 1 ? " " : null}
          </span>
        );
      })}
    </p>
  );
}
