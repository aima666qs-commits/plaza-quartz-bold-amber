import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { paintText, paintWord, wordBeats, wordRule } from "./tajweed.ts";

function rulesOf(s: string, next = "") {
  return paintWord(s, next).map((p) => `${p.text}:${p.rule}`);
}

function hasRule(s: string, rule: string, next = "") {
  return paintWord(s, next).some((p) => p.rule === rule);
}

describe("tajweed karaoke", () => {
  it("izhar: noon sakin + throat", () => {
    assert.equal(true, hasRule("أَنْعَمْتَ", "izhar"));
  });

  it("ikhfa: noon sakin + sīn", () => {
    assert.equal(true, hasRule("مِنْ", "ikhfa", "سَيْءٍ") || hasRule("إِنسَانَ", "ikhfa") || paintText("مِن سِرٍّ").some((p) => p.rule === "ikhfa"));
  });

  it("idgham without ghunna: noon + ra", () => {
    const p = paintText("مِن رَّبِّهِمْ");
    assert.equal(true, p.some((x) => x.rule === "idghamNo"));
  });

  it("idgham with ghunna: noon + ya", () => {
    const p = paintText("مَن يَعْمَلْ");
    assert.equal(true, p.some((x) => x.rule === "idgham"));
  });

  it("iqlab: noon + ba", () => {
    const p = paintText("مِن بَعْدِ");
    assert.equal(true, p.some((x) => x.rule === "iqlab"));
  });

  it("ghunna on nun with shadda", () => {
    assert.equal(true, hasRule("إِنَّ", "ghunna"));
  });

  it("qalqala on qutub jad with sukun", () => {
    assert.equal(true, hasRule("يَلِدْ", "qalqala"));
  });

  it("wasl is silent", () => {
    const p = paintText("بِسْمِ ٱللَّهِ");
    assert.equal(true, p.some((x) => x.text.startsWith("ٱ") && x.rule === "silent"));
  });

  it("madd lazim on maddah", () => {
    const p = paintText("الضَّآلِّينَ");
    assert.equal(true, p.some((x) => x.rule === "maddLazim"));
  });

  it("longer beats on madd than on a plain letter", () => {
    const plain = wordBeats("كَتَبَ");
    const madd = wordBeats("قَالَ");
    assert.equal(true, madd > plain);
  });

  it("ikhfa shafawi: meem sakin + ba", () => {
    const p = paintText("هُم بِهِ");
    assert.equal(true, p.some((x) => x.rule === "ikhfaShafawi"));
  });

  it("wordRule keeps one colour so letters join", () => {
    assert.equal(wordRule("إِنَّ"), "ghunna");
    assert.equal(wordRule("يَلِدْ"), "qalqala");
  });
});
