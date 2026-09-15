import { ChevronDown } from "lucide-react";
import { useEffect, useRef } from "react";
import { AllSections, CURRENCIES } from "@/components/mizan/form-sections.tsx";
import { AssistantPanel, EvidenceList, QuotesButton, RecipientsPanel, ResultsPanel } from "@/components/mizan/panels.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Field, Select, TextInput } from "@/components/ui/field.tsx";
import { formatMoney } from "@/lib/mizan/decimal.ts";
import { OVERALL_RU } from "@/lib/mizan/labels.ts";
import { getProfile, PROFILES } from "@/lib/mizan/profiles.ts";
import { fetchMarketQuotes } from "@/lib/quotes/server.ts";
import { cn } from "@/lib/utils.ts";
import { useMizan } from "@/stores/mizan-store.ts";

export function ZakatView() {
  const result = useMizan((s) => s.lastResult);
  const input = useMizan((s) => s.input);
  const setInput = useMizan((s) => s.setInput);
  const open = useMizan((s) => s.zakatOpen);
  const setOpen = useMizan((s) => s.setZakatOpen);
  const details = useMizan((s) => s.detailsOpen);
  const setDetails = useMizan((s) => s.setDetailsOpen);
  const profile = result ? getProfile(result.profileId) : null;
  const line = input.money[0];
  const fetched = useRef(false);
  useEffect(() => {
    if (fetched.current) return;
    const hasMetal = input.quotes.quotes.some((q) => q.asset === "XAU_G" || q.asset === "XAG_G");
    if (hasMetal) return;
    fetched.current = true;
    const { asOfDate, baseCurrency, crypto } = useMizan.getState().input;
    void (async () => {
      useMizan.getState().setQuotesStatus("loading");
      try {
        const res = await fetchMarketQuotes({
          data: {
            date: asOfDate,
            base: baseCurrency,
            symbols: ["USD", "EUR", "RUB", "KZT", "TRY", "EGP", "SAR", "AED", "CNY", "GBP"],
            cryptoIds: crypto.map((c) => c.coingeckoId).filter((x): x is string => Boolean(x)),
          },
        });
        if (!res.ok) {
          useMizan.getState().setQuotesStatus("error", res.error);
          return;
        }
        const manuals = useMizan.getState().input.quotes.quotes.filter((q) => q.status === "manual");
        const merged = [...res.snapshot.quotes.filter((q) => !manuals.some((m) => m.asset === q.asset)), ...manuals];
        useMizan.getState().setInput({ quotes: { ...res.snapshot, quotes: merged } });
        useMizan.getState().setQuotesStatus("ok");
      } catch (e) {
        useMizan.getState().setQuotesStatus("error", e instanceof Error ? e.message : "сеть");
      }
    })();
  }, [input.quotes.quotes]);
  const mal = result?.categories.find((c) => c.id === "mal_net");
  const below = mal?.status === "below_nisab" || result?.overallStatus === "not_due_confirmed";
  const due = result?.overallStatus === "due" || result?.overallStatus === "mixed";
  const empty = !line?.amount.trim() && (mal?.status === "not_entered" || !mal);
  const needHawl = !empty && !below && !due && input.hawlConfirmed === null;

  const headline = empty
    ? "Введите сумму"
    : below
      ? "Не подпадает под закят"
      : due
        ? "К уплате"
        : needHawl
          ? "Нужен год владения"
          : "Пока не считаем";
  const amountText = empty || below ? "—" : result ? formatMoney(result.totalMoneyRounded, result.baseCurrency) : "—";

  return (
    <div className="page-pad mx-auto grid max-w-3xl gap-4 px-4 pt-6">
      <div>
        <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--muted)]">Расчёт</p>
        <h1 className="font-display mt-2 text-3xl tracking-tight">Закят</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">Сумма на этой карточке. Остальное — ниже, если нужно.</p>
      </div>

      <div className="rounded-[28px] border border-[var(--line)] bg-[var(--bg-elev)] p-5">
        <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--muted)]">{headline}</p>
        <p
          className={cn(
            "font-display mt-2 leading-none tracking-tight",
            below || empty || needHawl ? "text-4xl text-[var(--fg)]" : "text-5xl tabular-nums text-[var(--ok)]",
          )}
          data-testid="zakat-total"
        >
          {below ? "Не подпадает" : needHawl ? "Год?" : amountText}
        </p>
        {result && !empty ? (
          <>
            {due && result.totalMoneyRounded !== 0n ? (
              <p className="font-display mt-3 text-4xl tabular-nums text-[var(--ok)]">
                {formatMoney(result.totalMoneyRounded, result.baseCurrency)}
              </p>
            ) : null}
            <p className="mt-2 text-sm">
              {below
                ? "Сумма ниже нисаба. Ставка 1/40 не применяется."
                : needHawl
                  ? "Сумма выше нисаба. Без года владения закят не начисляем."
                  : (OVERALL_RU[result.overallStatus] ?? result.overallStatus)}
              {profile ? ` · ${profile.name}` : ""}
            </p>
          </>
        ) : (
          <p className="mt-2 text-sm text-[var(--muted)]">Пока нет цифры — нет закята к уплате.</p>
        )}

        {line ? (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Field label="Сумма">
              <TextInput
                inputMode="decimal"
                value={line.amount}
                placeholder="0"
                onChange={(e) => {
                  const money = input.money.map((m) => (m.id === line.id ? { ...m, amount: e.target.value } : m));
                  setInput({ money });
                }}
              />
            </Field>
            <Field label="Валюта">
              <Select
                value={input.baseCurrency}
                onChange={(e) => {
                  const baseCurrency = e.target.value;
                  const money = input.money.map((m, i) => (i === 0 ? { ...m, currency: baseCurrency } : m));
                  setInput({ baseCurrency, money });
                }}
              >
                {CURRENCIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Деньги уже год?">
              <Select
                value={input.hawlConfirmed === null ? "unknown" : input.hawlConfirmed ? "yes" : "no"}
                onChange={(e) =>
                  setInput({
                    hawlConfirmed: e.target.value === "unknown" ? null : e.target.value === "yes",
                  })
                }
              >
                <option value="unknown">Пока не знаю</option>
                <option value="yes">Да, год прошёл</option>
                <option value="no">Нет, год не прошёл</option>
              </Select>
            </Field>
            <Field label="Школа">
              <Select value={input.profileId} onChange={(e) => setInput({ profileId: e.target.value as typeof input.profileId })}>
                {PROFILES.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
        ) : null}

        <div className="mt-4 flex flex-wrap gap-2">
          <QuotesButton />
          <Button variant="ghost" className="pill" onClick={() => setDetails(!details)}>
            {details ? "Скрыть порог" : "Порог нисаба"}
            <ChevronDown className={cn("size-4 transition-transform", details && "rotate-180")} />
          </Button>
        </div>
        {details ? (
          <div className="mt-3">
            <ResultsPanel />
          </div>
        ) : null}
      </div>

      <Button variant="glow" className="w-full" onClick={() => setOpen(!open)} aria-expanded={open}>
        {open ? "Скрыть остальное" : "Золото, скот, крипто, урожай"}
        <ChevronDown className={cn("size-4 transition-transform duration-200", open && "rotate-180")} />
      </Button>

      {open ? (
        <div className="grid gap-3 pb-2">
          <AllSections />
          <RecipientsPanel />
          <EvidenceList />
          <AssistantPanel />
        </div>
      ) : null}
    </div>
  );
}
