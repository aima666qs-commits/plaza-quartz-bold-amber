import { useEffect, useRef, type ReactNode } from "react";
import { BookOpen, ChevronLeft, GraduationCap, Home, Scale, Settings, Shield, UserRound } from "lucide-react";
import { BrandMark } from "@/components/mizan/brand.tsx";
import { CabinetSheet } from "@/components/mizan/cabinet.tsx";
import { HadithReader } from "@/components/mizan/hadith-reader.tsx";
import { HisnView } from "@/components/mizan/hisn-view.tsx";
import { HomeView } from "@/components/mizan/home-view.tsx";
import { LearnView } from "@/components/mizan/learn-view.tsx";
import { PlayerBar } from "@/components/mizan/player-bar.tsx";
import { QuranView } from "@/components/mizan/quran-view.tsx";
import { SettingsDialog } from "@/components/mizan/panels.tsx";
import { StudyGate } from "@/components/mizan/study-gate.tsx";
import { ZakatView } from "@/components/mizan/zakat-view.tsx";
import { HOUSE_MAIN, HOUSE_MORE, type HouseRoomId } from "@/lib/house/catalog.ts";
import { translate } from "@/lib/i18n/dict.ts";
import { startSabrDaily } from "@/lib/notify.ts";
import { getTheme } from "@/lib/themes/registry.ts";
import { cn } from "@/lib/utils.ts";
import { hydrateHisn } from "@/stores/hisn-store.ts";
import { hydrateLearn, useLearn } from "@/stores/learn-store.ts";
import { hydrateMizan, useMizan, type AppTab } from "@/stores/mizan-store.ts";
import { hydrateQuran, useQuran } from "@/stores/quran-store.ts";

function ThemeApplier() {
  const settings = useMizan((s) => s.settings);
  const preview = useMizan((s) => s.previewThemeId);
  const theme = getTheme(preview ?? settings.themeId);
  useEffect(() => {
    const root = document.documentElement;
    Object.entries(theme.tokens).forEach(([k, v]) => root.style.setProperty(k, v));
    root.dataset.theme = theme.id;
    root.dataset.family = theme.family;
    root.dataset.density = settings.densityOverride === "theme" ? theme.density : settings.densityOverride;
    root.dataset.mode = settings.colorScheme === "theme" ? theme.mode : settings.colorScheme === "dark" ? "dark" : settings.colorScheme === "light" ? "light" : theme.mode;
    root.dataset.radius = theme.radius;
    root.dataset.fonts = settings.fontPair && settings.fontPair !== "theme" ? settings.fontPair : theme.fonts;
    root.dataset.nav = settings.navLayout === "theme" ? theme.nav : settings.navLayout;
    root.lang = settings.locale === "ar" ? "ar" : settings.locale;
    root.dir = settings.locale === "ar" ? "rtl" : "ltr";
    root.dataset.motion = settings.reducedMotion ? "off" : "on";
    root.dataset.shadow = theme.shadow;
    root.dataset.tap = settings.largeTap ? "large" : "normal";
    root.dataset.contrast = settings.highContrast ? "high" : "normal";
    root.dataset.home = settings.homeSize;
    root.style.setProperty("--user-font-scale", String(settings.fontScale));
    root.style.colorScheme = theme.mode;
  }, [theme, settings]);
  return null;
}

const TABS: { id: AppTab; label: string; icon: typeof Home }[] = [
  { id: "home", label: "Главная", icon: Home },
  { id: "zakat", label: "Закят", icon: Scale },
  { id: "quran", label: "Коран", icon: BookOpen },
  { id: "hisn", label: "Хисн", icon: Shield },
  { id: "learn", label: "Учить", icon: GraduationCap },
];

function parseHash() {
  if (typeof window === "undefined") return;
  const h = location.hash.replace(/^#/, "");
  if (!h) return;
  const [a, b, c] = h.split("/");
  if (a === "tafsir") {
    useMizan.getState().setAppTab("quran");
    const s = Number(b) || 12;
    const ay = Number(c);
    useQuran.getState().openTafsir(s, ay >= 1 ? ay : 1);
  } else if (a === "quran") {
    useMizan.getState().setAppTab("quran");
    const s = Number(b);
    const ay = Number(c);
    if (s >= 1 && s <= 114) useQuran.getState().setRef(s, ay >= 1 ? ay : 1);
  } else if (a === "learn") {
    useMizan.getState().setAppTab("learn");
    const n = Number(b);
    if (n >= 1 && n <= 40) useLearn.getState().setWeek(n);
  } else if (a === "hisn") {
    useMizan.getState().setAppTab("hisn");
    const id = Number(b);
    if (Number.isFinite(id) && id > 0) useMizan.getState().setHisnChapter(id);
  } else if (a === "house") {
    const rooms = new Set([...HOUSE_MAIN, ...HOUSE_MORE].map((t) => t.room).filter(Boolean) as HouseRoomId[]);
    if (b && rooms.has(b as HouseRoomId)) {
      const n = Number(c);
      if (b === "nawawi" && Number.isFinite(n) && n >= 1 && n <= 42) {
        useMizan.getState().setHouseNav("nawawi", n, "list");
      } else {
        useMizan.getState().setHouseNav(b as HouseRoomId, null);
      }
    } else useMizan.getState().setAppTab("home");
  } else if (a === "settings") {
    useMizan.getState().setSettingsOpen(true);
  } else if (a === "zakat" || a === "home" || a === "quran" || a === "learn" || a === "hisn") {
    useMizan.getState().setSettingsOpen(false);
    useMizan.getState().setAppTab(a);
    if (a === "home") useMizan.getState().setHouseRoom(null);
  }
}

function goHome() {
  useLearn.getState().setCourse(null);
  useLearn.getState().setLane(null);
  useQuran.getState().closeTafsir();
  useMizan.getState().resetToHome();
}

function goBack() {
  const m = useMizan.getState();
  const q = useQuran.getState();
  const l = useLearn.getState();
  if (m.settingsOpen) {
    m.setSettingsOpen(false);
    return;
  }
  if (q.tafsirOn) {
    q.closeTafsir();
    return;
  }
  if (m.houseHadith != null || m.houseRoom) {
    m.setHouseRoom(null);
    return;
  }
  if (l.course != null) {
    l.setCourse(null);
    return;
  }
  if (l.lane) {
    l.setLane(null);
    return;
  }
  if (m.appTab !== "home") {
    m.setAppTab("home");
    return;
  }
  goHome();
}

function Header() {
  const setOpen = useMizan((s) => s.setSettingsOpen);
  const locale = useMizan((s) => s.settings.locale);
  const tab = useMizan((s) => s.appTab);
  const room = useMizan((s) => s.houseRoom);
  const tafsirOn = useQuran((s) => s.tafsirOn);
  const course = useLearn((s) => s.course);
  const lane = useLearn((s) => s.lane);
  const setCabinet = useMizan((s) => s.setCabinetOpen);
  const back = tab !== "home" || room || tafsirOn || course || Boolean(lane);
  return (
    <header className="relative z-20 flex min-h-16 items-center justify-between gap-3 px-4 pt-[env(safe-area-inset-top)]">
      {back ? (
        <button type="button" className="settings-gear" onClick={goBack} aria-label="Назад" data-go="back">
          <ChevronLeft className="size-5" />
        </button>
      ) : (
        <button type="button" className="flex min-w-0 items-center gap-3 text-left" onClick={goHome} data-go="home" aria-label="На главную">
          <BrandMark size={44} />
          <div className="min-w-0">
            <p className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--muted)]">
              <span className="live-dot" />
              Мизан
            </p>
            <p className="truncate text-xs text-[var(--muted)]">Шейх · Закят · Коран · Хисн · Иткан</p>
          </div>
        </button>
      )}
      {back ? (
        <button type="button" className="flex min-w-0 flex-1 items-center gap-2 text-left" onClick={goHome} aria-label="На главную">
          <BrandMark size={36} />
          <span className="truncate text-sm">Мизан</span>
        </button>
      ) : <span className="flex-1" />}
      <button type="button" className="settings-gear" aria-label="Кабинет" onClick={() => setCabinet(true)}>
        <UserRound className="size-5" />
      </button>
      <button
        type="button"
        className="settings-gear"
        aria-label={translate(locale, "settings")}
        data-go="settings"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen(true);
        }}
      >
        <Settings className="size-5" />
      </button>
    </header>
  );
}

function BottomNav() {
  const tab = useMizan((s) => s.appTab);
  const setTab = useMizan((s) => s.setAppTab);
  const locale = useMizan((s) => s.settings.locale);
  const layout = useMizan((s) => s.settings.navLayout);
  const rail = layout === "rail";
  return (
    <nav className="bottom-dock glass" aria-label={translate(locale, "nav.home")}>
      <ul className={cn("mx-auto grid max-w-lg", layout === "sidebar" ? "grid-cols-1" : "grid-cols-5")}>
        {TABS.map((t) => {
          const Icon = t.icon;
          const on = tab === t.id;
          return (
            <li key={t.id}>
              <button
                type="button"
                onClick={() => setTab(t.id)}
                data-go={`tab-${t.id}`}
                className={cn(
                  "flex w-full flex-col items-center justify-center gap-1 text-[11px]",
                  rail ? "min-h-14" : "min-h-16",
                  on ? "nav-glow" : "text-[var(--muted)]",
                )}
              >
                <Icon className="size-5" />
                {rail ? null : translate(locale, `nav.${t.id}`)}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function KeepTab({ id, tab, children }: { id: AppTab; tab: AppTab; children: ReactNode }) {
  const seen = useRef(tab === id);
  if (tab === id) seen.current = true;
  if (!seen.current) return null;
  return (
    <div hidden={tab !== id} className="tab-keep" aria-hidden={tab !== id}>
      {children}
    </div>
  );
}

function SettingsGate() {
  const open = useMizan((s) => s.settingsOpen);
  if (!open) return null;
  return <SettingsDialog />;
}

export function MizanApp() {
  const tab = useMizan((s) => s.appTab);
  const homeEpoch = useMizan((s) => s.homeEpoch);
  const session = useQuran((s) => s.session);
  const hadithOpen = useMizan((s) => s.houseHadith != null);
  const settingsOpen = useMizan((s) => s.settingsOpen);
  const courseOpen = useLearn((s) => s.course != null) && tab === "learn";
  const chromeOff = hadithOpen || settingsOpen;
  useEffect(() => {
    hydrateMizan();
    hydrateQuran();
    hydrateLearn();
    hydrateHisn();
    parseHash();
    if (!location.hash) {
      const st = useMizan.getState().settings;
      if (!st.keepLastTab && st.startTab && st.startTab !== "home") useMizan.getState().setAppTab(st.startTab);
      else if (!st.keepLastTab) useMizan.getState().setAppTab(st.startTab);
    }
    const onHash = () => parseHash();
    window.addEventListener("hashchange", onHash);
    const onMsg = (e: MessageEvent) => {
      if (e.data?.type === "OPEN" && typeof e.data.url === "string") {
        const hash = String(e.data.url).split("#")[1];
        if (hash) location.hash = hash;
        parseHash();
      }
      if (e.data?.type === "SABR_DUE") {
        const s = useMizan.getState().settings;
        if (s.sabrNotify) void import("@/lib/notify.ts").then((m) => m.showSabrNow());
      }
    };
    navigator.serviceWorker?.addEventListener("message", onMsg);
    queueMicrotask(() => useMizan.getState().recompute());
    const st = useMizan.getState().settings;
    if (st.sabrNotify) void startSabrDaily(st.sabrHour);
    return () => {
      window.removeEventListener("hashchange", onHash);
      navigator.serviceWorker?.removeEventListener("message", onMsg);
    };
  }, []);
  return (
    <div className={cn("app-shell", session && "has-player", hadithOpen && "is-hadith", courseOpen && "is-method", settingsOpen && "is-settings")}>
      <ThemeApplier />
      {hadithOpen || settingsOpen ? null : <div className="geo-veil" aria-hidden />}
      {chromeOff ? null : <Header />}
      {chromeOff ? null : <PlayerBar />}
      <main inert={chromeOff || undefined} aria-hidden={chromeOff || undefined}>
        <KeepTab id="home" tab={tab}>
          <HomeView key={homeEpoch} />
        </KeepTab>
        <KeepTab id="zakat" tab={tab}>
          <ZakatView />
        </KeepTab>
        <KeepTab id="quran" tab={tab}>
          <QuranView />
        </KeepTab>
        <KeepTab id="hisn" tab={tab}>
          <HisnView />
        </KeepTab>
        <KeepTab id="learn" tab={tab}>
          <LearnView />
        </KeepTab>
      </main>
      {chromeOff ? null : <BottomNav />}
      {hadithOpen && !settingsOpen ? <HadithReader /> : null}
      <SettingsGate />
      <CabinetSheet />
      <StudyGate />
      <StudyGate />
    </div>
  );
}
