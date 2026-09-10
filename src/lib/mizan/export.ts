import { formatFixed, formatMoney, formatPlain } from "./decimal.ts";
import { getSources } from "./sources.ts";
import { getProfile } from "./profiles.ts";
import { NISAB_MODE_RU, OVERALL_RU, STATUS_RU } from "./labels.ts";
import type { CalculationInput, CalculationResult } from "./types.ts";

export function resultToJson(input: CalculationInput, result: CalculationResult): string {
  return JSON.stringify(
    {
      schemaVersion: 1,
      disclaimer:
        "Программный расчёт. Не богословская рецензия и не факт уплаты. Источники привязаны к правилам.",
      input,
      result: {
        ...result,
        totalMoneyExact: formatPlain(result.totalMoneyExact),
        totalMoneyRounded: formatFixed(result.totalMoneyRounded, 2),
        nisab: {
          ...result.nisab,
          goldGrams: formatPlain(result.nisab.goldGrams),
          silverGrams: formatPlain(result.nisab.silverGrams),
          goldValue: result.nisab.goldValue !== null ? formatPlain(result.nisab.goldValue) : null,
          silverValue: result.nisab.silverValue !== null ? formatPlain(result.nisab.silverValue) : null,
          threshold: result.nisab.threshold !== null ? formatPlain(result.nisab.threshold) : null,
        },
        categories: result.categories.map((c) => ({
          ...c,
          baseMoney: c.baseMoney !== undefined ? formatPlain(c.baseMoney) : undefined,
          zakatMoney: c.zakatMoney !== undefined ? formatPlain(c.zakatMoney) : undefined,
        })),
      },
    },
    null,
    2,
  );
}

export function resultToCsv(result: CalculationResult): string {
  const rows = [["category", "status", "base", "zakat_money", "natural", "missing"]];
  for (const c of result.categories) {
    rows.push([
      c.title,
      c.status,
      c.baseMoney !== undefined ? formatFixed(c.baseMoney, 2) : "",
      c.zakatMoney !== undefined ? formatFixed(c.zakatMoney, 2) : "",
      (c.natural ?? []).map((n) => `${n.count} ${n.label}`).join("; "),
      c.missing.join("; "),
    ]);
  }
  return rows
    .map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\n");
}

export function resultToHtml(input: CalculationInput, result: CalculationResult): string {
  const profile = getProfile(result.profileId);
  const money = (q: bigint | undefined) =>
    q === undefined ? "—" : formatMoney(q, result.baseCurrency);
  const cats = result.categories
    .map((c) => {
      const src = getSources(c.sourceIds)
        .map((s) => `<li><a href="${s.url}">${s.title}</a> — ${s.locator}. ${s.notes}</li>`)
        .join("");
      const nat = (c.natural ?? []).map((n) => `<li>${n.label}</li>`).join("");
      const steps = c.steps
        .map((s) => `<li>${s.label}${s.output ? `: <b>${s.output}</b>` : ""}</li>`)
        .join("");
      return `<section>
        <h2>${c.title}</h2>
        <p>Статус: ${STATUS_RU[c.status]}</p>
        <p>База: ${money(c.baseMoney)} · Закят (деньги): ${money(c.zakatMoney)}</p>
        ${nat ? `<p>Натура:</p><ul>${nat}</ul>` : ""}
        <ol>${steps}</ol>
        <h3>Источники</h3>
        <ul>${src}</ul>
        ${c.missing.length ? `<p>Не хватает данных: ${c.missing.join("; ")}</p>` : ""}
      </section>`;
    })
    .join("\n");
  return `<!DOCTYPE html>
<html lang="ru" dir="ltr">
<head>
<meta charset="utf-8"/>
<title>Мизан — отчёт закята</title>
<style>
  body { font-family: "Source Serif 4", Georgia, serif; max-width: 820px; margin: 2rem auto; color: #10221a; }
  h1 { font-weight: 600; }
  [lang=ar], .ar { direction: rtl; font-family: "Noto Naskh Arabic", serif; font-size: 1.15rem; }
  .warn { border: 1px solid #b45309; padding: 12px; }
  table { width: 100%; border-collapse: collapse; }
  td, th { border-bottom: 1px solid #ddd; padding: 6px 8px; text-align: left; }
  @media print { .no-print { display: none; } }
</style>
</head>
<body>
  <p class="no-print"><button onclick="window.print()">Печать / PDF</button></p>
  <h1>Мизан — расчёт закята</h1>
  <p class="warn">Это не факт уплаты и не рецензия учёного. Деньги никуда не уходят.</p>
  <p>Школа: ${profile.name} (${profile.version}). Дата: ${result.asOfDate}. Валюта: ${result.baseCurrency}.</p>
  <p>Статус: ${OVERALL_RU[result.overallStatus] ?? result.overallStatus}. ${result.completeness === "complete" ? "Всё заполнено." : "Есть пропуски."} Нисаб: ${NISAB_MODE_RU[result.nisab.mode]}.</p>
  <p>К уплате: ${formatMoney(result.totalMoneyRounded, result.baseCurrency)}.</p>
  ${result.natural.length ? `<h2>Натурой</h2><ul>${result.natural.map((n) => `<li>${n.label}</li>`).join("")}</ul>` : ""}
  ${cats}
  <h2>Котировки</h2>
  <table><thead><tr><th>Актив</th><th>Курс</th><th>Статус</th><th>Источник</th></tr></thead>
  <tbody>${result.quotes.quotes
    .map(
      (q) =>
        `<tr><td>${q.asset}/${q.quote}</td><td>${q.rate}</td><td>${q.status}</td><td>${q.source} ${q.author ?? ""}</td></tr>`,
    )
    .join("")}</tbody></table>
  <h2>Предупреждения</h2>
  <ul>${result.warnings.map((w) => `<li>${w}</li>`).join("")}</ul>
</body></html>`;
}

export function downloadBlob(filename: string, mime: string, content: string) {
  const blob = new Blob([content], { type: mime });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}
