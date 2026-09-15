import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { SignInGate, UserButton } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { addMemory, dumpStudy, pullStudy, pushStudyMs } from "@/lib/study/server.ts";
import { FREE_MS, readStudyMs } from "@/lib/study/clock.ts";
import { useLearn } from "@/stores/learn-store.ts";
import { useMizan } from "@/stores/mizan-store.ts";

export function CabinetSheet() {
  const open = useMizan((s) => s.cabinetOpen);
  const setOpen = useMizan((s) => s.setCabinetOpen);
  const { user, isPending } = useCurrentUserState();
  const [note, setNote] = useState("");
  const [mems, setMems] = useState<{ body: string; created_at: string }[]>([]);
  const [studyMs, setStudyMs] = useState(0);
  const lane = useLearn((s) => s.lane);
  const method = useLearn((s) => s.arabicMethod);
  const lessonN = useLearn((s) => s.lessonN);

  useEffect(() => {
    setStudyMs(readStudyMs());
    if (!open || !user) return;
    void pullStudy()
      .then((d) => {
        setStudyMs(Math.max(readStudyMs(), d.studyMs));
        setMems(d.memories);
      })
      .catch(() => {});
    void pushStudyMs({ data: { studyMs: readStudyMs() } }).catch(() => {});
  }, [open, user]);

  if (!open) return null;
  const hours = (studyMs / 3600000).toFixed(1);

  function backupLocal() {
    const blob = new Blob(
      [
        JSON.stringify(
          {
            savedAt: new Date().toISOString(),
            studyMs: readStudyMs(),
            learn: useLearn.getState(),
            memories: mems,
          },
          null,
          2,
        ),
      ],
      { type: "application/json" },
    );
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `mizan-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  }

  async function backupServer() {
    try {
      const dump = await dumpStudy();
      const blob = new Blob([JSON.stringify(dump, null, 2)], { type: "application/json" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `mizan-server-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
    } catch {
      backupLocal();
    }
  }

  return (
    <div className="fixed inset-0 z-[90] grid place-items-end bg-black/50 p-3 sm:place-items-center">
      <article className="max-h-[90dvh] w-full max-w-md overflow-y-auto rounded-[28px] border border-[var(--line)] bg-[var(--bg)] p-5">
        <div className="flex items-center justify-between gap-2">
          <h1 className="font-display text-2xl">Кабинет</h1>
          <button type="button" className="settings-gear" onClick={() => setOpen(false)} aria-label="Закрыть">
            <X className="size-5" />
          </button>
        </div>
        {isPending ? <div className="mt-4 h-10 animate-pulse rounded-full bg-[var(--surface)]" /> : null}
        <SignInGate
          fallback={
            <div className="mt-4 grid gap-3">
              <p className="text-sm text-[var(--muted)]">
                Гость: {hours} ч из 2. Потом вход. Google, почта или X. Telegram на этой платформе нет.
              </p>
              <Link to="/login" className="btn-glow grid min-h-12 place-items-center rounded-full">
                Войти
              </Link>
              <Button variant="secondary" onClick={backupLocal}>
                Скачать копию на компьютер
              </Button>
            </div>
          }
        >
          <div className="mt-3 flex items-center justify-between gap-3">
            <p className="text-sm">{user?.displayName || user?.primaryEmail || "Студент"}</p>
            <UserButton />
          </div>
          <p className="mt-2 text-sm text-[var(--muted)]">Учёба: {hours} ч. Память на сервере, завтра модель помнит сегодняшнее.</p>
          <p className="mt-1 text-xs text-[var(--muted)]">
            Сейчас: {lane ?? "не выбран путь"}
            {method ? ` · ${method} урок ${lessonN}` : ""}
          </p>
          <form
            className="mt-4 grid gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              const body = note.trim();
              if (!body) return;
              void addMemory({ data: { body } }).then(() => {
                setMems((m) => [{ body, created_at: new Date().toISOString() }, ...m]);
                setNote("");
              });
            }}
          >
            <textarea
              className="min-h-20 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-3 text-sm"
              placeholder="Что запомнить шейху: сура, слабое место, обещание…"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
            <Button type="submit" variant="glow">
              В память
            </Button>
          </form>
          <ul className="mt-3 grid gap-2">
            {mems.slice(0, 8).map((m, i) => (
              <li key={i} className="rounded-2xl border border-[var(--line)] p-3 text-sm">
                {m.body}
              </li>
            ))}
          </ul>
          <Button className="mt-4 w-full" variant="secondary" onClick={() => void backupServer()}>
            Скачать копию на компьютер
          </Button>
        </SignInGate>
      </article>
    </div>
  );
}
