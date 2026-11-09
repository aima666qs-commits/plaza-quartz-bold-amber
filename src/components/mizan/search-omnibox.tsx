import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { createPortal } from "react-dom";
import { Search } from "lucide-react";
import { ContextualRail } from "@/components/mizan/contextual-rail.tsx";
import { translate } from "@/lib/i18n/dict.ts";
import { loadHisn } from "@/lib/hisn/load.ts";
import { NAV_BY_ID } from "@/lib/nav/catalog.ts";
import { buildSearchDocs, frequentDocs, searchDocs, type SearchHit } from "@/lib/nav/search.ts";
import { useMizan } from "@/stores/mizan-store.ts";
import { useQuran } from "@/stores/quran-store.ts";

function useFocusTrap(open: boolean, onClose: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const root = ref.current;
    const items = () =>
      Array.from(root?.querySelectorAll<HTMLElement>("button, input, [href], [tabindex]:not([tabindex='-1'])") ?? []).filter(
        (node) => !node.hasAttribute("disabled"),
      );
    items()[0]?.focus();
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
  return ref;
}

export function SearchOmnibox() {
  const open = useMizan((s) => s.searchOpen);
  const query = useMizan((s) => s.searchQuery);
  const setQuery = useMizan((s) => s.setSearchQuery);
  const closeSearch = useMizan((s) => s.closeSearch);
  const locale = useMizan((s) => s.settings.locale);
  const bookmarks = useQuran((s) => s.bookmarks);
  const [chapters, setChapters] = useState<{ id: number; titleAr: string }[]>([]);
  const [debounced, setDebounced] = useState(query);
  const [active, setActive] = useState(0);
  const listId = useId();
  const close = () => closeSearch(true);
  const trapRef = useFocusTrap(open, close);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        const state = useMizan.getState();
        if (state.searchOpen) state.closeSearch(true);
        else state.openSearch("");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!open) return;
    let live = true;
    void loadHisn()
      .then((book) => {
        if (!live) return;
        setChapters(book.chapters.map((chapter) => ({ id: chapter.id, titleAr: chapter.titleAr })));
      })
      .catch(() => {});
    return () => {
      live = false;
    };
  }, [open]);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(query), 150);
    return () => window.clearTimeout(timer);
  }, [query]);

  const docs = useMemo(() => buildSearchDocs(locale, bookmarks, chapters), [locale, bookmarks, chapters]);
  const results = useMemo(() => (query.trim() ? searchDocs(docs, debounced) : frequentDocs(docs)), [docs, debounced, query]);

  useEffect(() => setActive(0), [debounced, query, open]);

  if (!open || typeof document === "undefined") return null;

  function choose(hit: SearchHit) {
    closeSearch(false);
    if (location.hash !== hit.href) location.hash = hit.href;
    else useMizan.getState().closeSearch(true);
  }

  function onKey(event: ReactKeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((index) => Math.min(results.length - 1, index + 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((index) => Math.max(0, index - 1));
    } else if (event.key === "Enter" && results[active]) {
      event.preventDefault();
      choose(results[active]);
    }
  }

  const current = results[active];
  return createPortal(
    <div className="search-layer" role="presentation" onClick={close}>
      <div
        ref={trapRef}
        className="search-panel glass"
        role="dialog"
        aria-modal="true"
        aria-label={translate(locale, "nav.search")}
        onClick={(event) => event.stopPropagation()}
      >
        <label className="search-field">
          <Search className="size-5" aria-hidden />
          <input
            value={query}
            placeholder={translate(locale, "search.ph")}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={onKey}
            role="combobox"
            aria-expanded="true"
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={current ? `${listId}-${current.id}` : undefined}
            autoComplete="off"
          />
        </label>
        <p className="search-hint">{query.trim() ? translate(locale, "search.hint") : translate(locale, "search.frequent")}</p>
        {results.length ? (
          <ul id={listId} role="listbox" className="search-list">
            {results.map((hit, index) => {
              const Icon = NAV_BY_ID[hit.iconId ?? ""]?.icon ?? Search;
              const on = index === active;
              return (
                <li key={hit.id} role="option" id={`${listId}-${hit.id}`} aria-selected={on}>
                  <button type="button" className={on ? "search-hit is-on" : "search-hit"} onClick={() => choose(hit)} onMouseEnter={() => setActive(index)}>
                    <Icon className="size-5" aria-hidden />
                    <span>
                      <strong>{hit.title}</strong>
                      <small>{hit.subtitle}</small>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="search-empty">{translate(locale, "search.empty")}</p>
        )}
        {!query.trim() ? <ContextualRail /> : null}
      </div>
    </div>,
    document.body,
  );
}
