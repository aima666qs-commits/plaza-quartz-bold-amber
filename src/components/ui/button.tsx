import { Tap } from "@/components/mizan/press.tsx";
import { cn } from "@/lib/utils.ts";
import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "glow";

export function Button({
  className,
  variant = "primary",
  type = "button",
  onAnimationStart: _anim,
  onDrag: _drag,
  onDragStart: _dragStart,
  onDragEnd: _dragEnd,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <Tap
      type={type}
      className={cn(
        "inline-flex min-h-11 items-center justify-center gap-2 px-4 text-sm font-medium",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]",
        "disabled:opacity-50 disabled:pointer-events-none",
        variant === "primary" && "bg-[var(--accent)] text-[var(--accent-fg)]",
        variant === "secondary" && "skin rounded-full text-[var(--fg)]",
        variant === "ghost" && "text-[var(--fg)] hover:bg-[var(--bg-elev)]",
        variant === "danger" && "bg-[var(--danger)] text-[var(--bg)]",
        variant === "glow" && "btn-glow min-h-12 px-6 font-semibold",
        className,
      )}
      {...props}
    />
  );
}