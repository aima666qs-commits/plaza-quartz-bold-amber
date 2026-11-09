import { useEffect, useRef, useState, type MouseEvent } from "react";
import { Mic, Pause, Send, Volume2, BookOpen, Library, Clock, Compass, Scale, Shield, GraduationCap, User } from "lucide-react";
import { SheikhSeal } from "@/components/mizan/brand.tsx";
import { HadithSource } from "@/components/mizan/hadith-source.tsx";
import { HouseRoom } from "@/components/mizan/house-room.tsx";
import { SheikhSheet } from "@/components/mizan/sheikh-sheet.tsx";
import { SalahCard } from "@/components/mizan/salah-card.tsx";
import { SalahBoard } from "@/components/mizan/salah-board.tsx";
import { StudyDesk } from "@/components/mizan/study-desk.tsx";
import { Tap } from "@/components/mizan/press.tsx";
import { Button } from "@/components/ui/button.tsx";
import { HOUSE_MAIN, HOUSE_MORE, type HouseTile } from "@/lib/house/catalog.ts";
import { NAV_BY_ID, labelKeyFor } from "@/lib/nav/catalog.ts";
import { goNav } from "@/lib/nav/go.ts";
import { readRecents, type RecentItem } from "@/lib/nav/recents.ts";
import { hadithAr, hadithMeaning, hadithOfDay, hadithTitle, hijriLabel, speakLang } from "@/lib/house/data.ts";
import { gradeLabel, isSahih } from "@/lib/house/nawawi-grade.ts";
import { translate } from "@/lib/i18n/dict.ts";
import { bootNotify, nextSabrLabel, requestNotify, showSabrNow } from "@/lib/notify.ts";
import { formatRef, loadAyah } from "@/lib/quran/mushaf.ts";
import { sabrOfDay } from "@/lib/quran/sabr.ts";
import type { Ayah } from "@/lib/quran/types.ts";
import { hearAsk, prefetchSpeak, speakText, stopSpeak, voiceAvailable } from "@/lib/voice.ts";
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
  goNav(t.id);
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

function Windows() {
  const locale = useMizan((s) => s.settings.locale);
  const setCabinet = useMizan((s) => s.setCabinetOpen);
  const items = [
    { id: "quran", label: "win.quran", icon: BookOpen, go: () => goNav("quran") },
    { id: "books", label: "win.books", icon: Library, go: () => goNav("hadith") },
    { id: "salah", label: "win.salah", icon: Clock, go: () => goNav("namaz") },
    { id: "qibla", label: "win.qibla", icon: Compass, go: () => goNav("qibla") },
    { id: "zakat", label: "win.zakat", icon: Scale, go: () => goNav("zakat") },
    { id: "hisn", label: "win.hisn", icon: Shield, go: () => goNav("hisn") },
    { id: "learn", label: "win.learn", icon: GraduationCap, go: () => goNav("learn") },
    { id: "profile", label: "win.profile", icon: User, go: () => setCabinet(true) },
  ];
  return (
    <div className="win-grid" data-go="windows">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <Tap key={item.id} className="win" onClick={item.go}>
            <Icon />
            <span>{translate(locale, item.label)}</span>
          </Tap>
        );
      })}
    </div>
  );
}

function HadithDay() {
  const locale = useMizan((s) => s.settings.locale);
  const setNav = useMizan((s) => s.setHouseNav);
  const h = hadithOfDay();
  const meaning = hadithMeaning(h, locale);
  const arabic = hadithAr(h);
  const [speaking, setSpeaking] = useState(false);
  const [full, setFull] = useState(true);
  const [source, setSource] = useState(false);
  const [tongue, setTongue] = useState<"ar" | "ru">("ru");
  const playId = useRef(0);

  useEffect(() => () => stopSpeak(), []);
  useEffect(() => {
    void prefetchSpeak(arabic, "ar-SA");
    if (meaning) void prefetchSpeak(meaning, speakLang(locale));
  }, [arabic, meaning, locale]);

  async function runSpeak(next: "ar" | "ru") {
    const id = ++playId.current;
    setSpeaking(true);
    try {
      if (next === "ar") await speakText(arabic, "ar-SA");
      else if (meaning) await speakText(meaning, speakLang(locale));
      else await speakText(arabic, "ar-SA");
    } finally {
      if (playId.current === id) setSpeaking(false);
    }
  }

  async function play(e: MouseEvent) {
    e.stopPropagation();
    if (speaking) {
      playId.current += 1;
      stopSpeak();
      setSpeaking(false);
      return;
    }
    await runSpeak(tongue);
  }

  function flipTongue(next: "ar" | "ru") {
    setTongue(next);
    if (speaking) void runSpeak(next);
  }

  const body = tongue === "ar" ? "" : meaning;

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
        <p className="hadith-day-title" dir="auto">{hadithTitle(h, locale)}</p>
        {body ? (
          <p className={cn("hadith-day-mean", full && "is-full")} dir="auto" lang={locale}>
            {body}
          </p>
        ) : null}
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
          className={cn("hadith-mini", source && "is-on")}
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
          className={cn("hadith-mini", tongue === "ar" && "is-on")}
          onClick={(e) => {
            e.stopPropagation();
            flipTongue(tongue === "ar" ? "ru" : "ar");
          }}
          data-go="hadith-lang"
          aria-label={translate(locale, tongue === "ar" ? "hadith.lang.ru" : "hadith.lang.ar")}
        >
          {tongue === "ar" ? (
            translate(locale, "hadith.lang.ru")
          ) : (
            <span className="ayah-ar text-base leading-none" lang="ar">
              عربي
            </span>
          )}
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
      {source ? <HadithSource h={h} locale={locale} /> : null}
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
          <p className="mt-2 text-sm leading-relaxed ayah-mean" dir="auto">{ayah.ru}</p>
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
  const homeStyle = useMizan((s) => s.settings.homeStyle);
  const [returning, setReturning] = useState(false);
  const [ask, setAsk] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [seed, setSeed] = useState("");
  const [listening, setListening] = useState(false);
  const [mic, setMic] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [recents, setRecents] = useState<RecentItem[]>([]);
  const hijri = hijriLabel(new Date(), locale);
  const swipe = useRef<{ y: number; x: number } | null>(null);
  const stopMic = useRef<(() => void) | null>(null);

  useEffect(() => {
    setReturning(alreadyMet());
    markMet();
    setMic(voiceAvailable());
    const sync = () => setRecents(readRecents().filter((item) => NAV_BY_ID[item.id] || item.id === "search"));
    sync();
    window.addEventListener("mizan-recents", sync);
    return () => window.removeEventListener("mizan-recents", sync);
  }, []);

  function openSheikh(question?: string) {
    setSeed(question ?? "");
    setSheetOpen(true);
  }

  if (room) return <HouseRoom id={room} />;
  if (homeStyle === "board") return <SalahBoard />;

  return (
    <div
      className={cn("page-pad home-board mx-auto grid w-full max-w-lg gap-4 px-4 pt-1 lg:max-w-6xl", homeSize === "roomy" && "home-roomy")}
      onTouchStart={(event) => {
        const touch = event.changedTouches[0];
        if (!touch) return;
        swipe.current = { y: touch.clientY, x: touch.clientX };
      }}
      onTouchEnd={(event) => {
        const start = swipe.current;
        const touch = event.changedTouches[0];
        swipe.current = null;
        if (!start || !touch || window.scrollY > 0) return;
        const dy = touch.clientY - start.y;
        const dx = Math.abs(touch.clientX - start.x);
        if (dy > 72 && dx < 48) useMizan.getState().openSearch("");
      }}
    >
      <section className="home-span grid justify-items-center text-center">
        <p className="bismillah" lang="ar">
          بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
        </p>
        <SheikhSeal size={152} onClick={() => openSheikh()} />
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
        {recents.length ? (
          <div className="recent-row" aria-label={translate(locale, "nav.recent")}>
            <p>{translate(locale, "nav.recent")}</p>
            <div>
              {recents.map((item) => (
                <button key={item.id} type="button" className="nav-chip" onClick={() => goNav(item.id)}>
                  {translate(locale, labelKeyFor(item.id))}
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </section>

      <form
        className="ask-mini glass home-span"
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
            className={cn("grid size-10 place-items-center", listening && "is-hearing")}
            aria-label={translate(locale, listening ? "mic.hearing" : "mic.listen")}
            onClick={() => {
              if (listening) {
                stopMic.current?.();
                stopMic.current = null;
                setListening(false);
                return;
              }
              setListening(true);
              stopMic.current = hearAsk((t, fin) => {
                setAsk(t);
                if (fin) {
                  stopMic.current = null;
                  setListening(false);
                  const q = t.trim();
                  if (q) openSheikh(q);
                }
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

      <div className="home-main">
        <div className="grid gap-3">
          <HadithDay />
          <Windows />
        </div>
        <SalahCard />
      </div>

      <div className="home-span">
        <StudyDesk />
      </div>

      <div className="home-span">
        <SabrCard />
      </div>

      <div className="home-span">
        <button type="button" className="more-fold" aria-expanded={moreOpen} onClick={() => setMoreOpen((v) => !v)}>
          {translate(locale, "more")}
        </button>
      </div>
      {moreOpen ? (
        <>
          <div className="home-grid home-span">
            {HOUSE_MAIN.map((t) => (
              <Tile key={t.id} t={t} />
            ))}
          </div>
          <div className="home-grid home-span">
            {HOUSE_MORE.map((t) => (
              <Tile key={t.id} t={t} />
            ))}
          </div>
        </>
      ) : null}

      <SheikhSheet open={sheetOpen} seed={seed} onClose={() => setSheetOpen(false)} />
    </div>
  );
}
