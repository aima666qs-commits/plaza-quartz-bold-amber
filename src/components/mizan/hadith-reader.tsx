import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Pause, Volume2 } from "lucide-react";
import {
  NAWAWI,
  NAWAWI_SAHIH,
  hadithMeaning,
  hadithRef,
  hadithTitle,
  speakLang,
  type HadithArFont,
  type HadithMeanFont,
  type HadithPaper,
} from "@/lib/house/data.ts";
import { gradeLabel, gradeNote, isSahih } from "@/lib/house/nawawi-grade.ts";
import { translate } from "@/lib/i18n/dict.ts";
import { speakText, stopSpeak } from "@/lib/voice.ts";
import { cn } from "@/lib/utils.ts";
import { useMizan } from "@/stores/mizan-store.ts";

const PAPERS: { id: HadithPaper; key: string }[] = [
  { id: "mushaf", key: "hadith.paper.mushaf" },
  { id: "folio", key: "hadith.paper.folio" },
  { id: "night", key: "hadith.paper.night" },
  { id: "vellum", key: "hadith.paper.vellum" },
];

const AR_FONTS: { id: HadithArFont; key: string }[] = [
  { id: "naskh", key: "hadith.font.naskh" },
  { id: "amiri", key: "hadith.font.amiri" },
  { id: "kufi", key: "hadith.font.kufi" },
  { id: "scheherazade", key: "hadith.font.scheherazade" },
];

const MEAN_FONTS: { id: HadithMeanFont; key: string }[] = [
  { id: "literata", key: "hadith.font.mean.literata" },
  { id: "fraunces", key: "hadith.font.mean.fraunces" },
  { id: "newsreader", key: "hadith.font.mean.newsreader" },
  { id: "plex", key: "hadith.font.mean.plex" },
];

type SpeakKind = "ar" | "mean" | "all" | null;

export function HadithReader() {
  const n = useMizan((s) => s.houseHadith) ?? 1;
  const from = useMizan((s) => s.houseHadithFrom);
  const setNav = useMizan((s) => s.setHouseNav);
  const locale = useMizan((s) => s.settings.locale);
  const paper = useMizan((s) => s.settings.hadithPaper);
  const arFont = useMizan((s) => s.settings.hadithArFont);
  const meanFont = useMizan((s) => s.settings.hadithMeanFont) ?? "literata";
  const setSettings = useMizan((s) => s.setSettings);
  const [speaking, setSpeaking] = useState<SpeakKind>(null);
  const [source, setSource] = useState(false);
  const t = (k: string) => translate(locale, k);
  const h = NAWAWI.find((x) => x.n === n) ?? NAWAWI[0];
  const meaning = hadithMeaning(h, locale);
  const title = hadithTitle(h, locale);
  const pool = isSahih(h.n) ? NAWAWI_SAHIH : NAWAWI;
  const i = pool.findIndex((x) => x.n === h.n);
  const prev = i > 0 ? pool[i - 1] : null;
  const next = i >= 0 && i < pool.length - 1 ? pool[i + 1] : null;

  useEffect(() => {
    return () => stopSpeak();
  }, []);

  useEffect(() => {
    stopSpeak();
    setSpeaking(null);
    setSource(false);
  }, [h.n]);

  function back() {
    stopSpeak();
    if (from === "home") setNav(null);
    else setNav("nawawi", null);
  }

  function go(other: number) {
    stopSpeak();
    setSpeaking(null);
    setNav("nawawi", other, from);
  }

  async function play(kind: SpeakKind) {
    if (speaking) {
      stopSpeak();
      setSpeaking(null);
      if (speaking === kind) return;
    }
    if (!kind) return;
    setSpeaking(kind);
    try {
      if (kind === "ar" || kind === "all") await speakText(h.ar, "ar-SA");
      if (kind === "mean" || kind === "all") {
        const text = meaning || title;
        if (text) await speakText(text, speakLang(locale));
      }
    } finally {
      setSpeaking(null);
    }
  }

  return (
    <div
      className="book-page"
      data-paper={paper}
      data-arfont={arFont}
      data-meanfont={meanFont}
      data-go="hadith-reader"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <header className="book-bar">
        <button type="button" className="book-icon" onClick={back} aria-label={t("hadith.back")} data-go="hadith-back">
          <ChevronLeft className="size-5" />
        </button>
        <p className="book-kicker">
          {t("hadith.n")} {h.n}
          <span className="opacity-50"> · {gradeLabel(h.n, locale)}</span>
        </p>
        <span className="size-11" />
      </header>

      <div className="book-sheet">
        <h1 className="book-title">{title}</h1>
        <p className="book-ar gold-flow" lang="ar">
          {h.ar}
        </p>
        <ChipRow
          items={AR_FONTS.map((f) => ({ id: f.id, label: t(f.key) }))}
          value={arFont}
          onChange={(id) => setSettings({ hadithArFont: id })}
        />
        {meaning ? <p className="book-mean">{meaning}</p> : null}
        {meaning ? (
          <ChipRow
            items={MEAN_FONTS.map((f) => ({ id: f.id, label: t(f.key) }))}
            value={meanFont}
            onChange={(id) => setSettings({ hadithMeanFont: id })}
          />
        ) : null}
        <p className="book-ref">{hadithRef(h, locale)}</p>
        <button
          type="button"
          className="hadith-mini mx-auto"
          onClick={() => setSource((v) => !v)}
          data-go="hadith-source"
          aria-expanded={source}
        >
          {t("hadith.whence")}
        </button>
        {source ? <p className="book-source">{gradeNote(h.n, locale)}</p> : null}
        <ChipRow
          items={PAPERS.map((p) => ({ id: p.id, label: t(p.key) }))}
          value={paper}
          onChange={(id) => setSettings({ hadithPaper: id })}
        />
        <div className="book-listen">
          <ListenBtn active={speaking === "ar"} label={t("hadith.listen.ar")} onClick={() => void play("ar")} />
          {meaning ? (
            <ListenBtn active={speaking === "mean"} label={t("hadith.listen.mean")} onClick={() => void play("mean")} />
          ) : null}
          <ListenBtn active={speaking === "all"} label={t("hadith.listen.all")} onClick={() => void play("all")} />
        </div>
      </div>

      <nav className="book-pager">
        <button type="button" className="book-page-btn" disabled={!prev} onClick={() => prev && go(prev.n)} aria-label={t("hadith.prev")}>
          <ChevronLeft className="size-5" />
          <span>{prev ? `${prev.n}` : "·"}</span>
        </button>
        <button type="button" className="book-page-btn" disabled={!next} onClick={() => next && go(next.n)} aria-label={t("hadith.next")}>
          <span>{next ? `${next.n}` : "·"}</span>
          <ChevronRight className="size-5" />
        </button>
      </nav>
    </div>
  );
}

function ListenBtn({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button type="button" className={cn("book-listen-btn", active && "is-on")} onClick={onClick} data-go="hadith-listen">
      {active ? <Pause className="size-4" /> : <Volume2 className="size-4" />}
      {label}
    </button>
  );
}

function ChipRow<T extends string>({
  items,
  value,
  onChange,
}: {
  items: { id: T; label: string }[];
  value: T;
  onChange: (id: T) => void;
}) {
  return (
    <div className="book-chips">
      {items.map((it) => (
        <button
          key={it.id}
          type="button"
          className={cn("book-chip", value === it.id && "is-on")}
          onClick={() => onChange(it.id)}
        >
          {it.label}
        </button>
      ))}
    </div>
  );
}
