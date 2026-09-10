import { createServerFn } from "@tanstack/react-start";

export type SourcePing = {
  id: string;
  label: string;
  url: string;
  ok: boolean;
  ms: number;
  detail: string;
};

async function ping(url: string, ms = 8000): Promise<{ ok: boolean; ms: number; detail: string }> {
  const started = Date.now();
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    const res = await fetch(url, { signal: ctrl.signal, headers: { accept: "application/json" } });
    const took = Date.now() - started;
    if (!res.ok) return { ok: false, ms: took, detail: `HTTP ${res.status}` };
    return { ok: true, ms: took, detail: "ответ получен" };
  } catch (e) {
    return { ok: false, ms: Date.now() - started, detail: e instanceof Error ? e.message : "сеть" };
  } finally {
    clearTimeout(t);
  }
}

const TARGETS: { id: string; label: string; url: string }[] = [
  {
    id: "quran.uthmani",
    label: "Коран · усмани",
    url: "https://api.alquran.cloud/v1/ayah/1:1/quran-uthmani",
  },
  {
    id: "quran.kuliev",
    label: "Коран · Кулиев",
    url: "https://api.alquran.cloud/v1/ayah/1:1/ru.kuliev",
  },
  {
    id: "hisn.index",
    label: "Хисн · hisnmuslim.com",
    url: "https://www.hisnmuslim.com/api/ar/husn_ar.json",
  },
  {
    id: "qwen.ovh",
    label: "Qwen · OVH",
    url: "https://oai.endpoints.kepler.ai.cloud.ovh.net/v1/models",
  },
  {
    id: "fx.usd",
    label: "Курсы · fawazahmed0",
    url: "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.min.json",
  },
];

export const pingOfficialSources = createServerFn({ method: "POST" })
  .validator(() => ({}) as Record<string, never>)
  .handler(async () => {
    const checkedAt = new Date().toISOString();
    const results = await Promise.all(TARGETS.map(async (t) => ({ id: t.id, label: t.label, url: t.url, ...(await ping(t.url)) })));
    return { checkedAt, items: results };
  });

export const fetchOfficialAyah = createServerFn({ method: "POST" })
  .validator((input: { surah: number; ayah: number }) => input)
  .handler(async ({ data }) => {
    const ref = `${data.surah}:${data.ayah}`;
    const url = `https://api.alquran.cloud/v1/ayah/${ref}/editions/quran-uthmani,ru.kuliev`;
    const started = Date.now();
    try {
      const res = await fetch(url, { headers: { accept: "application/json" } });
      const ms = Date.now() - started;
      if (!res.ok) return { ok: false as const, ms, error: `alquran.cloud ${res.status}` };
      const body = (await res.json()) as {
        data?: { text?: string; edition?: { identifier?: string; englishName?: string } }[];
      };
      const rows = body.data ?? [];
      const uthmani = rows.find((r) => r.edition?.identifier === "quran-uthmani")?.text?.replace(/^\uFEFF/, "") ?? "";
      const kuliev = rows.find((r) => r.edition?.identifier === "ru.kuliev")?.text ?? "";
      if (!uthmani || !kuliev) return { ok: false as const, ms, error: "пустой ответ издания" };
      return {
        ok: true as const,
        ms,
        ref,
        uthmani,
        kuliev,
        source: "https://alquran.cloud · editions quran-uthmani, ru.kuliev",
      };
    } catch (e) {
      return { ok: false as const, ms: Date.now() - started, error: e instanceof Error ? e.message : "сеть" };
    }
  });
