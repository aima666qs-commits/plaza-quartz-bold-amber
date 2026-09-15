import { useEffect, useMemo, useState } from "react";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { HADITH_BOOKS, DICT, type HouseRoomId } from "@/lib/house/catalog.ts";
import { NAMES, NAMES_META, NAWAWI, dayIndex, hadithMeaning, hadithTitle, hijriLabel } from "@/lib/house/data.ts";
import { formatRef, loadAyah } from "@/lib/quran/mushaf.ts";
import { HARAKAT, LETTERS, TAJWEED_CARDS } from "@/lib/quran/letters.ts";
import { sabrOfDay } from "@/lib/quran/sabr.ts";
import { RECITERS, reciterSurahs } from "@/lib/quran/reciters.ts";
import { SURAHS } from "@/lib/quran/surahs.ts";
import { translate } from "@/lib/i18n/dict.ts";
import { cn } from "@/lib/utils.ts";
import { useMizan } from "@/stores/mizan-store.ts";
import { useQuran } from "@/stores/quran-store.ts";

export function HouseRoom({ id }: { id: HouseRoomId }) {
  const setRoom = useMizan((s) => s.setHouseRoom);
  const locale = useMizan((s) => s.settings.locale);
  const hadith = useMizan((s) => s.houseHadith);
  if (id === "nawawi" && hadith != null) return null;
  return (
    <div className="page-pad mx-auto grid max-w-2xl gap-4 px-4 pt-2">
      <div className="flex items-center gap-2">
        <button type="button" className="grid size-11 place-items-center" onClick={() => setRoom(null)} aria-label={translate(locale, "hadith.back")}>
          <ChevronLeft className="size-5" />
        </button>
        <h1 className="font-display text-2xl leading-tight">{translate(locale, `room.${id}`)}</h1>
      </div>
      {id === "names" ? <NamesRoom /> : null}
      {id === "nawawi" ? <NawawiRoom /> : null}
      {id === "index" ? <IndexRoom /> : null}
      {id === "alphabet" ? <AlphabetRoom /> : null}
      {id === "quiz" ? <QuizRoom /> : null}
      {id === "dict" ? <DictRoom /> : null}
      {id === "reminder" ? <ReminderRoom /> : null}
      {id === "wisdom" ? <WisdomRoom /> : null}
      {id === "calendar" ? <CalendarRoom /> : null}
      {id === "recite" ? <ReciteRoom /> : null}
      {id === "tajweed" ? <TajweedRoom /> : null}
      {id === "books" ? <BooksRoom /> : null}
      {id === "mecca" ? <PlaceRoom place="M" /> : null}
      {id === "madina" ? <PlaceRoom place="D" /> : null}
    </div>
  );
}

function NamesRoom() {
  return (
    <div className="grid gap-2">
      <p className="text-xs text-[var(--muted)]">{NAMES_META.source}</p>
      <ul className="grid gap-1">
        {NAMES.map((n) => (
          <li key={n.n} className="list-item flex items-center gap-3 rounded-2xl border border-[var(--line)] px-3 py-2">
            <span className="w-6 shrink-0 text-[11px] tabular-nums text-[var(--muted)]">{n.n}</span>
            <span className="ayah-ar flex-1 text-right text-xl" lang="ar">
              {n.ar}
            </span>
            <span className="w-28 shrink-0 text-right text-xs">
              {n.ru}
              <span className="mt-0.5 block text-[10px] text-[var(--muted)]">{n.tr}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function NawawiRoom() {
  const locale = useMizan((s) => s.settings.locale);
  const setNav = useMizan((s) => s.setHouseNav);
  return (
    <div className="grid gap-2">
      {NAWAWI.map((h) => (
        <button
          key={h.n}
          type="button"
          className="flex min-h-12 w-full items-center gap-3 rounded-2xl border border-[var(--line)] px-3 py-2.5 text-left"
          onClick={() => setNav("nawawi", h.n, "list")}
          data-go={`hadith-${h.n}`}
        >
          <span className="w-6 shrink-0 text-[11px] tabular-nums text-[var(--muted)]">{h.n}</span>
          <span className="flex-1 font-medium leading-snug">{hadithTitle(h, locale)}</span>
        </button>
      ))}
    </div>
  );
}

function IndexRoom() {
  const locale = useMizan((s) => s.settings.locale);
  const setTab = useMizan((s) => s.setAppTab);
  const setRoom = useMizan((s) => s.setHouseRoom);
  const setNav = useMizan((s) => s.setHouseNav);
  const setRef = useQuran((s) => s.setRef);
  return (
    <div className="grid gap-4">
      <p className="text-xs text-[var(--muted)]">{translate(locale, "room.index.note")}</p>
      <section>
        <h2 className="text-[11px] uppercase tracking-[0.14em] text-[var(--muted)]">{translate(locale, "nav.quran")}</h2>
        <ul className="mt-2 grid max-h-64 gap-1 overflow-y-auto">
          {SURAHS.map((s) => (
            <li key={s.n}>
              <button
                type="button"
                className="flex w-full items-center justify-between rounded-xl px-2 py-2 text-sm"
                onClick={() => {
                  setRef(s.n, 1);
                  setTab("quran");
                  setRoom(null);
                }}
              >
                <span>
                  {s.n}. {s.ru}
                </span>
                <span className="ayah-ar" lang="ar">
                  {s.ar}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h2 className="text-[11px] uppercase tracking-[0.14em] text-[var(--muted)]">{translate(locale, "tile.nawawi")}</h2>
        <ul className="mt-2 grid gap-1">
          {NAWAWI.map((h) => (
            <li key={h.n}>
              <button type="button" className="w-full rounded-xl px-2 py-2 text-left text-sm" onClick={() => setNav("nawawi", h.n, "list")}>
                {h.n}. {hadithTitle(h, locale)}
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function AlphabetRoom() {
  const locale = useMizan((s) => s.settings.locale);
  const setTab = useMizan((s) => s.setAppTab);
  const setRoom = useMizan((s) => s.setHouseRoom);
  return (
    <div className="grid gap-3">
      <p className="text-xs text-[var(--muted)]">{translate(locale, "room.alphabet.note")}</p>
      <div className="grid grid-cols-4 gap-2">
        {LETTERS.map((l) => (
          <div key={l.ar} className="rounded-2xl border border-[var(--line)] py-3 text-center">
            <p className="ayah-ar text-3xl" lang="ar">
              {l.ar}
            </p>
            <p className="text-[11px] text-[var(--muted)]">{l.name}</p>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {HARAKAT.map((h) => (
          <span key={h.name} className="rounded-full border border-[var(--line)] px-3 py-1 text-xs">
            <span lang="ar">{h.mark}</span> {h.name}
          </span>
        ))}
      </div>
      <Button
        variant="glow"
        onClick={() => {
          setRoom(null);
          setTab("learn");
        }}
      >
        {translate(locale, "tile.learn")}
      </Button>
    </div>
  );
}

function QuizRoom() {
  const locale = useMizan((s) => s.settings.locale);
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const q = useMemo(() => {
    const n = NAMES[i % NAMES.length];
    const rest = NAMES.filter((x) => x.n !== n.n).slice((i * 3) % 90, (i * 3) % 90 + 3);
    const opts = [n, ...rest].sort((a, b) => a.n - b.n);
    return { n, opts };
  }, [i]);
  return (
    <div className="grid gap-4">
      <p className="text-xs text-[var(--muted)]">{translate(locale, "room.quiz.note")}</p>
      <p className="ayah-ar text-center text-4xl" lang="ar">
        {q.n.ar}
      </p>
      <div className="grid gap-2">
        {q.opts.map((o) => (
          <button
            key={o.n}
            type="button"
            onClick={() => setPicked(o.ru)}
            className={cn(
              "min-h-12 rounded-2xl border px-3 text-sm",
              picked && o.n === q.n.n && "border-[var(--ok)] text-[var(--ok)]",
              picked && o.ru === picked && o.n !== q.n.n && "border-[var(--danger)]",
              !picked && "border-[var(--line)]",
            )}
          >
            {o.ru}
          </button>
        ))}
      </div>
      {picked ? (
        <Button
          variant="secondary"
          onClick={() => {
            setPicked(null);
            setI(i + 1);
          }}
        >
          {translate(locale, "hadith.next")}
        </Button>
      ) : null}
    </div>
  );
}

function DictRoom() {
  const locale = useMizan((s) => s.settings.locale);
  const [q, setQ] = useState("");
  const list = DICT.filter((d) => !q || d.ar.includes(q) || d.ru.toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="grid gap-3">
      <p className="text-xs text-[var(--muted)]">{translate(locale, "room.dict.note")}</p>
      <input
        className="min-h-11 rounded-full border border-[var(--line)] bg-transparent px-4"
        placeholder={translate(locale, "hisn.find")}
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
      <ul className="grid gap-2">
        {list.map((d) => (
          <li key={d.ar} className="rounded-2xl border border-[var(--line)] px-3 py-2">
            <span className="ayah-ar text-xl" lang="ar">
              {d.ar}
            </span>
            <span className="ms-3">{d.ru}</span>
            <p className="text-[11px] text-[var(--muted)]">{d.note}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ReminderRoom() {
  const locale = useMizan((s) => s.settings.locale);
  const setTab = useMizan((s) => s.setAppTab);
  const setHisn = useMizan((s) => s.setHisnChapter);
  const setRoom = useMizan((s) => s.setHouseRoom);
  const setRef = useQuran((s) => s.setRef);
  const ref = sabrOfDay();
  const [ru, setRu] = useState("");
  const [ar, setAr] = useState("");
  useEffect(() => {
    void loadAyah(ref.surah, ref.ayah).then((a) => {
      setRu(a?.ru ?? "");
      setAr(a?.ar ?? "");
    });
  }, [ref.surah, ref.ayah]);
  return (
    <div className="grid gap-3">
      <article className="ayah-card">
        <p className="text-[11px] uppercase tracking-[0.14em] text-[var(--accent)]">{translate(locale, "hadith.day")}</p>
        <p className="ayah-ar mt-2 text-xl" lang="ar">{ar}</p>
        <p className="mt-2 text-sm">{ru}</p>
        <p className="mt-1 text-[11px] text-[var(--muted)]">{formatRef(ref.surah, ref.ayah)}</p>
        <Button
          className="mt-3"
          onClick={() => {
            setRef(ref.surah, ref.ayah);
            setRoom(null);
            setTab("quran");
          }}
        >
          {translate(locale, "tile.quran")}
        </Button>
      </article>
      <button
        type="button"
        className="door"
        onClick={() => {
          setHisn(27);
          setRoom(null);
          setTab("hisn");
        }}
      >
        {translate(locale, "hisn.col.morning")}
      </button>
    </div>
  );
}

function WisdomRoom() {
  const h = NAWAWI[dayIndex(NAWAWI.length)];
  const n = NAMES[dayIndex(NAMES.length)];
  const locale = useMizan((s) => s.settings.locale);
  const setNav = useMizan((s) => s.setHouseNav);
  const meaning = hadithMeaning(h, locale);
  return (
    <div className="grid gap-4">
      <button type="button" className="rounded-2xl border border-[var(--line)] p-4 text-left" onClick={() => setNav("nawawi", h.n, "list")}>
        <p className="text-[11px] uppercase tracking-[0.14em] text-[var(--muted)]">
          {translate(locale, "hadith.day")} · {h.n}
        </p>
        <h2 className="mt-2 font-display text-xl">{hadithTitle(h, locale)}</h2>
        <p className="book-ar gold-flow mt-3 text-center text-2xl" lang="ar">
          {h.core}
        </p>
        {meaning ? <p className="mt-3 text-sm text-[var(--muted)]">{meaning}</p> : null}
        <p className="mt-2 text-[11px] text-[var(--muted)]">{locale === "en" ? h.ref.replace(/^sunnah\.com\/nawawi40:/, "an-Nawawi ") : h.refRu}</p>
      </button>
      <article className="rounded-2xl border border-[var(--line)] p-4">
        <p className="text-[11px] uppercase tracking-[0.14em] text-[var(--muted)]">{translate(locale, "tile.names")}</p>
        <p className="ayah-ar mt-2 text-3xl" lang="ar">
          {n.ar}
        </p>
        <p>
          {n.ru} · {n.tr}
        </p>
      </article>
    </div>
  );
}

function CalendarRoom() {
  const locale = useMizan((s) => s.settings.locale);
  const { hijri, greg } = hijriLabel(new Date(), locale);
  return (
    <div className="grid gap-3">
      <p className="font-display text-3xl">{hijri}</p>
      <p className="text-sm text-[var(--muted)]">{greg}</p>
    </div>
  );
}

function ReciteRoom() {
  const locale = useMizan((s) => s.settings.locale);
  const setReciter = useQuran((s) => s.setReciter);
  const playAt = useQuran((s) => s.playAt);
  const setTab = useMizan((s) => s.setAppTab);
  const setRoom = useMizan((s) => s.setHouseRoom);
  return (
    <div className="grid gap-2">
      <p className="text-xs text-[var(--muted)]">{translate(locale, "room.recite.note")}</p>
      {RECITERS.map((r) => {
        const files = reciterSurahs(r);
        const dead = r.kind === "surah" && !files?.length;
        return (
          <button
            key={r.id}
            type="button"
            className="door"
            onClick={() => {
              setReciter(r.id);
              setRoom(null);
              setTab("quran");
              if (dead) return;
              const first = files?.[0] ?? 1;
              playAt(first, 1, r.kind === "surah" ? null : 7);
            }}
          >
            <span className="font-medium">{r.name}</span>
            <span className="ayah-ar block" lang="ar">
              {r.nameAr}
            </span>
            <span className="text-xs text-[var(--muted)]">{r.blurb}</span>
          </button>
        );
      })}
    </div>
  );
}

function TajweedRoom() {
  const locale = useMizan((s) => s.settings.locale);
  return (
    <div className="grid gap-2">
      <p className="text-xs text-[var(--muted)]">{translate(locale, "room.tajweed.note")}</p>
      {TAJWEED_CARDS.map((c) => (
        <article key={c.id} className="rounded-2xl border border-[var(--line)] p-3">
          <h2 className="font-display text-xl">{c.title}</h2>
          <p className="mt-2 text-sm">{c.rule}</p>
          <p className="ayah-ar mt-2" lang="ar">
            {c.example}
          </p>
        </article>
      ))}
    </div>
  );
}

function BooksRoom() {
  const locale = useMizan((s) => s.settings.locale);
  const setNav = useMizan((s) => s.setHouseNav);
  return (
    <div className="grid gap-2">
      <p className="text-xs text-[var(--muted)]">{translate(locale, "room.books.note")}</p>
      <button type="button" className="door" onClick={() => setNav("nawawi")}>
        <span className="block font-medium">{translate(locale, "tile.nawawi")}</span>
      </button>
      {HADITH_BOOKS.map((b, i) => (
        <a key={b.id} href={b.href} target="_blank" rel="noreferrer" className="door">
          <span className="text-[11px] text-[var(--muted)]">{i + 1}</span>
          <span className="block font-medium">{b.ru}</span>
          <span className="ayah-ar" lang="ar">
            {b.ar}
          </span>
        </a>
      ))}
    </div>
  );
}

function PlaceRoom({ place }: { place: "M" | "D" }) {
  const setRef = useQuran((s) => s.setRef);
  const setTab = useMizan((s) => s.setAppTab);
  const setRoom = useMizan((s) => s.setHouseRoom);
  const list = SURAHS.filter((s) => s.place === place);
  return (
    <div className="grid gap-2">
      <ul className="grid gap-1">
        {list.map((s) => (
          <li key={s.n}>
            <button
              type="button"
              className="flex w-full items-center justify-between rounded-xl px-2 py-2 text-sm"
              onClick={() => {
                setRef(s.n, 1);
                setRoom(null);
                setTab("quran");
              }}
            >
              <span>
                {s.n}. {s.ru}
              </span>
              <span className="ayah-ar" lang="ar">
                {s.ar}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
