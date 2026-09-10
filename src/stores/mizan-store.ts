import { calculate, emptyInput } from "@/lib/mizan/engine.ts";
import type { CalculationInput, CalculationResult, SavedCalculation } from "@/lib/mizan/types.ts";
import { DEFAULT_THEME_ID } from "@/lib/themes/registry.ts";
import { todayISO, uid } from "@/lib/utils.ts";
import { create } from "zustand";

const INPUT_KEY = "mizan.v1.input";
const SETTINGS_KEY = "mizan.v1.settings";
const HISTORY_KEY = "mizan.v1.history";
const UI_KEY = "mizan.v1.ui";

export type AppTab = "home" | "zakat" | "quran" | "hisn" | "learn";

export interface SettingsState {
  themeId: string;
  favorites: string[];
  reducedMotion: boolean;
  densityOverride: "theme" | "compact" | "regular" | "airy";
  colorScheme: "theme" | "light" | "dark" | "system";
  fontScale: number;
}

const defaultSettings: SettingsState = {
  themeId: DEFAULT_THEME_ID,
  favorites: [],
  reducedMotion: false,
  densityOverride: "theme",
  colorScheme: "theme",
  fontScale: 1,
};

interface Store {
  input: CalculationInput;
  settings: SettingsState;
  history: SavedCalculation[];
  previewThemeId: string | null;
  settingsOpen: boolean;
  designsOpen: boolean;
  wizardStep: number;
  activeSection: string;
  lastResult: CalculationResult | null;
  quotesStatus: "idle" | "loading" | "ok" | "error";
  quotesError: string;
  appTab: AppTab;
  zakatOpen: boolean;
  detailsOpen: boolean;
  openZakatSection: string | null;
  hisnChapterId: number | null;
  setInput: (patch: Partial<CalculationInput> | ((prev: CalculationInput) => CalculationInput)) => void;
  setSettings: (patch: Partial<SettingsState>) => void;
  setPreviewTheme: (id: string | null) => void;
  applyTheme: (id: string) => void;
  revertTheme: () => void;
  toggleFavorite: (id: string) => void;
  setSettingsOpen: (v: boolean) => void;
  setDesignsOpen: (v: boolean) => void;
  setWizardStep: (n: number) => void;
  setActiveSection: (id: string) => void;
  setAppTab: (t: AppTab) => void;
  setZakatOpen: (v: boolean) => void;
  setDetailsOpen: (v: boolean) => void;
  setOpenZakatSection: (id: string | null) => void;
  setHisnChapter: (id: number | null) => void;
  recompute: () => CalculationResult;
  saveDraft: (title?: string) => void;
  loadSaved: (id: string) => void;
  duplicate: (id: string) => void;
  deleteSaved: (id: string) => void;
  importJson: (raw: string) => { ok: boolean; error?: string };
  resetInput: () => void;
  setQuotesStatus: (s: Store["quotesStatus"], err?: string) => void;
}

function persistSettings(s: SettingsState) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
  } catch {
    /* ignore */
  }
}
function persistInput(i: CalculationInput) {
  try {
    localStorage.setItem(INPUT_KEY, JSON.stringify(i));
  } catch {
    /* ignore */
  }
}
function persistHistory(h: SavedCalculation[]) {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(h));
  } catch {
    /* ignore */
  }
}
function persistUi(s: Store) {
  try {
    localStorage.setItem(
      UI_KEY,
      JSON.stringify({
        appTab: s.appTab,
        zakatOpen: s.zakatOpen,
        detailsOpen: s.detailsOpen,
        openZakatSection: s.openZakatSection,
      }),
    );
  } catch {
    /* ignore */
  }
}

function loadJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

const initialInput = emptyInput({
  id: uid("calc"),
  asOfDate: todayISO(),
  title: "Черновик",
});

export const useMizan = create<Store>((set, get) => ({
  input: initialInput,
  settings: defaultSettings,
  history: [],
  previewThemeId: null,
  settingsOpen: false,
  designsOpen: false,
  wizardStep: 0,
  activeSection: "params",
  lastResult: null,
  quotesStatus: "idle",
  quotesError: "",
  appTab: "home",
  zakatOpen: false,
  detailsOpen: false,
  openZakatSection: null,
  hisnChapterId: null,
  setInput: (patch) => {
    const prev = get().input;
    const next = typeof patch === "function" ? patch(prev) : { ...prev, ...patch };
    persistInput(next);
    const result = calculate(next);
    set({ input: next, lastResult: result });
  },
  setSettings: (patch) => {
    const next = { ...get().settings, ...patch };
    persistSettings(next);
    set({ settings: next });
  },
  setPreviewTheme: (id) => set({ previewThemeId: id }),
  applyTheme: (id) => {
    const next = { ...get().settings, themeId: id };
    persistSettings(next);
    set({ settings: next, previewThemeId: null, designsOpen: false });
  },
  revertTheme: () => set({ previewThemeId: null }),
  toggleFavorite: (id) => {
    const fav = get().settings.favorites.includes(id)
      ? get().settings.favorites.filter((x) => x !== id)
      : [...get().settings.favorites, id];
    get().setSettings({ favorites: fav });
  },
  setSettingsOpen: (v) => set({ settingsOpen: v, designsOpen: v ? get().designsOpen : false }),
  setDesignsOpen: (v) => set({ designsOpen: v, settingsOpen: v ? true : get().settingsOpen }),
  setWizardStep: (n) => set({ wizardStep: n }),
  setActiveSection: (id) => set({ activeSection: id }),
  setAppTab: (appTab) => {
    set({ appTab });
    persistUi(get());
    if (typeof window !== "undefined") {
      const map: Record<AppTab, string> = {
        home: "#home",
        zakat: "#zakat",
        quran: "#quran",
        hisn: "#hisn",
        learn: "#learn",
      };
      if (
        !location.hash.startsWith("#quran/") &&
        !location.hash.startsWith("#learn/") &&
        !location.hash.startsWith("#hisn/")
      ) {
        history.replaceState(null, "", map[appTab]);
      }
    }
  },
  setZakatOpen: (zakatOpen) => {
    set({ zakatOpen });
    persistUi(get());
  },
  setDetailsOpen: (detailsOpen) => {
    set({ detailsOpen });
    persistUi(get());
  },
  setOpenZakatSection: (openZakatSection) => {
    set({ openZakatSection, activeSection: openZakatSection ?? get().activeSection });
    persistUi(get());
  },
  setHisnChapter: (hisnChapterId) => {
    set({ hisnChapterId, appTab: hisnChapterId != null ? "hisn" : get().appTab });
    persistUi(get());
    if (typeof window !== "undefined" && hisnChapterId != null) {
      history.replaceState(null, "", `#hisn/${hisnChapterId}`);
    }
  },
  recompute: () => {
    const result = calculate(get().input);
    set({ lastResult: result });
    return result;
  },
  saveDraft: (title) => {
    const input = { ...get().input, title: title || get().input.title, id: get().input.id };
    const result = calculate(input);
    const item: SavedCalculation = {
      id: input.id,
      title: input.title,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      input,
      result,
    };
    const history = [item, ...get().history.filter((h) => h.id !== item.id)].slice(0, 40);
    persistHistory(history);
    persistInput(input);
    set({ history, input, lastResult: result });
  },
  loadSaved: (id) => {
    const item = get().history.find((h) => h.id === id);
    if (!item) return;
    persistInput(item.input);
    set({ input: item.input, lastResult: item.result });
  },
  duplicate: (id) => {
    const item = get().history.find((h) => h.id === id);
    if (!item) return;
    const copy: CalculationInput = {
      ...structuredClone(item.input),
      id: uid("calc"),
      title: `${item.title} (копия)`,
    };
    persistInput(copy);
    set({ input: copy, lastResult: calculate(copy) });
  },
  deleteSaved: (id) => {
    const history = get().history.filter((h) => h.id !== id);
    persistHistory(history);
    set({ history });
  },
  importJson: (raw) => {
    try {
      const data = JSON.parse(raw) as { schemaVersion?: number; input?: CalculationInput };
      if (!data.input || data.input.schemaVersion !== 1) {
        return { ok: false, error: "Этот файл Мизан не узнаёт. Текущий расчёт не тронут." };
      }
      const input: CalculationInput = { ...data.input, id: uid("calc") };
      persistInput(input);
      set({ input, lastResult: calculate(input) });
      return { ok: true };
    } catch {
      return { ok: false, error: "Файл не открылся. Текущий расчёт на месте." };
    }
  },
  resetInput: () => {
    const input = emptyInput({ id: uid("calc"), asOfDate: todayISO() });
    persistInput(input);
    set({ input, lastResult: calculate(input) });
  },
  setQuotesStatus: (s, err) => set({ quotesStatus: s, quotesError: err ?? "" }),
}));

export function hydrateMizan() {
  if (typeof window === "undefined") return;
  const settings = loadJson(SETTINGS_KEY, defaultSettings);
  const input = loadJson(INPUT_KEY, initialInput);
  const history = loadJson<SavedCalculation[]>(HISTORY_KEY, []);
  const ui = loadJson<{ appTab?: AppTab; zakatOpen?: boolean; detailsOpen?: boolean; openZakatSection?: string | null }>(
    UI_KEY,
    {},
  );
  useMizan.setState({
    settings: { ...defaultSettings, ...settings },
    input,
    history,
    lastResult: calculate(input),
    appTab: ui.appTab ?? "home",
    zakatOpen: ui.zakatOpen ?? false,
    detailsOpen: ui.detailsOpen ?? false,
    openZakatSection: ui.openZakatSection ?? null,
  });
}
