import { useEffect, useState } from "react";
import { BookOpen, GraduationCap, Mic, Play, Scale, Send, Shield } from "lucide-react";
import { HisnMini } from "@/components/mizan/hisn-view.tsx";
import { SheikhSheet } from "@/components/mizan/sheikh-sheet.tsx";
import { SourcePulse } from "@/components/mizan/source-pulse.tsx";
import { Button } from "@/components/ui/button.tsx";
import { fetchOfficialAyah } from "@/lib/agents/server.ts";
import { TRACKS } from "@/lib/learn/tracks.ts";
import { formatMoney } from "@/lib/mizan/decimal.ts";
import { PROGRAM, weekByN } from "@/lib/quran/curriculum.ts";
import { dayAyahRef, formatRef, loadAyah } from "@/lib/quran/mushaf.ts";
import type { Ayah } from "@/lib/quran/types.ts";
import { listenRu, voiceAvailable } from "@/lib/voice.ts";
import { useLearn } from "@/stores/learn-store.ts";
import { useMizan } from "@/stores/mizan-store.ts";
import { useQuran } from "@/stores/quran-store.ts";

const MET_KEY = "mizan.v1.sheikhMet";

function alreadyMet() {
  try {
    return localStorage.getItem(MET_KEY) === "1";
  } catch {
    return false;
  }
}

function markMet() {
  try {
    localStorage.setItem(MET_KEY, "1");
  } catch {
    /* ignore */
  }
}

export function HomeView() {
  const setTab = useMizan((s) => s.setAppTab);
  const setHisn = useMizan((s) => s.setHisnChapter);
  const setZakatOpen = useMizan((s) => s.setZakatOpen);
  const result = useMizan((s) => s.lastResult);
  const weekN = useLearn((s) => s.week);
  const setTrack = useLearn((s) => s.setTrack);
  const week = weekByN(weekN);
  const playAt = useQuran((s) => s.playAt);
  const [daily, setDaily] = useState<{ ref: { surah: number; ayah: number }; ayah: Ayah | null } | null>(null);
  const [returning, setReturning] = useState(false);
  const [ask, setAsk] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [seed, setSeed] = useState("");
  const [check, setCheck] = useState<{ match: boolean; kuliev: string; source: string } | null>(null);
  const [checkErr, setCheckErr] = useState("");
  const [checking, setChecking] = useState(false);
  const [listening, setListening] = useState(false);
  const [mic, setMic] = useState(false);

  useEffect(() => {
    setReturning(alreadyMet());
    markMet();
    setMic(voiceAvailable());
    const ref = dayAyahRef();
    void loadAyah(ref.surah, ref.ayah).then((ayah) => setDaily({ ref, ayah }));
  }, []);

  function openSheikh(question?: string) {
    setSeed(question ?? "");
    setSheetOpen(true);
  }

  async function verifyAyah() {
    if (!daily?.ref) return;
    setChecking(true);
    setCheckErr("");
    setCheck(null);
    try {
      const res = await fetchOfficialAyah({ data: daily.ref });
      if (!res.ok) {
        setCheckErr(res.error);
        return;
      }
      const local = daily.ayah?.ru.trim() ?? "";
      setCheck({
        match: local === res.kuliev.trim(),
        kuliev: res.kuliev,
        source: res.source,
      });
    } catch (e) {
      setCheckErr(e instanceof Error ? e.message : "сеть");
    } finally {
      setChecking(false);
    }
  }

  return (
    <div className="page-pad home-stage mx-auto grid max-w-2xl gap-6 px-4 pt-2">
      <section className="home-stagger grid justify-items-center text-center">
        <p className="bismillah" lang="ar">
          بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
        </p>
        <button
          type="button"
          className="sheikh-seal-btn"
          aria-label="Спросить шейха"
          title="Спросить шейха"
          onClick={() => openSheikh()}
        >
          <i className="sheikh-ring" aria-hidden />
          <i className="sheikh-ring" aria-hidden />
          <img src="/brand/sheikh-seal.jpg" alt="" width={128} height={128} />
        </button>
        <div className="mt-5 grid gap-1">
          <p className="salam-ar greet-line" lang="ar" style={{ animationDelay: "40ms" }}>
            السلام عليكم
          </p>
          <p className="greet-line home-hero" style={{ animationDelay: "180ms" }}>
            Мир тебе.
          </p>
          {returning ? null : (
            <p className="greet-line mt-2 text-lg text-[var(--muted)]" style={{ animationDelay: "320ms" }}>
              Я шейх.
            </p>
          )}
          <p className="greet-line mt-3 max-w-md text-sm leading-relaxed text-[var(--muted)]" style={{ animationDelay: "400ms" }}>
            Закят. Счёт. Коран. Хисн. Хребет мусульманина. Без хукма с потолка.
          </p>
        </div>
      </section>

      <form
        className="ask-full glass"
        onSubmit={(e) => {
          e.preventDefault();
          const t = ask.trim();
          if (!t) {
            openSheikh();
            return;
          }
          setAsk("");
          openSheikh(t);
        }}
      >
        <textarea
          rows={5}
          className="min-h-28 w-full resize-none bg-transparent text-base outline-none placeholder:text-[var(--muted)]"
          value={ask}
          placeholder="Пиши шейху сюда полностью…"
          onChange={(e) => setAsk(e.target.value)}
        />
        <div className="mt-2 flex gap-2">
          {mic ? (
            <Button
              type="button"
              variant={listening ? "glow" : "secondary"}
              className="pill size-11 p-0"
              aria-label="Говорить"
              onClick={() => {
                if (listening) {
                  setListening(false);
                  return;
                }
                setListening(true);
                listenRu((t, fin) => {
                  setAsk(t);
                  if (fin) setListening(false);
                });
              }}
            >
              <Mic className="size-4" />
            </Button>
          ) : null}
          <Button type="submit" variant="glow" className="pill flex-1" aria-label="Спросить шейха">
            <Send className="size-4" /> Шейху
          </Button>
        </div>
      </form>

      <section className="grid gap-3">
        <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--muted)]">Что в доме</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            className="door"
            onClick={() => {
              setTab("zakat");
              setZakatOpen(false);
            }}
          >
            <span className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] text-[var(--muted)]">
              <Scale className="size-4" /> Закят
            </span>
            <span className="font-display text-3xl leading-none tabular-nums text-[var(--ok)]">
              {result ? formatMoney(result.totalMoneyRounded, result.baseCurrency) : "—"}
            </span>
            <span className="text-sm text-[var(--muted)]">Деньги, золото, скот. Сунна рядом. Сумму считает ядро, не шейх.</span>
          </button>
          <button type="button" className="door" onClick={() => setTab("quran")}>
            <span className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] text-[var(--muted)]">
              <BookOpen className="size-4" /> Коран
            </span>
            <span className="font-display text-2xl leading-tight">Коран</span>
            <span className="text-sm text-[var(--muted)]">Текст и слух. Учить — по дорожкам, не иджаза.</span>
          </button>
          <button
            type="button"
            className="door"
            onClick={() => {
              setHisn(null);
              setTab("hisn");
            }}
          >
            <span className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] text-[var(--muted)]">
              <Shield className="size-4" /> Хисн
            </span>
            <span className="font-display text-2xl leading-tight">Крепость мусульманина</span>
            <span className="text-sm text-[var(--muted)]">132 главы, 267 дуа. Снимок hisnmuslim.com. Русский перевод дуа не выдуман.</span>
          </button>
          <button
            type="button"
            className="door"
            onClick={() => {
              setTrack("itqan");
              setTab("learn");
            }}
          >
            <span className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] text-[var(--muted)]">
              <GraduationCap className="size-4" /> Учить
            </span>
            <span className="font-display text-2xl leading-tight">{week.title}</span>
            <span className="text-sm text-[var(--muted)]">
              {PROGRAM.name} · неделя {week.n} из {PROGRAM.weeks}. Шесть путей: вход, каттаб, глубокий.
            </span>
          </button>
        </div>
      </section>

      <article className="ayah-card">
        <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--muted)]">Аят дня · мусхаф Кулиева</p>
        {daily?.ayah ? (
          <>
            <p className="ayah-ar mt-3" lang="ar">
              {daily.ayah.ar}
            </p>
            <p className="mt-3 text-[15px] leading-relaxed">{daily.ayah.ru}</p>
            <p className="mt-2 text-[11px] text-[var(--muted)]">
              {formatRef(daily.ref.surah, daily.ref.ayah)} · Эльмир Кулиев · локальная копия, сверка с alquran.cloud
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button
                variant="glow"
                className="flex-1"
                onClick={() => {
                  useQuran.getState().setReciter("ar.husary");
                  playAt(daily.ref.surah, daily.ref.ayah, daily.ref.ayah);
                }}
              >
                <Play className="size-4" /> Хусари
              </Button>
              <Button variant="secondary" className="pill" onClick={() => setTab("quran")}>
                Весь Коран
              </Button>
              <Button variant="ghost" className="pill" disabled={checking} onClick={() => void verifyAyah()}>
                {checking ? "Сверяю…" : "Сверить с alquran.cloud"}
              </Button>
            </div>
            {check ? (
              <p className={`mt-3 text-sm ${check.match ? "text-[var(--ok)]" : "text-[var(--danger)]"}`}>
                {check.match
                  ? "Локальный Кулиев совпал с изданием ru.kuliev."
                  : "Расхождение с живым изданием. Показан ответ API, не «исправленный» нами текст."}
                <span className="mt-1 block text-[11px] text-[var(--muted)]">{check.source}</span>
                {check.match ? null : <span className="mt-1 block">{check.kuliev}</span>}
              </p>
            ) : null}
            {checkErr ? <p className="mt-3 text-sm text-[var(--danger)]">Сеть: {checkErr}. Показана сохранённая копия.</p> : null}
          </>
        ) : (
          <p className="mt-3 text-sm text-[var(--muted)]">Открываю мусхаф…</p>
        )}
      </article>

      <HisnMini onOpen={(id) => setHisn(id)} />

      <section className="grid gap-3">
        <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--muted)]">Пути обучения</p>
        <div className="grid gap-2 sm:grid-cols-2">
          {TRACKS.map((t) => (
            <button
              key={t.id}
              type="button"
              className="door"
              onClick={() => {
                if (t.id === "hisn") {
                  setHisn(null);
                  setTab("hisn");
                  return;
                }
                if (t.id === "tafsir") {
                  setTab("quran");
                  return;
                }
                setTrack(t.id);
                setTab("learn");
              }}
            >
              <span className="text-[11px] uppercase tracking-[0.14em] text-[var(--muted)]">
                {t.depth} · {t.time}
              </span>
              <span className="font-display text-xl leading-tight">{t.name}</span>
              <span className="ayah-ar text-base" lang="ar">
                {t.nameAr}
              </span>
              <span className="text-sm text-[var(--muted)]">{t.honest}</span>
            </button>
          ))}
        </div>
      </section>

      <SourcePulse />

      <p className="text-xs leading-relaxed text-[var(--muted)]">
        Шейх не муфтий. Расчёт — ядро. Коран — усмани и Кулиев. Хисн — hisnmuslim.com. Хадисы закята — реестр sunnah.com.
        Богословской рецензии этого приложения не было.
      </p>

      <SheikhSheet open={sheetOpen} seed={seed} onClose={() => setSheetOpen(false)} />
    </div>
  );
}
