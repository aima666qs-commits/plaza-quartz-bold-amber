import { useState, useSyncExternalStore } from "react";
import { Bell, MapPin } from "lucide-react";
import { SalahCard } from "@/components/mizan/salah-card.tsx";
import { GROK_PROVIDERS, signIn } from "@/lib/auth/client";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { hijriLabel } from "@/lib/house/data.ts";
import { askSalah, getSalahBoot, subscribeSalah } from "@/lib/salah/boot.ts";
import { PRAYER_LABELS, type PrayerName } from "@/lib/salah/times.ts";
import { addMemory } from "@/lib/study/server.ts";
import {
  armAdhan,
  markPrayerDone,
  prayerDays,
  readAdhanPrefs,
  requestNotify,
  type AdhanPref,
  writeAdhanPref,
} from "@/lib/notify.ts";
import { useMizan } from "@/stores/mizan-store.ts";

const DAYS = ["П", "В", "С", "Ч", "П", "С", "В"];
const EMPTY: AdhanPref = { on: true, full: false, days: [true, true, true, true, true, true, true] };

export function SalahBoard() {
  const locale = useMizan((s) => s.settings.locale);
  const boot = useSyncExternalStore(subscribeSalah, getSalahBoot, getSalahBoot);
  const { user } = useCurrentUserState();
  const hijri = hijriLabel(new Date(), locale);
  const [pick, setPick] = useState<PrayerName | null>(null);
  const [prefs, setPrefs] = useState(readAdhanPrefs);
  const [days, setDays] = useState(prayerDays);
  const [qibla, setQibla] = useState(false);
  const [note, setNote] = useState("");
  const pref = (pick && prefs[pick]) || EMPTY;

  function save(next: AdhanPref) {
    if (!pick) return;
    writeAdhanPref(pick, next);
    const all = { ...prefs, [pick]: next };
    setPrefs(all);
    if (boot.day && Notification.permission === "granted") armAdhan(boot.day.timings);
  }

  return (
    <div className="page-pad mx-auto grid w-full max-w-lg gap-3 px-4 pt-2">
      <header>
        <p className="font-display text-xl">Сегодня, {hijri.greg}</p>
        <p className="text-sm text-[var(--muted)]">{hijri.hijri}</p>
      </header>

      {!user ? (
        <section className="skin grid gap-2 rounded-[22px] p-4">
          <p className="font-display text-lg">Мир тебе</p>
          <p className="text-sm text-[var(--muted)]">Войди через Google — Коран, кибла и память утренних сохранятся на сервере.</p>
          {GROK_PROVIDERS.filter((p) => p.idp === "google").map((p) => (
            <button key={p.providerId} type="button" className="skin min-h-11 rounded-full px-4 text-sm" onClick={() => signIn(p.providerId, { callbackURL: "/" })}>
              Войти через Google
            </button>
          ))}
        </section>
      ) : (
        <p className="text-sm text-[var(--muted)]">{user.displayName || user.primaryEmail} · дней намаза {days}</p>
      )}

      <button type="button" className="skin flex min-h-14 items-center gap-3 rounded-[22px] px-4 text-left" onClick={() => askSalah(true)}>
        <MapPin className="size-5 shrink-0" />
        <span>
          <strong className="block">{boot.coords ? "Место определено" : "Установить местоположение"}</strong>
          <small className="text-[var(--muted)]">{boot.coords ? `${boot.coords.lat.toFixed(2)}, ${boot.coords.lng.toFixed(2)}` : "Нужно для точного времени намаза"}</small>
        </span>
      </button>

      <ul className="skin grid gap-1 rounded-[22px] p-2">
        {PRAYER_LABELS.map((p) => (
          <li key={p.id} className="flex items-center gap-2 px-2 py-2">
            <button
              type="button"
              className="size-7 rounded-full border border-[var(--line)]"
              aria-label={`Отметить ${p.ru}`}
              onClick={() => setDays(markPrayerDone(p.id))}
            />
            <span className="flex-1 lowercase">{p.ru}</span>
            <span className="tabular-nums">{boot.day?.timings[p.id] ?? "—:—"}</span>
            <button type="button" className="settings-gear" aria-label={`Азан ${p.ru}`} onClick={() => setPick(p.id)}>
              <Bell className="size-4" />
            </button>
          </li>
        ))}
      </ul>

      <div className="grid grid-cols-4 gap-2">
        <button type="button" className="skin min-h-16 rounded-2xl text-xs" onClick={() => setQibla((v) => !v)}>Кибла</button>
        <button type="button" className="skin min-h-16 rounded-2xl text-xs" onClick={() => useMizan.getState().setAppTab("quran")}>Коран</button>
        <button type="button" className="skin min-h-16 rounded-2xl text-xs" onClick={() => useMizan.getState().setAppTab("hisn")}>Дуа</button>
        <button
          type="button"
          className="skin min-h-16 rounded-2xl text-xs"
          onClick={() => {
            const body = `Утренние азкары прочитаны ${new Date().toLocaleDateString("ru")}`;
            if (!user) {
              setNote("Войди через Google — тогда утро останется в памяти.");
              return;
            }
            void addMemory({ data: { body } }).then(() => setNote("Утро записано в память.")).catch(() => setNote("Не удалось записать."));
          }}
        >
          Утро
        </button>
      </div>
      {note ? <p className="text-sm text-[var(--muted)]">{note}</p> : null}
      {qibla ? <SalahCard /> : null}

      {pick ? (
        <div className="adhan-sheet" role="dialog" aria-label={`${pick} азан`}>
          <div className="mb-3 flex items-center justify-between">
            <strong className="lowercase">{PRAYER_LABELS.find((p) => p.id === pick)?.ru} · азан</strong>
            <button type="button" className="text-sm" onClick={() => setPick(null)}>Закрыть</button>
          </div>
          <label className="flex items-center justify-between py-2">Уведомить
            <input type="checkbox" checked={pref.on} onChange={(e) => save({ ...pref, on: e.target.checked })} />
          </label>
          <label className="flex items-center justify-between py-2">Полный сигнал
            <input type="checkbox" checked={pref.full} onChange={(e) => save({ ...pref, full: e.target.checked })} />
          </label>
          <div className="mt-2 flex gap-2">
            {DAYS.map((letter, i) => (
              <button
                key={`${letter}-${i}`}
                type="button"
                className={pref.days[i] ? "azkar-bead size-9 text-xs" : "skin size-9 rounded-full text-xs"}
                onClick={() => {
                  const daysOn = pref.days.slice();
                  daysOn[i] = !daysOn[i];
                  save({ ...pref, days: daysOn });
                }}
              >
                {letter}
              </button>
            ))}
          </div>
          <button
            type="button"
            className="skin mt-4 min-h-11 w-full rounded-full"
            onClick={() => {
              void requestNotify().then((perm) => {
                if (perm === "granted" && boot.day) armAdhan(boot.day.timings);
                setPick(null);
              });
            }}
          >
            Сохранить
          </button>
        </div>
      ) : null}
    </div>
  );
}
