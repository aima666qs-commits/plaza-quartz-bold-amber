import {
  Q0,
  add,
  cmp,
  formatMoney,
  formatPlain,
  isZero,
  mul,
  mulRatio,
  parseCount,
  parseDecimal,
  qInt,
  roundTo,
  sub,
  type Qty,
} from "./decimal.ts";
import { camelZakat, cattleZakat, sheepZakat, type AnimalDue } from "./livestock.ts";
import { getProfile, resolveNisabGrams } from "./profiles.ts";
import type {
  CalculationInput,
  CalculationResult,
  CategoryResult,
  CategoryStatus,
  NaturalDue,
  Profile,
  Quote,
  Step,
} from "./types.ts";

function mustQty(raw: string, field: string): Qty {
  const p = parseDecimal(raw, { field });
  if (!p.ok) throw new Error(p.error);
  return p.qty;
}

const HUNDRED = mustQty("100", "100");
const THOUSAND = mustQty("1000", "1000");

function q(raw: string | number | null | undefined, field: string) {
  return parseDecimal(raw, { field });
}

function moneyQuote(quotes: Quote[], from: string, to: string): Quote | undefined {
  if (from === to) {
    return {
      id: `fx:${from}:${to}`,
      asset: from,
      base: from,
      quote: to,
      unit: "1",
      rate: "1",
      marketTime: null,
      fetchedAt: "",
      source: "identity",
      status: "live",
    };
  }
  return quotes.find((x) => x.asset === from && x.quote === to && (x.unit === "fx" || x.unit === "1"));
}

function metalQuote(quotes: Quote[], metal: "gold" | "silver", currency: string): Quote | undefined {
  const code = metal === "gold" ? "XAU_G" : "XAG_G";
  return quotes.find((x) => x.asset === code && x.quote === currency);
}

function convert(amount: Qty, from: string, to: string, quotes: Quote[], missing: string[], label: string): Qty | null {
  if (from === to) return amount;
  const fx = moneyQuote(quotes, from, to);
  if (!fx || fx.status === "missing") {
    missing.push(`Нет курса ${from}→${to} для «${label}». Сумма не посчитана: не ноль и не «бесплатно».`);
    return null;
  }
  const rate = q(fx.rate, `курс ${from}/${to}`);
  if (!rate.ok || rate.qty === 0n) {
    missing.push(`Некорректный курс ${from}→${to}.`);
    return null;
  }
  return mul(amount, rate.qty);
}

function animalNatural(items: AnimalDue[]): NaturalDue[] {
  return items.map((a) => ({
    unit: a.kind,
    count: String(a.count),
    label: a.labelRu,
  }));
}

function cat(
  partial: Omit<CategoryResult, "included"> & { included?: boolean },
): CategoryResult {
  const included = partial.included ?? (partial.status === "due");
  return { ...partial, included };
}

function share(amount: Qty, pctRaw: string, field: string): { qty: Qty; missing: string[] } {
  const p = q(pctRaw || "100", field);
  if (!p.ok) return { qty: Q0, missing: [p.error] };
  if (p.qty > HUNDRED) return { qty: Q0, missing: [`${field}: доля больше 100 %`] };
  return { qty: mulRatio(amount, p.qty, HUNDRED), missing: [] };
}

export function calculate(input: CalculationInput): CalculationResult {
  const profile = getProfile(input.profileId);
  const missing: string[] = [];
  const warnings: string[] = [];
  const categories: CategoryResult[] = [];
  const quotes = input.quotes.quotes;
  const base = input.baseCurrency;
  const nisabSpec = resolveNisabGrams(profile, input.nisabOverride);

  const goldG = q(nisabSpec.gold, "нисаб золота, г");
  const silverG = q(nisabSpec.silver, "нисаб серебра, г");
  if (!goldG.ok) missing.push(goldG.error);
  if (!silverG.ok) missing.push(silverG.error);

  const goldPx = metalQuote(quotes, "gold", base);
  const silverPx = metalQuote(quotes, "silver", base);
  let goldValue: Qty | null = null;
  let silverValue: Qty | null = null;
  if (goldG.ok && goldPx) {
    const p = q(goldPx.rate, "цена золота");
    if (p.ok) goldValue = mul(goldG.qty, p.qty);
    else missing.push(p.error);
  } else if (!goldPx) {
    missing.push("Нет цены золота за грамм — нисаб по золоту не посчитан.");
  }
  if (silverG.ok && silverPx) {
    const p = q(silverPx.rate, "цена серебра");
    if (p.ok) silverValue = mul(silverG.qty, p.qty);
    else missing.push(p.error);
  } else if (!silverPx) {
    missing.push("Нет цены серебра за грамм — нисаб по серебру не посчитан.");
  }

  let threshold: Qty | null = null;
  if (nisabSpec.mode === "gold") threshold = goldValue;
  else if (nisabSpec.mode === "silver") threshold = silverValue;
  else if (nisabSpec.mode === "lower") {
    if (goldValue !== null && silverValue !== null) threshold = goldValue < silverValue ? goldValue : silverValue;
    else threshold = goldValue ?? silverValue;
  } else if (nisabSpec.mode === "higher") {
    if (goldValue !== null && silverValue !== null) threshold = goldValue > silverValue ? goldValue : silverValue;
    else threshold = goldValue ?? silverValue;
  } else {
    threshold = goldValue;
  }

  const nisab = {
    goldGrams: goldG.ok ? goldG.qty : Q0,
    silverGrams: silverG.ok ? silverG.qty : Q0,
    goldValue,
    silverValue,
    threshold,
    mode: nisabSpec.mode,
    ruleId: "rule.nisab.profile",
    missing: [] as string[],
  };

  const separateMetals = !profile.combineGoldSilverByValue || nisabSpec.mode === "separate";

  categories.push(calcMoney(input, quotes, base));
  const metals = calcMetals(input, profile, quotes, base, {
    separate: separateMetals,
    goldNisabG: goldG.ok ? goldG.qty : null,
    silverNisabG: silverG.ok ? silverG.qty : null,
    hawl: input.hawlConfirmed,
  });
  categories.push(metals);
  categories.push(calcTrade(input, quotes, base));
  categories.push(calcInvestments(input, profile, quotes, base, warnings));
  categories.push(calcRealEstate(input, quotes, base));
  categories.push(calcCrypto(input, quotes, base, warnings));
  categories.push(calcReceivables(input, quotes, base));
  const debts = calcDebts(input, profile, quotes, base);
  categories.push(debts);

  const moneyLikeIds = separateMetals
    ? ["money", "trade", "investments", "real_estate", "crypto", "receivables"]
    : ["money", "metals", "trade", "investments", "real_estate", "crypto", "receivables"];
  const moneyLike = categories.filter((c) => moneyLikeIds.includes(c.id));
  let gross = Q0;
  let moneyIncomplete = false;
  for (const c of moneyLike) {
    if (c.status === "incomplete") moneyIncomplete = true;
    if (c.baseMoney) gross = add(gross, c.baseMoney);
  }
  const deduct = debts.baseMoney ?? Q0;
  let net = sub(gross, deduct);
  if (net < Q0) {
    warnings.push("Допустимые долги превышают денежную базу. Закят с имущества не отрицательный — денежная часть 0. Другие категории считаются отдельно.");
    net = Q0;
  }

  const hawl = input.hawlConfirmed;
  let malStatus: CategoryStatus = "not_entered";
  let malZakat: Qty = Q0;
  const malMissing: string[] = [];
  const malSteps: Step[] = [
    { id: "gross", label: separateMetals ? "Денежная база без металлов (профиль не соединяет Au/Ag)" : "Денежная база до вычетов", output: formatMoney(gross, base) },
    { id: "deduct", label: "Вычеты (немедленные долги)", output: formatMoney(deduct, base) },
    { id: "net", label: "Нетто", output: formatMoney(net, base) },
  ];
  const cashEntered = moneyLike.some((c) => c.status !== "not_entered");
  if (!cashEntered && isZero(gross) && !moneyIncomplete) {
    malStatus = "not_entered";
  } else if (hawl === null) {
    malStatus = "incomplete";
    malMissing.push("Хауль для денежных активов не подтверждён. Это не равно «не обязан».");
  } else if (hawl === false) {
    malStatus = "exempt";
    malSteps.push({ id: "hawl", label: "Хауль не подтверждён пользователем", output: "денежная ставка 1/40 не применена" });
  } else if (threshold === null) {
    malStatus = "incomplete";
    malMissing.push("Нисаб не посчитан — нет цены металла.");
  } else if (cmp(net, threshold) < 0) {
    malStatus = "below_nisab";
    malSteps.push({
      id: "nisab",
      label: "Сравнение с нисабом",
      output: `${formatMoney(net, base)} < ${formatMoney(threshold, base)}`,
      ruleId: "rule.nisab.profile",
    });
  } else {
    malStatus = "due";
    malZakat = mulRatio(net, 1n, 40n);
    malSteps.push({
      id: "rate",
      label: "Ставка 1/40 (Бухари 1454 для серебра; для денег — аналогия выбранного профиля)",
      output: formatMoney(malZakat, base),
      ruleId: "rule.money.1_40",
    });
  }

  categories.push(
    cat({
      id: "mal_net",
      title: separateMetals ? "Закят с денежных активов (металлы отдельно)" : "Закят с денежных активов (после нисаба и хауля)",
      status: malStatus,
      included: malStatus === "due",
      reasons: [
        `Профиль: ${profile.name}. Нисаб: режим ${nisabSpec.mode}. Соединение золота и серебра: ${profile.combineGoldSilverByValue ? "по стоимости (не иджмаʿ)" : "нет, каждый металл со своим нисабом"}.`,
        "Ставка 1/40 для серебра — Бухари 1454. Распространение на фиат и крипто — современная аналогия, не текст хадиса.",
      ],
      missing: malMissing,
      baseMoney: net,
      zakatMoney: malZakat,
      ruleIds: ["rule.money.1_40", "rule.nisab.profile"],
      sourceIds: ["bukhari.1454", "math.rate.1_40"],
      steps: malSteps,
    }),
  );

  categories.push(calcLivestock(input, profile, quotes, base));
  categories.push(calcCrops(input, profile, quotes, base, warnings));
  categories.push(calcRikaz(input, quotes, base));
  categories.push(calcFitr(input, profile, quotes, base, warnings));

  const natural: NaturalDue[] = [];
  let total = Q0;
  for (const c of categories) {
    if (c.zakatMoney && c.included) total = add(total, c.zakatMoney);
    if (c.natural) natural.push(...c.natural);
  }

  const anyDue = categories.some((c) => c.status === "due");
  const anyIncomplete = categories.some((c) => c.status === "incomplete" || c.missing.length > 0);
  const anyUnverified = categories.some((c) => c.status === "unverified_rule");
  let overall: CalculationResult["overallStatus"];
  if (anyDue && anyIncomplete) overall = "mixed";
  else if (anyDue) overall = "due";
  else if (anyIncomplete || anyUnverified) overall = "incomplete";
  else if (categories.some((c) => c.status === "below_nisab" || c.status === "exempt" || c.status === "not_entered")) {
    overall = "not_due_confirmed";
    if (categories.every((c) => c.status === "not_entered" || c.status === "not_applicable")) overall = "incomplete";
  } else overall = "incomplete";

  if (overall === "not_due_confirmed" && anyIncomplete) overall = "incomplete";

  warnings.push("Это программа, не фетва. Учёный этот расчёт не заверял.");

  const special = input.special ?? {
    minorOwner: false,
    inherited: false,
    incompleteOwnership: false,
    prepaid: false,
    overduePeriods: "",
  };
  if (special.minorOwner) {
    warnings.push("Несовершеннолетний владелец: применимость закята зависит от мазхаба и не рассчитана автоматически.");
    missing.push("Несовершеннолетний владелец: автоматический хукм не выведен.");
  }
  if (special.inherited) {
    warnings.push("Наследованные активы: момент начала хауля и доли наследников не рассчитаны автоматически.");
    missing.push("Наследование: хауль и доли не рассчитаны автоматически.");
  }
  if (special.incompleteOwnership) {
    warnings.push("Неполное владение отмечено: используйте поле доли собственника. Автоматический хукм не выводится.");
    missing.push("Неполное владение требует явной доли; общий хукм не выведен.");
  }
  if (special.prepaid) {
    warnings.push("Авансовая уплата отмечена справочно и не уменьшает рассчитанную обязанность автоматически.");
  }
  if (special.overduePeriods?.trim()) {
    warnings.push(
      `Просроченные периоды («${special.overduePeriods}») отмечены справочно и не умножают итог автоматически.`,
    );
    missing.push("Просроченные периоды не разложены по годам автоматически.");
  }

  const completeness = missing.length === 0 && !anyIncomplete ? "complete" : "partial";

  return {
    schemaVersion: 1,
    inputId: input.id,
    profileId: profile.id,
    profileVersion: profile.version,
    asOfDate: input.asOfDate,
    baseCurrency: base,
    quotes: input.quotes,
    nisab,
    categories,
    totalMoneyExact: total,
    totalMoneyRounded: roundTo(total, 2),
    natural,
    completeness,
    overallStatus: overall,
    warnings,
    missing: [...new Set([...missing, ...malMissing, ...categories.flatMap((c) => c.missing)])],
    computedAt: new Date().toISOString(),
  };
}

function calcMoney(input: CalculationInput, quotes: Quote[], base: string): CategoryResult {
  const steps: Step[] = [];
  let total = Q0;
  const miss: string[] = [];
  if (input.money.length === 0) {
    return cat({
      id: "money",
      title: "Деньги и валюты",
      status: "not_entered",
      reasons: [],
      missing: [],
      baseMoney: Q0,
      ruleIds: ["rule.money.1_40"],
      sourceIds: ["bukhari.1454"],
      steps,
    });
  }
  let anyAmount = false;
  for (const line of input.money) {
    const a = q(line.amount, line.label || "сумма");
    if (!a.ok) {
      if (a.code === "empty") continue;
      miss.push(a.error);
      continue;
    }
    anyAmount = true;
    const sh = share(a.qty, line.ownerSharePct || "100", `доля «${line.label}»`);
    miss.push(...sh.missing);
    const conv = convert(sh.qty, line.currency, base, quotes, miss, line.label || line.currency);
    if (conv === null) continue;
    total = add(total, conv);
    steps.push({
      id: line.id,
      label: `${line.label || line.currency} ${line.joint ? "(совместно)" : ""}`,
      input: `${formatPlain(a.qty)} ${line.currency} × доля ${line.ownerSharePct || 100}%`,
      output: formatMoney(conv, base),
    });
  }
  if (!anyAmount && miss.length === 0) {
    return cat({
      id: "money",
      title: "Деньги и валюты",
      status: "not_entered",
      reasons: [],
      missing: [],
      baseMoney: Q0,
      ruleIds: ["rule.money.1_40"],
      sourceIds: ["bukhari.1454"],
      steps,
    });
  }
  return cat({
    id: "money",
    title: "Деньги и валюты",
    status: miss.length ? "incomplete" : "due",
    included: false,
    reasons: ["Входят в денежную базу. Закят считается на этапе «денежные активы» после нисаба и хауля."],
    missing: miss,
    baseMoney: total,
    ruleIds: ["rule.money.1_40"],
    sourceIds: ["bukhari.1454", "math.rate.1_40"],
    steps,
  });
}

function calcMetals(
  input: CalculationInput,
  profile: Profile,
  quotes: Quote[],
  base: string,
  opts: { separate: boolean; goldNisabG: Qty | null; silverNisabG: Qty | null; hawl: boolean | null },
): CategoryResult {
  const steps: Step[] = [];
  const miss: string[] = [];
  let goldFine = Q0;
  let silverFine = Q0;
  let goldVal = Q0;
  let silverVal = Q0;
  if (input.metals.length === 0) {
    return cat({
      id: "metals",
      title: "Золото и серебро",
      status: "not_entered",
      reasons: [],
      missing: [],
      baseMoney: Q0,
      ruleIds: ["rule.metals.purity"],
      sourceIds: ["bukhari.1454"],
      steps,
    });
  }
  for (const line of input.metals) {
    const g = q(line.grams, "граммы");
    const pur = q(line.purityPerMille || "1000", "проба");
    if (!g.ok) {
      if (g.code !== "empty") miss.push(g.error);
      continue;
    }
    if (!pur.ok) {
      miss.push(pur.error);
      continue;
    }
    const fine = mulRatio(g.qty, pur.qty, THOUSAND);
    const exemptWear = !profile.jewelryPersonalZakatable && line.form === "jewelry" && line.use === "personal_wear";
    if (exemptWear) {
      steps.push({
        id: line.id,
        label: `${line.metal} украшение (личное ношение)`,
        output: "исключено профилем",
        ruleId: "rule.jewelry.profile",
      });
      continue;
    }
    if (line.metal === "gold") goldFine = add(goldFine, fine);
    else silverFine = add(silverFine, fine);
    const px = metalQuote(quotes, line.metal, base);
    if (!px) {
      miss.push(`Нет цены ${line.metal} за грамм. ${formatPlain(fine)} г чистого металла не оценены как 0.`);
      steps.push({
        id: line.id,
        label: `${line.metal} ${formatPlain(g.qty)} г, проба ${formatPlain(pur.qty)} → чистое ${formatPlain(fine)} г`,
        output: "нет цены",
      });
      continue;
    }
    const p = q(px.rate, "цена металла");
    if (!p.ok) {
      miss.push(p.error);
      continue;
    }
    const val = mul(fine, p.qty);
    if (line.metal === "gold") goldVal = add(goldVal, val);
    else silverVal = add(silverVal, val);
    steps.push({
      id: line.id,
      label: `${line.metal} ${formatPlain(g.qty)} г × проба ${formatPlain(pur.qty)}/1000 = ${formatPlain(fine)} г чистого`,
      output: formatMoney(val, base),
      ruleId: "rule.metals.purity",
    });
  }

  const combined = add(goldVal, silverVal);

  if (!opts.separate) {
    const kept = !isZero(combined) || miss.length > 0;
    return cat({
      id: "metals",
      title: "Золото и серебро",
      status: miss.length ? "incomplete" : kept ? "due" : "exempt",
      included: false,
      reasons: ["Чистое вещество = масса × проба/1000. Украшения зависят от профиля. В этом профиле стоимость входит в общую денежную базу."],
      missing: miss,
      baseMoney: combined,
      ruleIds: ["rule.metals.purity", "rule.jewelry.profile"],
      sourceIds: ["bukhari.1454", "fiqh.jewelry.ikhtilaf"],
      steps,
    });
  }

  if (isZero(goldFine) && isZero(silverFine) && miss.length === 0) {
    return cat({
      id: "metals",
      title: "Золото и серебро (раздельно)",
      status: "exempt",
      reasons: ["Все введённые металлы исключены выбранным профилем (например, носимые украшения)."],
      missing: [],
      baseMoney: Q0,
      ruleIds: ["rule.metals.purity", "rule.jewelry.profile"],
      sourceIds: ["bukhari.1454", "fiqh.jewelry.ikhtilaf"],
      steps,
    });
  }

  /* Separate: each metal vs its gram nisab. Cash is not mixed in. */
  let zakat = Q0;
  let status: CategoryStatus = "not_entered";
  if (opts.hawl === null) {
    miss.push("Хауль металлов не подтверждён (денежный флажок). Для раздельного профиля это не «не обязан».");
  }
  if (opts.hawl === false) {
    return cat({
      id: "metals",
      title: "Золото и серебро (раздельно)",
      status: "exempt",
      reasons: ["Хауль не подтверждён. Металлы не соединяются с деньгами в этом профиле."],
      missing: miss,
      baseMoney: combined,
      ruleIds: ["rule.metals.purity", "rule.jewelry.profile"],
      sourceIds: ["bukhari.1454", "fiqh.nisab.combine"],
      steps,
    });
  }

  if (opts.goldNisabG && !isZero(goldFine)) {
    if (cmp(goldFine, opts.goldNisabG) < 0) {
      steps.push({ id: "gold-nisab", label: `Чистое золото ${formatPlain(goldFine)} г < нисаба ${formatPlain(opts.goldNisabG)} г`, output: "ниже нисаба золота" });
      if (status === "not_entered") status = "below_nisab";
    } else if (opts.hawl === true) {
      const z = mulRatio(goldVal, 1n, 40n);
      zakat = add(zakat, z);
      status = "due";
      steps.push({ id: "gold-zakat", label: "Золото отдельно ≥ нисаба, 1/40", output: formatMoney(z, base) });
    }
  }
  if (opts.silverNisabG && !isZero(silverFine)) {
    if (cmp(silverFine, opts.silverNisabG) < 0) {
      steps.push({ id: "silver-nisab", label: `Чистое серебро ${formatPlain(silverFine)} г < нисаба ${formatPlain(opts.silverNisabG)} г`, output: "ниже нисаба серебра" });
      if (status === "not_entered") status = "below_nisab";
    } else if (opts.hawl === true) {
      const z = mulRatio(silverVal, 1n, 40n);
      zakat = add(zakat, z);
      status = "due";
      steps.push({ id: "silver-zakat", label: "Серебро отдельно ≥ нисаба, 1/40", output: formatMoney(z, base) });
    }
  }
  if (miss.length) status = "incomplete";
  if (status === "not_entered" && (!isZero(goldFine) || !isZero(silverFine))) status = "below_nisab";

  return cat({
    id: "metals",
    title: "Золото и серебро (раздельно)",
    status,
    included: status === "due",
    reasons: [
      "Ан-Навави и близкие позиции: золото и серебро не дополняют нисаб друг друга. Это не иджмаʿ.",
      "Чистое вещество = масса × проба/1000.",
    ],
    missing: miss,
    baseMoney: combined,
    zakatMoney: status === "due" ? zakat : undefined,
    ruleIds: ["rule.metals.purity", "rule.jewelry.profile"],
    sourceIds: ["bukhari.1454", "fiqh.nisab.combine", "fiqh.jewelry.ikhtilaf"],
    steps,
  });
}

function calcTrade(input: CalculationInput, quotes: Quote[], base: string): CategoryResult {
  const t = input.trade;
  const miss: string[] = [];
  const steps: Step[] = [];
  const parts = [
    ["inventory", t.inventory, "товар на складе"],
    ["businessCash", t.businessCash, "деньги бизнеса"],
    ["receivables", t.receivables, "вам должны"],
  ] as const;
  let gross = Q0;
  let any = false;
  for (const [id, raw, label] of parts) {
    const a = q(raw, label);
    if (!a.ok) {
      if (a.code !== "empty") miss.push(a.error);
      continue;
    }
    any = true;
    const conv = convert(a.qty, t.currency || base, base, quotes, miss, label);
    if (conv === null) continue;
    gross = add(gross, conv);
    steps.push({ id, label, output: formatMoney(conv, base) });
  }
  const pay = q(t.payables, "обязательства бизнеса");
  if (pay.ok) {
    any = true;
    const conv = convert(pay.qty, t.currency || base, base, quotes, miss, "обязательства бизнеса");
    if (conv !== null) {
      gross = sub(gross, conv);
      steps.push({ id: "payables", label: "обязательства бизнеса (−)", output: formatMoney(conv, base) });
    }
  } else if (pay.code !== "empty") miss.push(pay.error);
  const sh = share(gross < Q0 ? Q0 : gross, t.ownerSharePct || "100", "доля в бизнесе");
  miss.push(...sh.missing);
  const val = gross < Q0 ? Q0 : sh.qty;
  if (!any) {
    return cat({
      id: "trade",
      title: "Торговые активы",
      status: "not_entered",
      reasons: [],
      missing: [],
      baseMoney: Q0,
      ruleIds: ["rule.trade.market"],
      sourceIds: ["ir.uk.calculator"],
      steps,
    });
  }
  return cat({
    id: "trade",
    title: "Торговые активы",
    status: miss.length ? "incomplete" : "due",
    included: false,
    reasons: ["ʿUrūḍ al-tijārah: рыночная стоимость. Доля собственника применяется к нетто."],
    missing: miss,
    baseMoney: val,
    ruleIds: ["rule.trade.market"],
    sourceIds: ["ir.uk.calculator"],
    steps,
  });
}

function calcInvestments(
  input: CalculationInput,
  profile: Profile,
  quotes: Quote[],
  base: string,
  warnings: string[],
): CategoryResult {
  const miss: string[] = [];
  const steps: Step[] = [];
  let total = Q0;
  if (input.investments.length === 0) {
    return cat({
      id: "investments",
      title: "Инвестиции",
      status: "not_entered",
      reasons: [],
      missing: [],
      baseMoney: Q0,
      ruleIds: ["rule.invest.modes"],
      sourceIds: ["nzf.proxy25.unverified"],
      steps,
    });
  }
  for (const line of input.investments) {
    const a = q(line.marketValue, line.label || "инвестиции");
    if (!a.ok) {
      if (a.code !== "empty") miss.push(a.error);
      continue;
    }
    const conv = convert(a.qty, line.currency, base, quotes, miss, line.label);
    if (conv === null) continue;
    let baseAmt = conv;
    if (line.mode === "trade_100") {
      baseAmt = conv;
      steps.push({ id: line.id, label: `${line.label} 100 % рыночной стоимости (торговля)`, output: formatMoney(baseAmt, base) });
    } else if (line.mode === "asset_fraction") {
      if (!line.assetFractionPct) {
        miss.push(`Для «${line.label}» режим доли активов требует ввода доли. 25 % не подставляется.`);
        continue;
      }
      const sh = share(conv, line.assetFractionPct, `доля закятооблагаемых активов «${line.label}»`);
      miss.push(...sh.missing);
      baseAmt = sh.qty;
      steps.push({
        id: line.id,
        label: `${line.label} × ${line.assetFractionPct} % закятооблагаемых активов`,
        output: formatMoney(baseAmt, base),
      });
    } else {
      if (!profile.proxy25Allowed) {
        miss.push(`Режим 25 % proxy не включён в профиль «${profile.name}». Укажите долю активов или полную стоимость.`);
        continue;
      }
      const sh = share(conv, "25", "proxy 25%");
      baseAmt = sh.qty;
      warnings.push(`«${line.label}»: 25 % — оценочная методика, не текст Корана/Сунны (source nzf.proxy25.unverified).`);
      steps.push({
        id: line.id,
        label: `${line.label} оценка 25 % (помечено)`,
        output: formatMoney(baseAmt, base),
        ruleId: "rule.invest.proxy25",
      });
    }
    const own = share(baseAmt, line.ownerSharePct || "100", "доля владельца");
    miss.push(...own.missing);
    total = add(total, own.qty);
  }
  return cat({
    id: "investments",
    title: "Инвестиции (акции, фонды, сукук, пенсия)",
    status: miss.length ? "incomplete" : "due",
    included: false,
    reasons: ["Три режима разделены: 100 %, явная доля, помеченный 25 % proxy."],
    missing: miss,
    baseMoney: total,
    ruleIds: ["rule.invest.modes"],
    sourceIds: ["nzf.proxy25.unverified", "ir.uk.calculator"],
    steps,
  });
}

function calcRealEstate(input: CalculationInput, quotes: Quote[], base: string): CategoryResult {
  const miss: string[] = [];
  const steps: Step[] = [];
  let total = Q0;
  if (input.realEstate.length === 0) {
    return cat({
      id: "real_estate",
      title: "Недвижимость",
      status: "not_entered",
      reasons: [],
      missing: [],
      baseMoney: Q0,
      ruleIds: ["rule.property.split"],
      sourceIds: ["ir.uk.calculator"],
      steps,
    });
  }
  for (const line of input.realEstate) {
    if (line.purpose === "personal") {
      steps.push({ id: line.id, label: `${line.label} (личное пользование)`, output: "не в базе закята имущества" });
      continue;
    }
    if (line.purpose === "rental") {
      const rent = q(line.annualRent, `аренда «${line.label}»`);
      if (!rent.ok) {
        if (rent.code !== "empty") miss.push(rent.error);
        else miss.push(`Для арендной недвижимости «${line.label}» нужна величина дохода, не стоимость объекта как таковая.`);
        continue;
      }
      const conv = convert(rent.qty, line.currency, base, quotes, miss, line.label);
      if (conv === null) continue;
      total = add(total, conv);
      steps.push({ id: line.id, label: `${line.label} доход (не стоимость объекта)`, output: formatMoney(conv, base) });
      continue;
    }
    const val = q(line.propertyValue, `стоимость «${line.label}»`);
    if (!val.ok) {
      if (val.code !== "empty") miss.push(val.error);
      else miss.push(`Торговая недвижимость «${line.label}» требует рыночной стоимости.`);
      continue;
    }
    const conv = convert(val.qty, line.currency, base, quotes, miss, line.label);
    if (conv === null) continue;
    total = add(total, conv);
    steps.push({ id: line.id, label: `${line.label} торговая стоимость`, output: formatMoney(conv, base) });
  }
  const onlyPersonal = input.realEstate.every((l) => l.purpose === "personal");
  return cat({
    id: "real_estate",
    title: "Недвижимость",
    status: miss.length ? "incomplete" : onlyPersonal || isZero(total) ? "exempt" : "due",
    included: false,
    reasons: ["Личное пользование исключается. Аренда — доход. Торговля — стоимость объекта."],
    missing: miss,
    baseMoney: total,
    ruleIds: ["rule.property.split"],
    sourceIds: ["ir.uk.calculator"],
    steps,
  });
}

function calcCrypto(input: CalculationInput, quotes: Quote[], base: string, warnings: string[]): CategoryResult {
  const miss: string[] = [];
  const steps: Step[] = [];
  let total = Q0;
  if (input.crypto.length === 0) {
    return cat({
      id: "crypto",
      title: "Криптоактивы",
      status: "not_entered",
      reasons: [],
      missing: [],
      baseMoney: Q0,
      ruleIds: ["rule.crypto.ijtihad"],
      sourceIds: ["crypto.screening.opinions"],
      steps,
    });
  }
  warnings.push("Криптоактивы: нет прямого хадиса. Оценка — иджтихад. Панель источников — мнения, не хукм.");
  for (const line of input.crypto) {
    const qty = q(line.quantity, line.symbol || "количество");
    const px = q(line.price, `цена ${line.symbol}`);
    if (!qty.ok) {
      if (qty.code !== "empty") miss.push(qty.error);
      continue;
    }
    if (!px.ok) {
      miss.push(px.error || `Нет цены ${line.symbol}; сумма не подставлена нулём.`);
      continue;
    }
    if (line.availability !== "liquid") {
      miss.push(
        `${line.symbol}: доступность «${line.availability}» — право собственности и возможность изъятия не подтверждены. Не включается молча.`,
      );
      steps.push({ id: line.id, label: `${line.symbol} (${line.availability})`, output: "не включено до разбора права" });
      continue;
    }
    const value = mul(qty.qty, px.qty);
    const conv = convert(value, line.priceCurrency || base, base, quotes, miss, line.symbol);
    if (conv === null) continue;
    total = add(total, conv);
    steps.push({
      id: line.id,
      label: `${line.symbol} ${formatPlain(qty.qty)} × ${formatPlain(px.qty)} ${line.priceCurrency}`,
      output: formatMoney(conv, base),
    });
  }
  return cat({
    id: "crypto",
    title: "Криптоактивы",
    status: miss.length ? "incomplete" : "due",
    included: false,
    reasons: ["Ликвидные токены входят в денежную базу по рыночной цене. Стейкинг/DeFi/лок — отдельно и неполное, пока не ясна собственность."],
    missing: miss,
    baseMoney: total,
    ruleIds: ["rule.crypto.ijtihad"],
    sourceIds: ["crypto.screening.opinions"],
    steps,
  });
}

function calcReceivables(input: CalculationInput, quotes: Quote[], base: string): CategoryResult {
  const miss: string[] = [];
  const steps: Step[] = [];
  let total = Q0;
  const rec = input.debts.filter((d) => d.kind === "receivable");
  if (rec.length === 0) {
    return cat({
      id: "receivables",
      title: "Вам должны",
      status: "not_entered",
      reasons: [],
      missing: [],
      baseMoney: Q0,
      ruleIds: ["rule.debts.split"],
      sourceIds: ["ir.uk.calculator"],
      steps,
    });
  }
  for (const line of rec) {
    if (line.collectible !== "yes") {
      steps.push({ id: line.id, label: line.label, output: "получить нельзя / неизвестно — не в базе" });
      if (line.collectible === "unknown") miss.push(`«${line.label}»: не сказано, можно ли получить этот долг.`);
      continue;
    }
    const a = q(line.amount, line.label);
    if (!a.ok) {
      if (a.code !== "empty") miss.push(a.error);
      continue;
    }
    const conv = convert(a.qty, line.currency, base, quotes, miss, line.label);
    if (conv === null) continue;
    total = add(total, conv);
    steps.push({ id: line.id, label: line.label, output: formatMoney(conv, base) });
  }
  return cat({
    id: "receivables",
    title: "Вам должны",
    status: miss.length ? "incomplete" : "due",
    included: false,
    reasons: ["В базу входят только те долги, которые реально можно получить."],
    missing: miss,
    baseMoney: total,
    ruleIds: ["rule.debts.split"],
    sourceIds: ["ir.uk.calculator"],
    steps,
  });
}

function calcDebts(input: CalculationInput, profile: Profile, quotes: Quote[], base: string): CategoryResult {
  const miss: string[] = [];
  const steps: Step[] = [];
  let total = Q0;
  const pay = input.debts.filter((d) => d.kind === "payable");
  if (pay.length === 0) {
    return cat({
      id: "debts",
      title: "Ваши обязательства",
      status: "not_entered",
      reasons: [],
      missing: [],
      baseMoney: Q0,
      ruleIds: ["rule.debts.split"],
      sourceIds: ["ir.uk.calculator"],
      steps,
    });
  }
  for (const line of pay) {
    if (!profile.debtsDeductImmediate) continue;
    if (line.timing !== "immediate") {
      steps.push({ id: line.id, label: line.label, output: "долгосрочное — не вычитается в этом профиле автоматически" });
      continue;
    }
    const a = q(line.amount, line.label);
    if (!a.ok) {
      if (a.code !== "empty") miss.push(a.error);
      continue;
    }
    const conv = convert(a.qty, line.currency, base, quotes, miss, line.label);
    if (conv === null) continue;
    total = add(total, conv);
    steps.push({ id: line.id, label: `вычет «${line.label}»`, output: formatMoney(conv, base) });
  }
  return cat({
    id: "debts",
    title: "Ваши обязательства",
    status: miss.length ? "incomplete" : "due",
    included: false,
    reasons: ["Вычитаются только немедленные реальные обязательства выбранного профиля. Нет отрицательного закята."],
    missing: miss,
    baseMoney: total,
    zakatMoney: Q0,
    ruleIds: ["rule.debts.split"],
    sourceIds: ["ir.uk.calculator"],
    steps,
  });
}

function calcLivestock(
  input: CalculationInput,
  profile: Profile,
  quotes: Quote[],
  base: string,
): CategoryResult {
  const miss: string[] = [];
  const steps: Step[] = [];
  const natural: NaturalDue[] = [];
  const L = input.livestock;
  const hasAny = [L.sheep, L.camels, L.cattle].some((x) => x && String(x).trim() !== "" && String(x) !== "0");
  if (!hasAny) {
    return cat({
      id: "livestock",
      title: "Скот",
      status: "not_entered",
      reasons: [],
      missing: [],
      ruleIds: ["rule.sheep.bukhari1454"],
      sourceIds: ["bukhari.1454", "abudawud.1576"],
      steps,
    });
  }
  if (L.grazing === null) miss.push("Не указано, является ли скот саимой (выпасной). Условие таблиц — пасущийся скот.");
  if (L.grazing === false) {
    return cat({
      id: "livestock",
      title: "Скот",
      status: "exempt",
      reasons: ["Таблицы Бухари 1454 / Абу Дауд 1576 относятся к саиме. Кормовой скот этим правилом не рассчитан."],
      missing: [],
      ruleIds: ["rule.sheep.bukhari1454"],
      sourceIds: ["bukhari.1454", "abudawud.1576"],
      steps,
    });
  }
  if (L.hawlConfirmed === null) miss.push("Хауль скота не подтверждён. Не переносится автоматически с денежного флажка.");
  if (L.hawlConfirmed === false) {
    return cat({
      id: "livestock",
      title: "Скот",
      status: "exempt",
      reasons: ["Хауль скота не подтверждён пользователем."],
      missing: [],
      ruleIds: ["rule.sheep.bukhari1454"],
      sourceIds: ["bukhari.1454"],
      steps,
    });
  }

  const apply = (raw: string, label: string, fn: (n: number) => ReturnType<typeof sheepZakat>) => {
    if (!raw || String(raw).trim() === "") return;
    const c = parseCount(raw, label);
    if (!c.ok) {
      miss.push(c.error);
      return;
    }
    const n = c.count ?? 0;
    const br = fn(n);
    steps.push({
      id: label,
      label: `${label}: ${n}, диапазон ${br.range}`,
      output: br.due.length ? br.due.map((d) => d.labelRu).join(", ") : "ниже порога",
      ruleId: br.ruleId,
    });
    natural.push(...animalNatural(br.due));
    if (br.alternatives?.length) {
      steps.push({
        id: `${label}-alt`,
        label: "допустимые варианты",
        output: br.alternatives.map((a) => a.map((x) => x.labelRu).join("+")).join(" | "),
      });
    }
  };
  apply(L.sheep, "овцы/козы", sheepZakat);
  apply(L.camels, "верблюды", camelZakat);
  apply(L.cattle, "КРС", cattleZakat);

  let zakatMoney: Qty | undefined;
  if (profile.livestockCashOk && L.cashSubstitute) {
    const priceMap: Record<string, string> = {
      sheep: L.priceSheep,
      camel_bint_makhad: L.priceCamel,
      camel_bint_labun: L.priceCamel,
      camel_hiqqa: L.priceCamel,
      camel_jadhah: L.priceCamel,
      cattle_tabi: L.priceCattle,
      cattle_musinna: L.priceCattle,
    };
    let sum = Q0;
    let ok = true;
    for (const n of natural) {
      const pr = priceMap[n.unit];
      const p = q(pr, `цена ${n.label}`);
      if (!p.ok) {
        miss.push(`Денежный эквивалент скота: нет цены для ${n.label}. Натуральное обязательство сохранено.`);
        ok = false;
        continue;
      }
      const countQ = qInt(Number(n.count));
      const conv = convert(mul(p.qty, countQ), L.currency || base, base, quotes, miss, n.label);
      if (conv === null) {
        ok = false;
        continue;
      }
      sum = add(sum, conv);
    }
    if (ok && !isZero(sum)) zakatMoney = sum;
  }

  const due = natural.length > 0;
  return cat({
    id: "livestock",
    title: "Скот",
    status: miss.length ? "incomplete" : due ? "due" : "below_nisab",
    included: due,
    reasons: [
      "Натуральные обязательства отделены от денег. 120 овец = 1 овца (Бухари 1454), не floor(120/40).",
      "КРС — Абу Дауд 1576, не Бухари 1454.",
    ],
    missing: miss,
    zakatMoney,
    natural,
    ruleIds: ["rule.sheep.bukhari1454", "rule.camel.bukhari1454", "rule.cattle.abudawud1576"],
    sourceIds: ["bukhari.1454", "abudawud.1576"],
    steps,
  });
}

function calcCrops(
  input: CalculationInput,
  profile: Profile,
  quotes: Quote[],
  base: string,
  warnings: string[],
): CategoryResult {
  const miss: string[] = [];
  const steps: Step[] = [];
  const natural: NaturalDue[] = [];
  let money = Q0;
  if (input.crops.length === 0) {
    return cat({
      id: "crops",
      title: "Урожай",
      status: "not_entered",
      reasons: [],
      missing: [],
      ruleIds: ["rule.crops.bukhari1483"],
      sourceIds: ["bukhari.1483", "bukhari.1447", "quran.6.141"],
      steps,
    });
  }
  warnings.push("Хауль для урожая не требуется (6:141 — день сбора). Порог 5 васков (Бухари 1447) в кг не переводится универсально без вида культуры.");
  for (const line of input.crops) {
    const mass = q(line.massKg, `масса «${line.cropType || "урожай"}»`);
    if (!mass.ok) {
      if (mass.code !== "empty") miss.push(mass.error);
      continue;
    }
    if (line.irrigation === "unknown") {
      miss.push(`Полив «${line.cropType}» не указан. Не назначена единая ставка наугад.`);
      continue;
    }
    if (line.irrigation === "mixed") {
      const sharePct = q(line.mixedNaturalSharePct, "доля естественного полива");
      if (!sharePct.ok) {
        miss.push(`Смешанный полив «${line.cropType}»: нужна доля естественного орошения. Единая ставка не назначается.`);
        continue;
      }
      const nat = mulRatio(mass.qty, sharePct.qty, HUNDRED);
      const cost = sub(mass.qty, nat);
      const dueAmt = add(mulRatio(nat, 1n, 10n), mulRatio(cost, 1n, 20n));
      natural.push({ unit: "kg", count: formatPlain(dueAmt), label: `${line.cropType}: ${formatPlain(dueAmt)} кг (смешанный полив)` });
      steps.push({
        id: line.id,
        label: `${line.cropType} смешанный: 10 % × ${formatPlain(nat)} кг + 5 % × ${formatPlain(cost)} кг`,
        output: `${formatPlain(dueAmt)} кг`,
        ruleId: "rule.crops.mixed.user_share",
      });
      const price = q(line.pricePerKg, "цена урожая");
      if (price.ok && profile.cropCashOk) {
        const conv = convert(mul(dueAmt, price.qty), line.currency || base, base, quotes, miss, line.cropType);
        if (conv) money = add(money, conv);
      }
      continue;
    }
    const rate = line.irrigation === "natural" ? 10n : 20n;
    const dueAmt = mulRatio(mass.qty, 1n, rate);
    natural.push({
      unit: "kg",
      count: formatPlain(dueAmt),
      label: `${line.cropType || "урожай"}: ${formatPlain(dueAmt)} кг (${rate === 10n ? "10 %" : "5 %"})`,
    });
    steps.push({
      id: line.id,
      label: `${formatPlain(mass.qty)} кг × ${rate === 10n ? "1/10" : "1/20"} (Бухари 1483)`,
      output: `${formatPlain(dueAmt)} кг`,
      ruleId: "rule.crops.bukhari1483",
    });
    const price = q(line.pricePerKg, "цена урожая");
    if (price.ok) {
      if (!profile.cropCashOk) {
        steps.push({ id: `${line.id}-cash`, label: "денежная оценка справочно", output: "профиль не разрешает замену натуры деньгами" });
      } else {
        const conv = convert(mul(dueAmt, price.qty), line.currency || base, base, quotes, miss, line.cropType);
        if (conv) {
          money = add(money, conv);
          steps.push({ id: `${line.id}-cash`, label: "денежный эквивалент (профиль допускает)", output: formatMoney(conv, base) });
        }
      }
    }
  }
  const due = natural.length > 0;
  return cat({
    id: "crops",
    title: "Урожай",
    status: miss.length ? "incomplete" : due ? "due" : "not_entered",
    included: due,
    reasons: ["1 т при 10 % = 100 кг, не 10 ₽. Деньги только при цене и разрешённом профиле."],
    missing: miss,
    zakatMoney: profile.cropCashOk && !isZero(money) ? money : undefined,
    natural,
    ruleIds: ["rule.crops.bukhari1483"],
    sourceIds: ["bukhari.1483", "bukhari.1447", "quran.6.141"],
    steps,
  });
}

function calcRikaz(input: CalculationInput, quotes: Quote[], base: string): CategoryResult {
  const r = input.rikaz;
  const steps: Step[] = [];
  const miss: string[] = [];
  const amt = q(r.amount, "риказ");
  if (!amt.ok) {
    return cat({
      id: "rikaz",
      title: "Риказ",
      status: "not_entered",
      reasons: [],
      missing: [],
      ruleIds: ["rule.rikaz.bukhari6912"],
      sourceIds: ["bukhari.6912"],
      steps,
    });
  }
  if (r.classifiedAsRikaz !== true) {
    return cat({
      id: "rikaz",
      title: "Риказ",
      status: r.classifiedAsRikaz === false ? "not_applicable" : "incomplete",
      reasons: ["Обычная находка не классифицируется как риказ автоматически. Нужно подтверждение, что это риказ в смысле Бухари 6912."],
      missing: r.classifiedAsRikaz === null ? ["Классификация как риказ не подтверждена."] : [],
      ruleIds: ["rule.rikaz.bukhari6912"],
      sourceIds: ["bukhari.6912"],
      steps,
    });
  }
  const conv = convert(amt.qty, r.currency || base, base, quotes, miss, "риказ");
  if (conv === null) {
    return cat({
      id: "rikaz",
      title: "Риказ",
      status: "incomplete",
      reasons: [],
      missing: miss,
      ruleIds: ["rule.rikaz.bukhari6912"],
      sourceIds: ["bukhari.6912"],
      steps,
    });
  }
  const zakat = mulRatio(conv, 1n, 5n);
  steps.push({
    id: "rikaz",
    label: "1/5 (Бухари 6912)",
    input: formatMoney(conv, base),
    output: formatMoney(zakat, base),
    ruleId: "rule.rikaz.bukhari6912",
  });
  return cat({
    id: "rikaz",
    title: "Риказ",
    status: "due",
    included: true,
    reasons: ["Ставка 1/5. Хауль не применяется. Не смешивается с 2,5 % имущества без пометки."],
    missing: miss,
    baseMoney: conv,
    zakatMoney: zakat,
    ruleIds: ["rule.rikaz.bukhari6912"],
    sourceIds: ["bukhari.6912"],
    steps,
  });
}

function calcFitr(
  input: CalculationInput,
  profile: Profile,
  quotes: Quote[],
  base: string,
  warnings: string[],
): CategoryResult {
  const f = input.fitr;
  const steps: Step[] = [];
  const miss: string[] = [];
  const people = parseCount(f.people, "число людей для фитра");
  if (!people.ok || !people.count) {
    return cat({
      id: "fitr",
      title: "Закят аль-фитр",
      status: "not_entered",
      reasons: [],
      missing: [],
      ruleIds: ["rule.fitr.bukhari1503"],
      sourceIds: ["bukhari.1503"],
      steps,
    });
  }
  const n = people.count;
  if (f.mode === "food_sa") {
    const sa = n;
    steps.push({
      id: "fitr-sa",
      label: `${n} чел. × 1 ṣāʿ (${f.product})`,
      output: `${sa} ṣāʿ`,
      ruleId: "rule.fitr.bukhari1503",
    });
    warnings.push("Перевод ṣāʿ в килограммы в хадисе не задан. Пометка «≈3 кг» на sunnah.com — пояснение издания, не текст хадиса.");
    return cat({
      id: "fitr",
      title: "Закят аль-фитр",
      status: "due",
      included: true,
      reasons: ["Бухари 1503: 1 ṣāʿ фиников или ячменя на каждого мусульманина до праздничной молитвы."],
      missing: miss,
      natural: [{ unit: "sa", count: String(sa), label: `${sa} ṣāʿ (${f.product})` }],
      ruleIds: ["rule.fitr.bukhari1503"],
      sourceIds: ["bukhari.1503", "bukhari.1506"],
      steps,
    });
  }
  if (!profile.fitrCashOk) {
    return cat({
      id: "fitr",
      title: "Закят аль-фитр",
      status: "incomplete",
      reasons: [`Профиль «${profile.name}» не разрешает денежную замену фитра. Укажите выдачу ṣāʿ продукта.`],
      missing: ["Денежный эквивалент фитра не разрешён выбранным профилем."],
      natural: [{ unit: "sa", count: String(n), label: `${n} ṣāʿ (натура, профиль без замены)` }],
      ruleIds: ["rule.fitr.bukhari1503"],
      sourceIds: ["bukhari.1503"],
      steps,
    });
  }
  const per = q(f.cashPerPerson, "денежный эквивалент фитра на человека");
  if (!per.ok) {
    return cat({
      id: "fitr",
      title: "Закят аль-фитр",
      status: "incomplete",
      reasons: ["Для денежного режима нужна местная норма на человека. Тестовые 300 — не норма региона."],
      missing: [per.error],
      ruleIds: ["rule.fitr.cash.local"],
      sourceIds: ["bukhari.1503"],
      steps,
    });
  }
  const rawTotal = mul(per.qty, qInt(n));
  const conv = convert(rawTotal, f.currency || base, base, quotes, miss, "фитр");
  if (conv === null) {
    return cat({
      id: "fitr",
      title: "Закят аль-фитр",
      status: "incomplete",
      reasons: [],
      missing: miss,
      ruleIds: ["rule.fitr.cash.local"],
      sourceIds: ["bukhari.1503"],
      steps,
    });
  }
  steps.push({
    id: "fitr-cash",
    label: `${n} × ${formatPlain(per.qty)} ${f.currency || base} (местная методика, не хадис${f.region ? `, ${f.region}` : ""}${f.year ? ` ${f.year}` : ""})`,
    output: formatMoney(conv, base),
    ruleId: "rule.fitr.cash.local",
  });
  return cat({
    id: "fitr",
    title: "Закят аль-фитр",
    status: "due",
    included: true,
    reasons: ["Денежная сумма — местный эквивалент, допущенный профилем. Не норма из хадиса."],
    missing: miss,
    zakatMoney: conv,
    ruleIds: ["rule.fitr.cash.local"],
    sourceIds: ["bukhari.1503"],
    steps,
  });
}

export function emptyInput(partial?: Partial<CalculationInput>): CalculationInput {
  return {
    schemaVersion: 1,
    id: partial?.id ?? `calc_${Date.now()}`,
    title: partial?.title ?? "Черновик",
    asOfDate: partial?.asOfDate ?? new Date().toISOString().slice(0, 10),
    baseCurrency: partial?.baseCurrency ?? "RUB",
    profileId: partial?.profileId ?? "islamic-relief-silver",
    hawlConfirmed: partial?.hawlConfirmed ?? null,
    hawlStartDate: partial?.hawlStartDate ?? "",
    calendar: partial?.calendar ?? "hijri_lunar",
    money: partial?.money ?? [
      { id: "m_main", label: "Основной счёт", currency: partial?.baseCurrency ?? "RUB", amount: "", ownerSharePct: "100", joint: false },
    ],
    metals: partial?.metals ?? [],
    trade: partial?.trade ?? {
      inventory: "",
      businessCash: "",
      receivables: "",
      payables: "",
      currency: partial?.baseCurrency ?? "RUB",
      ownerSharePct: "100",
    },
    investments: partial?.investments ?? [],
    realEstate: partial?.realEstate ?? [],
    crypto: partial?.crypto ?? [],
    debts: partial?.debts ?? [],
    livestock: partial?.livestock ?? {
      grazing: null,
      hawlConfirmed: null,
      sheep: "",
      camels: "",
      cattle: "",
      cashSubstitute: false,
      priceSheep: "",
      priceCamel: "",
      priceCattle: "",
      currency: partial?.baseCurrency ?? "RUB",
    },
    crops: partial?.crops ?? [],
    rikaz: partial?.rikaz ?? { classifiedAsRikaz: null, amount: "", currency: partial?.baseCurrency ?? "RUB", note: "" },
    fitr: partial?.fitr ?? {
      people: "",
      mode: "cash_equivalent",
      product: "dates",
      cashPerPerson: "",
      currency: partial?.baseCurrency ?? "RUB",
      region: "",
      year: "",
    },
    special: partial?.special ?? {
      minorOwner: false,
      inherited: false,
      incompleteOwnership: false,
      prepaid: false,
      overduePeriods: "",
    },
    quotes: partial?.quotes ?? { asOfDate: "", fetchedAt: "", quotes: [] },
    nisabOverride: partial?.nisabOverride,
  };
}
