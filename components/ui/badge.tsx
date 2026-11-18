import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { Availability } from "@/lib/types";
import { AVAILABILITY_LABEL } from "@/lib/utils";

type Tone = "neutral" | "accent" | "warning" | "danger" | "muted";

const tones: Record<Tone, string> = {
  neutral: "border-line-strong text-cream bg-ink/60",
  accent: "border-accent/40 text-accent bg-accent/10",
  warning: "border-warning/40 text-warning bg-warning/10",
  danger: "border-danger/40 text-danger bg-danger/10",
  muted: "border-line text-muted bg-ink/60",
};

export function Badge({ tone = "neutral", className, children }: { tone?: Tone; className?: string; children: ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] backdrop-blur-md",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

const AVAIL_TONE: Record<Availability, Tone> = {
  in_stock: "accent",
  low_stock: "warning",
  out_of_stock: "danger",
  coming_soon: "muted",
};

export function AvailabilityBadge({ value, className }: { value: Availability; className?: string }) {
  return (
    <Badge tone={AVAIL_TONE[value]} className={className}>
      <span className="size-1.5 rounded-full bg-current" aria-hidden />
      {AVAILABILITY_LABEL[value]}
    </Badge>
  );
}
