import { useEffect, useRef, useState } from "react";
import { loadVerseTranslation, splitAyahWords, type SyncWord } from "@/lib/quran/sync.ts";
import { ruleClass, wordRule } from "@/lib/quran/tajweed.ts";
import type { Ayah } from "@/lib/quran/types.ts";
import { cn } from "@/lib/utils.ts";
import { useMizan } from "@/stores/mizan-store.ts";
import { useQuran } from "@/stores/quran-store.ts";

const EMPTY: SyncWord[] = [];

export function FlowAyah({ ayah, surah, active }: { ayah: Ayah; surah: number; active: boolean }) {
  const wordIndex = useQuran((s) => (active ? s.wordIndex : -1));
  const playing = useQuran((s) => s.playing);
  const words = useQuran((s) => (active ? s.words : EMPTY));
  const playWord = useQuran((s) => s.playWord);
  const parts = active && words.length ? words.map((w) => w.ar) : splitAyahWords(ayah.ar).map((w) => w.ar);
  const hi = active && wordIndex >= 0 ? wordIndex : -1;
  return (
    <>
      {parts.map((w, i) => (
        <span key={i}>
          <span
            data-ayah-word={i}
            className={cn("ayah-word", hi === i && "ayah-word-now", hi > i && "ayah-word-done")}
            onClick={(e) => {
              e.stopPropagation();
              playWord(surah, ayah.i, i);
            }}
          >
            {w}
          </span>
          {i < parts.length - 1 ? " " : null}
        </span>
      ))}
    </>
  );
}

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
  const [pick, setPick] = useState<number | null>(null);
  const locale = useMizan((s) => s.settings.locale);
  const [meaning, setMeaning] = useState(locale === "ru" ? ayah.ru : "");

  const live = active && (playing || waiting || wordIndex >= 0);
  const display: SyncWord[] = active && words.length ? words : splitAyahWords(ayah.ar);
  const hi = follow && active && wordIndex >= 0 ? wordIndex : -1;
  const chips = layout === "words" || viewMode === "learn";
  const split = chips || (live && follow);
  const veil = learnMode === "hifz" && active && follow && chips;
  const picked = chips && active && pick != null ? display[pick] : null;

  useEffect(() => {
    if (!active) setPick(null);
  }, [active, ayah.g]);

  useEffect(() => {
    if (!active) return;
    if (locale === "ru") {
      setMeaning(ayah.ru);
      return;
    }
    if (locale === "ar") {
      setMeaning("");
      return;
    }
    let on = true;
    setMeaning("");
    void loadVerseTranslation(surah, ayah.i, locale).then((text) => {
      if (on) setMeaning(text);
    });
    return () => {
      on = false;
    };
  }, [active, locale, surah, ayah.i, ayah.ru]);

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
      <div>
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
                  pick === i && "is-on",
                  tajweed && ruleClass(wordRule(w.ar, next)),
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  setPick(i);
                }}
              >
                <span className="ayah-word-text">{w.ar}</span>
                {w.tr ? <span className="ayah-tr">{w.tr}</span> : null}
                {locale === "en" && w.gloss ? <span className="ayah-gloss">{w.gloss}</span> : null}
              </button>
            );
          })}
        </div>
        {picked ? <WordCard word={picked} meaning={meaning} locale={locale} onListen={() => playWord(surah, ayah.i, picked.i)} onClose={() => setPick(null)} /> : null}
      </div>
    );
  }

  return (
    <div>
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
                  if (chips) setPick(i);
                  else playWord(surah, ayah.i, i);
                }}
              >
                {w.ar}
              </span>
              {i < display.length - 1 ? " " : null}
            </span>
          );
        })}
      </p>
      {picked ? <WordCard word={picked} meaning={meaning} locale={locale} onListen={() => playWord(surah, ayah.i, picked.i)} onClose={() => setPick(null)} /> : null}
    </div>
  );
}

function WordCard({ word, meaning, locale, onListen, onClose }: { word: SyncWord; meaning: string; locale: string; onListen: () => void; onClose: () => void }) {
  const gloss = locale === "en" ? word.gloss : "";
  return (
    <div className="word-pop mt-3" role="dialog" aria-label="Слово">
      <p className="ayah-ar text-2xl" lang="ar">
        {word.ar}
      </p>
      {word.tr ? <p className="mt-1 text-sm text-[var(--muted)]">{word.tr}</p> : null}
      {gloss ? <p className="mt-1 text-sm">{gloss}</p> : null}
      {meaning ? <p className="mt-1 text-sm leading-relaxed">{meaning}</p> : <p className="mt-1 text-xs text-[var(--muted)]">Пословный перевод этого языка в источнике не отдельный. Смысл аята — строкой ниже, без английского под каждым словом.</p>}
      <div className="mt-2 flex gap-2">
        <button type="button" className="skin min-h-11 rounded-full px-3 text-xs" onClick={onListen}>
          Слушать слово
        </button>
        <button type="button" className="min-h-11 rounded-full px-3 text-xs text-[var(--muted)]" onClick={onClose}>
          Закрыть
        </button>
      </div>
    </div>
  );
}
