import { useEffect, useState, type MouseEvent } from "react";
import { Mic, Pause, Send, Volume2 } from "lucide-react";
import { SheikhSeal } from "@/components/mizan/brand.tsx";
import { HouseRoom } from "@/components/mizan/house-room.tsx";
import { SheikhSheet } from "@/components/mizan/sheikh-sheet.tsx";
import { Button } from "@/components/ui/button.tsx";
import { HOUSE_MAIN, HOUSE_MORE, type HouseTile } from "@/lib/house/catalog.ts";
import { hadithMeaning, hadithOfDay, hadithRef, hadithTitle, hijriLabel, speakLang } from "@/lib/house/data.ts";
import { gradeLabel, gradeNote, isSahih } from "@/lib/house/nawawi-grade.ts";
import { translate } from "@/lib/i18n/dict.ts";
import { bootNotify, nextSabrLabel, requestNotify, showSabrNow } from "@/lib/notify.ts";
import { formatRef, loadAyah } from "@/lib/quran/mushaf.ts";
import { sabrOfDay } from "@/lib/quran/sabr.ts";
import type { Ayah } from "@/lib/quran/types.ts";
import { listenRu, speakText, stopSpeak, voiceAvailable } from "@/lib/voice.ts";
import { cn } from "@/lib/utils.ts";
import { useMizan } from "@/stores/mizan-store.ts";
import { useQuran } from "@/stores/quran-store.ts";

const MET_KEY = "mizan.v1.sheikhMet";

function alreadyMet() {
  try {
    return localStorage.getItem(MET_KEY) === "1";
  } catch {
    return false;
  }
}

function markMet() {
  try {
    localStorage.setItem(MET_KEY, "1");
  } catch {
    /* ignore */
  }
}

function go(t: HouseTile) {
  const setTab = useMizan.getState().setAppTab;
  const setRoom = useMizan.getState().setHouseRoom;
  const setHisn = useMizan.getState().setHisnChapter;
  if (t.id === "tafsir") {
    useQuran.getState().openTafsir(12, 1);
    setTab("quran");
    return;
  }
  if (t.tab) {
    if (t.hisn) setHisn(null);
    setRoom(null);
    setTab(t.tab);
    return;
  }
  if (t.room) setRoom(t.room);
}

function Tile({ t }: { t: HouseTile }) {
  const locale = useMizan((s) => s.settings.locale);
  const Icon = t.icon;
  return (
    <button type="button" className="home-tile" onClick={() => go(t)} data-go={t.id}>
      <span className="home-tile-icon">
        <Icon />
      </span>
      <span className="home-tile-label">{translate(locale, `tile.${t.id}`)}</span>
    </button>
  );
}

function HadithDay() {
  const locale = useMizan((s) => s.settings.locale);
  const setNav = useMizan((s) => s.setHouseNav);
  const h = hadithOfDay();
  const meaning = hadithMeaning(h, locale);
  const [speaking, setSpeaking] = useState(false);
  const [full, setFull] = useState(false);
  const [source, setSource] = useState(false);

  useEffect(() => () => stopSpeak(), []);

  async function play(e: MouseEvent) {
    e.stopPropagation();
    if (speaking) {
      stopSpeak();
      setSpeaking(false);
      return;
    }
    setSpeaking(true);
    try {
      await speakText(h.ar, "ar-SA");
      if (meaning) await speakText(meaning, speakLang(locale));
    } finally {
      setSpeaking(false);
    }
  }

  return (
    <div className="hadith-day">
      <button type="button" className="hadith-day-open" onClick={() => setNav("nawawi", h.n, "home")} data-go="hadith-day">
        <p className="hadith-day-kicker">
          {translate(locale, "hadith.day")} · {h.n}
          {isSahih(h.n) ? <span className="hadith-grade"> · {gradeLabel(h.n, locale)}</span> : null}
        </p>
        <p className="hadith-day-ar gold-flow" lang="ar">
          {h.core}
        </p>
        <p className="hadith-day-title">{hadithTitle(h, locale)}</p>
        {meaning ? <p className={cn("hadith-day-mean", full && "is-full")}>{meaning}</p> : null}
      </button>
      <div className="hadith-minis">
        {meaning ? (
          <button
            type="button"
            className="hadith-mini"
            onClick={(e) => {
              e.stopPropagation();
              setFull((v) => !v);
              setSource(false);
            }}
            data-go="hadith-expand"
            aria-expanded={full}
          >
            {full ? translate(locale, "hadith.less") : translate(locale, "hadith.more")}
          </button>
        ) : null}
        <button
          type="button"
          className="hadith-mini"
          onClick={(e) => {
            e.stopPropagation();
            setSource((v) => !v);
            setFull(false);
          }}
          data-go="hadith-source"
          aria-expanded={source}
        >
          {translate(locale, "hadith.whence")}
        </button>
        <button
          type="button"
          className={cn("hadith-day-listen", speaking && "is-on")}
          onClick={(e) => void play(e)}
          aria-label={translate(locale, "hadith.listen")}
          data-go="hadith-day-listen"
        >
          {speaking ? <Pause className="size-4" /> : <Volume2 className="size-4" />}
          {translate(locale, speaking ? "hadith.stop" : "hadith.listen")}
        </button>
      </div>
      {source ? (
        <p className="hadith-source">
          {gradeLabel(h.n, locale)} · {hadithRef(h, locale)}
          <span className="mt-1 block">{gradeNote(h.n, locale)}</span>
        </p>
      ) : null}
    </div>
  );
}

function SabrCard() {
  const locale = useMizan((s) => s.settings.locale);
  const setTab = useMizan((s) => s.setAppTab);
  const setRef = useQuran((s) => s.setRef);
  const sabrOn = useMizan((s) => s.settings.sabrNotify);
  const sabrHour = useMizan((s) => s.settings.sabrHour);
  const setSettings = useMizan((s) => s.setSettings);
  const ref = sabrOfDay();
  const [ayah, setAyah] = useState<Ayah | null>(null);
  const [perm, setPerm] = useState("");
  const [status, setStatus] = useState(translate(locale, "hadith.day"));
  useEffect(() => {
    void loadAyah(ref.surah, ref.ayah).then(setAyah);
    setStatus(`${translate(locale, "hadith.day")} · ${nextSabrLabel(sabrHour)}`);
  }, [ref.surah, ref.ayah, sabrHour, locale]);
  return (
    <article className="ayah-card">
      <p className="text-[11px] uppercase tracking-[0.14em] text-[var(--accent)]">{status}</p>
      <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-[var(--muted)]">{translate(locale, "tile.quran")}</p>
      {ayah ? (
        <>
          <p className="ayah-ar mt-2 text-xl" lang="ar">
            {ayah.ar}
          </p>
          <p className="mt-2 text-sm leading-relaxed">{ayah.ru}</p>
          <p className="mt-1 text-[11px] text-[var(--muted)]">{formatRef(ref.surah, ref.ayah)}</p>
        </>
      ) : (
        <p className="mt-2 text-sm text-[var(--muted)]">…</p>
      )}
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          className="pill min-h-11 rounded-full border border-[var(--line)] px-4 text-sm"
          onClick={() => {
            setRef(ref.surah, ref.ayah);
            setTab("quran");
          }}
        >
          {translate(locale, "tile.quran")}
        </button>
        <button
          type="button"
          className="pill min-h-11 rounded-full border border-[var(--line)] px-4 text-sm"
          onClick={() => {
            useQuran.getState().openTafsir(12, ref.surah === 12 ? ref.ayah : 1);
            setTab("quran");
          }}
        >
          {translate(locale, "tile.tafsir")}
        </button>
        <button
          type="button"
          className="pill min-h-11 rounded-full border border-[var(--line)] px-4 text-sm"
          onClick={async () => {
            const r = await requestNotify();
            if (r === "granted") {
              setSettings({ sabrNotify: true });
              await bootNotify(true, sabrHour);
              await showSabrNow();
              setPerm(translate(locale, "set.notify"));
              setStatus(`${translate(locale, "hadith.day")} · ${nextSabrLabel(sabrHour)}`);
            } else if (r === "unsupported") {
              setPerm(translate(locale, "set.notify"));
            } else {
              setPerm(translate(locale, "set.notify"));
            }
          }}
        >
          {sabrOn ? translate(locale, "hadith.day") : translate(locale, "set.notify")}
        </button>
      </div>
      {perm ? <p className="mt-2 text-[11px] text-[var(--muted)]">{perm}</p> : null}
    </article>
  );
}

export function HomeView() {
  const room = useMizan((s) => s.houseRoom);
  const locale = useMizan((s) => s.settings.locale);
  const showHijri = useMizan((s) => s.settings.showHijri);
  const homeSize = useMizan((s) => s.settings.homeSize);
  const [returning, setReturning] = useState(false);
  const [ask, setAsk] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [seed, setSeed] = useState("");
  const [listening, setListening] = useState(false);
  const [mic, setMic] = useState(false);
  const hijri = hijriLabel(new Date(), locale);

  useEffect(() => {
    setReturning(alreadyMet());
    markMet();
    setMic(voiceAvailable());
  }, []);

  function openSheikh(question?: string) {
    setSeed(question ?? "");
    setSheetOpen(true);
  }

  if (room) return <HouseRoom id={room} />;

  return (
    <div className={cn("page-pad home-compact mx-auto grid max-w-lg gap-3 px-4 pt-1", homeSize === "roomy" && "home-roomy")}>
      <section className="grid justify-items-center text-center">
        <p className="bismillah" lang="ar">
          بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
        </p>
        <SheikhSeal size={56} onClick={() => openSheikh()} />
        <p className="salam-ar mt-1" lang="ar">
          السلام عليكم
        </p>
        <p className="home-hero">{translate(locale, "peace.ru")}{returning ? "" : ""}</p>
        {showHijri ? (
          <p className="text-[11px] text-[var(--muted)]" data-go="hijri">
            {hijri.hijri}
          </p>
        ) : (
          <p className="text-[11px] text-[var(--muted)]" data-go="greg">
            {hijri.greg}
          </p>
        )}
      </section>

      <form
        className="ask-mini glass"
        onSubmit={(e) => {
          e.preventDefault();
          const t = ask.trim();
          setAsk("");
          openSheikh(t || undefined);
        }}
      >
        <input
          className="min-h-11 flex-1 bg-transparent text-sm outline-none placeholder:text-[var(--muted)]"
          value={ask}
          placeholder={translate(locale, "ask.ph")}
          onChange={(e) => setAsk(e.target.value)}
        />
        {mic ? (
          <button
            type="button"
            className={cn("grid size-10 place-items-center", listening && "text-[var(--accent)]")}
            aria-label={translate(locale, "ask.ph")}
            onClick={() => {
              if (listening) {
                setListening(false);
                return;
              }
              setListening(true);
              listenRu((t, fin) => {
                setAsk(t);
                if (fin) setListening(false);
              });
            }}
          >
            <Mic className="size-4" />
          </button>
        ) : null}
        <Button type="submit" variant="glow" className="pill h-10 px-4" aria-label={translate(locale, "sheikh")}>
          <Send className="size-4" />
        </Button>
      </form>

      <HadithDay />

      <div className="home-grid">
        {HOUSE_MAIN.map((t) => (
          <Tile key={t.id} t={t} />
        ))}
      </div>

      <SabrCard />

      <p className="text-center text-[11px] uppercase tracking-[0.16em] text-[var(--muted)]">{translate(locale, "more")}</p>
      <div className="home-grid">
        {HOUSE_MORE.map((t) => (
          <Tile key={t.id} t={t} />
        ))}
      </div>

      <SheikhSheet open={sheetOpen} seed={seed} onClose={() => setSheetOpen(false)} />
    </div>
  );
}
