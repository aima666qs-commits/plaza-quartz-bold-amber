import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { parseDecimal, formatPlain, formatFixed, Q0 } from "./decimal.ts";
import { sheepZakat, camelZakat, cattleZakat } from "./livestock.ts";
import { calculate, emptyInput } from "./engine.ts";
import type { CalculationInput, Quote } from "./types.ts";

function fx(from: string, to: string, rate: string): Quote {
  return {
    id: `fx:${from}:${to}`,
    asset: from,
    base: from,
    quote: to,
    unit: "fx",
    rate,
    marketTime: "test",
    fetchedAt: "test",
    source: "test",
    status: "manual",
    author: "test",
  };
}

function metal(kind: "gold" | "silver", currency: string, perGram: string): Quote {
  return {
    id: `metal:${kind}:${currency}`,
    asset: kind === "gold" ? "XAU_G" : "XAG_G",
    base: kind,
    quote: currency,
    unit: "g",
    rate: perGram,
    marketTime: "test",
    fetchedAt: "test",
    source: "test",
    status: "manual",
    author: "test",
  };
}

const RUB_QUOTES: Quote[] = [
  metal("gold", "RUB", "5000"),
  metal("silver", "RUB", "80"),
  fx("USD", "RUB", "90"),
  fx("RUB", "USD", "0.01111111"),
];

function base(over: Partial<CalculationInput> = {}): CalculationInput {
  const i = emptyInput({
    id: "t",
    asOfDate: "2026-09-09",
    baseCurrency: "RUB",
    profileId: "islamic-relief-silver",
    hawlConfirmed: true,
    quotes: { asOfDate: "2026-09-09", fetchedAt: "test", quotes: RUB_QUOTES },
    ...over,
  });
  return { ...i, ...over, quotes: over.quotes ?? i.quotes };
}

describe("decimal parse", () => {
  it("parses ru 1 000,50", () => {
    const p = parseDecimal("1 000,50");
    assert.equal(p.ok, true);
    if (p.ok) assert.equal(formatPlain(p.qty), "1000.5");
  });
  it("parses en 1,000.50", () => {
    const p = parseDecimal("1,000.50");
    assert.equal(p.ok, true);
    if (p.ok) assert.equal(formatPlain(p.qty), "1000.5");
  });
  it("empty is not zero", () => {
    const p = parseDecimal("");
    assert.equal(p.ok, false);
  });
  it("rejects negative amounts", () => {
    const p = parseDecimal("-1");
    assert.equal(p.ok, false);
  });
});

describe("sheep brackets Bukhari 1454", () => {
  const cases: [number, number][] = [
    [39, 0],
    [40, 1],
    [120, 1],
    [121, 2],
    [200, 2],
    [201, 3],
    [300, 3],
    [301, 3],
    [399, 3],
    [400, 4],
  ];
  for (const [n, expect] of cases) {
    it(`${n} sheep → ${expect}`, () => {
      const r = sheepZakat(n);
      const got = r.due[0]?.count ?? 0;
      assert.equal(got, expect, `${n} expected ${expect} got ${got}`);
    });
  }
});

describe("camels Bukhari 1454", () => {
  it("4 → none, 5 → 1 sheep", () => {
    assert.equal(camelZakat(4).due.length, 0);
    assert.equal(camelZakat(5).due[0]?.kind, "sheep");
    assert.equal(camelZakat(5).due[0]?.count, 1);
  });
  it("24 → 4 sheep, 25 → bint makhad", () => {
    assert.equal(camelZakat(24).due[0]?.count, 4);
    assert.equal(camelZakat(25).due[0]?.kind, "camel_bint_makhad");
  });
  it("35 makhad, 36 labun, 46 hiqqa, 61 jadhah, 76 2 labun, 91 2 hiqqa", () => {
    assert.equal(camelZakat(35).due[0]?.kind, "camel_bint_makhad");
    assert.equal(camelZakat(36).due[0]?.kind, "camel_bint_labun");
    assert.equal(camelZakat(46).due[0]?.kind, "camel_hiqqa");
    assert.equal(camelZakat(61).due[0]?.kind, "camel_jadhah");
    assert.equal(camelZakat(76).due[0]?.count, 2);
    assert.equal(camelZakat(91).due[0]?.kind, "camel_hiqqa");
    assert.equal(camelZakat(91).due[0]?.count, 2);
  });
  it("120 → 2 hiqqa, 121 → 3 bint labun", () => {
    const a = camelZakat(120);
    assert.equal(a.due[0]?.kind, "camel_hiqqa");
    assert.equal(a.due[0]?.count, 2);
    const b = camelZakat(121);
    const labun = b.due.find((x) => x.kind === "camel_bint_labun");
    assert.equal(labun?.count, 3);
  });
});

describe("cattle Abu Dawud 1576", () => {
  it("29 none, 30 tabi, 39 tabi, 40 musinna, 59 musinna, 60 2 tabi", () => {
    assert.equal(cattleZakat(29).due.length, 0);
    assert.equal(cattleZakat(30).due[0]?.kind, "cattle_tabi");
    assert.equal(cattleZakat(39).due[0]?.kind, "cattle_tabi");
    assert.equal(cattleZakat(40).due[0]?.kind, "cattle_musinna");
    assert.equal(cattleZakat(59).due[0]?.kind, "cattle_musinna");
    const s = cattleZakat(60);
    assert.equal(s.due.find((x) => x.kind === "cattle_tabi")?.count, 2);
  });
  it("120 → 4 tabi with 3 musinna alternative", () => {
    const br = cattleZakat(120);
    assert.equal(br.due.find((x) => x.kind === "cattle_tabi")?.count, 4);
    const alt = br.alternatives?.some((a) => a.some((x) => x.kind === "cattle_musinna" && x.count === 3));
    assert.equal(alt, true);
  });
});

describe("engine scenarios", () => {
  it("100000 at 2.5% → 2500", () => {
    const r = calculate(
      base({
        money: [{ id: "1", label: "cash", currency: "RUB", amount: "100000", ownerSharePct: "100", joint: false }],
      }),
    );
    assert.equal(formatFixed(r.totalMoneyRounded, 2), "2500.00");
    const mal = r.categories.find((c) => c.id === "mal_net");
    assert.equal(mal?.status, "due");
  });

  it("two 50000 equal one 100000", () => {
    const a = calculate(
      base({
        money: [
          { id: "1", label: "a", currency: "RUB", amount: "50000", ownerSharePct: "100", joint: false },
          { id: "2", label: "b", currency: "RUB", amount: "50000", ownerSharePct: "100", joint: false },
        ],
      }),
    );
    const b = calculate(
      base({
        money: [{ id: "1", label: "c", currency: "RUB", amount: "100000", ownerSharePct: "100", joint: false }],
      }),
    );
    assert.equal(a.totalMoneyExact, b.totalMoneyExact);
  });

  it("100 USD at 90 RUB = 9000 RUB base, zakat 225", () => {
    const r = calculate(
      base({
        money: [{ id: "1", label: "usd", currency: "USD", amount: "100", ownerSharePct: "100", joint: false }],
      }),
    );
    const money = r.categories.find((c) => c.id === "money");
    assert.equal(formatFixed(money?.baseMoney ?? Q0, 2), "9000.00");
  });

  it("missing FX does not treat asset as zero-free", () => {
    const r = calculate(
      base({
        money: [{ id: "1", label: "eur", currency: "EUR", amount: "100", ownerSharePct: "100", joint: false }],
      }),
    );
    const money = r.categories.find((c) => c.id === "money");
    assert.equal(money?.status, "incomplete");
    assert.equal(formatFixed(money?.baseMoney ?? Q0, 2), "0.00");
    assert.ok(r.missing.some((m) => m.includes("EUR")));
  });

  it("gold 100g purity 585 → 58.5g fine", () => {
    const r = calculate(
      base({
        metals: [
          {
            id: "g",
            metal: "gold",
            grams: "100",
            purityPerMille: "585",
            form: "jewelry",
            use: "investment",
          },
        ],
      }),
    );
    const m = r.categories.find((c) => c.id === "metals");
    const step = m?.steps[0]?.label ?? "";
    assert.match(step, /58\.5/);
    assert.equal(formatFixed(m?.baseMoney ?? Q0, 2), "292500.00");
  });

  it("investments 100000 trade_100 → base 100000", () => {
    const r = calculate(
      base({
        investments: [
          {
            id: "i",
            kind: "stock",
            label: "trade",
            currency: "RUB",
            marketValue: "100000",
            mode: "trade_100",
            assetFractionPct: "",
            ownerSharePct: "100",
          },
        ],
      }),
    );
    const c = r.categories.find((x) => x.id === "investments");
    assert.equal(formatFixed(c?.baseMoney ?? Q0, 2), "100000.00");
  });

  it("investments 100000 at 40% fraction → 40000", () => {
    const r = calculate(
      base({
        investments: [
          {
            id: "i",
            kind: "stock",
            label: "hold",
            currency: "RUB",
            marketValue: "100000",
            mode: "asset_fraction",
            assetFractionPct: "40",
            ownerSharePct: "100",
          },
        ],
      }),
    );
    const c = r.categories.find((x) => x.id === "investments");
    assert.equal(formatFixed(c?.baseMoney ?? Q0, 2), "40000.00");
  });

  it("proxy 25% → 25000 base, zakat 625 when due", () => {
    const r = calculate(
      base({
        quotes: {
          asOfDate: "2026-09-09",
          fetchedAt: "test",
          quotes: [metal("gold", "RUB", "5000"), metal("silver", "RUB", "10"), fx("USD", "RUB", "90")],
        },
        investments: [
          {
            id: "i",
            kind: "fund",
            label: "unknown",
            currency: "RUB",
            marketValue: "100000",
            mode: "proxy_25",
            assetFractionPct: "",
            ownerSharePct: "100",
          },
        ],
      }),
    );
    const c = r.categories.find((x) => x.id === "investments");
    assert.equal(formatFixed(c?.baseMoney ?? Q0, 2), "25000.00");
    const mal = r.categories.find((x) => x.id === "mal_net");
    assert.equal(formatFixed(mal?.zakatMoney ?? Q0, 2), "625.00");
    assert.ok(r.warnings.some((w) => w.includes("25")));
  });

  it("crop 1t natural 10% → 100 kg not 10 RUB", () => {
    const r = calculate(
      base({
        crops: [
          {
            id: "c",
            cropType: "wheat",
            massKg: "1000",
            irrigation: "natural",
            mixedNaturalSharePct: "",
            pricePerKg: "",
            currency: "RUB",
          },
        ],
      }),
    );
    const c = r.categories.find((x) => x.id === "crops");
    assert.equal(c?.natural?.[0]?.unit, "kg");
    assert.equal(c?.natural?.[0]?.count, "100");
    assert.equal(c?.zakatMoney, undefined);
  });

  it("crop 1t costly 5% → 50 kg", () => {
    const r = calculate(
      base({
        crops: [
          {
            id: "c",
            cropType: "wheat",
            massKg: "1000",
            irrigation: "costly",
            mixedNaturalSharePct: "",
            pricePerKg: "",
            currency: "RUB",
          },
        ],
      }),
    );
    assert.equal(r.categories.find((x) => x.id === "crops")?.natural?.[0]?.count, "50");
  });

  it("fitr 4 people × 300 = 1200", () => {
    const r = calculate(
      base({
        fitr: {
          people: "4",
          mode: "cash_equivalent",
          product: "dates",
          cashPerPerson: "300",
          currency: "RUB",
          region: "test",
          year: "2026",
        },
      }),
    );
    const c = r.categories.find((x) => x.id === "fitr");
    assert.equal(formatFixed(c?.zakatMoney ?? Q0, 2), "1200.00");
    assert.equal(formatFixed(r.totalMoneyRounded, 2), "1200.00");
  });

  it("rikaz 10000 classified → 2000; unclassified not auto", () => {
    const yes = calculate(
      base({
        rikaz: { classifiedAsRikaz: true, amount: "10000", currency: "RUB", note: "test" },
      }),
    );
    assert.equal(formatFixed(yes.categories.find((c) => c.id === "rikaz")?.zakatMoney ?? Q0, 2), "2000.00");
    const no = calculate(
      base({
        rikaz: { classifiedAsRikaz: null, amount: "10000", currency: "RUB", note: "found" },
      }),
    );
    assert.equal(no.categories.find((c) => c.id === "rikaz")?.status, "incomplete");
    assert.equal(no.categories.find((c) => c.id === "rikaz")?.zakatMoney, undefined);
  });

  it("debts > assets → money zakat 0, not negative", () => {
    const r = calculate(
      base({
        money: [{ id: "1", label: "c", currency: "RUB", amount: "1000", ownerSharePct: "100", joint: false }],
        debts: [
          {
            id: "d",
            kind: "payable",
            label: "loan",
            currency: "RUB",
            amount: "5000",
            timing: "immediate",
            collectible: "yes",
          },
        ],
      }),
    );
    const mal = r.categories.find((c) => c.id === "mal_net");
    assert.ok((mal?.zakatMoney ?? 1n) >= 0n);
    assert.equal(formatFixed(mal?.zakatMoney ?? Q0, 2), "0.00");
  });

  it("hawl unknown → not 'not obligated'", () => {
    const r = calculate(
      base({
        hawlConfirmed: null,
        money: [{ id: "1", label: "c", currency: "RUB", amount: "1000000", ownerSharePct: "100", joint: false }],
      }),
    );
    assert.notEqual(r.overallStatus, "not_due_confirmed");
    const mal = r.categories.find((c) => c.id === "mal_net");
    assert.equal(mal?.status, "incomplete");
  });

  it("120 sheep natural 1 sheep, not added as 3 RUB", () => {
    const r = calculate(
      base({
        livestock: {
          grazing: true,
          hawlConfirmed: true,
          sheep: "120",
          camels: "",
          cattle: "",
          cashSubstitute: false,
          priceSheep: "",
          priceCamel: "",
          priceCattle: "",
          currency: "RUB",
        },
      }),
    );
    const c = r.categories.find((x) => x.id === "livestock");
    assert.equal(c?.natural?.[0]?.count, "1");
    assert.equal(c?.zakatMoney, undefined);
    assert.equal(formatFixed(r.totalMoneyRounded, 2), "0.00");
  });

  it("USD formatting uses USD when base is USD", () => {
    const r = calculate(
      base({
        baseCurrency: "USD",
        quotes: {
          asOfDate: "2026-09-09",
          fetchedAt: "test",
          quotes: [metal("gold", "USD", "100"), metal("silver", "USD", "1"), fx("RUB", "USD", "0.01")],
        },
        money: [{ id: "1", label: "c", currency: "USD", amount: "100000", ownerSharePct: "100", joint: false }],
      }),
    );
    assert.equal(r.baseCurrency, "USD");
    assert.equal(formatFixed(r.totalMoneyRounded, 2), "2500.00");
  });

  it("shafii fitr cash refused", () => {
    const r = calculate(
      base({
        profileId: "shafii",
        fitr: {
          people: "4",
          mode: "cash_equivalent",
          product: "dates",
          cashPerPerson: "300",
          currency: "RUB",
          region: "test",
          year: "2026",
        },
      }),
    );
    const c = r.categories.find((x) => x.id === "fitr");
    assert.equal(c?.status, "incomplete");
    assert.ok(c?.natural?.[0]?.unit === "sa");
  });

  it("shafii jewelry personal wear excluded; bullion gold due separately", () => {
    const wear = calculate(
      base({
        profileId: "shafii",
        metals: [
          {
            id: "j",
            metal: "gold",
            grams: "100",
            purityPerMille: "999",
            form: "jewelry",
            use: "personal_wear",
          },
        ],
      }),
    );
    const m = wear.categories.find((c) => c.id === "metals");
    assert.equal(m?.status, "exempt");
    const inv = calculate(
      base({
        profileId: "shafii",
        metals: [
          {
            id: "g",
            metal: "gold",
            grams: "100",
            purityPerMille: "999",
            form: "bullion",
            use: "investment",
          },
        ],
      }),
    );
    const mg = inv.categories.find((c) => c.id === "metals");
    assert.equal(mg?.status, "due");
    assert.ok(mg?.zakatMoney && mg.zakatMoney > 0n);
    const mal = inv.categories.find((c) => c.id === "mal_net");
    assert.equal(formatFixed(mal?.zakatMoney ?? Q0, 2), "0.00");
  });

  it("nisab: equal to silver threshold is due; just below is below_nisab", () => {
    const at = calculate(
      base({
        money: [{ id: "1", label: "c", currency: "RUB", amount: "48988.8", ownerSharePct: "100", joint: false }],
      }),
    );
    assert.equal(at.categories.find((c) => c.id === "mal_net")?.status, "due");
    const below = calculate(
      base({
        money: [{ id: "1", label: "c", currency: "RUB", amount: "48988", ownerSharePct: "100", joint: false }],
      }),
    );
    assert.equal(below.categories.find((c) => c.id === "mal_net")?.status, "below_nisab");
  });

  it("cattle 120 natural 4 tabi, not added as money", () => {
    const r = calculate(
      base({
        livestock: {
          grazing: true,
          hawlConfirmed: true,
          sheep: "",
          camels: "",
          cattle: "120",
          cashSubstitute: false,
          priceSheep: "",
          priceCamel: "",
          priceCattle: "",
          currency: "RUB",
        },
      }),
    );
    const c = r.categories.find((x) => x.id === "livestock");
    assert.equal(c?.natural?.[0]?.count, "4");
    assert.equal(formatFixed(r.totalMoneyRounded, 2), "0.00");
  });

  it("mixed irrigation 1000 kg 40% natural → 70 kg", () => {
    const r = calculate(
      base({
        crops: [
          {
            id: "c",
            cropType: "wheat",
            massKg: "1000",
            irrigation: "mixed",
            mixedNaturalSharePct: "40",
            pricePerKg: "",
            currency: "RUB",
          },
        ],
      }),
    );
    assert.equal(r.categories.find((x) => x.id === "crops")?.natural?.[0]?.count, "70");
  });

  it("empty money line is not entered", () => {
    const r = calculate(
      base({
        money: [{ id: "1", label: "c", currency: "RUB", amount: "", ownerSharePct: "100", joint: false }],
      }),
    );
    assert.equal(r.categories.find((c) => c.id === "money")?.status, "not_entered");
  });

  it("minor owner keeps 2500 and flags uncertainty instead of zeroing", () => {
    const r = calculate(
      base({
        special: {
          minorOwner: true,
          inherited: false,
          incompleteOwnership: false,
          prepaid: false,
          overduePeriods: "",
        },
        money: [{ id: "1", label: "c", currency: "RUB", amount: "100000", ownerSharePct: "100", joint: false }],
      }),
    );
    assert.equal(formatFixed(r.totalMoneyRounded, 2), "2500.00");
    assert.equal(r.completeness, "partial");
    assert.ok(r.warnings.some((w) => w.includes("Несовершеннолетний")));
    assert.ok(r.missing.some((m) => m.includes("Несовершеннолетний")));
  });
});
