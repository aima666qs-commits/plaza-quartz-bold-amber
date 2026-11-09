import { useEffect, useState, useSyncExternalStore } from "react";
import { translate } from "@/lib/i18n/dict.ts";
import { goNav } from "@/lib/nav/go.ts";
import { salahWasSeen } from "@/lib/nav/recents.ts";
import { getSalahBoot, subscribeSalah } from "@/lib/salah/boot.ts";
import type { PrayerName } from "@/lib/salah/times.ts";
import { useMizan } from "@/stores/mizan-store.ts";
import { useQuran } from "@/stores/quran-store.ts";

type Chip = { id: string; labelKey: string; dest: string };

const PRAYERS: PrayerName[] = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];

function minutes(value: string) {
  const [h, m] = value.split(":").map(Number);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return null;
  return h * 60 + m;
}

function nearAdhan(timings?: Record<string, string>) {
  if (!timings) return false;
  const now = new Date();
  const cur = now.getHours() * 60 + now.getMinutes();
  return PRAYERS.some((id) => {
    const at = minutes(timings[id] ?? "");
    if (at == null) return false;
    let delta = Math.abs(at - cur);
    if (delta > 12 * 60) delta = 24 * 60 - delta;
    return delta <= 30;
  });
}

function useSeenFlag() {
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    setSeen(salahWasSeen());
    const on = () => setSeen(true);
    window.addEventListener("mizan-salah-seen", on);
    return () => window.removeEventListener("mizan-salah-seen", on);
  }, []);
  return seen;
}

export function suggestChips(input: {
  tab: string;
  near: boolean;
  seen: boolean;
  ayah: number;
  hasResult: boolean;
  hour: number;
  hasPlace: boolean;
}): Chip[] {
  const out: Chip[] = [];
  const push = (chip: Chip) => {
    if (out.length >= 3 || out.some((item) => item.id === chip.id)) return;
    out.push(chip);
  };
  if (input.near || input.tab === "namaz") {
    push({ id: "qibla", labelKey: "chip.qibla", dest: "qibla" });
    push({ id: "tasbih", labelKey: "chip.tasbih", dest: "tasbih" });
    push({ id: "dua", labelKey: "chip.dua", dest: "hisn:25" });
  }
  if (input.seen && input.tab !== "namaz") {
    push({ id: "zakat-ask", labelKey: "chip.zakat", dest: "zakat" });
  }
  if (input.tab === "quran" && input.ayah >= 1) {
    push({ id: "tafsir", labelKey: "chip.tafsir", dest: "tafsir" });
    push({ id: "hifz", labelKey: "chip.hifz", dest: "learn" });
    push({ id: "similar", labelKey: "chip.hadith", dest: "hadith-search" });
  }
  if (input.tab === "zakat" && input.hasResult) {
    push({ id: "save", labelKey: "chip.save", dest: "save-zakat" });
    push({ id: "asset", labelKey: "chip.asset", dest: "finance" });
    push({ id: "zakat-hadith", labelKey: "chip.zakatHadith", dest: "zakat-hadith" });
  }
  if (input.tab === "hisn") {
    if (input.hour < 12) push({ id: "morning", labelKey: "chip.morning", dest: "hisn:27" });
    if (input.hour >= 17) push({ id: "evening", labelKey: "chip.evening", dest: "hisn:28" });
  }
  if (!input.hasPlace) push({ id: "place", labelKey: "chip.place", dest: "place" });
  return out.slice(0, 3);
}

export function ContextualRail({ placement = "bar" }: { placement?: "bar" | "side" }) {
  const locale = useMizan((s) => s.settings.locale);
  const tab = useMizan((s) => s.appTab);
  const result = useMizan((s) => s.lastResult);
  const ayah = useQuran((s) => s.ayah);
  const boot = useSyncExternalStore(subscribeSalah, getSalahBoot, getSalahBoot);
  const seen = useSeenFlag();
  const hour = new Date().getHours();
  const chips = suggestChips({
    tab,
    near: nearAdhan(boot.day?.timings),
    seen,
    ayah,
    hasResult: result != null,
    hour,
    hasPlace: boot.coords != null,
  });
  if (!chips.length) return null;
  return (
    <section className={placement === "side" ? "side-suggest" : "context-rail"} aria-label={translate(locale, "nav.now")} data-go="context-rail">
      {placement === "side" ? <p className="side-group-label">{translate(locale, "nav.now")}</p> : null}
      <div className="context-row">
        {chips.map((chip) => (
          <button key={chip.id} type="button" className="nav-chip" onClick={() => {
              if (chip.dest === "hadith-search") useMizan.getState().openSearch(translate(locale, "nav.hadith"));
              else if (chip.dest === "zakat-hadith") useMizan.getState().openSearch(translate(locale, "nav.zakat"));
              else goNav(chip.dest);
            }}>
            {translate(locale, chip.labelKey)}
          </button>
        ))}
      </div>
    </section>
  );
}
