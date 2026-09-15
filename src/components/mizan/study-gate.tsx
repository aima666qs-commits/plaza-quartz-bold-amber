import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { addStudyMs, FREE_MS, guestLocked, readStudyMs } from "@/lib/study/clock.ts";
import { pushStudyMs } from "@/lib/study/server.ts";
import { useMizan } from "@/stores/mizan-store.ts";
import { useQuran } from "@/stores/quran-store.ts";

export function StudyGate() {
  const { user, isPending } = useCurrentUserState();
  const tab = useMizan((s) => s.appTab);
  const playing = useQuran((s) => s.playing);
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    const t = window.setInterval(() => {
      const active = playing || tab === "quran" || tab === "learn" || tab === "hisn";
      if (active) addStudyMs(10_000);
      setLocked(!user && guestLocked());
      if (user) void pushStudyMs({ data: { studyMs: readStudyMs() } }).catch(() => {});
    }, 10_000);
    setLocked(!user && guestLocked());
    return () => window.clearInterval(t);
  }, [user, tab, playing]);

  if (isPending || user || !locked) return null;
  const used = Math.round(readStudyMs() / 3600000);

  return (
    <div className="fixed inset-0 z-[85] grid place-items-center bg-[color-mix(in_oklab,var(--bg)_88%,black)] p-6">
      <div className="max-w-sm text-center">
        <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--muted)]">ضيفان</p>
        <h1 className="font-display mt-2 text-3xl">Два часа прошли</h1>
        <p className="mt-3 text-sm text-[var(--muted)]">
          {used} ч учёбы как гость. Дальше нужен кабинет: Google, почта или X. Прогресс и память шейха лягут на сервер.
        </p>
        <Link to="/login" className="btn-glow mt-5 grid min-h-12 place-items-center rounded-full">
          Войти и продолжить
        </Link>
        <p className="mt-3 text-[11px] text-[var(--muted)]">Лимит гостя — {Math.round(FREE_MS / 3600000)} часа.</p>
      </div>
    </div>
  );
}
