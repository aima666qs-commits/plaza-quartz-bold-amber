import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Pin } from "lucide-react";
import { BrandMark } from "@/components/mizan/brand.tsx";
import { ContextualRail } from "@/components/mizan/contextual-rail.tsx";
import { Tap } from "@/components/mizan/press.tsx";
import { translate } from "@/lib/i18n/dict.ts";
import {
  LONG_PRESS,
  MoreIcon,
  itemsInGroup,
  navIsCurrent,
  overflowItems,
  primaryItems,
  SIDEBAR_GROUPS,
} from "@/lib/nav/catalog.ts";
import { goNav } from "@/lib/nav/go.ts";
import { cn } from "@/lib/utils.ts";
import { useMizan } from "@/stores/mizan-store.ts";
import { useQuran } from "@/stores/quran-store.ts";

function useNarrow() {
  const [narrow, setNarrow] = useState(false);
  useEffect(() => {
    const query = window.matchMedia("(max-width: 359px)");
    const apply = () => setNarrow(query.matches);
    apply();
    query.addEventListener("change", apply);
    return () => query.removeEventListener("change", apply);
  }, []);
  return narrow;
}

function useOnline() {
  const [online, setOnline] = useState(true);
  const [offlineReady, setOfflineReady] = useState(false);
  useEffect(() => {
    const sync = () => setOnline(navigator.onLine);
    sync();
    window.addEventListener("online", sync);
    window.addEventListener("offline", sync);
    setOfflineReady(Boolean(navigator.serviceWorker?.controller));
    return () => {
      window.removeEventListener("online", sync);
      window.removeEventListener("offline", sync);
    };
  }, []);
  return { online, offlineReady };
}

function useCurrentNav() {
  const tab = useMizan((s) => s.appTab);
  const room = useMizan((s) => s.houseRoom);
  const qibla = useMizan((s) => s.qiblaOn);
  const tafsir = useQuran((s) => s.tafsirOn);
  return { tab, room, qibla, tafsir };
}

function FocusDialog({
  open,
  label,
  onClose,
  children,
  className,
}: {
  open: boolean;
  label: string;
  onClose: () => void;
  children: ReactNode;
  className: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const root = ref.current;
    const items = () =>
      Array.from(root?.querySelectorAll<HTMLElement>("button, [href], input, [tabindex]:not([tabindex='-1'])") ?? []).filter(
        (node) => !node.hasAttribute("disabled"),
      );
    window.setTimeout(() => items()[0]?.focus(), 20);
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeRef.current();
        return;
      }
      if (event.key !== "Tab") return;
      const list = items();
      if (!list.length) return;
      const first = list[0];
      const last = list[list.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      previous?.focus?.();
    };
  }, [open]);
  if (!open) return null;
  return (
    <div className="nav-sheet" role="presentation" onClick={onClose}>
      <div ref={ref} className={className} role="dialog" aria-modal="true" aria-label={label} onClick={(event) => event.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

function DockButton({
  id,
  label,
  icon: Icon,
  current,
  rail,
  menu,
}: {
  id: string;
  label: string;
  icon: typeof MoreIcon;
  current: boolean;
  rail: boolean;
  menu?: { id: string; labelKey: string }[];
}) {
  const locale = useMizan((s) => s.settings.locale);
  const [open, setOpen] = useState(false);
  const timer = useRef<number | null>(null);
  const held = useRef(false);

  function clear() {
    if (timer.current != null) window.clearTimeout(timer.current);
    timer.current = null;
  }

  return (
    <li className="nav-slot">
      <Tap
        aria-current={current ? "page" : undefined}
        aria-label={rail ? label : undefined}
        aria-haspopup={menu ? "menu" : undefined}
        aria-expanded={menu ? open : undefined}
        data-go={`tab-${id}`}
        className={cn("nav-tab", rail ? "min-h-14" : "min-h-16", current && "nav-glow")}
        onPointerDown={() => {
          if (!menu) return;
          held.current = false;
          clear();
          timer.current = window.setTimeout(() => {
            held.current = true;
            setOpen(true);
          }, 400);
        }}
        onPointerUp={clear}
        onPointerLeave={clear}
        onPointerCancel={clear}
        onClick={() => {
          if (held.current) {
            held.current = false;
            return;
          }
          setOpen(false);
          goNav(id);
        }}
      >
        <Icon className="size-5" aria-hidden />
        {rail ? null : <span>{label}</span>}
      </Tap>
      {open && menu ? (
        <div className="nav-pop" role="menu" aria-label={translate(locale, "nav.quick")}>
          {menu.map((item) => (
            <button
              key={item.id}
              type="button"
              role="menuitem"
              className="nav-pop-item"
              onClick={() => {
                setOpen(false);
                goNav(item.id);
              }}
            >
              {translate(locale, item.labelKey)}
            </button>
          ))}
        </div>
      ) : null}
    </li>
  );
}

export function BottomNav() {
  const locale = useMizan((s) => s.settings.locale);
  const layout = useMizan((s) => s.settings.navLayout);
  const sheet = useMizan((s) => s.navSheet);
  const setSheet = useMizan((s) => s.setNavSheet);
  const tab = useMizan((s) => s.appTab);
  const narrow = useNarrow();
  const current = useCurrentNav();
  const rail = layout === "rail";
  const [tucked, setTucked] = useState(false);
  const [ready, setReady] = useState(false);
  const primary = primaryItems(narrow);
  const overflow = overflowItems(narrow);
  const moreOn = sheet || overflow.some((item) => navIsCurrent(item.id, current) && !primary.some((p) => p.id === item.id));

  useEffect(() => setReady(true), []);

  useEffect(() => {
    if (tab === "namaz" || current.qibla) {
      setTucked(false);
      return;
    }
    if (tab !== "quran" && tab !== "hisn") {
      setTucked(false);
      return;
    }
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setTucked(y > last + 8 && y > 80);
      if (y < last - 4) setTucked(false);
      last = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [tab, current.qibla]);

  if (!ready || typeof document === "undefined") return null;
  return createPortal(
    <>
      <nav className={cn("bottom-dock glass", tucked && "is-tucked")} aria-label={translate(locale, "nav.menu")}>
        <ul className="dock-grid">
          {primary.map((item) => (
            <DockButton
              key={item.id}
              id={item.id}
              label={translate(locale, item.labelKey)}
              icon={item.icon}
              current={navIsCurrent(item.id, current)}
              rail={rail}
              menu={LONG_PRESS[item.id]}
            />
          ))}
          <li className="nav-slot">
            <Tap
              data-go="tab-more"
              aria-haspopup="dialog"
              aria-expanded={sheet}
              aria-label={translate(locale, "nav.more")}
              className={cn("nav-tab", rail ? "min-h-14" : "min-h-16", moreOn && "nav-glow")}
              onClick={() => setSheet(!sheet)}
            >
              <MoreIcon className="size-5" aria-hidden />
              {rail ? null : <span>{translate(locale, "nav.more")}</span>}
            </Tap>
          </li>
        </ul>
      </nav>
      <FocusDialog open={sheet} label={translate(locale, "nav.overflow")} onClose={() => setSheet(false)} className="nav-sheet-card glass">
        <div className="nav-grab" aria-hidden />
        <p className="nav-sheet-title">{translate(locale, "nav.more")}</p>
        <ul className="overflow-grid">
          {overflow.map((item) => {
            const Icon = item.icon;
            const on = navIsCurrent(item.id, current);
            return (
              <li key={item.id}>
                <button
                  type="button"
                  className={cn("overflow-cell", on && "nav-glow")}
                  aria-current={on ? "page" : undefined}
                  data-go={`more-${item.id}`}
                  onClick={() => goNav(item.id)}
                >
                  <Icon className="size-5" aria-hidden />
                  <span>{translate(locale, item.labelKey)}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </FocusDialog>
    </>,
    document.body,
  );
}

export function SidebarNav({ onHome }: { onHome: () => void }) {
  const locale = useMizan((s) => s.settings.locale);
  const [expanded, setExpanded] = useState(true);
  const current = useCurrentNav();
  const { online, offlineReady } = useOnline();

  useEffect(() => {
    try {
      if (localStorage.getItem("mizan.v1.navExpanded") === "0") setExpanded(false);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    document.documentElement.dataset.side = expanded ? "expanded" : "compact";
    try {
      localStorage.setItem("mizan.v1.navExpanded", expanded ? "1" : "0");
    } catch {
      /* ignore */
    }
  }, [expanded]);

  return (
    <aside className="side-nav" aria-label={translate(locale, "nav.menu")}>
      <button type="button" className="side-brand" onClick={onHome}>
        <BrandMark size={36} />
        <span className="side-label">
          <strong className="gold-flow">Мизан</strong>
          <small lang="ar">الميزان</small>
        </span>
      </button>
      <div className="side-scroll">
        {SIDEBAR_GROUPS.map((group) => (
          <div key={group.id} className="side-group">
            <p className="side-group-label">{translate(locale, group.labelKey)}</p>
            <ul>
              {itemsInGroup(group.id).map((item) => {
                const Icon = item.icon;
                const on = navIsCurrent(item.id, current);
                const label = translate(locale, item.labelKey);
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      className={cn("side-link", on && "nav-glow")}
                      aria-current={on ? "page" : undefined}
                      aria-label={expanded ? undefined : label}
                      data-go={`side-${item.id}`}
                      onClick={() => goNav(item.id)}
                    >
                      <Icon className="size-5" aria-hidden />
                      <span className="side-label">{label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
        <ContextualRail placement="side" />
      </div>
      <div className="side-foot">
        <button type="button" className="side-pin" onClick={() => setExpanded((value) => !value)} aria-pressed={expanded} aria-label={expanded ? translate(locale, "nav.unpin") : translate(locale, "nav.pin")}>
          {expanded ? <span className="side-label">{translate(locale, "nav.unpin")}</span> : <Pin className="size-5" aria-hidden />}
        </button>
        <p className="side-foot-text">{!online || offlineReady ? translate(locale, "nav.offline") : translate(locale, "nav.online")}</p>
      </div>
    </aside>
  );
}
