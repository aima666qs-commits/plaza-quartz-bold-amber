import { useState } from "react";
import { addNote, readNotes, removeNote, type NoteKind } from "@/lib/notebook.ts";
import { translate } from "@/lib/i18n/dict.ts";
import { speakText } from "@/lib/voice.ts";
import { useMizan } from "@/stores/mizan-store.ts";

const KINDS: { id: NoteKind; key: string }[] = [
  { id: "lesson", key: "note.lesson" },
  { id: "ayah", key: "note.ayah" },
  { id: "hadith", key: "note.hadith" },
  { id: "note", key: "note.note" },
];

const DRILLS = [
  { ar: "اللَّهُ", key: "phrase.allah" },
  { ar: "صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ", key: "phrase.salawat" },
  { ar: "سُبْحَانَ اللَّهِ", key: "phrase.subhan" },
];

export function StudyDesk() {
  const locale = useMizan((s) => s.settings.locale);
  const [notes, setNotes] = useState(() => (typeof window === "undefined" ? [] : readNotes()));
  const [kind, setKind] = useState<NoteKind>("note");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [saying, setSaying] = useState("");

  return (
    <section className="home-tools">
      <div className="phrase-list">
        {DRILLS.map((d) => (
          <button
            key={d.ar}
            type="button"
            className="phrase"
            disabled={saying === d.ar}
            onClick={() => {
              setSaying(d.ar);
              void speakText(d.ar, "ar-SA", "ar-SA-HamedNeural").finally(() => setSaying(""));
            }}
          >
            <span className="ayah-ar" lang="ar" dir="rtl">
              {d.ar}
            </span>
            <span className="phrase-gloss" dir="auto">{saying === d.ar ? "…" : translate(locale, d.key)}</span>
          </button>
        ))}
      </div>

      <article className="skin rounded-[24px] p-4">
        <h2 className="font-display text-xl">{translate(locale, "note.book")}</h2>
        <div className="mt-3 flex gap-2 overflow-x-auto">
          {KINDS.map((k) => (
            <button key={k.id} type="button" className={`skin shrink-0 rounded-full px-3 py-2 text-xs ${kind === k.id ? "is-on" : ""}`} onClick={() => setKind(k.id)}>
              {translate(locale, k.key)}
            </button>
          ))}
        </div>
        <input className="skin mt-2 min-h-11 w-full rounded-2xl px-3 text-sm outline-none" placeholder={translate(locale, "note.name")} value={title} onChange={(e) => setTitle(e.target.value)} dir="auto" />
        <textarea className="skin mt-2 min-h-20 w-full rounded-2xl px-3 py-2 text-sm outline-none" placeholder={translate(locale, "note.text")} value={body} onChange={(e) => setBody(e.target.value)} dir="auto" />
        <button
          type="button"
          className="skin mt-2 min-h-11 rounded-full px-4 text-sm"
          onClick={() => {
            const t = title.trim();
            if (!t) return;
            addNote({ kind, title: t, body: body.trim() });
            setTitle("");
            setBody("");
            setNotes(readNotes());
          }}
        >
          {translate(locale, "note.save")}
        </button>
        <ul className="mt-3 grid gap-2">
          {notes.map((n) => (
            <li key={n.id} className="rounded-2xl px-3 py-2">
              <div className="flex items-start justify-between gap-2">
                <span>
                  <span className="text-[11px] uppercase tracking-[0.12em] text-[var(--muted)]">{translate(locale, KINDS.find((k) => k.id === n.kind)?.key ?? "note.note")}</span>
                  <span className="mt-0.5 block text-sm font-medium">{n.title}</span>
                </span>
                <button type="button" className="text-xs text-[var(--muted)]" onClick={() => { removeNote(n.id); setNotes(readNotes()); }}>
                  Убрать
                </button>
              </div>
              {n.body ? <p className="mt-1 text-sm text-[var(--muted)]">{n.body}</p> : null}
            </li>
          ))}
        </ul>
      </article>
    </section>
  );
}
