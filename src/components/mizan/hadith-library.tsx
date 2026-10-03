import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, Search, Star } from "lucide-react";
import {
  editionFor,
  foldSearch,
  langLabel,
  loadOne,
  loadSection,
  rangeLabel,
  sectionsOf,
  HADITH_SOURCE,
  type HadithRow,
  type SectionInfo,
} from "@/lib/hadith/api.ts";
import { translateEnRu } from "@/lib/hadith/ru.ts";
import { HADITH_COLLECTIONS, collectionById, type HadithCategory } from "@/lib/hadith/registry.ts";
import { readFavs, readPlace, toggleFav, writePlace } from "@/lib/hadith/place.ts";
import type { Locale } from "@/lib/i18n/dict.ts";
import { cn } from "@/lib/utils.ts";
import { useMizan } from "@/stores/mizan-store.ts";

type View =
  | { kind: "catalog" }
  | { kind: "books"; id: string }
  | { kind: "section"; id: string; section: number; page: number }
  | { kind: "hadith"; id: string; section: number; n: number };

const FILTERS: { id: "all" | HadithCategory; ru: string }[] = [
  { id: "all", ru: "Все" },
  { id: "primary", ru: "Основные" },
  { id: "sunan", ru: "Сунан" },
  { id: "thematic", ru: "Тематические" },
];

export function HadithLibrary() {
  const locale = useMizan((s) => s.settings.locale);
  const [view, setView] = useState<View>({ kind: "catalog" });
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["id"]>("all");
  const place = typeof window !== "undefined" ? readPlace() : null;

  if (view.kind === "books") {
    return <Books id={view.id} locale={locale} onBack={() => setView({ kind: "catalog" })} onOpen={(section) => setView({ kind: "section", id: view.id, section, page: 0 })} />;
  }
  if (view.kind === "section") {
    return (
      <SectionList
        id={view.id}
        section={view.section}
        page={view.page}
        locale={locale}
        onBack={() => setView({ kind: "books", id: view.id })}
        onPage={(page) => setView({ ...view, page })}
        onOpen={(n) => setView({ kind: "hadith", id: view.id, section: view.section, n })}
      />
    );
  }
  if (view.kind === "hadith") {
    return (
      <HadithPage
        id={view.id}
        section={view.section}
        n={view.n}
        locale={locale}
        onBack={() => setView({ kind: "section", id: view.id, section: view.section, page: 0 })}
        onGo={(n) => setView({ ...view, n })}
      />
    );
  }

  const list = HADITH_COLLECTIONS.filter((c) => filter === "all" || c.category === filter).filter((c) => {
    const hay = foldSearch(`${c.nameRu} ${c.nameAr} ${c.authorRu}`);
    return !q.trim() || hay.includes(foldSearch(q));
  });

  return (
    <div className="grid gap-3">
      <p className="text-xs leading-relaxed text-[var(--muted)]">
        Сборники открываются здесь. Источник: {HADITH_SOURCE.provider}, лицензия {HADITH_SOURCE.license}. Оценки — только если их дал учёный в этом издании.
      </p>
      <label className="skin flex min-h-11 items-center gap-2 rounded-full px-3">
        <Search className="size-4 text-[var(--muted)]" />
        <input
          className="min-h-11 w-full bg-transparent text-sm outline-none"
          placeholder="Поиск по сборникам"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </label>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map((f) => (
          <button key={f.id} type="button" className={cn("skin shrink-0 rounded-full px-3 py-2 text-xs", filter === f.id && "is-on")} onClick={() => setFilter(f.id)}>
            {f.ru}
          </button>
        ))}
      </div>
      {place && collectionById(place.id) ? (
        <button
          type="button"
          className="skin rounded-2xl px-3 py-3 text-left"
          onClick={() => setView({ kind: "hadith", id: place.id, section: place.section, n: place.n })}
        >
          <span className="text-[11px] uppercase tracking-[0.14em] text-[var(--muted)]">Продолжить чтение</span>
          <span className="mt-1 block font-medium">{collectionById(place.id)?.nameRu}</span>
          <span className="text-sm text-[var(--muted)]">Хадис {place.n}</span>
        </button>
      ) : null}
      <div className="grid gap-2 sm:grid-cols-2">
        {list.map((c) => (
          <button key={c.id} type="button" className="skin rounded-2xl px-3 py-3 text-left" onClick={() => setView({ kind: "books", id: c.id })}>
            <span className="block font-medium">{c.nameRu}</span>
            <span className="ayah-ar mt-1 block text-lg" lang="ar">
              {c.nameAr}
            </span>
            <span className="mt-1 block text-xs text-[var(--muted)]">{c.authorRu}</span>
            <span className="mt-2 block text-xs text-[var(--accent)]">
              {c.locales.includes("rus") ? "Арабский и русское издание" : "Арабский, русский со английского издания"}
            </span>
          </button>
        ))}
      </div>
      <p className="text-[11px] leading-relaxed text-[var(--muted)]">
        Муснад Ахмада, Сунан ад-Дарими, Ибн Хузайма, Ибн Хиббан, Мустадрак, Мусаннафы, Кубра, Адаб аль-Муфрад, Шамаиль, Рияд, Мишкат, Булуг и Хисн аль-Муслим в этом корпусе нет — пустые карточки не показываем. Хисн и 40 ан-Навави в своей вёрстке остаются в доме.
      </p>
    </div>
  );
}

function Back({ label, onBack }: { label: string; onBack: () => void }) {
  return (
    <button type="button" className="mb-2 inline-flex min-h-11 items-center gap-1 text-sm text-[var(--muted)]" onClick={onBack}>
      <ChevronLeft className="size-4" /> {label}
    </button>
  );
}

function Books({ id, locale, onBack, onOpen }: { id: string; locale: Locale; onBack: () => void; onOpen: (section: number) => void }) {
  const book = collectionById(id);
  const [sections, setSections] = useState<SectionInfo[] | null>(null);
  const [err, setErr] = useState("");
  const [q, setQ] = useState("");
  useEffect(() => {
    let live = true;
    setSections(null);
    setErr("");
    void sectionsOf(id)
      .then((s) => live && setSections(s))
      .catch(() => live && setErr("Не удалось открыть книги сборника."));
    return () => {
      live = false;
    };
  }, [id]);
  const shown = (sections ?? []).filter((s) => !q.trim() || foldSearch(s.name).includes(foldSearch(q)));
  return (
    <div className="grid gap-2">
      <Back label="Сборники" onBack={onBack} />
      <h2 className="font-display text-2xl">{book?.nameRu}</h2>
      <p className="ayah-ar text-xl" lang="ar">
        {book?.nameAr}
      </p>
      <p className="text-sm text-[var(--muted)]">{book?.authorRu}</p>
      <p className="text-[11px] text-[var(--muted)]">Названия книг — как в источнике. Язык интерфейса: {locale}. Перевод хадиса подставится на странице хадиса.</p>
      <label className="skin flex min-h-11 items-center gap-2 rounded-full px-3">
        <Search className="size-4 text-[var(--muted)]" />
        <input className="min-h-11 w-full bg-transparent text-sm outline-none" placeholder="Поиск книги" value={q} onChange={(e) => setQ(e.target.value)} />
      </label>
      {err ? <p className="text-sm text-[var(--danger)]">{err}</p> : null}
      {!sections && !err ? <p className="text-sm text-[var(--muted)]">Открываю книги…</p> : null}
      <ol className="grid gap-2">
        {shown.map((s, i) => (
          <li key={s.id}>
            <button type="button" className="skin flex w-full items-start justify-between gap-3 rounded-2xl px-3 py-3 text-left" onClick={() => onOpen(s.id)}>
              <span>
                <span className="text-[11px] text-[var(--muted)]">{i + 1}</span>
                <span className="mt-0.5 block text-sm">{s.name}</span>
              </span>
              <span className="shrink-0 text-xs tabular-nums text-[var(--accent)]">{rangeLabel(s)}</span>
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}

function SectionList({
  id,
  section,
  page,
  locale,
  onBack,
  onPage,
  onOpen,
}: {
  id: string;
  section: number;
  page: number;
  locale: Locale;
  onBack: () => void;
  onPage: (n: number) => void;
  onOpen: (n: number) => void;
}) {
  const [rows, setRows] = useState<HadithRow[] | null>(null);
  const [title, setTitle] = useState("");
  const [err, setErr] = useState("");
  const [q, setQ] = useState("");
  const [means, setMeans] = useState<Map<number, string>>(new Map());
  useEffect(() => {
    let live = true;
    setRows(null);
    setErr("");
    const ara = editionFor(id, "ar");
    const ed = editionFor(id, locale);
    void Promise.all([
      loadSection(ara.code, section),
      sectionsOf(id),
      ed.lang === "rus" ? loadSection(ed.code, section) : Promise.resolve([] as HadithRow[]),
    ])
      .then(([arabic, sections, rus]) => {
        if (!live) return;
        setTitle(sections.find((s) => s.id === section)?.name ?? "");
        setRows(arabic);
        setMeans(new Map(rus.map((h) => [h.hadithnumber, h.text])));
      })
      .catch(() => live && setErr("Не удалось загрузить хадисы этой книги."));
    return () => {
      live = false;
    };
  }, [id, section, locale]);
  const filtered = useMemo(() => {
    const list = rows ?? [];
    if (!q.trim()) return list;
    const needle = foldSearch(q);
    return list.filter((h) => foldSearch(h.text).includes(needle) || String(h.hadithnumber).includes(q.trim()));
  }, [rows, q]);
  const size = 24;
  const pages = Math.max(1, Math.ceil(filtered.length / size));
  const slice = filtered.slice(page * size, page * size + size);
  return (
    <div className="grid gap-2">
      <Back label="Книги" onBack={onBack} />
      <h2 className="font-display text-2xl">{title || "Книга"}</h2>
      <p className="text-xs text-[var(--muted)]">{filtered.length} хадисов · язык списка: арабский оригинал · интерфейс {locale}</p>
      <label className="skin flex min-h-11 items-center gap-2 rounded-full px-3">
        <Search className="size-4 text-[var(--muted)]" />
        <input className="min-h-11 w-full bg-transparent text-sm outline-none" placeholder="Номер или фраза" value={q} onChange={(e) => { setQ(e.target.value); onPage(0); }} />
      </label>
      {err ? <p className="text-sm text-[var(--danger)]">{err}</p> : null}
      {!rows && !err ? <p className="text-sm text-[var(--muted)]">Загружаю книгу…</p> : null}
      <ol className="grid gap-2">
        {slice.map((h) => (
          <li key={h.hadithnumber}>
            <button type="button" className="skin w-full rounded-2xl px-3 py-3 text-left" onClick={() => onOpen(h.hadithnumber)}>
              <span className="text-[11px] tabular-nums text-[var(--accent)]">{h.hadithnumber}</span>
              <span className="ayah-ar mt-1 line-clamp-3 block text-lg" lang="ar">
                {h.text}
              </span>
              {means.get(h.hadithnumber) ? (
                <span className="mt-1 line-clamp-2 block text-xs leading-relaxed text-[var(--muted)]" dir="auto">
                  {means.get(h.hadithnumber)}
                </span>
              ) : null}
            </button>
          </li>
        ))}
      </ol>
      {pages > 1 ? (
        <div className="flex items-center justify-between gap-2">
          <button type="button" className="skin min-h-11 rounded-full px-3 text-sm" disabled={page <= 0} onClick={() => onPage(page - 1)}>
            Назад
          </button>
          <span className="text-xs tabular-nums text-[var(--muted)]">
            {page + 1} / {pages}
          </span>
          <button type="button" className="skin min-h-11 rounded-full px-3 text-sm" disabled={page + 1 >= pages} onClick={() => onPage(page + 1)}>
            Дальше
          </button>
        </div>
      ) : null}
    </div>
  );
}

function HadithPage({
  id,
  section,
  n,
  locale,
  onBack,
  onGo,
}: {
  id: string;
  section: number;
  n: number;
  locale: Locale;
  onBack: () => void;
  onGo: (n: number) => void;
}) {
  const book = collectionById(id);
  const ed = editionFor(id, locale);
  const [ar, setAr] = useState<HadithRow | null>(null);
  const [tr, setTr] = useState<HadithRow | null>(null);
  const [ru, setRu] = useState("");
  const [err, setErr] = useState("");
  const [favs, setFavs] = useState<string[]>(() => readFavs());
  const [neighbors, setNeighbors] = useState<number[]>([]);
  useEffect(() => {
    let live = true;
    setErr("");
    const ara = editionFor(id, "ar");
    void Promise.all([
      loadSection(ara.code, section),
      ed.lang === "ara" ? Promise.resolve(null) : loadOne(ed.code, n),
    ])
      .then(([arabic, mean]) => {
        if (!live) return;
        const row = arabic.find((h) => h.hadithnumber === n) ?? null;
        setAr(row);
        setTr(mean);
        setRu("");
        setNeighbors(arabic.map((h) => h.hadithnumber));
        if (row) writePlace({ id, section, n: row.hadithnumber });
      })
      .catch(() => live && setErr("Хадис не загрузился."));
    return () => {
      live = false;
    };
  }, [id, section, n, ed.code, ed.lang]);
  useEffect(() => {
    if (!ed.mt || !tr?.text) return;
    let live = true;
    void translateEnRu({ data: { text: tr.text } }).then((r) => {
      if (live && r.ok) setRu(r.text);
    });
    return () => {
      live = false;
    };
  }, [ed.mt, tr?.text]);
  const key = `${id}:${n}`;
  const i = neighbors.indexOf(n);
  const prev = i > 0 ? neighbors[i - 1] : null;
  const next = i >= 0 && i < neighbors.length - 1 ? neighbors[i + 1] : null;
  const grades = ar?.grades?.filter((g) => g.name && g.grade) ?? [];
  return (
    <article className="grid gap-3">
      <Back label="К главе" onBack={onBack} />
      <p className="text-[11px] uppercase tracking-[0.14em] text-[var(--muted)]">
        {book?.nameRu} · {n}
      </p>
      <h2 className="font-display text-2xl">{book?.nameAr}</h2>
      {err ? <p className="text-sm text-[var(--danger)]">{err}</p> : null}
      {!ar && !err ? <p className="text-sm text-[var(--muted)]">Открываю хадис…</p> : null}
      {ar ? (
        <p className="ayah-ar text-xl leading-[2.2]" lang="ar">
          {ar.text}
        </p>
      ) : null}
      {ru ? <p className="text-sm leading-relaxed" dir="auto">{ru}</p> : tr && ed.lang !== "ara" ? <p className="text-sm leading-relaxed" dir="auto">{tr.text}</p> : null}
      <p className="text-[11px] leading-relaxed text-[var(--muted)]">
        {ed.mt
          ? "Арабский матн сверху. Русский — перевод английского издания этого сборника, для чтения внутри приложения."
          : ed.lang === "rus"
            ? "Арабский матн и русское издание. Оба здесь, не на чужой странице."
            : ed.lang === "ara"
              ? "Арабский матн. Переводом не подменяем."
              : `Перевод внутри приложения: ${langLabel(ed.lang)}. Арабский текст над ним.`}
      </p>
      {grades.length ? (
        <ul className="grid gap-1 text-xs text-[var(--muted)]">
          {grades.map((g) => (
            <li key={`${g.name}-${g.grade}`}>
              Оценка: {g.name} — {g.grade}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-[11px] text-[var(--muted)]">Оценки учёных в этой записи источника нет. Своих оценок приложение не ставит.</p>
      )}
      <p className="text-[11px] text-[var(--muted)]">
        Источник: {HADITH_SOURCE.provider} · {book?.id}:{n}
        {ar?.reference ? ` · книга ${ar.reference.book}, хадис ${ar.reference.hadith}` : ""} · {HADITH_SOURCE.license}
      </p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className={cn("skin inline-flex min-h-11 items-center gap-1.5 rounded-full px-3 text-xs", favs.includes(key) && "is-on")}
          onClick={() => setFavs(toggleFav(key))}
        >
          <Star className="size-3.5" /> {favs.includes(key) ? "В избранном" : "В избранное"}
        </button>
        <button
          type="button"
          className="skin min-h-11 rounded-full px-3 text-xs"
          onClick={() => {
            const text = `${book?.nameRu} ${n}\n${ar?.text ?? ""}\n${tr?.text ?? ""}`;
            void navigator.clipboard?.writeText(text);
          }}
        >
          Копировать
        </button>
        {prev != null ? (
          <button type="button" className="skin min-h-11 rounded-full px-3 text-xs" onClick={() => onGo(prev)}>
            Предыдущий
          </button>
        ) : null}
        {next != null ? (
          <button type="button" className="skin min-h-11 rounded-full px-3 text-xs" onClick={() => onGo(next)}>
            Следующий
          </button>
        ) : null}
      </div>
    </article>
  );
}
