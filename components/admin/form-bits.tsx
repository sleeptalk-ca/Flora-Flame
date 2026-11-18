"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ActionState } from "@/app/admin/actions";
import { cn } from "@/lib/utils";

export { useSubmitWithoutReset } from "@/components/ui/use-submit-without-reset";

export function SubmitButton({
  children,
  pendingLabel = "Saving…",
  variant = "primary",
  size = "md",
  className,
  pending: pendingProp,
}: {
  children: ReactNode;
  pendingLabel?: string;
  variant?: "primary" | "outline" | "danger" | "subtle";
  size?: "sm" | "md";
  className?: string;
  /** Pass useActionState's pending flag when the form uses useSubmitWithoutReset. */
  pending?: boolean;
}) {
  const status = useFormStatus();
  const pending = pendingProp ?? status.pending;
  return (
    <Button type="submit" disabled={pending} variant={variant} size={size} className={className} aria-busy={pending}>
      {pending && <Loader2 className="size-4 animate-spin" aria-hidden />}
      {pending ? pendingLabel : children}
    </Button>
  );
}

/** Inline result banner for useActionState forms; success messages fade after a few seconds. */
export function ActionFeedback({ state, className }: { state: ActionState; className?: string }) {
  const [dismissedAt, setDismissedAt] = useState<number | undefined>(undefined);
  useEffect(() => {
    if (state.status !== "success") return;
    const t = setTimeout(() => setDismissedAt(state.at), 4000);
    return () => clearTimeout(t);
  }, [state.at, state.status]);

  if (state.status === "idle" || !state.message || dismissedAt === state.at) return null;
  const success = state.status === "success";
  return (
    <div
      role={success ? "status" : "alert"}
      className={cn(
        "flex items-start gap-2 rounded-xl border px-4 py-3 text-sm",
        success ? "border-accent/30 bg-accent/10 text-accent" : "border-danger/30 bg-danger/10 text-danger",
        className,
      )}
    >
      {success ? <CheckCircle2 className="mt-0.5 size-4 shrink-0" /> : <XCircle className="mt-0.5 size-4 shrink-0" />}
      {state.message}
    </div>
  );
}

/** A submit button that asks for confirmation first (for destructive server-action forms). */
export function ConfirmSubmit({
  children,
  message,
  className,
  variant = "danger",
  size = "sm",
}: {
  children: ReactNode;
  message: string;
  className?: string;
  variant?: "danger" | "outline" | "subtle";
  size?: "sm" | "md";
}) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      variant={variant}
      size={size}
      disabled={pending}
      className={className}
      onClick={(e) => {
        if (!window.confirm(message)) e.preventDefault();
      }}
    >
      {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
      {children}
    </Button>
  );
}
