/**
 * Livestock tables.
 * Sheep & camels: Sahih al-Bukhari 1454 (letter of Abu Bakr).
 * Cattle: Sunan Abi Dawud 1576 / al-Tirmidhi 623 (Muʿādh, Yemen) — not Bukhari 1454.
 * Heads are never added into a money total. Cash substitute is a separate, profile-gated valuation.
 */

export type AnimalKind =
  | "sheep"
  | "camel_bint_makhad"
  | "camel_bint_labun"
  | "camel_hiqqa"
  | "camel_jadhah"
  | "cattle_tabi"
  | "cattle_musinna";

export interface AnimalDue {
  kind: AnimalKind;
  count: number;
  labelRu: string;
}

export interface LivestockBracket {
  due: AnimalDue[];
  alternatives?: AnimalDue[][];
  ruleId: string;
  range: string;
}

function d(kind: AnimalKind, count: number, labelRu: string): AnimalDue {
  return { kind, count, labelRu };
}

function empty(ruleId: string, range: string): LivestockBracket {
  return { due: [], ruleId, range };
}

/** Sheep / goats (ghanam). 40–120 inclusive = 1 sheep. 120 is NOT 2 or 3. */
export function sheepZakat(n: number): LivestockBracket {
  if (!Number.isInteger(n) || n < 0) {
    throw new Error("sheep: integer >= 0 required");
  }
  if (n < 40) return empty("rule.sheep.bukhari1454", "0–39");
  if (n <= 120) {
    return {
      due: [d("sheep", 1, "1 овца")],
      ruleId: "rule.sheep.bukhari1454",
      range: "40–120",
    };
  }
  if (n <= 200) {
    return {
      due: [d("sheep", 2, "2 овцы")],
      ruleId: "rule.sheep.bukhari1454",
      range: "121–200",
    };
  }
  if (n <= 300) {
    return {
      due: [d("sheep", 3, "3 овцы")],
      ruleId: "rule.sheep.bukhari1454",
      range: "201–300",
    };
  }
  const count = Math.floor(n / 100);
  return {
    due: [d("sheep", count, `${count} овец`)],
    ruleId: "rule.sheep.bukhari1454",
    range: `≥301 (по 1 на каждые 100; ${n} → ${count})`,
  };
}

function camelCombo(n: number): { h: number; b: number; v: number }[] {
  const found: { h: number; b: number; v: number }[] = [];
  for (let h = 0; h <= Math.floor(n / 50) + 1; h++) {
    for (let b = 0; b <= Math.floor(n / 40) + 1; b++) {
      const v = 50 * h + 40 * b;
      if (v >= 120 && n >= v && n <= v + 9) found.push({ h, b, v });
    }
  }
  found.sort((a, c) => c.v - a.v);
  const bestV = found[0]?.v;
  return found.filter((x) => x.v === bestV);
}

function camelLabel(h: number, b: number): AnimalDue[] {
  const items: AnimalDue[] = [];
  if (b) items.push(d("camel_bint_labun", b, `${b} бинт лабун (2 года)`));
  if (h) items.push(d("camel_hiqqa", h, `${h} хикка (3 года)`));
  return items;
}

export function camelZakat(n: number): LivestockBracket {
  if (!Number.isInteger(n) || n < 0) throw new Error("camels: integer >= 0 required");
  const ruleId = "rule.camel.bukhari1454";
  if (n < 5) return empty(ruleId, "0–4");
  if (n <= 9) return { due: [d("sheep", 1, "1 овца")], ruleId, range: "5–9" };
  if (n <= 14) return { due: [d("sheep", 2, "2 овцы")], ruleId, range: "10–14" };
  if (n <= 19) return { due: [d("sheep", 3, "3 овцы")], ruleId, range: "15–19" };
  if (n <= 24) return { due: [d("sheep", 4, "4 овцы")], ruleId, range: "20–24" };
  if (n <= 35) {
    return { due: [d("camel_bint_makhad", 1, "1 бинт махад (1 год)")], ruleId, range: "25–35" };
  }
  if (n <= 45) {
    return { due: [d("camel_bint_labun", 1, "1 бинт лабун (2 года)")], ruleId, range: "36–45" };
  }
  if (n <= 60) return { due: [d("camel_hiqqa", 1, "1 хикка (3 года)")], ruleId, range: "46–60" };
  if (n <= 75) return { due: [d("camel_jadhah", 1, "1 джазаʿ (4 года)")], ruleId, range: "61–75" };
  if (n <= 90) {
    return { due: [d("camel_bint_labun", 2, "2 бинт лабун (2 года)")], ruleId, range: "76–90" };
  }
  if (n <= 120) return { due: [d("camel_hiqqa", 2, "2 хикки (3 года)")], ruleId, range: "91–120" };

  const combos = camelCombo(n);
  if (combos.length === 0) {
    const h = Math.floor(n / 50);
    const rest = n - h * 50;
    const b = Math.floor(rest / 40);
    return {
      due: camelLabel(h, b),
      ruleId,
      range: `>${120} (комбинация 40/50)`,
    };
  }
  const primary = camelLabel(combos[0].h, combos[0].b);
  const alts = combos.slice(1).map((c) => camelLabel(c.h, c.b));
  return {
    due: primary,
    alternatives: alts.length ? alts : undefined,
    ruleId,
    range: `${combos[0].v}–${combos[0].v + 9}`,
  };
}

function cattleCombo(n: number): { t: number; m: number; v: number }[] {
  const found: { t: number; m: number; v: number }[] = [];
  for (let m = 0; m <= Math.floor(n / 40) + 1; m++) {
    for (let t = 0; t <= Math.floor(n / 30) + 1; t++) {
      const v = 30 * t + 40 * m;
      if (v >= 30 && n >= v && n < v + 10) found.push({ t, m, v });
    }
  }
  found.sort((a, c) => c.v - a.v);
  const bestV = found[0]?.v;
  return found.filter((x) => x.v === bestV);
}

function cattleLabel(t: number, m: number): AnimalDue[] {
  const items: AnimalDue[] = [];
  if (t) items.push(d("cattle_tabi", t, `${t} табиʿ / табиʿа (1 год)`));
  if (m) items.push(d("cattle_musinna", m, `${m} мусинна (2 года)`));
  return items;
}

export function cattleZakat(n: number): LivestockBracket {
  if (!Number.isInteger(n) || n < 0) throw new Error("cattle: integer >= 0 required");
  const ruleId = "rule.cattle.abudawud1576";
  if (n < 30) return empty(ruleId, "0–29");
  if (n < 40) {
    return { due: [d("cattle_tabi", 1, "1 табиʿ / табиʿа (1 год)")], ruleId, range: "30–39" };
  }
  if (n < 60) {
    return { due: [d("cattle_musinna", 1, "1 мусинна (2 года)")], ruleId, range: "40–59" };
  }
  const combos = cattleCombo(n);
  if (combos.length === 0) {
    return { due: cattleLabel(Math.floor(n / 30), 0), ruleId, range: `≥60` };
  }
  const primary = cattleLabel(combos[0].t, combos[0].m);
  const alts = combos.slice(1).map((c) => cattleLabel(c.t, c.m));
  return {
    due: primary,
    alternatives: alts.length ? alts : undefined,
    ruleId,
    range: `${combos[0].v}–${combos[0].v + 9}`,
  };
}
