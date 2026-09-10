import { ChevronDown } from "lucide-react";
import { AllSections } from "@/components/mizan/form-sections.tsx";
import { AssistantPanel, EvidenceList, QuotesButton, RecipientsPanel, ResultsPanel } from "@/components/mizan/panels.tsx";
import { Button } from "@/components/ui/button.tsx";
import { formatMoney, formatPlain } from "@/lib/mizan/decimal.ts";
import { OVERALL_RU } from "@/lib/mizan/labels.ts";
import { getProfile } from "@/lib/mizan/profiles.ts";
import { cn } from "@/lib/utils.ts";
import { useMizan } from "@/stores/mizan-store.ts";

export function ZakatView() {
  const result = useMizan((s) => s.lastResult);
  const open = useMizan((s) => s.zakatOpen);
  const setOpen = useMizan((s) => s.setZakatOpen);
  const details = useMizan((s) => s.detailsOpen);
  const setDetails = useMizan((s) => s.setDetailsOpen);
  const profile = result ? getProfile(result.profileId) : null;

  return (
    <div className="page-pad mx-auto grid max-w-3xl gap-4 px-4 pt-6">
      <div>
        <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--muted)]">Расчёт</p>
        <h1 className="font-display mt-2 text-3xl tracking-tight">Закят</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">Сначала сумма. Имущество и источники — кнопкой ниже.</p>
      </div>

      <div className="rounded-[28px] border border-[var(--line)] bg-[var(--bg-elev)] p-5">
        <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--muted)]">К уплате</p>
        <p className="font-display mt-2 text-5xl leading-none tabular-nums tracking-tight text-[var(--ok)]" data-testid="zakat-total">
          {result ? formatMoney(result.totalMoneyRounded, result.baseCurrency) : "—"}
        </p>
        {result ? (
          <>
            {result.totalMoneyRounded !== 0n && formatPlain(result.totalMoneyExact).includes(".") && !formatPlain(result.totalMoneyExact).endsWith(".00") ? (
              <p className="mt-2 text-xs text-[var(--muted)]">без округления: {formatPlain(result.totalMoneyExact)}</p>
            ) : null}
            <p className="mt-2 text-sm">
              {OVERALL_RU[result.overallStatus] ?? result.overallStatus}
              {profile ? ` · ${profile.name}` : ""}
            </p>
          </>
        ) : null}
        <div className="mt-4 flex flex-wrap gap-2">
          <QuotesButton />
          <Button variant="ghost" className="pill" onClick={() => setDetails(!details)}>
            {details ? "Скрыть подробности" : "Как получилась сумма"}
            <ChevronDown className={cn("size-4 transition-transform", details && "rotate-180")} />
          </Button>
        </div>
        <div className="roll mt-3" data-open={details ? "true" : "false"} {...(!details ? { inert: true } : {})}>
          <div className="roll-inner">
            <ResultsPanel />
          </div>
        </div>
      </div>

      <Button variant="glow" className="w-full" onClick={() => setOpen(!open)} aria-expanded={open}>
        {open ? "Скрыть имущество" : "Ввести имущество"}
        <ChevronDown className={cn("size-4 transition-transform duration-200", open && "rotate-180")} />
      </Button>

      <div className="roll" data-open={open ? "true" : "false"} {...(!open ? { inert: true } : {})}>
        <div className="roll-inner">
          <div className="grid gap-3 pb-2">
            <AllSections />
            <RecipientsPanel />
            <EvidenceList />
            <AssistantPanel />
          </div>
        </div>
      </div>
    </div>
  );
}
