/** Tajweed for karaoke: colour + harakah weight. Hafs ‘an ‘Asim, teaching aid — not an ijazah. */

export type TajweedRule =
  | "none"
  | "izhar"
  | "idgham"
  | "idghamNo"
  | "iqlab"
  | "ikhfa"
  | "ghunna"
  | "ikhfaShafawi"
  | "idghamShafawi"
  | "qalqala"
  | "madd"
  | "maddLazim"
  | "maddTabi"
  | "silent";

export type Painted = { text: string; rule: TajweedRule; beats: number };

export const TAJWEED_LEGEND: { id: TajweedRule; ru: string; color: string }[] = [
  { id: "ghunna", ru: "гунна", color: "#3ecf8e" },
  { id: "ikhfa", ru: "ихфа", color: "#3ecf8e" },
  { id: "idgham", ru: "идгам", color: "#3ecf8e" },
  { id: "iqlab", ru: "икляб", color: "#2bbbad" },
  { id: "ikhfaShafawi", ru: "ихфа шафави", color: "#3ecf8e" },
  { id: "qalqala", ru: "калькаля", color: "#5b8cff" },
  { id: "madd", ru: "мадд 4–5", color: "#e24b4b" },
  { id: "maddLazim", ru: "мадд лязим 6", color: "#ff6b4a" },
  { id: "silent", ru: "не читается", color: "#7a7a7a" },
  { id: "idghamNo", ru: "идгам без гунны", color: "#7a7a7a" },
];

export const TAJWEED_KARAOKE_KEY = [
  { ru: "гунна · ихфа · идгам", color: "#3ecf8e" },
  { ru: "икляб", color: "#2bbbad" },
  { ru: "калькаля", color: "#5b8cff" },
  { ru: "мадд 4–6", color: "#e24b4b" },
  { ru: "не читается", color: "#7a7a7a" },
];

type Cluster = {
  letter: string;
  marks: string;
  space: boolean;
  raw: string;
};

const MARK = /[\u064B-\u065F\u0670\u06D6-\u06ED\u08D3-\u08FF\u0640]/;
const LETTER = /[\u0621-\u063A\u0641-\u064A\u0671]/;

const IZHAR = new Set(["ء", "ه", "ع", "ح", "غ", "خ"]);
const IDGHAM_G = new Set(["ي", "ن", "م", "و"]);
const IDGHAM_N = new Set(["ل", "ر"]);
const IQLAB = new Set(["ب"]);
const IKHFA = new Set(["ت", "ث", "ج", "د", "ذ", "ز", "س", "ش", "ص", "ض", "ط", "ظ", "ف", "ق", "ك"]);
const QALQALA = new Set(["ق", "ط", "ب", "ج", "د"]);
const SHAMSI = new Set(["ت", "ث", "د", "ذ", "ر", "ز", "س", "ش", "ص", "ض", "ط", "ظ", "ل", "ن"]);
const MADD = new Set(["ا", "ى", "و", "ي"]);

const SUKUN = "\u0652";
const SHADDA = "\u0651";
const FATHA = "\u064E";
const DAMMA = "\u064F";
const KASRA = "\u0650";
const TANWEEN = /[\u064B\u064C\u064D]/;
const MADDAH = "\u0653";
const WASL = "ٱ";

export function baseLetter(ch: string): string {
  if ("أإآؤئٱ".includes(ch)) return "ء";
  if (ch === "ى") return "ي";
  if (ch === "ة") return "ه";
  return ch;
}

function isLetter(ch: string) {
  return LETTER.test(ch);
}

function tokenize(text: string): Cluster[] {
  const out: Cluster[] = [];
  let i = 0;
  while (i < text.length) {
    const ch = text[i] ?? "";
    if (ch === " " || ch === "\n" || ch === "\u00a0") {
      out.push({ letter: " ", marks: "", space: true, raw: " " });
      i += 1;
      continue;
    }
    if (isLetter(ch)) {
      let marks = "";
      i += 1;
      while (i < text.length && MARK.test(text[i] ?? "")) {
        marks += text[i];
        i += 1;
      }
      out.push({ letter: ch, marks, space: false, raw: ch + marks });
      continue;
    }
    if (MARK.test(ch)) {
      if (out.length && !out[out.length - 1].space) out[out.length - 1].marks += ch;
      i += 1;
      continue;
    }
    out.push({ letter: ch, marks: "", space: false, raw: ch });
    i += 1;
  }
  return out;
}

function has(c: Cluster, mark: string) {
  return c.marks.includes(mark);
}

function hasTanween(c: Cluster) {
  return TANWEEN.test(c.marks);
}

function isSakin(c: Cluster) {
  if (has(c, SUKUN)) return true;
  if (hasTanween(c) || has(c, FATHA) || has(c, DAMMA) || has(c, KASRA) || has(c, SHADDA)) return false;
  if ("اآىٱووي".includes(c.letter)) return false;
  return isLetter(c.letter);
}

function nextLetter(cs: Cluster[], i: number): Cluster | null {
  for (let k = i + 1; k < cs.length; k++) {
    const c = cs[k];
    if (c.space) continue;
    if (c.letter === WASL) continue;
    if (!isLetter(c.letter)) continue;
    return c;
  }
  return null;
}

function prevLetter(cs: Cluster[], i: number): Cluster | null {
  for (let k = i - 1; k >= 0; k--) {
    const c = cs[k];
    if (c.space) continue;
    if (!isLetter(c.letter)) continue;
    return c;
  }
  return null;
}

function beatsFor(rule: TajweedRule): number {
  if (rule === "maddLazim") return 6;
  if (rule === "madd") return 4;
  if (rule === "maddTabi") return 2;
  if (rule === "ghunna" || rule === "ikhfa" || rule === "idgham" || rule === "iqlab" || rule === "ikhfaShafawi" || rule === "idghamShafawi") return 2;
  if (rule === "qalqala") return 1.4;
  if (rule === "silent" || rule === "idghamNo") return 0.2;
  return 1;
}

function noonRule(next: Cluster | null): TajweedRule {
  if (!next) return "none";
  const n = baseLetter(next.letter);
  if (IZHAR.has(n)) return "izhar";
  if (IQLAB.has(n) || next.marks.includes("\u06E2")) return "iqlab";
  if (IDGHAM_G.has(n)) return "idgham";
  if (IDGHAM_N.has(n)) return "idghamNo";
  if (IKHFA.has(n)) return "ikhfa";
  return "none";
}

function meemRule(next: Cluster | null): TajweedRule {
  if (!next) return "none";
  const n = baseLetter(next.letter);
  if (n === "ب") return "ikhfaShafawi";
  if (n === "م") return "idghamShafawi";
  return "none";
}

function maddKind(cs: Cluster[], i: number): TajweedRule | null {
  const c = cs[i];
  if (has(c, MADDAH)) return "maddLazim";
  if (c.marks.includes("\u0670")) {
    const nxt = nextLetter(cs, i);
    if (nxt && baseLetter(nxt.letter) === "ء") return "madd";
    return "maddTabi";
  }
  const prev = prevLetter(cs, i);
  if (!prev) return null;
  const letter = c.letter;
  const tabi =
    (letter === "ا" && has(prev, FATHA)) ||
    ((letter === "و" || letter === "ۥ") && has(prev, DAMMA) && !has(c, FATHA) && !has(c, KASRA)) ||
    ((letter === "ي" || letter === "ى") && has(prev, KASRA) && !has(c, FATHA) && !has(c, DAMMA));
  if (!tabi) return null;
  const nxt = nextLetter(cs, i);
  if (nxt && baseLetter(nxt.letter) === "ء") return "madd";
  if (nxt && has(nxt, SHADDA) && letter === "ا") return "maddLazim";
  return "maddTabi";
}

export function paintText(text: string): Painted[] {
  const cs = tokenize(text);
  const rules: TajweedRule[] = cs.map(() => "none");

  for (let i = 0; i < cs.length; i++) {
    const c = cs[i];
    if (c.space || !isLetter(c.letter)) continue;
    const nxt = nextLetter(cs, i);
    const b = baseLetter(c.letter);

    if (c.letter === WASL) {
      rules[i] = "silent";
      continue;
    }

    if (c.letter === "آ") {
      rules[i] = "maddLazim";
      continue;
    }

    if ((b === "ن" || b === "م") && has(c, SHADDA)) {
      rules[i] = "ghunna";
    }

    if (b === "ن" && isSakin(c) && !has(c, SHADDA)) {
      rules[i] = noonRule(nxt);
    } else if (hasTanween(c)) {
      const r = noonRule(nxt);
      if (r !== "none") rules[i] = r;
    }

    if (b === "م" && isSakin(c) && !has(c, SHADDA)) {
      const r = meemRule(nxt);
      if (r !== "none") rules[i] = r;
    }

    if (QALQALA.has(b) && (has(c, SUKUN) || (hasTanween(c) && !nxt))) {
      if (rules[i] === "none" || rules[i] === "izhar") rules[i] = "qalqala";
    }

    const m = maddKind(cs, i);
    if (m && m !== "none") rules[i] = m;

    if (c.letter === "ل") {
      const prev = prevLetter(cs, i);
      if (prev && (prev.letter === WASL || prev.letter === "ا" || prev.letter === "أ") && nxt && SHAMSI.has(baseLetter(nxt.letter))) {
        rules[i] = "silent";
      }
    }
  }

  return cs.map((c, i) => ({
    text: c.raw,
    rule: rules[i],
    beats: beatsFor(rules[i]),
  }));
}

export function paintWord(ar: string, next = ""): Painted[] {
  const painted = paintText(next ? `${ar} ${next}` : ar);
  const out: Painted[] = [];
  for (const p of painted) {
    if (p.text === " ") break;
    out.push(p);
  }
  return out;
}

export function wordBeats(ar: string, next = ""): number {
  const parts = paintWord(ar, next);
  const sum = parts.reduce((a, p) => a + Math.max(0.2, p.beats), 0);
  return Math.max(2, sum);
}

const RULE_RANK: TajweedRule[] = [
  "maddLazim",
  "madd",
  "ghunna",
  "ikhfa",
  "idgham",
  "iqlab",
  "ikhfaShafawi",
  "idghamShafawi",
  "qalqala",
  "idghamNo",
  "silent",
  "izhar",
  "maddTabi",
  "none",
];

/** One colour per word so letters stay joined. */
export function wordRule(ar: string, next = ""): TajweedRule {
  const parts = paintWord(ar, next);
  let best: TajweedRule = "none";
  let rank = RULE_RANK.length;
  for (const p of parts) {
    const i = RULE_RANK.indexOf(p.rule);
    if (i >= 0 && i < rank) {
      rank = i;
      best = p.rule;
    }
  }
  return best;
}

export function ruleClass(rule: TajweedRule): string {
  if (rule === "none" || rule === "izhar" || rule === "maddTabi") return "";
  return `tj tj-${rule}`;
}
