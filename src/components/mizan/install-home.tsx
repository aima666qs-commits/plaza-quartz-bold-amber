import { useEffect, useRef, useState } from "react";
import { Check, Download, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { translate } from "@/lib/i18n/dict.ts";
import { cn } from "@/lib/utils.ts";
import { useMizan } from "@/stores/mizan-store.ts";

type BeforeInstall = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function standalone() {
  if (typeof window === "undefined") return false;
  const n = navigator as Navigator & { standalone?: boolean };
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.matchMedia("(display-mode: fullscreen)").matches ||
    Boolean(n.standalone)
  );
}

function nativeApk() {
  if (typeof navigator === "undefined") return false;
  return /MizanNative\//.test(navigator.userAgent);
}

export function InstallHome() {
  const locale = useMizan((s) => s.settings.locale);
  const t = (k: string) => translate(locale, k);
  const deferred = useRef<BeforeInstall | null>(null);
  const [can, setCan] = useState(false);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");
  const native = nativeApk();
  const [pwa, setPwa] = useState(false);

  useEffect(() => {
    setPwa(standalone());
    const onPrompt = (e: Event) => {
      e.preventDefault();
      deferred.current = e as BeforeInstall;
      setCan(true);
    };
    const onInstalled = () => {
      setPwa(true);
      setCan(false);
      deferred.current = null;
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  async function installAndroid() {
    const ev = deferred.current;
    if (ev) {
      setBusy(true);
      try {
        await ev.prompt();
        const { outcome } = await ev.userChoice;
        if (outcome === "accepted") {
          setPwa(true);
          setNote(t("set.install.ok"));
        }
      } catch {
        setNote(t("set.install.android.how"));
      } finally {
        setBusy(false);
        deferred.current = null;
        setCan(false);
      }
      return;
    }
    setNote(t("set.install.android.how"));
  }

  return (
    <section className="install-card" data-go="install">
      <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-[var(--muted)]">{t("set.section.install")}</p>
      <p className="font-display mt-1 text-2xl leading-tight">{t("set.install.title")}</p>
      {native ? (
        <p className="mt-2 flex items-center gap-2 text-sm text-[var(--ok)]">
          <Check className="size-4" /> {t("set.install.native")}
        </p>
      ) : (
        <p className="mt-2 text-sm text-[var(--muted)]">{t("set.install.lead")}</p>
      )}

      <div className="install-split">
        <article className="install-pane" data-go="install-android">
          <p className="install-pane-kicker">{t("set.install.android.title")}</p>
          <p className="mt-1 text-sm">{t("set.install.android.apk")}</p>
          {native ? (
            <p className="mt-3 flex min-h-12 items-center gap-2 text-sm text-[var(--ok)]">
              <Check className="size-4" /> {t("set.install.done")}
            </p>
          ) : (
            <a
              href="/mizan.apk"
              download="mizan.apk"
              data-go="install-apk"
              className={cn(
                "btn-glow mt-3 inline-flex min-h-12 w-full items-center justify-center gap-2 px-6 text-sm font-semibold",
                "transition-[transform,box-shadow,opacity] duration-150 ease-out active:scale-[0.96]",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]",
              )}
              onClick={() => setNote(t("set.install.android.sideload"))}
            >
              <Download className="size-4" />
              {t("set.install.android.btn")}
            </a>
          )}
          <ol className="install-steps">
            {["set.install.android.s1", "set.install.android.s2", "set.install.android.s3"].map((k, i) => (
              <li key={k}>
                <span>{i + 1}</span>
                {t(k)}
              </li>
            ))}
          </ol>
          {native ? null : (
            <Button variant="secondary" className="mt-3 w-full" disabled={busy || pwa} onClick={() => void installAndroid()}>
              <Download className="size-4" />
              {can ? t("set.install.android.now") : t("set.install.android.chrome")}
            </Button>
          )}
        </article>
        <article className="install-pane" data-go="install-ios">
          <p className="install-pane-kicker">{t("set.install.ios.title")}</p>
          <p className="mt-1 text-sm">{t("set.install.ios.how")}</p>
          <Button
            variant="secondary"
            className="mt-3 w-full"
            onClick={() => {
              if (navigator.share) {
                void navigator.share({ title: "Мизан", url: location.origin + location.pathname }).catch(() => setNote(t("set.install.ios.how")));
              }
              setNote(t("set.install.ios.how"));
            }}
          >
            <Share2 className="size-4" />
            {t("set.install.ios.btn")}
          </Button>
          <ol className="install-steps">
            {["set.install.ios.s1", "set.install.ios.s2", "set.install.ios.s3"].map((k, i) => (
              <li key={k}>
                <span>{i + 1}</span>
                {t(k)}
              </li>
            ))}
          </ol>
        </article>
      </div>
      {note ? <p className="mt-3 text-sm text-[var(--muted)]">{note}</p> : null}
    </section>
  );
}
