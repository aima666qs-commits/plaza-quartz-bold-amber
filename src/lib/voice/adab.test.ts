import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { markSalawat, speakPrep, SALAWAT_GLYPH, SALAWAT_AR, SALAWAT_RU } from "./adab.ts";

describe("markSalawat", () => {
  it("adds ﷺ after Посланник Аллаха", () => {
    const s = markSalawat("Посланник Аллаха сказал");
    assert.match(s, /Посланник Аллаха ﷺ сказал/);
  });

  it("does not double the mark", () => {
    const once = markSalawat("Посланник Аллаха сказал");
    const twice = markSalawat(once);
    assert.equal(twice, once);
    assert.equal([...twice.matchAll(/ﷺ/g)].length, 1);
  });

  it("honors Мухаммад but not Абу Мухаммад", () => {
    const s = markSalawat("О Мухаммад, поведай. Абу Мухаммада аль-Хасана, внука Посланника Аллаха");
    assert.match(s, /О Мухаммад ﷺ,/);
    assert.match(s, /Абу Мухаммада аль-Хасана/);
    assert.doesNotMatch(s, /Абу Мухаммада ﷺ/);
    assert.match(s, /Посланника Аллаха ﷺ/);
  });

  it("skips plural prophets", () => {
    const s = markSalawat("разногласие с их пророками и пророческой вести");
    assert.equal(s.includes(SALAWAT_GLYPH), false);
  });

  it("adds after singular Пророк", () => {
    const s = markSalawat("Он сел к Пророку, прижал колени");
    assert.match(s, /Пророку ﷺ,/);
  });

  it("keeps existing ﷺ on the Prophet", () => {
    const s = markSalawat("Посланник Аллаха ﷺ сказал");
    assert.equal(s, "Посланник Аллаха ﷺ сказал");
  });

  it("adds Arabic salawat after رسول الله", () => {
    const s = markSalawat("أن رسول الله قال", "ar");
    assert.match(s, new RegExp(`رسول الله ${SALAWAT_AR}`));
  });
});

describe("speakPrep", () => {
  it("says the salawat in full, not the glyph", () => {
    const s = speakPrep("Посланник Аллаха сказал");
    assert.match(s, new RegExp(SALAWAT_RU.replace(/́/g, "́?")));
    assert.equal(s.includes("ﷺ"), false);
    assert.match(s, /Посланник Алла́ха/);
  });

  it("does not flatten Хаттаб to Хатаба", () => {
    const s = speakPrep("Умара ибн аль-Хаттаба, да будет доволен им Аллах");
    assert.match(s, /Хат-та́ба/);
    assert.doesNotMatch(s, /аль-Хатаба/);
    assert.doesNotMatch(s, /(?<!т-)Хатаба/);
  });

  it("geminates Мухаммад", () => {
    const s = speakPrep("О Мухаммад, поведай");
    assert.match(s, /Муха́м-мад/);
    assert.match(s, new RegExp(SALAWAT_RU));
  });

  it("Arabic speech expands to Arabic salawat", () => {
    const s = speakPrep("قال رسول الله", "ar");
    assert.match(s, new RegExp(SALAWAT_AR));
  });
});
