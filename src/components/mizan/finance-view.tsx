import { Wallet } from "lucide-react";
import { translate } from "@/lib/i18n/dict.ts";
import { useMizan } from "@/stores/mizan-store.ts";

const TOPICS = ["finance.topic.cash", "finance.topic.gold", "finance.topic.shares", "finance.topic.rent", "finance.topic.trade"] as const;

export function FinanceView() {
  const locale = useMizan((s) => s.settings.locale);
  const t = (key: string) => translate(locale, key);
  return (
    <div className="page-pad mx-auto grid w-full max-w-lg gap-4 px-4 pt-3">
      <header className="grid gap-2">
        <p className="flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-[var(--muted)]">
          <Wallet className="size-4" aria-hidden />
          {t("nav.finance")}
        </p>
        <h1 className="font-display text-3xl leading-tight">{t("finance.title")}</h1>
        <p className="finance-disclaimer text-sm">{t("finance.disclaimer")}</p>
        <p className="text-sm text-[var(--muted)]">{t("finance.lead")}</p>
      </header>
      <ul className="grid gap-2">
        {TOPICS.map((key) => (
          <li key={key}>
            <button type="button" className="skin min-h-11 w-full rounded-2xl px-4 text-left text-sm" disabled>
              {t(key)}
            </button>
          </li>
        ))}
      </ul>
      <p className="text-center text-sm text-[var(--muted)]">{t("finance.cta")}</p>
    </div>
  );
}
