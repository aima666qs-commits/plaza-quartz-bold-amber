import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { MapPin } from "lucide-react";
import { translate } from "@/lib/i18n/dict.ts";
import { askSalah, getSalahBoot, pinSalah, subscribeSalah } from "@/lib/salah/boot.ts";
import { nextPrayer, PRAYER_LABELS, qiblaBearing, SALAH_METHODS, type PrayerName } from "@/lib/salah/times.ts";
import { useMizan } from "@/stores/mizan-store.ts";
import { cn } from "@/lib/utils.ts";

function angleDelta(a: number, b: number) {
  return Math.abs(((a - b + 540) % 360) - 180);
}

function smoothHead(prev: number | null, next: number) {
  if (prev == null) return next;
  const d = ((next - prev + 540) % 360) - 180;
  return (prev + d * 0.22 + 360) % 360;
}

const PRAYER_NAME: Record<string, Record<PrayerName, string>> = {
  ar: { Fajr: "الفجر", Sunrise: "الشروق", Dhuhr: "الظهر", Asr: "العصر", Maghrib: "المغرب", Isha: "العشاء" },
  tr: { Fajr: "Sabah", Sunrise: "Güneş", Dhuhr: "Öğle", Asr: "İkindi", Maghrib: "Akşam", Isha: "Yatsı" },
  uz: { Fajr: "Bomdod", Sunrise: "Quyosh", Dhuhr: "Peshin", Asr: "Asr", Maghrib: "Shom", Isha: "Xufton" },
  tg: { Fajr: "Бомдод", Sunrise: "Офтоб", Dhuhr: "Пешин", Asr: "Аср", Maghrib: "Шом", Isha: "Хуфтан" },
  kk: { Fajr: "Бамдат", Sunrise: "Күн", Dhuhr: "Бесін", Asr: "Екінті", Maghrib: "Ақшам", Isha: "Құптан" },
  en: { Fajr: "Fajr", Sunrise: "Sunrise", Dhuhr: "Dhuhr", Asr: "Asr", Maghrib: "Maghrib", Isha: "Isha" },
};

export function SalahCard() {
  const locale = useMizan((s) => s.settings.locale);
  const t = (key: string) => translate(locale, key);
  const boot = useSyncExternalStore(subscribeSalah, getSalahBoot, getSalahBoot);
  const { coords, day, err: errKey, phase, net } = boot;
  const [heading, setHeading] = useState<number | null>(null);
  const [needTap, setNeedTap] = useState(false);
  const [adhanOn, setAdhanOn] = useState(false);
  const headRef = useRef<number | null>(null);
  const alignedOnce = useRef(false);
  const drag = useRef<{ x: number; head: number } | null>(null);

  useEffect(() => {
    const io = DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> };
    const needs = typeof io.requestPermission === "function";
    setNeedTap(needs || heading == null);
    if (needs) return;
    return armCompass((deg) => {
      const next = smoothHead(headRef.current, deg);
      headRef.current = next;
      setHeading(next);
      setNeedTap(false);
    });
  }, []);

  useEffect(() => {
    if (!day || typeof Notification === "undefined" || Notification.permission !== "granted") return;
    setAdhanOn(true);
    void import("@/lib/notify.ts").then((m) => m.armAdhan(day.timings));
  }, [day]);

  const bearing = coords ? (qiblaBearing(coords.lat, coords.lng) + 360) % 360 : null;
  const next = day ? nextPrayer(day.timings) : null;
  const off = bearing != null && heading != null ? angleDelta(heading, bearing) : null;
  const aligned = off != null && off < 5;

  useEffect(() => {
    if (!aligned) {
      alignedOnce.current = false;
      return;
    }
    if (alignedOnce.current) return;
    alignedOnce.current = true;
    navigator.vibrate?.(20);
  }, [aligned]);

  return (
    <section id="salah" className="skin rounded-[24px] p-4">
      <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--muted)]">{t("salah.kicker")}</p>
      <h2 className="font-display text-xl">{t("salah.title")}</h2>
      {bearing != null ? (
        <div
          className={cn("qibla-face", aligned && "is-on")}
          role="img"
          aria-label={`${t("salah.qibla")} ${bearing.toFixed(0)}`}
          onPointerDown={(e) => {
            drag.current = { x: e.clientX, head: headRef.current ?? heading ?? 0 };
            e.currentTarget.setPointerCapture(e.pointerId);
          }}
          onPointerMove={(e) => {
            if (!drag.current) return;
            const next = (drag.current.head + (e.clientX - drag.current.x) * 0.7 + 360) % 360;
            headRef.current = next;
            setHeading(next);
          }}
          onPointerUp={() => {
            drag.current = null;
          }}
        >
          <i className="qibla-caret" />
          <div className="qibla-disc" style={{ transform: `rotate(${heading == null ? 0 : -heading}deg)` }}>
            <span className="qibla-n">N</span>
            <span className="qibla-e">E</span>
            <span className="qibla-s">S</span>
            <span className="qibla-w">W</span>
            <i className="qibla-kaaba" style={{ transform: `rotate(${bearing}deg) translateY(-5.6rem)` }}>
              <b style={{ transform: `rotate(${-(heading == null ? 0 : -heading) - bearing}deg)` }}>ك</b>
            </i>
          </div>
          <strong>{aligned ? t("salah.face") : off != null ? `${Math.round(off)}°` : `${bearing.toFixed(0)}°`}</strong>
        </div>
      ) : null}
      {phase ? <p className="salah-copy mt-2 text-sm text-[var(--muted)]" dir="auto">{t(phase === "ask" ? "salah.ask" : "salah.calc")}</p> : null}
      {errKey ? <p className="salah-copy mt-2 text-sm text-[var(--muted)]" dir="auto">{t(errKey)}</p> : null}
      {bearing != null ? (
        <p className="salah-copy mt-2 text-sm" dir="auto">
          {aligned ? t("salah.face") : t("salah.turn")}. {t("salah.flat")}. {t("salah.qibla")} {bearing.toFixed(1)}° {t("salah.north")}.
          {coords ? ` ${coords.lat.toFixed(3)}, ${coords.lng.toFixed(3)}` : ""}
          {net ? " · " : ""}
        </p>
      ) : null}
      {day ? (
        <>
          <p className="mt-1 text-[11px] text-[var(--muted)]">
            {day.methodName} · {day.timezone} · {day.school === 1 ? t("salah.hanafi") : t("salah.shafii")}
          </p>
          <ul className="mt-3 grid grid-cols-3 gap-2">
            {PRAYER_LABELS.map((p) => (
              <li key={p.id} className={p.id === next ? "skin is-on rounded-2xl px-2 py-2" : "rounded-2xl px-2 py-2"}>
                <span className="block text-[11px] text-[var(--muted)]">{PRAYER_NAME[locale]?.[p.id] ?? p.ru}</span>
                <span className="tabular-nums text-lg">{day.timings[p.id]}</span>
              </li>
            ))}
          </ul>
        </>
      ) : null}
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" className="skin inline-flex min-h-11 items-center gap-1.5 rounded-full px-3 text-xs" onClick={() => askSalah(true)}>
          <MapPin className="size-3.5" /> {t("salah.refresh")}
        </button>
        <button
          type="button"
          className="skin inline-flex min-h-11 items-center gap-1.5 rounded-full px-3 text-xs"
          onClick={() => {
            const id = next === "Dhuhr" || next === "Asr" ? 25 : next === "Maghrib" || next === "Isha" ? 28 : 27;
            useMizan.getState().setHisnChapter(id);
            useMizan.getState().setAppTab("hisn");
          }}
        >
          {t("nav.hisn")}
        </button>
        {needTap ? (
          <button
            type="button"
            className="skin min-h-11 rounded-full px-3 text-xs"
            onClick={() => {
              const io = DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> };
              const start = () => {
                setNeedTap(false);
                armCompass((deg) => {
                  const nextHead = smoothHead(headRef.current, deg);
                  headRef.current = nextHead;
                  setHeading(nextHead);
                });
              };
              if (io.requestPermission) void io.requestPermission().then((r) => r === "granted" && start());
              else start();
            }}
          >
            {t("salah.compass")}
          </button>
        ) : null}
        <button
          type="button"
          className="skin min-h-11 rounded-full px-3 text-xs"
          onClick={() => {
            void import("@/lib/notify.ts").then(async (m) => {
              const perm = await m.requestNotify();
              if (perm !== "granted" || !day) return;
              setAdhanOn(true);
              m.armAdhan(day.timings);
              void m.playAdhan("Азан включён");
            });
          }}
        >
          {adhanOn ? "Азан включён" : "Азан"}
        </button>
      </div>
      <div className="method-row mt-2 flex gap-2 overflow-x-auto pb-1">
        {SALAH_METHODS.map((m) => (
          <button
            key={`${m.method}-${m.school}-${m.label}`}
            type="button"
            className="skin shrink-0 rounded-full px-3 py-2 text-[11px]"
            onClick={() => pinSalah(m.method, m.school)}
          >
            {t(m.key)}
          </button>
        ))}
      </div>
    </section>
  );
}

function armCompass(onHead: (deg: number) => void) {
  const on = (e: DeviceOrientationEvent) => {
    const webkit = (e as DeviceOrientationEvent & { webkitCompassHeading?: number }).webkitCompassHeading;
    if (typeof webkit === "number" && !Number.isNaN(webkit)) {
      onHead((webkit + 360) % 360);
      return;
    }
    if (e.alpha == null) return;
    onHead((360 - e.alpha + 360) % 360);
  };
  window.addEventListener("deviceorientationabsolute", on as EventListener, true);
  window.addEventListener("deviceorientation", on, true);
  return () => {
    window.removeEventListener("deviceorientationabsolute", on as EventListener, true);
    window.removeEventListener("deviceorientation", on, true);
  };
}
