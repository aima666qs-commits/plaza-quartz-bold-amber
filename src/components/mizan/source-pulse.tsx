import { useState } from "react";
import { Button } from "@/components/ui/button.tsx";
import { pingOfficialSources, type SourcePing } from "@/lib/agents/server.ts";

export function SourcePulse() {
  const [items, setItems] = useState<SourcePing[] | null>(null);
  const [at, setAt] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function run() {
    setBusy(true);
    setError("");
    try {
      const res = await pingOfficialSources({ data: {} });
      setItems(res.items);
      setAt(res.checkedAt);
    } catch (e) {
      setError(e instanceof Error ? e.message : "сеть");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="ayah-card">
      <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--muted)]">Агенты источников</p>
      <p className="mt-2 text-sm text-[var(--muted)]">
        Коран и Хисн не выдумываются. Кнопка спрашивает живые официальные API. Хадисы закята — только из сохранённого реестра
        sunnah.com, без подстановки.
      </p>
      <Button className="mt-3 pill" variant="secondary" disabled={busy} onClick={() => void run()}>
        {busy ? "Спрашиваю сеть…" : "Сверить сейчас"}
      </Button>
      {error ? <p className="mt-2 text-sm text-[var(--danger)]">{error}</p> : null}
      {items ? (
        <ul className="mt-3 grid gap-2 text-sm">
          {items.map((it) => (
            <li key={it.id} className="flex items-start justify-between gap-3 border-t border-[var(--line)] pt-2">
              <span>
                <span className={it.ok ? "text-[var(--ok)]" : "text-[var(--danger)]"}>{it.ok ? "связь есть" : "нет ответа"}</span>
                {" · "}
                {it.label}
                <span className="mt-0.5 block text-[11px] text-[var(--muted)]">{it.detail}</span>
              </span>
              <span className="shrink-0 tabular-nums text-[11px] text-[var(--muted)]">{it.ms} мс</span>
            </li>
          ))}
        </ul>
      ) : null}
      {at ? <p className="mt-2 text-[11px] text-[var(--muted)]">Проверка {at.replace("T", " ").slice(0, 19)} UTC</p> : null}
    </section>
  );
}
