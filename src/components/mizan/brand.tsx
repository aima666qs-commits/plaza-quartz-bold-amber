import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils.ts";

export function BrandMark({ size = 44 }: { size?: number }) {
  const [ok, setOk] = useState(true);
  if (!ok) {
    return (
      <svg width={size} height={size} viewBox="0 0 64 64" className="brand-logo" aria-hidden>
        <rect width="64" height="64" rx="14" fill="var(--accent)" />
        <text x="32" y="42" textAnchor="middle" fontSize="28" fill="var(--accent-fg)" fontFamily="serif">
          م
        </text>
      </svg>
    );
  }
  return (
    <img
      src="/brand/mizan-mark.jpg"
      alt="Мизан"
      className="brand-logo"
      width={size}
      height={size}
      onError={() => setOk(false)}
    />
  );
}

export function SheikhSeal({ size = 148, onClick }: { size?: number; onClick?: () => void }) {
  const [ok, setOk] = useState(true);
  const inner = ok ? (
    <img
      src="/brand/sheikh-seal.jpg"
      alt=""
      width={size}
      height={size}
      decoding="async"
      draggable={false}
      onError={() => setOk(false)}
    />
  ) : (
    <svg width={size} height={size} viewBox="0 0 128 128" aria-hidden>
      <circle cx="64" cy="64" r="62" fill="#0b2e23" stroke="#f0cf7a" strokeWidth="3" />
      <text x="64" y="58" textAnchor="middle" fontSize="22" fill="#f0cf7a" fontFamily="serif">
        شيخ
      </text>
      <text x="64" y="88" textAnchor="middle" fontSize="16" fill="#f8f4e9" fontFamily="serif">
        ميزان
      </text>
    </svg>
  );
  if (!onClick) return <span className="sheikh-seal-btn" style={{ width: size, height: size }}>{inner}</span>;
  return (
    <button
      type="button"
      className="sheikh-seal-btn"
      style={{ width: size, height: size }}
      aria-label="Спросить шейха"
      title="Спросить шейха"
      onClick={onClick}
    >
      <i className="sheikh-ring" aria-hidden />
      <i className="sheikh-ring" aria-hidden />
      {inner}
    </button>
  );
}

export function ScalesFilm({
  grown = false,
  mini = false,
  onHome,
  onGrow,
}: {
  grown?: boolean;
  mini?: boolean;
  onHome: () => void;
  onGrow: () => void;
}) {
  const film = useRef<HTMLVideoElement>(null);
  const wait = useRef<number | null>(null);
  useEffect(() => {
    const node = film.current;
    if (!node) return;
    node.playbackRate = 0.9;
    void node.play().catch(() => {});
  }, []);
  function press() {
    if (wait.current != null) {
      window.clearTimeout(wait.current);
      wait.current = null;
      onGrow();
      return;
    }
    wait.current = window.setTimeout(() => {
      wait.current = null;
      onHome();
    }, 280);
  }
  return (
    <button
      type="button"
      className={cn("scales-mark", grown && "is-launch", mini && "is-mini")}
      onClick={press}
      aria-label={grown ? "Свернуть" : "На главную"}
      data-go="scales"
    >
      <video
        ref={film}
        poster="/brand/scales-clear.png"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
      >
        <source src="/brand/scales-rock.webm" type="video/webm" />
        <source src="/brand/scales-rock.mp4" type="video/mp4" />
      </video>
    </button>
  );
}
