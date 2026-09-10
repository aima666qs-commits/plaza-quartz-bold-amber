import { useEffect, useRef, useState } from "react";
import { Mic, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { TextArea } from "@/components/ui/field.tsx";
import { askEvidence, localSourceSearch, type AskPayload } from "@/lib/assistant/server.ts";
import { formatPlain } from "@/lib/mizan/decimal.ts";
import { getProfile } from "@/lib/mizan/profiles.ts";
import { SOURCES } from "@/lib/mizan/sources.ts";
import { listenRu, voiceAvailable } from "@/lib/voice.ts";
import { useMizan } from "@/stores/mizan-store.ts";

type Log = { role: "user" | "sheikh"; text: string };

export function SheikhSheet({
  open,
  seed,
  onClose,
}: {
  open: boolean;
  seed: string;
  onClose: () => void;
}) {
  const result = useMizan((s) => s.lastResult);
  const input = useMizan((s) => s.input);
  const [q, setQ] = useState("");
  const [log, setLog] = useState<Log[]>([]);
  const [busy, setBusy] = useState(false);
  const [listening, setListening] = useState(false);
  const [modelNote, setModelNote] = useState("");
  const seeded = useRef("");
  const scroller = useRef<HTMLDivElement>(null);
  const stopVoice = useRef<(() => void) | null>(null);
  const [canVoice, setCanVoice] = useState(false);

  useEffect(() => {
    setCanVoice(voiceAvailable());
  }, []);

  useEffect(() => {
    if (!open) {
      seeded.current = "";
      stopVoice.current?.();
      setListening(false);
      return;
    }
    if (seed && seed !== seeded.current) {
      seeded.current = seed;
      void send(seed);
    }
  }, [open, seed]);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" });
  }, [log, busy]);

  function toggleMic() {
    if (listening) {
      stopVoice.current?.();
      stopVoice.current = null;
      setListening(false);
      return;
    }
    setListening(true);
    stopVoice.current = listenRu((t, fin) => {
      setQ(t);
      if (fin) {
        setListening(false);
        stopVoice.current = null;
      }
    });
  }

  async function send(raw?: string) {
    const question = (raw ?? q).trim();
    if (!question || busy) return;
    setQ("");
    setLog((l) => [...l, { role: "user", text: question }]);
    setBusy(true);
    const local = localSourceSearch(question);
    const excerpts = (local.length ? local : SOURCES.slice(0, 6)).map((s) => ({
      id: s.sourceId,
      title: s.title,
      locator: s.locator,
      notes: s.notes,
      arabic: s.arabic,
    }));
    const payload: AskPayload = {
      question,
      profileId: input.profileId,
      profileName: getProfile(input.profileId).name,
      anonymized: {
        overallStatus: result?.overallStatus ?? "unknown",
        completeness: result?.completeness ?? "partial",
        categories: (result?.categories ?? []).map((c) => ({
          id: c.id,
          status: c.status,
          zakat: c.zakatMoney !== undefined ? formatPlain(c.zakatMoney) : undefined,
          natural: c.natural?.map((n) => n.label),
        })),
        missing: result?.missing ?? [],
      },
      sourceExcerpts: excerpts,
    };
    try {
      const res = await askEvidence({ data: payload });
      if (res.ok) {
        setModelNote(res.model);
        setLog((l) => [...l, { role: "sheikh", text: res.text }]);
      } else {
        const fallback = excerpts.map((s) => `• ${s.title}: ${s.notes}`).join("\n");
        setModelNote("источники");
        setLog((l) => [
          ...l,
          {
            role: "sheikh",
            text: `Мир тебе. Живая модель сейчас молчит — ниже только сохранённый реестр, без выдумки.\n\n${fallback}`,
          },
        ]);
      }
    } catch {
      setLog((l) => [
        ...l,
        { role: "sheikh", text: "Сейчас без сети. Откройте закят, Коран или Хисн — я не ушёл." },
      ]);
    } finally {
      setBusy(false);
    }
  }

  if (!open) return null;
  return (
    <div className="sheikh-sheet" role="presentation" onClick={onClose}>
      <div
        className="sheikh-sheet-card glass"
        role="dialog"
        aria-labelledby="sheikh-title"
        onClick={(e) => e.stopPropagation()}
        onMouseLeave={(e) => {
          if (e.relatedTarget && (e.currentTarget as HTMLElement).contains(e.relatedTarget as Node)) return;
        }}
      >
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <img src="/brand/sheikh-seal.jpg" alt="" className="sheikh-seal sheikh-seal-sm" width={44} height={44} />
            <div>
              <p id="sheikh-title" className="font-display text-xl leading-none">
                Шейх
              </p>
              <p className="mt-1 text-xs text-[var(--muted)]">
                Мир тебе{modelNote ? ` · ${modelNote}` : ""}
              </p>
            </div>
          </div>
          <Button variant="ghost" className="pill size-11 p-0" onClick={onClose} aria-label="Закрыть">
            <X className="size-5" />
          </Button>
        </div>
        <div ref={scroller} className="min-h-0 overflow-y-auto pr-1 text-sm leading-relaxed">
          {log.length === 0 && !busy ? (
            <p className="text-[var(--muted)]">Спроси про закят, нисаб, вирд или с чего начать Коран. Говори в микрофон или пиши.</p>
          ) : null}
          {log.map((m, i) => (
            <div
              key={i}
              className={
                m.role === "user"
                  ? "mb-2 ml-8 rounded-2xl bg-[var(--bg-elev)] px-3 py-2"
                  : "mb-3 mr-4 border-l-2 border-[var(--accent)] pl-3"
              }
            >
              <p className="whitespace-pre-wrap">{m.text}</p>
            </div>
          ))}
          {busy ? <p className="text-xs text-[var(--muted)]">Шейх смотрит источники…</p> : null}
        </div>
        <form
          className="ask-full mt-3"
          onSubmit={(e) => {
            e.preventDefault();
            void send();
          }}
        >
          <TextArea
            rows={5}
            value={q}
            placeholder="Пиши сюда полностью. Или нажми микрофон."
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void send();
              }
            }}
          />
          <div className="mt-2 flex gap-2">
            {canVoice ? (
              <Button type="button" variant={listening ? "glow" : "secondary"} className="pill size-11 p-0" onClick={toggleMic} aria-label="Говорить">
                <Mic className="size-4" />
              </Button>
            ) : null}
            <Button type="submit" disabled={busy} variant="glow" className="pill flex-1">
              <Send className="size-4" /> Сказать шейху
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
