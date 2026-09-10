import { createServerFn } from "@tanstack/react-start";
import type { Quote, QuoteSnapshot } from "@/lib/mizan/types.ts";

const TROY = 31.1034768;

async function fetchJson(url: string, ms = 8000): Promise<unknown> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    const res = await fetch(url, { signal: ctrl.signal, headers: { accept: "application/json" } });
    if (!res.ok) throw new Error(`${res.status} ${url}`);
    return await res.json();
  } finally {
    clearTimeout(t);
  }
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

/** 1 unit of `from` = `rate` units of `to`. */
export function unitsOfQuotePerBase(fromTableRate: number): number | null {
  if (!Number.isFinite(fromTableRate) || fromTableRate <= 0) return null;
  return fromTableRate;
}

export const fetchMarketQuotes = createServerFn({ method: "POST" })
  .validator((input: { date: string; base: string; symbols: string[]; cryptoIds: string[] }) => input)
  .handler(async ({ data }): Promise<{ ok: true; snapshot: QuoteSnapshot } | { ok: false; error: string }> => {
    const fetchedAt = new Date().toISOString();
    const quotes: Quote[] = [];
    const date = data.date;
    const isFuture = date > todayISO();
    if (isFuture) {
      return { ok: false, error: "Будущая дата: рыночная цена неизвестна, введите вручную." };
    }
    const isToday = date === todayISO();
    const fxDate = isToday ? "latest" : date;
    const base = data.base.toLowerCase();

    const froms = data.symbols.filter((s) => s.toUpperCase() !== data.base.toUpperCase());
    const fxResults = await Promise.allSettled(
      froms.map(async (sym) => {
        const url = `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@${fxDate}/v1/currencies/${sym.toLowerCase()}.min.json`;
        const fx = (await fetchJson(url)) as Record<string, unknown>;
        const table = (fx[sym.toLowerCase()] ?? {}) as Record<string, number>;
        const rate = unitsOfQuotePerBase(table[base]);
        if (rate === null) throw new Error(`нет ${sym}→${data.base}`);
        return {
          sym: sym.toUpperCase(),
          rate,
          marketTime: typeof fx.date === "string" ? fx.date : date,
        };
      }),
    );
    const fxOk = fxResults.filter((r): r is PromiseFulfilledResult<{ sym: string; rate: number; marketTime: string }> => r.status === "fulfilled");
    if (fxOk.length === 0) {
      const firstErr = fxResults.find((r) => r.status === "rejected") as PromiseRejectedResult | undefined;
      const msg = firstErr?.reason instanceof Error ? firstErr.reason.message : "сеть";
      return { ok: false, error: `Курсы валют недоступны: ${msg}` };
    }
    for (const r of fxOk) {
      quotes.push({
        id: `fx:${r.value.sym}:${data.base}`,
        asset: r.value.sym,
        base: r.value.sym,
        quote: data.base,
        unit: "fx",
        rate: String(r.value.rate),
        marketTime: r.value.marketTime,
        fetchedAt,
        source: "fawazahmed0/currency-api (jsDelivr) — 1 единица исходной валюты в базовой",
        status: isToday ? "live" : "historical",
      });
    }

    if (isToday) {
      try {
        const [xau, xag] = await Promise.all([
          fetchJson("https://api.gold-api.com/price/XAU") as Promise<{ price?: number; updatedAt?: string }>,
          fetchJson("https://api.gold-api.com/price/XAG") as Promise<{ price?: number; updatedAt?: string }>,
        ]);
        const usdPerOzAu = xau.price;
        const usdPerOzAg = xag.price;
        const usdToBase =
          data.base === "USD"
            ? 1
            : Number(quotes.find((q) => q.asset === "USD" && q.quote === data.base)?.rate ?? NaN);
        if (usdPerOzAu && usdToBase && Number.isFinite(usdToBase) && usdToBase > 0) {
          const perG = (usdPerOzAu / TROY) * usdToBase;
          quotes.push({
            id: `metal:gold:${data.base}`,
            asset: "XAU_G",
            base: "XAU",
            quote: data.base,
            unit: "g",
            rate: perG.toFixed(6),
            marketTime: xau.updatedAt ?? fetchedAt,
            fetchedAt,
            source: "gold-api.com XAU/oz ÷ 31.1034768 г",
            status: "live",
          });
        }
        if (usdPerOzAg && usdToBase && Number.isFinite(usdToBase) && usdToBase > 0) {
          const perG = (usdPerOzAg / TROY) * usdToBase;
          quotes.push({
            id: `metal:silver:${data.base}`,
            asset: "XAG_G",
            base: "XAG",
            quote: data.base,
            unit: "g",
            rate: perG.toFixed(6),
            marketTime: xag.updatedAt ?? fetchedAt,
            fetchedAt,
            source: "gold-api.com XAG/oz ÷ 31.1034768 г",
            status: "live",
          });
        }
      } catch {
        /* metals optional — do not zero the rest */
      }
    } else {
      /* historical metals: gold-api has no archive here. Do not silently use today's price. */
    }

    if (data.cryptoIds.length && isToday) {
      try {
        const ids = data.cryptoIds.slice(0, 20).join(",");
        const vs = data.base.toLowerCase();
        const url = `https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(ids)}&vs_currencies=${encodeURIComponent(vs)}`;
        const cg = (await fetchJson(url)) as Record<string, Record<string, number>>;
        for (const id of data.cryptoIds) {
          const rate = cg[id]?.[vs];
          if (typeof rate === "number") {
            quotes.push({
              id: `crypto:${id}:${data.base}`,
              asset: id,
              base: id,
              quote: data.base,
              unit: "price",
              rate: String(rate),
              marketTime: fetchedAt,
              fetchedAt,
              source: "CoinGecko simple/price",
              status: "live",
            });
          }
        }
      } catch {
        /* optional */
      }
    }

    return {
      ok: true,
      snapshot: { asOfDate: date, fetchedAt, quotes },
    };
  });
