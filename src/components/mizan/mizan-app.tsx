import { useEffect, useState } from "react";
import { BookOpen, GraduationCap, Home, Scale, Settings, Shield } from "lucide-react";
import { HisnView } from "@/components/mizan/hisn-view.tsx";
import { HomeView } from "@/components/mizan/home-view.tsx";
import { LearnView } from "@/components/mizan/learn-view.tsx";
import { PlayerBar } from "@/components/mizan/player-bar.tsx";
import { QuranView } from "@/components/mizan/quran-view.tsx";
import { SettingsDialog } from "@/components/mizan/panels.tsx";
import { ZakatView } from "@/components/mizan/zakat-view.tsx";
import { Button } from "@/components/ui/button.tsx";
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
    root.dataset.mode = theme.mode;
    root.dataset.radius = theme.radius;
    root.dataset.fonts = theme.fonts;
    root.dataset.nav = theme.nav;
    root.dataset.motion = settings.reducedMotion ? "off" : "on";
    root.dataset.shadow = theme.shadow;
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
  if (a === "quran") {
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
  } else if (a === "zakat" || a === "home" || a === "quran" || a === "learn" || a === "hisn") {
    useMizan.getState().setAppTab(a);
  }
}

function Header() {
  const open = useMizan((s) => s.setSettingsOpen);
  const setDesigns = useMizan((s) => s.setDesignsOpen);
  return (
    <header className="relative z-20 flex min-h-16 items-center justify-between gap-3 px-4 pt-[env(safe-area-inset-top)]">
      <div className="flex min-w-0 items-center gap-3">
        <img src="/brand/mizan-mark.jpg" alt="Мизан" className="brand-logo" width={44} height={44} />
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--muted)]">
            <span className="live-dot" />
            Мизан
          </p>
          <p className="truncate text-xs text-[var(--muted)]">Шейх · Закят · Коран · Хисн · Иткан</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          className="pill size-11 p-0"
          aria-label="Настройки"
          onClick={() => {
            open(true);
            setDesigns(true);
          }}
        >
          <Settings className="size-5" />
        </Button>
      </div>
    </header>
  );
}

function BottomNav() {
  const tab = useMizan((s) => s.appTab);
  const setTab = useMizan((s) => s.setAppTab);
  const [tucked, setTucked] = useState(false);
  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      if (y > last + 8 && y > 48) setTucked(true);
      else if (y < last - 8) setTucked(false);
      last = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <nav className={cn("bottom-dock glass", tucked && "is-tucked")} aria-label="Разделы">
      <button type="button" className="dock-handle" aria-label={tucked ? "Показать меню" : "Спрятать меню"} onClick={() => setTucked((v) => !v)} />
      <ul className="mx-auto grid max-w-lg grid-cols-5">
        {TABS.map((t) => {
          const Icon = t.icon;
          const on = tab === t.id;
          return (
            <li key={t.id}>
              <button
                type="button"
                onClick={() => setTab(t.id)}
                className={cn(
                  "flex min-h-16 w-full flex-col items-center justify-center gap-1 text-[11px]",
                  on ? "nav-glow" : "text-[var(--muted)]",
                )}
              >
                <Icon className="size-5" />
                {t.label}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function MizanApp() {
  const tab = useMizan((s) => s.appTab);
  const session = useQuran((s) => s.session);
  useEffect(() => {
    hydrateMizan();
    hydrateQuran();
    hydrateLearn();
    hydrateHisn();
    useMizan.getState().recompute();
    parseHash();
    const onHash = () => parseHash();
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
  return (
    <div className={cn("app-shell", session && "has-player")}>
      <ThemeApplier />
      <div className="geo-veil" aria-hidden />
      <Header />
      <main>
        {tab === "home" ? <HomeView /> : null}
        {tab === "zakat" ? <ZakatView /> : null}
        {tab === "quran" ? <QuranView /> : null}
        {tab === "hisn" ? <HisnView /> : null}
        {tab === "learn" ? <LearnView /> : null}
      </main>
      <PlayerBar />
      <BottomNav />
      <SettingsDialog />
    </div>
  );
}
