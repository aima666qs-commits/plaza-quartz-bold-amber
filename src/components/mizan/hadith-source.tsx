import { hadithChain, type NawawiHadith } from "@/lib/house/data.ts";
import { gradeLabel, gradeNote } from "@/lib/house/nawawi-grade.ts";
import { translate, type Locale } from "@/lib/i18n/dict.ts";

export function HadithSource({ h, locale }: { h: NawawiHadith; locale: Locale }) {
  const c = hadithChain(h, locale);
  return (
    <div className="hadith-chain" data-go="hadith-chain">
      <p className="hadith-chain-kicker">{translate(locale, "hadith.chain")}</p>
      <p className="hadith-chain-label">{translate(locale, "hadith.chain.narrator")}</p>
      <p className="hadith-chain-name">{c.narrator}</p>
      {c.narratorAr ? (
        <p className="hadith-chain-ar" lang="ar">
          {c.narratorAr}
        </p>
      ) : null}
      <span className="hadith-chain-arrow" aria-hidden>
        ↓
      </span>
      <p className="hadith-chain-name gold-flow">{c.prophet}</p>
      <span className="hadith-chain-arrow" aria-hidden>
        ↓
      </span>
      <p className="hadith-chain-book">{c.books}</p>
      <p className="hadith-chain-meta">
        {c.collection} · {gradeLabel(h.n, locale)}
      </p>
      <p className="hadith-chain-note">{gradeNote(h.n, locale)}</p>
    </div>
  );
}
