import { useEffect, useMemo, useRef, useState } from "react";
import { Bookmark, ChevronLeft, Download, Heart, Pause, Printer, RotateCcw, Table2, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { Field, Select, TextInput } from "@/components/ui/field.tsx";
import { useHisn } from "@/stores/hisn-store.ts";
import { useMizan, type VoiceGender, type VoiceRate } from "@/stores/mizan-store.ts";
import { formatMoney, formatPlain } from "@/lib/mizan/decimal.ts";
import { getSources, SOURCES } from "@/lib/mizan/sources.ts";
import { getProfile } from "@/lib/mizan/profiles.ts";
import { downloadBlob, resultToCsv, resultToHtml, resultToJson } from "@/lib/mizan/export.ts";
import { askEvidence, localSourceSearch, type AskPayload } from "@/lib/assistant/server.ts";
import { fetchMarketQuotes } from "@/lib/quotes/server.ts";
import { THEMES, type FontPair } from "@/lib/themes/registry.ts";
import { LOCALES, NAV_LAYOUTS, translate, type Locale, type NavLayout } from "@/lib/i18n/dict.ts";
import { hijriLabel, speakLang } from "@/lib/house/data.ts";
import { bootNotify, requestNotify } from "@/lib/notify.ts";
import { RECITERS } from "@/lib/quran/reciters.ts";
import { speakText, stopSpeak } from "@/lib/voice.ts";
import { VOICES_AR, VOICES_RU, defaultVoice, type NeuralVoice } from "@/lib/voice/catalog.ts";
import { useQuran } from "@/stores/quran-store.ts";
import { NISAB_MODE_RU, OVERALL_RU, RECIPIENTS, REVIEW_RU, SOURCE_TYPE_RU, STATUS_RU } from "@/lib/mizan/labels.ts";
import { cn } from "@/lib/utils.ts";
import { InstallHome } from "@/components/mizan/install-home.tsx";

export function ResultsPanel() {
  const result = useMizan((s) => s.lastResult);
  if (!result) return null;
  const profile = getProfile(result.profileId);
  const exact = formatPlain(result.totalMoneyExact);
  const showExact = result.totalMoneyRounded !== 0n && !exact.endsWith(".00") && !/^[0.]+$/.test(exact);
  return (
    <aside className="result-panel border border-[var(--line)] bg-[var(--bg-elev)] p-[var(--pad,1rem)] lg:sticky lg:top-24">
      <p className="text-[11px] uppercase tracking-[0.12em] text-[var(--muted)]">Закят к уплате</p>
      <p
        className="font-display mt-2 text-4xl leading-none tabular-nums text-[var(--ok)] sm:text-5xl"
        data-testid="zakat-total"
      >
        {formatMoney(result.totalMoneyRounded, result.baseCurrency)}
      </p>
      {showExact ? (
        <p className="mt-2 text-xs text-[var(--muted)]">без округления: {exact}</p>
      ) : null}
      <p className="mt-3 text-sm">{OVERALL_RU[result.overallStatus] ?? result.overallStatus}</p>
      <p className="text-xs text-[var(--muted)]">
        {profile.name} · {result.asOfDate} · {result.completeness === "complete" ? "всё заполнено" : "есть пропуски"}
      </p>
      {result.nisab.threshold !== null ? (
        <p className="mt-2 text-sm tabular-nums">
          Порог нисаба: {formatMoney(result.nisab.threshold, result.baseCurrency)} ({NISAB_MODE_RU[result.nisab.mode]})
        </p>
      ) : (
        <p className="mt-2 text-sm text-[var(--danger)]">Нисаб не посчитан — нет цены золота или серебра.</p>
      )}
      <div className="mt-3 grid grid-cols-2 gap-2 text-center">
        <div className="border border-[var(--line)] p-2">
          <p className="text-[11px] text-[var(--muted)]">Нисаб золота</p>
          <p className="font-display tabular-nums">{formatPlain(result.nisab.goldGrams)} г</p>
          {result.nisab.goldValue !== null ? (
            <p className="text-xs tabular-nums text-[var(--muted)]">
              {formatMoney(result.nisab.goldValue, result.baseCurrency)}
            </p>
          ) : null}
        </div>
        <div className="border border-[var(--line)] p-2">
          <p className="text-[11px] text-[var(--muted)]">Нисаб серебра</p>
          <p className="font-display tabular-nums">{formatPlain(result.nisab.silverGrams)} г</p>
          {result.nisab.silverValue !== null ? (
            <p className="text-xs tabular-nums text-[var(--muted)]">
              {formatMoney(result.nisab.silverValue, result.baseCurrency)}
            </p>
          ) : null}
        </div>
      </div>
      {result.natural.length ? (
        <ul className="mt-3 text-sm">
          {result.natural.map((n, i) => (
            <li key={i}>{n.label}</li>
          ))}
        </ul>
      ) : null}
      <ul className="mt-4 grid gap-1 text-sm">
        {result.categories
          .filter((c) => c.status !== "not_entered")
          .map((c) => (
            <li key={c.id} className="flex justify-between gap-3 border-t border-[var(--line)] py-1">
              <span>{c.title}</span>
              <span className="shrink-0 text-right tabular-nums text-[var(--muted)]">
                {c.zakatMoney !== undefined ? formatMoney(c.zakatMoney, result.baseCurrency) : ""}
                {c.natural?.length ? ` ${c.natural.map((n) => n.label).join(", ")}` : ""}
                {c.zakatMoney === undefined && !c.natural?.length ? STATUS_RU[c.status] : ` · ${STATUS_RU[c.status]}`}
              </span>
            </li>
          ))}
      </ul>
      {result.warnings.length ? (
        <div className="mt-4 text-xs text-[var(--muted)]">
          <p className="font-medium text-[var(--fg)]">Важно знать</p>
          <ul className="mt-1 list-disc pl-4">
            {result.warnings.slice(0, 6).map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
        </div>
      ) : null}
      {result.missing.length ? (
        <div className="mt-4 text-xs text-[var(--danger)]">
          <p className="font-medium">Не хватает данных</p>
          <ul className="mt-1 list-disc pl-4">
            {result.missing.slice(0, 8).map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        </div>
      ) : null}
      <ExportBar />
    </aside>
  );
}

function ExportBar() {
  const input = useMizan((s) => s.input);
  const result = useMizan((s) => s.lastResult);
  const saveDraft = useMizan((s) => s.saveDraft);
  const [saved, setSaved] = useState(false);
  if (!result) return null;
  return (
    <div className="mt-4 grid gap-2">
      <Button
        onClick={() => {
          downloadBlob(`mizan-${input.asOfDate}.json`, "application/json;charset=utf-8", resultToJson(input, result));
        }}
      >
        <Download className="size-4" />
        Скачать расчёт
      </Button>
      <p className="text-xs text-[var(--muted)]">Файл, чтобы потом снова открыть этот расчёт в Мизане.</p>
      <Button
        variant="secondary"
        onClick={() => {
          const html = resultToHtml(input, result);
          const w = window.open("", "_blank");
          if (w) {
            w.document.write(html);
            w.document.close();
          } else {
            downloadBlob(`mizan-${input.asOfDate}.html`, "text/html;charset=utf-8", html);
          }
        }}
      >
        <Printer className="size-4" />
        Распечатать или PDF
      </Button>
      <Button
        variant="secondary"
        onClick={() => downloadBlob(`mizan-${input.asOfDate}.csv`, "text/csv;charset=utf-8", resultToCsv(result))}
      >
        <Table2 className="size-4" />
        Скачать таблицу
      </Button>
      <Button
        variant="ghost"
        onClick={() => {
          saveDraft();
          setSaved(true);
        }}
      >
        <Bookmark className="size-4" />
        {saved ? "Сохранено в приложении" : "Сохранить здесь"}
      </Button>
      <p className="text-xs text-[var(--muted)]">Это только копия расчёта. Деньги никуда не уходят.</p>
    </div>
  );
}

export function RecipientsPanel() {
  return (
    <section className="border border-[var(--line)] bg-[var(--surface)] p-[var(--pad,1rem)]">
      <h2 className="font-display text-lg">Кому можно отдать (Коран 9:60)</h2>
      <p className="mt-1 text-xs text-[var(--muted)]">
        Справка. Калькулятор сам никому не переводит деньги.
      </p>
      <ul className="mt-3 grid gap-2 text-sm">
        {RECIPIENTS.map((r) => (
          <li key={r.ru} className="flex items-baseline justify-between gap-3 border-b border-[var(--line)] py-1">
            <span>{r.ru}</span>
            <span lang="ar" dir="rtl" className="ar text-[var(--muted)]">
              {r.ar}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function EvidenceList() {
  const result = useMizan((s) => s.lastResult);
  const ids = [...new Set(result?.categories.flatMap((c) => c.sourceIds) ?? ["quran.2.43", "bukhari.1454"])];
  const sources = getSources(ids);
  return (
    <div className="grid gap-3">
      <h2 className="font-display text-xl">Откуда правила</h2>
      {sources.map((s) => (
        <article key={s.sourceId} className="border-l-2 border-[var(--accent)] bg-[var(--surface)] p-3 text-sm">
          <p className="text-xs uppercase tracking-wide text-[var(--muted)]">
            {SOURCE_TYPE_RU[s.type]} · {REVIEW_RU[s.review]}
          </p>
          <h3 className="font-medium">{s.title}</h3>
          {s.arabic ? (
            <p lang="ar" dir="rtl" className="ar my-2 text-lg leading-loose">
              {s.arabic}
            </p>
          ) : null}
          <p>{s.translationRu ?? s.translationEn}</p>
          <p className="mt-1 text-xs text-[var(--muted)]">
            {s.locator}.{" "}
            {s.url ? (
              <a className="underline" href={s.url} target="_blank" rel="noreferrer">
                открыть источник
              </a>
            ) : (
              "ссылки нет"
            )}
          </p>
          <p className="mt-1 text-xs">{s.notes}</p>
        </article>
      ))}
    </div>
  );
}

export function AssistantPanel() {
  const result = useMizan((s) => s.lastResult);
  const input = useMizan((s) => s.input);
  const [q, setQ] = useState("");
  const [log, setLog] = useState<{ role: "user" | "bot"; text: string; meta?: string }[]>([]);
  const [busy, setBusy] = useState(false);
  async function send() {
    const question = q.trim();
    if (!question || busy) return;
    setQ("");
    setLog((l) => [...l, { role: "user", text: question }]);
    setBusy(true);
    const local = localSourceSearch(question);
    const excerpts = (local.length ? local : SOURCES.slice(0, 6)).map((s) => ({
      id: s.sourceId,
      title: s.title,
      locator: s.locator,
      notes: s.notes,
      arabic: s.arabic,
    }));
    const payload: AskPayload = {
      question,
      profileId: input.profileId,
      profileName: getProfile(input.profileId).name,
      anonymized: {
        overallStatus: result?.overallStatus ?? "unknown",
        completeness: result?.completeness ?? "partial",
        categories: (result?.categories ?? []).map((c) => ({
          id: c.id,
          status: c.status,
          zakat: c.zakatMoney !== undefined ? formatPlain(c.zakatMoney) : undefined,
          natural: c.natural?.map((n) => n.label),
        })),
        missing: result?.missing ?? [],
      },
      sourceExcerpts: excerpts,
    };
    try {
      const res = await askEvidence({ data: payload });
      if (res.ok) {
        setLog((l) => [
          ...l,
          {
            role: "bot",
            text: res.text,
            meta: "Ответ по источникам. Цифры считает калькулятор, не помощник.",
          },
        ]);
      } else {
        const fallback = excerpts.map((s) => `• ${s.title}: ${s.notes}`).join("\n");
        setLog((l) => [
          ...l,
          {
            role: "bot",
            text: `${res.error}\n\nИз местных источников:\n${fallback}`,
            meta: "поиск по сохранённым источникам",
          },
        ]);
      }
    } catch (e) {
      setLog((l) => [
        ...l,
        {
          role: "bot",
          text: `Сейчас без сети. ${e instanceof Error ? e.message : ""} Ваш расчёт на месте.`,
          meta: "без сети",
        },
      ]);
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="border border-[var(--line)] bg-[var(--surface)] p-4">
      <h2 className="font-display text-lg">Шейх</h2>
      <p className="text-xs text-[var(--muted)]">Мир тебе. Объясняю правила словами. Сумму считает калькулятор.</p>
      <div className="mt-3 max-h-56 overflow-y-auto text-sm">
        {log.map((m, i) => (
          <div key={i} className={cn("mb-2 p-2", m.role === "user" ? "bg-[var(--bg)]" : "bg-[var(--bg-elev)]")}>
            <p className="whitespace-pre-wrap">{m.text}</p>
            {m.meta ? <p className="mt-1 text-[11px] text-[var(--muted)]">{m.meta}</p> : null}
          </div>
        ))}
      </div>
      <div className="mt-2 flex gap-2">
        <TextInput
          value={q}
          placeholder="Спроси шейха про нисаб, год владения, скот…"
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") void send();
          }}
        />
        <Button onClick={() => void send()} disabled={busy}>
          Спросить
        </Button>
      </div>
    </section>
  );
}

export function QuotesButton() {
  const input = useMizan((s) => s.input);
  const setInput = useMizan((s) => s.setInput);
  const setQuotesStatus = useMizan((s) => s.setQuotesStatus);
  const status = useMizan((s) => s.quotesStatus);
  async function load() {
    setQuotesStatus("loading");
    try {
      const res = await fetchMarketQuotes({
        data: {
          date: input.asOfDate,
          base: input.baseCurrency,
          symbols: ["USD", "EUR", "RUB", "EGP", "SAR", "AED", "GBP", "TRY"],
          cryptoIds: input.crypto.map((c) => c.coingeckoId).filter((x): x is string => Boolean(x)),
        },
      });
      if (!res.ok) {
        setQuotesStatus("error", res.error);
        return;
      }
      const manuals = input.quotes.quotes.filter((q) => q.status === "manual");
      const merged = [...res.snapshot.quotes.filter((q) => !manuals.some((m) => m.asset === q.asset)), ...manuals];
      setInput({ quotes: { ...res.snapshot, quotes: merged } });
      setQuotesStatus("ok");
    } catch (e) {
      setQuotesStatus("error", e instanceof Error ? e.message : "сеть");
    }
  }
  return (
    <Button variant="secondary" onClick={() => void load()} disabled={status === "loading"}>
      {status === "loading" ? "Загружаем цены…" : "Обновить цены"}
    </Button>
  );
}

export function SettingsDialog() {
  const open = useMizan((s) => s.settingsOpen);
  const setOpen = useMizan((s) => s.setSettingsOpen);
  const settings = useMizan((s) => s.settings);
  const setSettings = useMizan((s) => s.setSettings);
  const history = useMizan((s) => s.history);
  const loadSaved = useMizan((s) => s.loadSaved);
  const duplicate = useMizan((s) => s.duplicate);
  const deleteSaved = useMizan((s) => s.deleteSaved);
  const importJson = useMizan((s) => s.importJson);
  const reciterId = useQuran((s) => s.reciterId);
  const setReciter = useQuran((s) => s.setReciter);
  const [importErr, setImportErr] = useState("");
  const [imported, setImported] = useState(false);
  const [note, setNote] = useState("");
  const [probing, setProbing] = useState(false);
  const openedAt = useRef(Date.now());
  const locale = settings.locale;
  const t = (k: string) => translate(locale, k);

  function close() {
    if (Date.now() - openedAt.current < 450) return;
    stopSpeak();
    setProbing(false);
    setOpen(false);
  }

  useEffect(() => {
    openedAt.current = Date.now();
    const html = document.documentElement;
    const prevOverflow = html.style.overflow;
    html.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (Date.now() - openedAt.current < 450) return;
      stopSpeak();
      setProbing(false);
      setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      html.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [setOpen]);

  async function probeVoice() {
    if (probing) {
      stopSpeak();
      setProbing(false);
      return;
    }
    setProbing(true);
    try {
      await speakText(t("set.voice.sample.ar"), "ar-SA");
      await speakText(t("set.voice.probe"), speakLang(locale));
    } finally {
      setProbing(false);
    }
  }

  async function previewVoice(v: NeuralVoice) {
    stopSpeak();
    setProbing(true);
    try {
      if (v.lang === "ar") {
        setSettings({ voiceAr: v.id, voiceGender: v.gender });
        await speakText(t("set.voice.sample.ar"), "ar-SA");
      } else {
        setSettings({ voiceRu: v.id, voiceGender: v.gender });
        await speakText(t("set.voice.probe"), "ru-RU");
      }
    } finally {
      setProbing(false);
    }
  }

  if (!open) return null;

  function Toggle({
    checked,
    onChange,
    label,
  }: {
    checked: boolean;
    onChange: (v: boolean) => void;
    label: string;
  }) {
    return (
      <label className="flex min-h-11 items-center gap-2 text-sm sm:col-span-2">
        <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
        {label}
      </label>
    );
  }

  return (
    <div
      className="settings-page"
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-title"
      data-go="settings-page"
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="settings-bar">
        <button type="button" className="settings-back" onClick={close} aria-label={t("set.close")} data-go="settings-close">
          <ChevronLeft className="size-5" />
        </button>
        <h2 id="settings-title" className="font-display text-2xl">
          {t("settings")}
        </h2>
        <span className="settings-back" aria-hidden />
      </div>
      <p className="mb-4 text-xs text-[var(--muted)]">{t("set.note")}</p>

      <InstallHome />

      <section className="settings-theme" id="settings-theme">
        <ThemeStage />
        <DesignGallery />
      </section>

      <h3 className="mt-6 mb-2 text-[11px] uppercase tracking-[0.14em] text-[var(--muted)]">{t("set.section.lang")}</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t("set.lang")}>
            <Select value={settings.locale} onChange={(e) => setSettings({ locale: e.target.value as Locale })}>
              {LOCALES.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.native}
                </option>
              ))}
            </Select>
          </Field>
          <Field label={t("set.start")}>
            <Select
              value={settings.startTab}
              onChange={(e) => setSettings({ startTab: e.target.value as typeof settings.startTab })}
            >
              <option value="home">{t("tab.home")}</option>
              <option value="zakat">{t("tab.zakat")}</option>
              <option value="quran">{t("tab.quran")}</option>
              <option value="hisn">{t("tab.hisn")}</option>
              <option value="learn">{t("tab.learn")}</option>
            </Select>
          </Field>
          <Field label={t("set.nav")}>
            <Select value={settings.navLayout} onChange={(e) => setSettings({ navLayout: e.target.value as NavLayout })}>
              {NAV_LAYOUTS.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.id === "theme" ? t("set.as.theme") : t(`set.nav.${n.id}`)}
                </option>
              ))}
            </Select>
          </Field>
          <Field label={t("set.scheme")}>
            <Select
              value={settings.colorScheme}
              onChange={(e) => setSettings({ colorScheme: e.target.value as typeof settings.colorScheme })}
            >
              <option value="theme">{t("set.as.theme")}</option>
              <option value="dark">{t("set.dark")}</option>
              <option value="light">{t("set.light")}</option>
            </Select>
          </Field>
          <Field label={t("set.font")}>
            <input
              type="range"
              min={0.9}
              max={1.3}
              step={0.05}
              value={settings.fontScale}
              onChange={(e) => setSettings({ fontScale: Number(e.target.value) })}
            />
          </Field>
          <Field label={t("set.font.family")}>
            <Select
              value={settings.fontPair}
              onChange={(e) => setSettings({ fontPair: e.target.value as FontPair | "theme" })}
            >
              <option value="theme">{t("set.font.theme")}</option>
              <option value="fraunces">{t("set.font.fraunces")}</option>
              <option value="literata">{t("set.font.literata")}</option>
              <option value="newsreader">{t("set.font.newsreader")}</option>
              <option value="serif-plex">{t("set.font.serif")}</option>
              <option value="plex">{t("set.font.plex")}</option>
              <option value="plex-mono">{t("set.font.mono")}</option>
            </Select>
          </Field>
          <Field label={t("set.density")}>
            <Select
              value={settings.densityOverride}
              onChange={(e) => setSettings({ densityOverride: e.target.value as typeof settings.densityOverride })}
            >
              <option value="theme">{t("set.as.theme")}</option>
              <option value="compact">{t("set.compact")}</option>
              <option value="regular">{t("set.regular")}</option>
              <option value="airy">{t("set.airy")}</option>
            </Select>
          </Field>
          <Field label={t("set.home")}>
            <Select
              value={settings.homeSize}
              onChange={(e) => setSettings({ homeSize: e.target.value as typeof settings.homeSize })}
            >
              <option value="compact">{t("set.compact")}</option>
              <option value="roomy">{t("set.roomy")}</option>
            </Select>
          </Field>
          <Toggle checked={settings.keepLastTab} onChange={(keepLastTab) => setSettings({ keepLastTab })} label={t("set.keep")} />
          <Toggle checked={settings.reducedMotion} onChange={(reducedMotion) => setSettings({ reducedMotion })} label={t("set.motion")} />
          <Toggle checked={settings.highContrast} onChange={(highContrast) => setSettings({ highContrast })} label={t("set.contrast")} />
          <Toggle checked={settings.largeTap} onChange={(largeTap) => setSettings({ largeTap })} label={t("set.largetap")} />
          <Toggle checked={settings.showHijri} onChange={(showHijri) => setSettings({ showHijri })} label={t("set.hijri")} />
        </div>

        <h3 className="mt-6 mb-2 text-[11px] uppercase tracking-[0.14em] text-[var(--muted)]">{t("set.section.quran")}</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t("set.reciter")}>
            <Select value={reciterId} onChange={(e) => setReciter(e.target.value)} data-go="settings-reciter">
              {RECITERS.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </Select>
          </Field>
          <Toggle checked={settings.showMeaning} onChange={(showMeaning) => setSettings({ showMeaning })} label={t("set.meaning")} />
          <Toggle checked={settings.favFirst} onChange={(favFirst) => setSettings({ favFirst })} label={t("set.favfirst")} />
          <Toggle checked={settings.autoPlayAyah} onChange={(autoPlayAyah) => setSettings({ autoPlayAyah })} label={t("set.autoplay")} />
        </div>

        <h3 className="mt-6 mb-2 text-[11px] uppercase tracking-[0.14em] text-[var(--muted)]">{t("set.section.voice")}</h3>
        <p className="mb-3 text-xs text-[var(--muted)]">{t("set.voice.note")}</p>
        <p className="mb-3 text-xs text-[var(--muted)]">{t("set.voice.pick")}</p>
        <p className="mb-2 text-[11px] uppercase tracking-[0.14em] text-[var(--muted)]">{t("set.voice.ru")}</p>
        <div className="voice-grid" data-go="settings-voice-ru">
          {VOICES_RU.map((v) => (
            <button
              key={v.id}
              type="button"
              className={cn("voice-card", (settings.voiceRu ?? defaultVoice("ru", settings.voiceGender)) === v.id && "is-on")}
              onClick={() => void previewVoice(v)}
              data-go={`voice-${v.id}`}
            >
              <span className="voice-card-name">{v.name}</span>
              <span className="voice-card-place">{v.place}</span>
              <span className="voice-card-note">{v.note}</span>
            </button>
          ))}
        </div>
        <p className="mt-4 mb-2 text-[11px] uppercase tracking-[0.14em] text-[var(--muted)]">{t("set.voice.ar")}</p>
        <div className="voice-grid" data-go="settings-voice-ar">
          {VOICES_AR.map((v) => (
            <button
              key={v.id}
              type="button"
              className={cn("voice-card", (settings.voiceAr ?? defaultVoice("ar", settings.voiceGender)) === v.id && "is-on")}
              onClick={() => void previewVoice(v)}
              data-go={`voice-${v.id}`}
            >
              <span className="voice-card-name">{v.name}</span>
              <span className="voice-card-place">{v.place} · {v.gender === "female" ? t("set.voice.female") : t("set.voice.male")}</span>
              <span className="voice-card-note">{v.note}</span>
            </button>
          ))}
        </div>
        <div className="grid gap-4 sm:grid-cols-2 mt-4">
          <Field label={t("set.voice.gender")}>
            <Select
              value={settings.voiceGender ?? "male"}
              onChange={(e) => {
                stopSpeak();
                setProbing(false);
                const voiceGender = e.target.value as VoiceGender;
                setSettings({
                  voiceGender,
                  voiceAr: defaultVoice("ar", voiceGender),
                  voiceRu: defaultVoice("ru", voiceGender),
                });
              }}
            >
              <option value="male">{t("set.voice.male")}</option>
              <option value="female">{t("set.voice.female")}</option>
            </Select>
          </Field>
          <Field label={t("set.voice.rate")}>
            <Select
              value={settings.voiceRate ?? "normal"}
              onChange={(e) => {
                stopSpeak();
                setProbing(false);
                setSettings({ voiceRate: e.target.value as VoiceRate });
              }}
            >
              <option value="slow">{t("set.voice.slow")}</option>
              <option value="normal">{t("set.voice.normal")}</option>
              <option value="fast">{t("set.voice.fast")}</option>
            </Select>
          </Field>
        </div>
        <Button variant="secondary" className="mt-3" onClick={() => void probeVoice()} data-go="voice-probe">
          {probing ? <Pause className="size-4" /> : <Volume2 className="size-4" />}
          {probing ? t("hadith.stop") : t("set.voice.test")}
        </Button>

        <h3 className="mt-6 mb-2 text-[11px] uppercase tracking-[0.14em] text-[var(--muted)]">{t("set.section.notify")}</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t("set.sabrhour")}>
            <Select
              value={String(settings.sabrHour)}
              onChange={(e) => {
                const sabrHour = Number(e.target.value);
                setSettings({ sabrHour });
                if (settings.sabrNotify) void bootNotify(true, sabrHour);
              }}
            >
              {Array.from({ length: 24 }, (_, h) => (
                <option key={h} value={h}>
                  {String(h).padStart(2, "0")}:00
                </option>
              ))}
            </Select>
          </Field>
          <Toggle
            checked={settings.sabrNotify}
            onChange={async (on) => {
              if (on) {
                const r = await requestNotify();
                setSettings({ sabrNotify: r === "granted" });
                if (r === "granted") await bootNotify(true, settings.sabrHour);
              } else {
                setSettings({ sabrNotify: false });
                await bootNotify(false, settings.sabrHour);
              }
            }}
            label={t("set.notify")}
          />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button
            variant="secondary"
            onClick={async () => {
              const r = await requestNotify();
              if (r === "granted") {
                const { showSabrNow } = await import("@/lib/notify.ts");
                await showSabrNow();
                setNote("Уведомление ушло, если система его не глушит.");
              } else setNote("Сначала разрешите уведомления.");
            }}
          >
            {t("set.test.notify")}
          </Button>
        </div>

        <h3 className="mt-6 mb-2 text-[11px] uppercase tracking-[0.14em] text-[var(--muted)]">{t("set.data")}</h3>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            onClick={() => {
              useHisn.setState({ counts: {} });
              try {
                localStorage.removeItem("mizan.v1.hisn");
              } catch {
                /* ignore */
              }
              setNote(t("set.reset.hisn"));
            }}
          >
            {t("set.reset.hisn")}
          </Button>
          <Button
            variant="secondary"
            onClick={() => document.getElementById("settings-theme")?.scrollIntoView({ behavior: "smooth", block: "start" })}
          >
            {t("set.theme")}
          </Button>
          <label className="inline-flex min-h-11 cursor-pointer items-center border border-[var(--line)] px-4 text-sm">
            {t("set.import")}
            <input
              type="file"
              accept="application/json,.json"
              className="sr-only"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const text = await file.text();
                const r = importJson(text);
                setImportErr(r.ok ? "" : r.error ?? "не получилось открыть файл");
                setImported(r.ok);
              }}
            />
          </label>
        </div>
        {note ? <p className="mt-2 text-sm text-[var(--muted)]">{note}</p> : null}
        {imported ? <p className="mt-2 text-sm text-[var(--ok)]">{t("set.import")}</p> : null}
        {importErr ? <p className="mt-2 text-sm text-[var(--danger)]">{importErr}</p> : null}
        {history.length ? (
          <div className="mt-6">
            <h3 className="mb-2 font-medium">{t("set.saved")}</h3>
            <ul className="grid gap-2 text-sm">
              {history.map((h) => (
                <li key={h.id} className="flex flex-wrap items-center justify-between gap-2 border border-[var(--line)] p-2">
                  <span>
                    {h.title} · {h.input.asOfDate}
                  </span>
                  <span className="flex gap-2">
                    <Button variant="ghost" onClick={() => loadSaved(h.id)}>
                      {t("set.saved.open")}
                    </Button>
                    <Button variant="ghost" onClick={() => duplicate(h.id)}>
                      {t("set.saved.copy")}
                    </Button>
                    <Button variant="ghost" onClick={() => deleteSaved(h.id)}>
                      {t("set.saved.delete")}
                    </Button>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
    </div>
  );
}

function ThemeStage() {
  const locale = useMizan((s) => s.settings.locale);
  const hijri = hijriLabel(new Date(), locale);
  return (
    <aside className="theme-stage" data-go="theme-preview">
      <p className="theme-stage-kicker">Предпросмотр</p>
      <div className="theme-stage-phone">
        <div className="theme-stage-top">
          <span className="theme-stage-mark" />
          <span>Мизан</span>
        </div>
        <p className="bismillah" lang="ar">
          بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
        </p>
        <p className="theme-stage-hero">Мир тебе.</p>
        <p className="theme-stage-date">{hijri.hijri}</p>
        <p className="theme-stage-ar gold-flow" lang="ar">
          بُنِيَ الْإِسْلَامُ عَلَى خَمْسٍ
        </p>
        <div className="theme-stage-tiles">
          <i />
          <i />
          <i />
          <i />
        </div>
        <nav className="theme-stage-dock" aria-hidden>
          <i />
          <i />
          <i />
          <i />
          <i />
        </nav>
      </div>
    </aside>
  );
}

function DesignGallery() {
  const settings = useMizan((s) => s.settings);
  const preview = useMizan((s) => s.previewThemeId);
  const setPreview = useMizan((s) => s.setPreviewTheme);
  const apply = useMizan((s) => s.applyTheme);
  const revert = useMizan((s) => s.revertTheme);
  const toggleFav = useMizan((s) => s.toggleFavorite);
  const [q, setQ] = useState("");
  const [mode, setMode] = useState<"all" | "light" | "dark">("all");
  const currentId = preview ?? settings.themeId;
  const list = useMemo(() => {
    return THEMES.filter((t) => {
      if (mode !== "all" && t.mode !== mode) return false;
      if (q && !`${t.name} ${t.nameRu} ${t.notes}`.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [q, mode]);
  return (
    <div className="theme-gallery">
      <h3 className="font-display text-xl">Оформление</h3>
      <p className="text-xs text-[var(--muted)]">Нажал — весь экран рядом уже в этой теме.</p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <Field label="Поиск">
          <TextInput value={q} onChange={(e) => setQ(e.target.value)} placeholder="Изумруд, мастер…" />
        </Field>
        <Field label="Светлый или тёмный">
          <Select value={mode} onChange={(e) => setMode(e.target.value as typeof mode)}>
            <option value="all">Все</option>
            <option value="dark">Тёмные</option>
            <option value="light">Светлые</option>
          </Select>
        </Field>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {list.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => {
              setPreview(t.id);
              apply(t.id);
            }}
            className={cn(
              "theme-swatch text-left",
              currentId === t.id ? "is-on" : "",
            )}
            data-go={`theme-${t.id}`}
            style={{
              background: t.tokens["--bg"],
              color: t.tokens["--fg"],
              borderColor: currentId === t.id ? t.tokens["--accent"] : t.tokens["--line"],
            }}
          >
            <div className="mb-2 flex h-12 overflow-hidden rounded-xl border" style={{ borderColor: t.tokens["--line"] }}>
              <div className="w-1/4" style={{ background: t.tokens["--surface"] }} />
              <div className="flex-1 p-2">
                <div className="h-2 w-1/2 rounded-full" style={{ background: t.tokens["--accent"] }} />
                <div className="mt-2 h-6 rounded-md" style={{ background: t.tokens["--bg-elev"] }} />
              </div>
            </div>
            <p className="text-sm font-medium">{t.nameRu}</p>
            <p className="text-[11px] opacity-80">
              {t.mode === "dark" ? "тёмная" : "светлая"} · {t.density}
            </p>
          </button>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button variant="ghost" onClick={() => apply("mizan-emerald")}>
          <RotateCcw className="size-4" /> Вернуть исходный
        </Button>
        <Button variant="ghost" onClick={() => toggleFav(currentId)}>
          <Heart className="size-4" /> Избранное
        </Button>
        {preview ? (
          <Button variant="secondary" onClick={revert}>
            Отмена
          </Button>
        ) : null}
      </div>
    </div>
  );
}
