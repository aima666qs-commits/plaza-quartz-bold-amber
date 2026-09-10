import type { ReactNode } from "react";
import { ChevronDown, Plus, Trash2 } from "lucide-react";
import { Field, Select, TextInput } from "@/components/ui/field.tsx";
import { Button } from "@/components/ui/button.tsx";
import { useMizan } from "@/stores/mizan-store.ts";
import { PROFILES } from "@/lib/mizan/profiles.ts";
import { CRYPTO_OPINION_LINKS } from "@/lib/mizan/sources.ts";
import { NISAB_MODE_RU } from "@/lib/mizan/labels.ts";
import { cn, uid } from "@/lib/utils.ts";
import type { CalculationInput, CryptoLine, InvestmentLine, MetalLine, MoneyLine, NisabMode, Quote } from "@/lib/mizan/types.ts";

const CURRENCIES = ["RUB", "USD", "EUR", "EGP", "SAR", "AED", "TRY", "GBP"];

export const SECTIONS = [
  { id: "params", title: "Как считать" },
  { id: "money", title: "Деньги" },
  { id: "metals", title: "Золото и серебро" },
  { id: "trade", title: "Бизнес и товар" },
  { id: "investments", title: "Инвестиции" },
  { id: "crypto", title: "Криптовалюта" },
  { id: "property", title: "Недвижимость" },
  { id: "debts", title: "Долги" },
  { id: "livestock", title: "Скот" },
  { id: "crops", title: "Урожай" },
  { id: "specials", title: "Клад и фитр" },
] as const;

export function SectionFrame({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  const openId = useMizan((s) => s.openZakatSection);
  const setOpen = useMizan((s) => s.setOpenZakatSection);
  const open = openId === id;
  return (
    <section id={`sec-${id}`} className="scroll-mt-24 overflow-hidden border border-[var(--line)] bg-[var(--surface)]">
      <button
        type="button"
        className="flex min-h-12 w-full items-center justify-between gap-3 px-[var(--pad,1rem)] py-3 text-left"
        aria-expanded={open}
        onClick={() => setOpen(open ? null : id)}
      >
        <span className="font-display text-lg text-balance">{title}</span>
        <ChevronDown className={cn("size-5 shrink-0 text-[var(--muted)] transition-transform duration-200", open && "rotate-180")} />
      </button>
      <div className="roll" data-open={open ? "true" : "false"} {...(!open ? { inert: true } : {})}>
        <div className="roll-inner">
          <div className="grid gap-4 px-[var(--pad,1rem)] pb-[var(--pad,1rem)]">{children}</div>
        </div>
      </div>
    </section>
  );
}

export function ParamsSection() {
  const input = useMizan((s) => s.input);
  const setInput = useMizan((s) => s.setInput);
  const quotesStatus = useMizan((s) => s.quotesStatus);
  const quotesError = useMizan((s) => s.quotesError);
  const gold = input.quotes.quotes.find((q) => q.asset === "XAU_G");
  const silver = input.quotes.quotes.find((q) => q.asset === "XAG_G");
  const profile = PROFILES.find((p) => p.id === input.profileId);
  return (
    <SectionFrame id="params" title="Как считать">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Название расчёта">
          <TextInput value={input.title} onChange={(e) => setInput({ title: e.target.value })} />
        </Field>
        <Field label="Дата">
          <TextInput type="date" value={input.asOfDate} onChange={(e) => setInput({ asOfDate: e.target.value })} />
        </Field>
        <Field label="Валюта расчёта">
          <Select value={input.baseCurrency} onChange={(e) => setInput({ baseCurrency: e.target.value })}>
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="По какой школе" hint="Меняет правила, ваши цифры не стирает.">
          <Select
            value={input.profileId}
            onChange={(e) => setInput({ profileId: e.target.value as CalculationInput["profileId"] })}
          >
            {PROFILES.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Какой год считать" hint="В шариате хауль — лунный год владения.">
          <Select
            value={input.calendar}
            onChange={(e) => setInput({ calendar: e.target.value as CalculationInput["calendar"] })}
          >
            <option value="hijri_lunar">Лунный год (хиджра)</option>
            <option value="gregorian_approx">Обычный календарь, примерно</option>
          </Select>
        </Field>
      </div>
      {profile ? <p className="text-xs text-[var(--muted)]">{profile.notes}</p> : null}
      {input.profileId === "custom" ? (
        <Field label="Режим нисаба (свой набор правил)">
          <Select
            value={input.nisabOverride?.mode ?? profile?.nisabMode ?? "gold"}
            onChange={(e) =>
              setInput({
                nisabOverride: { ...input.nisabOverride, mode: e.target.value as NisabMode },
              })
            }
          >
            {(Object.keys(NISAB_MODE_RU) as NisabMode[]).map((m) => (
              <option key={m} value={m}>
                {NISAB_MODE_RU[m]}
              </option>
            ))}
          </Select>
        </Field>
      ) : null}
      <Field
        label="Деньги у вас уже год?"
        hint="Хауль — год владения. Без ответа денежный закят не считается готовым. На урожай, фитр и клад это не распространяется."
      >
        <Select
          value={input.hawlConfirmed === null ? "unknown" : input.hawlConfirmed ? "yes" : "no"}
          onChange={(e) =>
            setInput({
              hawlConfirmed: e.target.value === "unknown" ? null : e.target.value === "yes",
            })
          }
        >
          <option value="unknown">Пока не знаю</option>
          <option value="yes">Да, год уже прошёл</option>
          <option value="no">Нет, год ещё не прошёл</option>
        </Select>
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Нисаб золота, г" hint="Сколько граммов считается порогом. 85 или 87,48 — современные переводы динара, не текст хадиса.">
          <TextInput
            inputMode="decimal"
            value={input.nisabOverride?.goldGrams ?? ""}
            placeholder={profile?.nisabGoldGrams}
            onChange={(e) =>
              setInput({
                nisabOverride: { ...input.nisabOverride, goldGrams: e.target.value },
              })
            }
          />
        </Field>
        <Field label="Нисаб серебра, г">
          <TextInput
            inputMode="decimal"
            value={input.nisabOverride?.silverGrams ?? ""}
            placeholder={profile?.nisabSilverGrams}
            onChange={(e) =>
              setInput({
                nisabOverride: { ...input.nisabOverride, silverGrams: e.target.value },
              })
            }
          />
        </Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label={`Цена золота за грамм, ${input.baseCurrency}`}
          hint={gold ? `${gold.source} · ${gold.status === "manual" ? "вы ввели сами" : gold.status}` : "Нет цены — введите сами. На прошлую дату сегодняшняя цена не подставляется."}
        >
          <TextInput
            inputMode="decimal"
            value={gold?.rate ?? ""}
            onChange={(e) => patchQuote(input, setInput, "XAU_G", e.target.value)}
          />
        </Field>
        <Field label={`Цена серебра за грамм, ${input.baseCurrency}`} hint={silver ? `${silver.source} · ${silver.status === "manual" ? "вы ввели сами" : silver.status}` : "Нет цены"}>
          <TextInput
            inputMode="decimal"
            value={silver?.rate ?? ""}
            onChange={(e) => patchQuote(input, setInput, "XAG_G", e.target.value)}
          />
        </Field>
      </div>
      <p className="text-xs text-[var(--muted)]">
        Цены: {quotesStatus === "ok" ? "обновлены" : quotesStatus === "loading" ? "загружаем" : quotesStatus === "error" ? "не загрузились" : "ещё не брали"}
        {quotesError ? ` — ${quotesError}` : ""}. То, что вы вписали сами, рынок не перезапишет.
      </p>
    </SectionFrame>
  );
}

function patchQuote(
  input: CalculationInput,
  setInput: (p: Partial<CalculationInput>) => void,
  asset: "XAU_G" | "XAG_G",
  rate: string,
) {
  const rest = input.quotes.quotes.filter((q) => q.asset !== asset);
  const next = {
    ...input.quotes,
    quotes: [
      ...rest,
      {
        id: `manual:${asset}`,
        asset,
        base: asset,
        quote: input.baseCurrency,
        unit: "g",
        rate,
        marketTime: null,
        fetchedAt: new Date().toISOString(),
        source: "ручной ввод пользователя",
        status: "manual" as const,
        author: "user",
      },
    ],
  };
  setInput({ quotes: next });
}

function patchFx(
  input: CalculationInput,
  setInput: (p: Partial<CalculationInput>) => void,
  from: string,
  rate: string,
) {
  const rest = input.quotes.quotes.filter((q) => !(q.asset === from && q.quote === input.baseCurrency && q.unit === "fx"));
  const row: Quote = {
    id: `manual:fx:${from}:${input.baseCurrency}`,
    asset: from,
    base: from,
    quote: input.baseCurrency,
    unit: "fx",
    rate,
    marketTime: null,
    fetchedAt: new Date().toISOString(),
    source: "ручной ввод пользователя",
    status: "manual",
    author: "user",
  };
  setInput({ quotes: { ...input.quotes, quotes: [...rest, row] } });
}

export function MoneySection() {
  const input = useMizan((s) => s.input);
  const setInput = useMizan((s) => s.setInput);
  const add = () =>
    setInput({
      money: [
        ...input.money,
        { id: uid("m"), label: "Счёт", currency: input.baseCurrency, amount: "", ownerSharePct: "100", joint: false },
      ],
    });
  return (
    <SectionFrame id="money" title="Деньги, которые вы держите год">
      <p className="text-sm text-[var(--muted)]">
        Наличные, карта, вклад и то, что вам должны — если это реально можно получить. Если валюта другая, укажите курс, иначе сумма не посчитается.
      </p>
      {input.money.map((line, i) => (
        <MoneyRow key={line.id} line={line} index={i} />
      ))}
      <Button variant="secondary" onClick={add}>
        <Plus className="size-4" /> Добавить счёт или валюту
      </Button>
    </SectionFrame>
  );
}

function MoneyRow({ line, index }: { line: MoneyLine; index: number }) {
  const input = useMizan((s) => s.input);
  const setInput = useMizan((s) => s.setInput);
  const update = (patch: Partial<MoneyLine>) => {
    const money = input.money.map((m) => (m.id === line.id ? { ...m, ...patch } : m));
    setInput({ money });
  };
  const fx = input.quotes.quotes.find((q) => q.asset === line.currency && q.quote === input.baseCurrency && q.unit === "fx");
  const needsFx = line.currency !== input.baseCurrency;
  return (
    <div className="row-box grid gap-3 border border-[var(--line)] p-3 sm:grid-cols-12">
      <div className="sm:col-span-3">
        <Field label="Название">
          <TextInput value={line.label} onChange={(e) => update({ label: e.target.value })} />
        </Field>
      </div>
      <div className="sm:col-span-2">
        <Field label="Валюта">
          <Select value={line.currency} onChange={(e) => update({ currency: e.target.value })}>
            {CURRENCIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </Select>
        </Field>
      </div>
      <div className="sm:col-span-3">
        <Field label="Сумма">
          <TextInput inputMode="decimal" value={line.amount} onChange={(e) => update({ amount: e.target.value })} />
        </Field>
      </div>
      <div className="sm:col-span-2">
        <Field label="Ваша доля, %">
          <TextInput value={line.ownerSharePct} onChange={(e) => update({ ownerSharePct: e.target.value })} />
        </Field>
      </div>
      {needsFx ? (
        <div className="sm:col-span-3">
          <Field
            label={`Курс: сколько ${input.baseCurrency} за 1 ${line.currency}`}
            hint={fx ? (fx.status === "manual" ? "вы ввели сами" : "с рынка") : "Впишите сами или нажмите «Обновить цены»"}
          >
            <TextInput
              inputMode="decimal"
              value={fx?.rate ?? ""}
              onChange={(e) => patchFx(input, setInput, line.currency, e.target.value)}
            />
          </Field>
        </div>
      ) : null}
      <div className="flex items-end sm:col-span-2">
        <label className="flex min-h-11 items-center gap-2 text-xs">
          <input type="checkbox" checked={line.joint} onChange={(e) => update({ joint: e.target.checked })} />
          Общее имущество
        </label>
      </div>
      <div className="flex items-end sm:col-span-2">
        <Button
          variant="ghost"
          aria-label="Удалить"
          onClick={() => setInput({ money: input.money.filter((m) => m.id !== line.id) })}
        >
          <Trash2 className="size-4" /> {index + 1}
        </Button>
      </div>
    </div>
  );
}

export function MetalsSection() {
  const input = useMizan((s) => s.input);
  const setInput = useMizan((s) => s.setInput);
  return (
    <SectionFrame id="metals" title="Золото и серебро">
      <p className="text-sm text-[var(--muted)]">
        Чистое вещество = масса × проба / 1000. Украшения: у ханафитов входят в закят, у шафиитов, маликитов и ханбалитов личное ношение обычно не входит.
      </p>
      {input.metals.map((line) => (
        <MetalRow key={line.id} line={line} />
      ))}
      <Button
        variant="secondary"
        onClick={() =>
          setInput({
            metals: [
              ...input.metals,
              { id: uid("au"), metal: "gold", grams: "", purityPerMille: "999", form: "bullion", use: "investment" },
            ],
          })
        }
      >
        <Plus className="size-4" /> Добавить металл
      </Button>
    </SectionFrame>
  );
}

function MetalRow({ line }: { line: MetalLine }) {
  const input = useMizan((s) => s.input);
  const setInput = useMizan((s) => s.setInput);
  const update = (patch: Partial<MetalLine>) =>
    setInput({ metals: input.metals.map((m) => (m.id === line.id ? { ...m, ...patch } : m)) });
  return (
    <div className="row-box grid gap-3 border border-[var(--line)] p-3 sm:grid-cols-5">
      <Field label="Металл">
        <Select value={line.metal} onChange={(e) => update({ metal: e.target.value as MetalLine["metal"] })}>
          <option value="gold">Золото</option>
          <option value="silver">Серебро</option>
        </Select>
      </Field>
      <Field label="Масса, г">
        <TextInput value={line.grams} inputMode="decimal" onChange={(e) => update({ grams: e.target.value })} />
      </Field>
      <Field label="Проба" hint="Например 585, 750, 999 из тысячи">
        <TextInput value={line.purityPerMille} inputMode="decimal" onChange={(e) => update({ purityPerMille: e.target.value })} />
      </Field>
      <Field label="Форма">
        <Select value={line.form} onChange={(e) => update({ form: e.target.value as MetalLine["form"] })}>
          <option value="bullion">Слиток</option>
          <option value="coin">Монета</option>
          <option value="jewelry">Украшение</option>
          <option value="other">Иное</option>
        </Select>
      </Field>
      <Field label="Назначение">
        <Select value={line.use} onChange={(e) => update({ use: e.target.value as MetalLine["use"] })}>
          <option value="investment">Накопление</option>
          <option value="personal_wear">Личное ношение</option>
          <option value="trade">Торговля</option>
          <option value="unknown">Неизвестно</option>
        </Select>
      </Field>
      <Button variant="ghost" onClick={() => setInput({ metals: input.metals.filter((m) => m.id !== line.id) })}>
        <Trash2 className="size-4" /> Удалить
      </Button>
    </div>
  );
}

export function TradeSection() {
  const t = useMizan((s) => s.input.trade);
  const setInput = useMizan((s) => s.setInput);
  const set = (patch: Partial<typeof t>) => setInput({ trade: { ...t, ...patch } });
  return (
    <SectionFrame id="trade" title="Бизнес и товар">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Товар на складе">
          <TextInput value={t.inventory} onChange={(e) => set({ inventory: e.target.value })} />
        </Field>
        <Field label="Деньги бизнеса">
          <TextInput value={t.businessCash} onChange={(e) => set({ businessCash: e.target.value })} />
        </Field>
        <Field label="Вам должны" hint="Только то, что реально можно получить">
          <TextInput value={t.receivables} onChange={(e) => set({ receivables: e.target.value })} />
        </Field>
        <Field label="Долги бизнеса">
          <TextInput value={t.payables} onChange={(e) => set({ payables: e.target.value })} />
        </Field>
        <Field label="Валюта">
          <Select value={t.currency} onChange={(e) => set({ currency: e.target.value })}>
            {CURRENCIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </Select>
        </Field>
        <Field label="Ваша доля, %">
          <TextInput value={t.ownerSharePct} onChange={(e) => set({ ownerSharePct: e.target.value })} />
        </Field>
      </div>
    </SectionFrame>
  );
}

export function InvestmentsSection() {
  const input = useMizan((s) => s.input);
  const setInput = useMizan((s) => s.setInput);
  return (
    <SectionFrame id="investments" title="Инвестиции">
      <p className="text-sm text-[var(--muted)]">
        Если акции как товар — считаем всё. Если только часть имущества в них закятная — укажите процент. «Примерно 25 %» — оценка, не правило из Корана.
      </p>
      {input.investments.map((line) => (
        <InvestRow key={line.id} line={line} />
      ))}
      <Button
        variant="secondary"
        onClick={() =>
          setInput({
            investments: [
              ...input.investments,
              {
                id: uid("inv"),
                kind: "stock",
                label: "Акции",
                currency: input.baseCurrency,
                marketValue: "",
                mode: "trade_100",
                assetFractionPct: "",
                ownerSharePct: "100",
              },
            ],
          })
        }
      >
        <Plus className="size-4" /> Добавить вложение
      </Button>
    </SectionFrame>
  );
}

function InvestRow({ line }: { line: InvestmentLine }) {
  const input = useMizan((s) => s.input);
  const setInput = useMizan((s) => s.setInput);
  const update = (patch: Partial<InvestmentLine>) =>
    setInput({ investments: input.investments.map((m) => (m.id === line.id ? { ...m, ...patch } : m)) });
  return (
    <div className="row-box grid gap-3 border border-[var(--line)] p-3 sm:grid-cols-3">
      <Field label="Название">
        <TextInput value={line.label} onChange={(e) => update({ label: e.target.value })} />
      </Field>
      <Field label="Вид">
        <Select value={line.kind} onChange={(e) => update({ kind: e.target.value as InvestmentLine["kind"] })}>
          <option value="stock">Акции</option>
          <option value="fund">Фонд</option>
          <option value="etf">ETF</option>
          <option value="sukuk">Сукук</option>
          <option value="pension">Пенсионный счёт</option>
          <option value="other">Иное</option>
        </Select>
      </Field>
      <Field label="Рыночная стоимость">
        <TextInput value={line.marketValue} onChange={(e) => update({ marketValue: e.target.value })} />
      </Field>
      <Field label="Как считать">
        <Select value={line.mode} onChange={(e) => update({ mode: e.target.value as InvestmentLine["mode"] })}>
          <option value="trade_100">Как товар — целиком</option>
          <option value="asset_fraction">Только закятная часть</option>
          <option value="proxy_25">Примерно 25 % (оценка, не правило)</option>
        </Select>
      </Field>
      {line.mode === "asset_fraction" ? (
        <Field label="Какая доля, %" hint="Без доли расчёт неполный. 25 % сами не подставим.">
          <TextInput value={line.assetFractionPct} onChange={(e) => update({ assetFractionPct: e.target.value })} />
        </Field>
      ) : null}
      <Button variant="ghost" onClick={() => setInput({ investments: input.investments.filter((m) => m.id !== line.id) })}>
        <Trash2 className="size-4" /> Удалить
      </Button>
    </div>
  );
}

export function CryptoSection() {
  const input = useMizan((s) => s.input);
  const setInput = useMizan((s) => s.setInput);
  return (
    <SectionFrame id="crypto" title="Криптовалюта">
      <p className="text-sm text-[var(--muted)]">
        Прямого хадиса нет. То, что можно сразу продать, входит в деньги по цене. Стейкинг, DeFi и заблокированное сами не включаем. Ссылки ниже — мнения, не хукм.
      </p>
      <ul className="flex flex-wrap gap-2 text-xs">
        {CRYPTO_OPINION_LINKS.map((l) => (
          <li key={l.url}>
            <a className="underline text-[var(--muted)]" href={l.url} target="_blank" rel="noreferrer">
              {l.name}
            </a>
          </li>
        ))}
      </ul>
      {input.crypto.map((line) => (
        <CryptoRow key={line.id} line={line} />
      ))}
      <Button
        variant="secondary"
        onClick={() =>
          setInput({
            crypto: [
              ...input.crypto,
              {
                id: uid("c"),
                symbol: "BTC",
                name: "Bitcoin",
                quantity: "",
                price: "",
                priceCurrency: input.baseCurrency,
                availability: "liquid",
                purpose: "hold",
              },
            ],
          })
        }
      >
        <Plus className="size-4" /> Добавить монету
      </Button>
    </SectionFrame>
  );
}

function CryptoRow({ line }: { line: CryptoLine }) {
  const input = useMizan((s) => s.input);
  const setInput = useMizan((s) => s.setInput);
  const update = (patch: Partial<CryptoLine>) =>
    setInput({ crypto: input.crypto.map((m) => (m.id === line.id ? { ...m, ...patch } : m)) });
  return (
    <div className="row-box grid gap-3 border border-[var(--line)] p-3 sm:grid-cols-3">
      <Field label="Монета">
        <TextInput value={line.symbol} onChange={(e) => update({ symbol: e.target.value })} />
      </Field>
      <Field label="Количество">
        <TextInput value={line.quantity} onChange={(e) => update({ quantity: e.target.value })} />
      </Field>
      <Field label={`Цена, ${line.priceCurrency}`}>
        <TextInput value={line.price} onChange={(e) => update({ price: e.target.value })} />
      </Field>
      <Field label="Можно ли продать сейчас">
        <Select
          value={line.availability}
          onChange={(e) => update({ availability: e.target.value as CryptoLine["availability"] })}
        >
          <option value="liquid">Да, сразу</option>
          <option value="staked">В стейкинге</option>
          <option value="locked">Заблокировано</option>
          <option value="defi">В DeFi</option>
          <option value="lent">Отдано в долг</option>
          <option value="unknown">Не знаю</option>
        </Select>
      </Field>
      <Button variant="ghost" onClick={() => setInput({ crypto: input.crypto.filter((m) => m.id !== line.id) })}>
        <Trash2 className="size-4" />
      </Button>
    </div>
  );
}

export function PropertySection() {
  const input = useMizan((s) => s.input);
  const setInput = useMizan((s) => s.setInput);
  return (
    <SectionFrame id="property" title="Недвижимость">
      {input.realEstate.map((line) => (
        <div key={line.id} className="grid gap-3 border border-[var(--line)] p-3 sm:grid-cols-3">
          <Field label="Объект">
            <TextInput
              value={line.label}
              onChange={(e) =>
                setInput({
                  realEstate: input.realEstate.map((x) => (x.id === line.id ? { ...x, label: e.target.value } : x)),
                })
              }
            />
          </Field>
          <Field label="Назначение">
            <Select
              value={line.purpose}
              onChange={(e) =>
                setInput({
                  realEstate: input.realEstate.map((x) =>
                    x.id === line.id ? { ...x, purpose: e.target.value as typeof line.purpose } : x,
                  ),
                })
              }
            >
              <option value="personal">Личное</option>
              <option value="rental">Аренда (доход)</option>
              <option value="trade">Торговля (стоимость)</option>
            </Select>
          </Field>
          <Field label={line.purpose === "rental" ? "Годовой доход" : "Стоимость"}>
            <TextInput
              value={line.purpose === "rental" ? line.annualRent : line.propertyValue}
              onChange={(e) =>
                setInput({
                  realEstate: input.realEstate.map((x) =>
                    x.id === line.id
                      ? line.purpose === "rental"
                        ? { ...x, annualRent: e.target.value }
                        : { ...x, propertyValue: e.target.value }
                      : x,
                  ),
                })
              }
            />
          </Field>
        </div>
      ))}
      <Button
        variant="secondary"
        onClick={() =>
          setInput({
            realEstate: [
              ...input.realEstate,
              {
                id: uid("re"),
                purpose: "personal",
                label: "Объект",
                currency: input.baseCurrency,
                propertyValue: "",
                annualRent: "",
              },
            ],
          })
        }
      >
        <Plus className="size-4" /> Добавить объект
      </Button>
    </SectionFrame>
  );
}

export function DebtsSection() {
  const input = useMizan((s) => s.input);
  const setInput = useMizan((s) => s.setInput);
  return (
    <SectionFrame id="debts" title="Долги">
      {input.debts.map((line) => (
        <div key={line.id} className="grid gap-3 border border-[var(--line)] p-3 sm:grid-cols-4">
          <Field label="Название">
            <TextInput
              value={line.label}
              onChange={(e) =>
                setInput({ debts: input.debts.map((x) => (x.id === line.id ? { ...x, label: e.target.value } : x)) })
              }
            />
          </Field>
          <Field label="Вид">
            <Select
              value={line.kind}
              onChange={(e) =>
                setInput({
                  debts: input.debts.map((x) => (x.id === line.id ? { ...x, kind: e.target.value as typeof line.kind } : x)),
                })
              }
            >
              <option value="payable">Я должен</option>
              <option value="receivable">Мне должны</option>
            </Select>
          </Field>
          <Field label="Сумма">
            <TextInput
              value={line.amount}
              onChange={(e) =>
                setInput({ debts: input.debts.map((x) => (x.id === line.id ? { ...x, amount: e.target.value } : x)) })
              }
            />
          </Field>
          <Field label="Когда / можно ли получить">
            <Select
              value={line.kind === "payable" ? line.timing : line.collectible}
              onChange={(e) =>
                setInput({
                  debts: input.debts.map((x) =>
                    x.id === line.id
                      ? line.kind === "payable"
                        ? { ...x, timing: e.target.value as typeof line.timing }
                        : { ...x, collectible: e.target.value as typeof line.collectible }
                      : x,
                  ),
                })
              }
            >
              {line.kind === "payable" ? (
                <>
                  <option value="immediate">Нужно отдать сейчас</option>
                  <option value="long">Потом, не срочно</option>
                  <option value="unknown">Не знаю</option>
                </>
              ) : (
                <>
                  <option value="yes">Можно получить</option>
                  <option value="no">Скорее нет</option>
                  <option value="unknown">Не знаю</option>
                </>
              )}
            </Select>
          </Field>
          <Button variant="ghost" onClick={() => setInput({ debts: input.debts.filter((x) => x.id !== line.id) })}>
            <Trash2 className="size-4" />
          </Button>
        </div>
      ))}
      <Button
        variant="secondary"
        onClick={() =>
          setInput({
            debts: [
              ...input.debts,
              {
                id: uid("d"),
                kind: "payable",
                label: "Долг",
                currency: input.baseCurrency,
                amount: "",
                timing: "immediate",
                collectible: "yes",
              },
            ],
          })
        }
      >
        <Plus className="size-4" /> Добавить долг
      </Button>
    </SectionFrame>
  );
}

export function LivestockSection() {
  const L = useMizan((s) => s.input.livestock);
  const profileId = useMizan((s) => s.input.profileId);
  const profile = PROFILES.find((p) => p.id === profileId);
  const setInput = useMizan((s) => s.setInput);
  const set = (patch: Partial<typeof L>) => setInput({ livestock: { ...L, ...patch } });
  return (
    <SectionFrame id="livestock" title="Скот">
      <p className="text-sm text-[var(--muted)]">
        Овцы: от 40 до 120 голов — одна овца, не «поделить на 40». Верблюды — Бухари 1454. Коровы — Абу Дауд 1576. Головы в рубли сами не складываем.
      </p>
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Пасётся сам?" hint="Саима — на подножном корму, не на купленном корме.">
          <Select
            value={L.grazing === null ? "u" : L.grazing ? "y" : "n"}
            onChange={(e) => set({ grazing: e.target.value === "u" ? null : e.target.value === "y" })}
          >
            <option value="u">Не указано</option>
            <option value="y">Да, пасётся</option>
            <option value="n">Нет, на купленном корме</option>
          </Select>
        </Field>
        <Field label="Скот у вас уже год?">
          <Select
            value={L.hawlConfirmed === null ? "u" : L.hawlConfirmed ? "y" : "n"}
            onChange={(e) => set({ hawlConfirmed: e.target.value === "u" ? null : e.target.value === "y" })}
          >
            <option value="u">Пока не знаю</option>
            <option value="y">Да</option>
            <option value="n">Нет</option>
          </Select>
        </Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Овцы / козы, голов">
          <TextInput value={L.sheep} onChange={(e) => set({ sheep: e.target.value })} />
        </Field>
        <Field label="Верблюды, голов">
          <TextInput value={L.camels} onChange={(e) => set({ camels: e.target.value })} />
        </Field>
        <Field label="КРС, голов">
          <TextInput value={L.cattle} onChange={(e) => set({ cattle: e.target.value })} />
        </Field>
      </div>
      {profile?.livestockCashOk ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex min-h-11 items-center gap-2 text-sm">
            <input type="checkbox" checked={L.cashSubstitute} onChange={(e) => set({ cashSubstitute: e.target.checked })} />
            Денежный эквивалент (если школа это допускает)
          </label>
          {L.cashSubstitute ? (
            <>
              <Field label="Цена овцы">
                <TextInput value={L.priceSheep} onChange={(e) => set({ priceSheep: e.target.value })} />
              </Field>
              <Field label="Цена верблюда">
                <TextInput value={L.priceCamel} onChange={(e) => set({ priceCamel: e.target.value })} />
              </Field>
              <Field label="Цена головы КРС">
                <TextInput value={L.priceCattle} onChange={(e) => set({ priceCattle: e.target.value })} />
              </Field>
            </>
          ) : null}
        </div>
      ) : (
        <p className="text-xs text-[var(--muted)]">Эта школа не подставляет деньги вместо голов сама.</p>
      )}
    </SectionFrame>
  );
}

export function CropsSection() {
  const input = useMizan((s) => s.input);
  const setInput = useMizan((s) => s.setInput);
  return (
    <SectionFrame id="crops" title="Урожай">
      <p className="text-sm text-[var(--muted)]">
        1 тонна = 1000 кг. Ставка 10 % → 100 кг, 5 % → 50 кг. В деньги переводим только если есть цена за кг. Год владения для урожая не нужен.
      </p>
      {input.crops.map((line) => (
        <div key={line.id} className="grid gap-3 border border-[var(--line)] p-3 sm:grid-cols-3">
          <Field label="Культура">
            <TextInput
              value={line.cropType}
              onChange={(e) =>
                setInput({ crops: input.crops.map((x) => (x.id === line.id ? { ...x, cropType: e.target.value } : x)) })
              }
            />
          </Field>
          <Field label="Масса, кг">
            <TextInput
              value={line.massKg}
              onChange={(e) =>
                setInput({ crops: input.crops.map((x) => (x.id === line.id ? { ...x, massKg: e.target.value } : x)) })
              }
            />
          </Field>
          <Field label="Полив">
            <Select
              value={line.irrigation}
              onChange={(e) =>
                setInput({
                  crops: input.crops.map((x) =>
                    x.id === line.id ? { ...x, irrigation: e.target.value as typeof line.irrigation } : x,
                  ),
                })
              }
            >
              <option value="natural">Дождь / самотёк (10 %)</option>
              <option value="costly">Колодец, насос (5 %)</option>
              <option value="mixed">И так, и так</option>
              <option value="unknown">Не знаю</option>
            </Select>
          </Field>
          {line.irrigation === "mixed" ? (
            <Field label="Какая доля дождём, %">
              <TextInput
                value={line.mixedNaturalSharePct}
                onChange={(e) =>
                  setInput({
                    crops: input.crops.map((x) => (x.id === line.id ? { ...x, mixedNaturalSharePct: e.target.value } : x)),
                  })
                }
              />
            </Field>
          ) : null}
          <Field label="Цена за кг (необязательно)">
            <TextInput
              value={line.pricePerKg}
              onChange={(e) =>
                setInput({ crops: input.crops.map((x) => (x.id === line.id ? { ...x, pricePerKg: e.target.value } : x)) })
              }
            />
          </Field>
        </div>
      ))}
      <Button
        variant="secondary"
        onClick={() =>
          setInput({
            crops: [
              ...input.crops,
              {
                id: uid("cr"),
                cropType: "",
                massKg: "",
                irrigation: "natural",
                mixedNaturalSharePct: "",
                pricePerKg: "",
                currency: input.baseCurrency,
              },
            ],
          })
        }
      >
        <Plus className="size-4" /> Добавить урожай
      </Button>
    </SectionFrame>
  );
}

export function SpecialsSection() {
  const input = useMizan((s) => s.input);
  const setInput = useMizan((s) => s.setInput);
  const r = input.rikaz;
  const f = input.fitr;
  const s = input.special ?? {
    minorOwner: false,
    inherited: false,
    incompleteOwnership: false,
    prepaid: false,
    overduePeriods: "",
  };
  return (
    <SectionFrame id="specials" title="Клад и фитр">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Сумма клада" hint="Риказ — древний клад в земле, не любая находка.">
          <TextInput value={r.amount} onChange={(e) => setInput({ rikaz: { ...r, amount: e.target.value } })} />
        </Field>
        <Field label="Это риказ?">
          <Select
            value={r.classifiedAsRikaz === null ? "u" : r.classifiedAsRikaz ? "y" : "n"}
            onChange={(e) =>
              setInput({
                rikaz: { ...r, classifiedAsRikaz: e.target.value === "u" ? null : e.target.value === "y" },
              })
            }
          >
            <option value="u">Не подтверждаю</option>
            <option value="y">Да, это клад (риказ)</option>
            <option value="n">Нет, обычная находка</option>
          </Select>
        </Field>
        <Field label="За сколько человек фитр">
          <TextInput value={f.people} onChange={(e) => setInput({ fitr: { ...f, people: e.target.value } })} />
        </Field>
        <Field label="Чем платить фитр">
          <Select value={f.mode} onChange={(e) => setInput({ fitr: { ...f, mode: e.target.value as typeof f.mode } })}>
            <option value="food_sa">Продуктами (один саʿ)</option>
            <option value="cash_equivalent">Деньгами, как принято у вас</option>
          </Select>
        </Field>
        {f.mode === "cash_equivalent" ? (
          <>
            <Field label="Сумма на человека" hint="Это ваша местная сумма, не общая норма.">
              <TextInput
                value={f.cashPerPerson}
                onChange={(e) => setInput({ fitr: { ...f, cashPerPerson: e.target.value } })}
              />
            </Field>
            <Field label="Регион">
              <TextInput value={f.region} onChange={(e) => setInput({ fitr: { ...f, region: e.target.value } })} />
            </Field>
            <Field label="Год">
              <TextInput value={f.year} onChange={(e) => setInput({ fitr: { ...f, year: e.target.value } })} />
            </Field>
          </>
        ) : (
          <Field label="Продукт">
            <Select value={f.product} onChange={(e) => setInput({ fitr: { ...f, product: e.target.value as typeof f.product } })}>
              <option value="dates">Финики</option>
              <option value="barley">Ячмень</option>
              <option value="wheat">Пшеница</option>
              <option value="raisins">Изюм</option>
              <option value="local">Местный</option>
            </Select>
          </Field>
        )}
      </div>
      <fieldset className="grid gap-2 border border-[var(--line)] p-3">
        <legend className="px-1 text-[11px] uppercase tracking-[0.08em] text-[var(--muted)]">Особые ситуации</legend>
        <label className="flex min-h-11 items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={s.minorOwner}
            onChange={(e) => setInput({ special: { ...s, minorOwner: e.target.checked } })}
          />
          Несовершеннолетний владелец (закят за ребёнка сами не решаем)
        </label>
        <label className="flex min-h-11 items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={s.inherited}
            onChange={(e) => setInput({ special: { ...s, inherited: e.target.checked } })}
          />
          Это наследство
        </label>
        <label className="flex min-h-11 items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={s.incompleteOwnership}
            onChange={(e) => setInput({ special: { ...s, incompleteOwnership: e.target.checked } })}
          />
          Владение неполное
        </label>
        <label className="flex min-h-11 items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={s.prepaid}
            onChange={(e) => setInput({ special: { ...s, prepaid: e.target.checked } })}
          />
          Уже заплатил авансом (просто пометка)
        </label>
        <Field label="Пропущенные годы">
          <TextInput
            value={s.overduePeriods}
            placeholder="например: 2 лунных года — итог сам не умножаем"
            onChange={(e) => setInput({ special: { ...s, overduePeriods: e.target.value } })}
          />
        </Field>
      </fieldset>
    </SectionFrame>
  );
}

export function AllSections() {
  return (
    <>
      <ParamsSection />
      <MoneySection />
      <MetalsSection />
      <TradeSection />
      <InvestmentsSection />
      <CryptoSection />
      <PropertySection />
      <DebtsSection />
      <LivestockSection />
      <CropsSection />
      <SpecialsSection />
    </>
  );
}

export const WIZARD_GROUPS = [
  { id: "params", title: "Школа и дата", nodes: ["params"] },
  { id: "money", title: "Деньги и металлы", nodes: ["money", "metals"] },
  { id: "trade", title: "Бизнес и вложения", nodes: ["trade", "investments", "crypto", "property"] },
  { id: "nature", title: "Скот и урожай", nodes: ["livestock", "crops"] },
  { id: "other", title: "Долги, клад, фитр", nodes: ["debts", "specials"] },
] as const;
