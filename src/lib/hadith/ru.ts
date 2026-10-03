import { createServerFn } from "@tanstack/react-start";

const cache = new Map<string, string>();

async function piece(q: string): Promise<string> {
  const hit = cache.get(q);
  if (hit) return hit;
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=ru&dt=t&q=${encodeURIComponent(q)}`;
  const r = await fetch(url);
  if (!r.ok) throw new Error("translate");
  const data = (await r.json()) as Array<Array<[string]>>;
  const text = (data[0] ?? []).map((row) => row[0] ?? "").join("").trim();
  if (!text) throw new Error("empty");
  cache.set(q, text);
  return text;
}

function chunks(s: string): string[] {
  const out: string[] = [];
  let rest = s.replace(/\s+/g, " ").trim();
  while (rest.length > 420) {
    const window = rest.slice(0, 420);
    let cut = Math.max(window.lastIndexOf(". "), window.lastIndexOf("! "), window.lastIndexOf("? "));
    if (cut < 160) cut = 420;
    out.push(rest.slice(0, cut + 1).trim());
    rest = rest.slice(cut + 1).trim();
  }
  if (rest) out.push(rest);
  return out;
}

export const translateEnRu = createServerFn({ method: "POST" })
  .validator((input: { text: string }) => input)
  .handler(async ({ data }) => {
    const text = data.text.replace(/\s+/g, " ").trim().slice(0, 4000);
    if (!text) return { ok: false as const, text: "" };
    try {
      const parts = [];
      for (const bit of chunks(text)) parts.push(await piece(bit));
      return { ok: true as const, text: parts.join(" ") };
    } catch {
      return { ok: false as const, text: "" };
    }
  });
