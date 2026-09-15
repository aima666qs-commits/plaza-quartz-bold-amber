/** Fixed-point decimal with 8 fractional digits. Money, mass and rates share this representation; units live on the value object. */

export const SCALE = 8;
export const FACTOR = 10n ** BigInt(SCALE);

export type Qty = bigint;

export const Q0: Qty = 0n;

export class DecimalError extends Error {
  code: string;
  constructor(message: string, code: string) {
    super(message);
    this.name = "DecimalError";
    this.code = code;
  }
}

function fail(code: string, message: string): never {
  throw new DecimalError(message, code);
}

export function qInt(n: number | bigint): Qty {
  if (typeof n === "bigint") return n * FACTOR;
  if (!Number.isFinite(n) || !Number.isInteger(n)) fail("not_int", "Ожидалось целое число");
  return BigInt(n) * FACTOR;
}

export function qRatio(num: bigint | number, den: bigint | number): Qty {
  const n = typeof num === "bigint" ? num : BigInt(num);
  const d = typeof den === "bigint" ? den : BigInt(den);
  if (d === 0n) fail("div0", "Деление на ноль");
  return (n * FACTOR) / d;
}

export type ParseOk = { ok: true; qty: Qty; normalized: string };
export type ParseErr = { ok: false; error: string; code: string };
export type ParseResult = ParseOk | ParseErr;

const SPACE_RE = /[\s\u00a0\u202f\u2009\u2007\u00ad]/g;

/**
 * Accepts Russian (1 000,50) and English (1,000.50) grouping without treating
 * a missing value as 0. Empty → error. Scientific notation rejected.
 */
export function parseDecimal(
  raw: string | number | null | undefined,
  opts: { allowNegative?: boolean; field?: string } = {},
): ParseResult {
  const field = opts.field ?? "значение";
  if (raw === null || raw === undefined) {
    return { ok: false, code: "empty", error: `Поле «${field}» не заполнено` };
  }
  if (typeof raw === "number") {
    if (!Number.isFinite(raw)) {
      return { ok: false, code: "nonfinite", error: `Поле «${field}» не является конечным числом` };
    }
    return parseDecimal(String(raw), opts);
  }
  let s = String(raw).trim().replace(SPACE_RE, "");
  if (s === "") return { ok: false, code: "empty", error: `Поле «${field}» не заполнено` };
  if (/[eE]/.test(s)) {
    return { ok: false, code: "scientific", error: `Поле «${field}»: научная запись не принимается` };
  }
  if (s === "+" || s === "-" || s === "." || s === "," || s === "-." || s === "-,") {
    return { ok: false, code: "invalid", error: `Поле «${field}»: некорректное число` };
  }

  let neg = false;
  if (s.startsWith("-")) {
    neg = true;
    s = s.slice(1);
  } else if (s.startsWith("+")) {
    s = s.slice(1);
  }
  if (neg && !opts.allowNegative) {
    return { ok: false, code: "negative", error: `Поле «${field}»: отрицательное значение недопустимо` };
  }

  const lastComma = s.lastIndexOf(",");
  const lastDot = s.lastIndexOf(".");
  let decimalSep: "," | "." | null = null;
  if (lastComma >= 0 && lastDot >= 0) {
    decimalSep = lastComma > lastDot ? "," : ".";
  } else if (lastComma >= 0) {
    const after = s.length - lastComma - 1;
    /* 1 000,50 → decimal; 1,000 → grouping; 185,664236 → decimal rate */
    decimalSep = after > 0 && after !== 3 && after <= SCALE ? "," : after > 0 && after <= 2 ? "," : null;
  } else if (lastDot >= 0) {
    const after = s.length - lastDot - 1;
    /* 12164.999887 (live gold) is a decimal, not thousands grouping */
    decimalSep = after > 0 && after <= SCALE ? "." : after > SCALE ? "." : null;
  }

  let intPart: string;
  let fracPart: string;
  if (decimalSep) {
    const i = s.lastIndexOf(decimalSep);
    const head = s.slice(0, i);
    const tail = s.slice(i + 1);
    if (/[.,]/.test(tail)) {
      return { ok: false, code: "invalid", error: `Поле «${field}»: лишний десятичный разделитель` };
    }
    intPart = head.replace(/[.,]/g, "");
    fracPart = tail;
  } else {
    intPart = s.replace(/[.,]/g, "");
    fracPart = "";
  }

  if (intPart === "") intPart = "0";
  if (!/^\d+$/.test(intPart) || (fracPart !== "" && !/^\d+$/.test(fracPart))) {
    return { ok: false, code: "invalid", error: `Поле «${field}»: некорректное число` };
  }
  if (intPart.length > 16) {
    return { ok: false, code: "too_large", error: `Поле «${field}»: слишком большое число` };
  }

  if (fracPart.length > SCALE) {
    const extra = fracPart.slice(SCALE);
    fracPart = fracPart.slice(0, SCALE);
    const roundUp = extra[0] && extra[0] >= "5";
    if (roundUp) {
      const bumped = BigInt(intPart + fracPart) + 1n;
      const padded = bumped.toString().padStart(SCALE + 1, "0");
      intPart = padded.slice(0, padded.length - SCALE) || "0";
      fracPart = padded.slice(padded.length - SCALE);
    }
  }

  fracPart = fracPart.padEnd(SCALE, "0").slice(0, SCALE);
  const units = BigInt(intPart) * FACTOR + BigInt(fracPart);
  if (neg && units === 0n) {
    /* keep +0 */
  }
  const qty = neg ? -units : units;
  return { ok: true, qty, normalized: formatPlain(qty) };
}

export function add(a: Qty, b: Qty): Qty {
  return a + b;
}
export function sub(a: Qty, b: Qty): Qty {
  return a - b;
}
export function neg(a: Qty): Qty {
  return -a;
}
export function cmp(a: Qty, b: Qty): number {
  return a < b ? -1 : a > b ? 1 : 0;
}
export function isZero(a: Qty): boolean {
  return a === 0n;
}
export function abs(a: Qty): Qty {
  return a < 0n ? -a : a;
}
export function minQ(a: Qty, b: Qty): Qty {
  return a < b ? a : b;
}
export function maxQ(a: Qty, b: Qty): Qty {
  return a > b ? a : b;
}

/** a * b / FACTOR (both scaled). */
export function mul(a: Qty, b: Qty): Qty {
  return (a * b) / FACTOR;
}

/** a * num / den, all exact. */
export function mulRatio(a: Qty, num: bigint | number, den: bigint | number): Qty {
  const n = typeof num === "bigint" ? num : BigInt(num);
  const d = typeof den === "bigint" ? den : BigInt(den);
  if (d === 0n) fail("div0", "Деление на ноль");
  const prod = a * n;
  const q = prod / d;
  const r = prod % d;
  const twice = r < 0n ? -r * 2n : r * 2n;
  const ad = d < 0n ? -d : d;
  if (twice > ad || (twice === ad && q % 2n !== 0n)) {
    return q + (prod < 0n !== d < 0n ? -1n : 1n);
  }
  return q;
}

export function pct(a: Qty, percent: Qty): Qty {
  return mulRatio(a, percent, qInt(100));
}

/** Half-up to `decimals` fractional digits (default 2 for money). */
export function roundTo(a: Qty, decimals = 2): Qty {
  if (decimals < 0 || decimals > SCALE) fail("scale", "Неверный порядок округления");
  const drop = SCALE - decimals;
  const div = 10n ** BigInt(drop);
  const sign = a < 0n ? -1n : 1n;
  const v = a < 0n ? -a : a;
  const q = v / div;
  const r = v % div;
  const bump = r * 2n >= div ? 1n : 0n;
  return (q + bump) * div * sign;
}

export function formatPlain(a: Qty, decimals = SCALE): string {
  const sign = a < 0n ? "-" : "";
  const v = a < 0n ? -a : a;
  const int = v / FACTOR;
  const frac = (v % FACTOR).toString().padStart(SCALE, "0").slice(0, decimals);
  if (decimals === 0) return `${sign}${int.toString()}`;
  const trimmed = frac.replace(/0+$/, "");
  return trimmed ? `${sign}${int.toString()}.${trimmed}` : `${sign}${int.toString()}`;
}

export function formatFixed(a: Qty, decimals = 2): string {
  const rounded = roundTo(a, decimals);
  const sign = rounded < 0n ? "-" : "";
  const v = rounded < 0n ? -rounded : rounded;
  const int = v / FACTOR;
  const frac = (v % FACTOR).toString().padStart(SCALE, "0").slice(0, decimals);
  return `${sign}${int.toString()}.${frac}`;
}

export function formatMoney(a: Qty, currency: string, locale = "ru-RU"): string {
  const rounded = roundTo(a, currencyDecimals(currency));
  const sign = rounded < 0n ? -1 : 1;
  const v = rounded < 0n ? -rounded : rounded;
  const int = v / FACTOR;
  const dec = currencyDecimals(currency);
  const frac = (v % FACTOR).toString().padStart(SCALE, "0").slice(0, dec);
  const n = Number(`${int.toString()}.${frac || "0"}`) * sign;
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      minimumFractionDigits: dec,
      maximumFractionDigits: dec,
    }).format(n);
  } catch {
    return `${formatFixed(rounded, dec)} ${currency}`;
  }
}

export function currencyDecimals(code: string): number {
  const zero = new Set(["JPY", "KRW", "VND", "CLP"]);
  if (zero.has(code.toUpperCase())) return 0;
  return 2;
}

export function toNumberApprox(a: Qty): number {
  return Number(a) / Number(FACTOR);
}

export function requireQty(raw: string | number | null | undefined, field: string): ParseResult {
  return parseDecimal(raw, { field });
}

/** Whole non-negative count (people, heads of livestock). */
export function parseCount(raw: string | number | null | undefined, field: string): ParseResult & { count?: number } {
  const p = parseDecimal(raw, { field });
  if (!p.ok) return p;
  if (p.qty < 0n) return { ok: false, code: "negative", error: `Поле «${field}»: отрицательное значение недопустимо` };
  if (p.qty % FACTOR !== 0n) {
    return { ok: false, code: "not_int", error: `Поле «${field}»: требуется целое число` };
  }
  const count = Number(p.qty / FACTOR);
  if (!Number.isSafeInteger(count)) {
    return { ok: false, code: "too_large", error: `Поле «${field}»: слишком большое число` };
  }
  return { ...p, count };
}
