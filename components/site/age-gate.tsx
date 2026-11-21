"use client";

import { useId, useState, useSyncExternalStore } from "react";
import { ShieldCheck } from "lucide-react";
import { LogoMark } from "./logo";
import { AGE_COOKIE, BRAND } from "@/lib/brand";
import { Button } from "@/components/ui/button";

/**
 * Age confirmation gate (Ontario minimum age: 19).
 *
 * The visitor ticks a box confirming they are 19 or older. No personal data is collected —
 * only a non-identifying flag cookie (`ff_age_verified=1`) is set.
 *
 * Compliance: this is an age *confirmation*, not identity verification. Any sale must still be
 * verified against government-issued photo ID at pickup/delivery (see /legal/compliance).
 */
const noopSubscribe = () => () => {};
const readVerified = () => document.documentElement.getAttribute("data-age-verified") === "true";

export function AgeGate() {
  // Server render always shows the gate; the client reads the flag set by the <head> boot script.
  const alreadyVerified = useSyncExternalStore(noopSubscribe, readVerified, () => false);
  const [confirmed, setConfirmed] = useState(false);
  const [isOfAge, setIsOfAge] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [denied, setDenied] = useState(false);
  const titleId = useId();

  if (alreadyVerified || confirmed) return null;

  function confirm(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!isOfAge) return setError(`Please confirm that you are ${BRAND.minimumAge} or older.`);
    const maxAge = remember ? `; max-age=${60 * 60 * 24 * 30}` : "";
    const secure = location.protocol === "https:" ? "; secure" : "";
    document.cookie = `${AGE_COOKIE}=1; path=/; samesite=lax${maxAge}${secure}`;
    document.documentElement.setAttribute("data-age-verified", "true");
    setConfirmed(true);
  }

  return (
    <div
      className="age-gate fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-ink/95 p-4 backdrop-blur-2xl"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <div className="relative w-full max-w-lg animate-fade-up overflow-hidden rounded-3xl border border-line bg-surface p-8 shadow-2xl md:p-12">
        <div className="pointer-events-none absolute -top-24 left-1/2 size-64 -translate-x-1/2 rounded-full bg-accent/10 blur-3xl" />
        <div className="relative text-center">
          <LogoMark className="mx-auto size-10 text-accent" />
          <p className="mt-6 text-[11px] tracking-[0.3em] text-muted uppercase">{BRAND.name}</p>

          {denied ? (
            <>
              <h2 id={titleId} className="mt-4 font-display text-4xl leading-tight">
                Come back when you&rsquo;re 19.
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-muted">
                This website is only for adults of legal age in Ontario. We can&rsquo;t let you enter right now.
              </p>
              <a
                href="https://www.ontario.ca/page/cannabis-legalization"
                className="mt-8 inline-block text-xs tracking-[0.14em] text-accent uppercase link-underline"
                rel="noopener noreferrer"
                target="_blank"
              >
                Learn about Ontario&rsquo;s laws
              </a>
            </>
          ) : (
            <>
              <h2 id={titleId} className="mt-4 font-display text-4xl leading-tight md:text-5xl">
                Are you of legal age?
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-muted">
                You must be <strong className="text-cream">19 or older</strong> to enter. Please confirm your age below.
              </p>

              <form onSubmit={confirm} className="mt-8 text-left" noValidate>
                <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-line bg-ink/50 p-4 text-sm text-cream">
                  <input
                    type="checkbox"
                    checked={isOfAge}
                    onChange={(e) => {
                      setIsOfAge(e.target.checked);
                      if (e.target.checked) setError(null);
                    }}
                    className="size-5 accent-[#A6B889]"
                  />
                  I confirm that I am {BRAND.minimumAge} years of age or older
                </label>
                {error && <p role="alert" className="mt-3 text-xs text-danger">{error}</p>}

                <label className="mt-5 flex cursor-pointer items-center gap-3 text-xs text-muted">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="size-4 accent-[#A6B889]"
                  />
                  Remember me on this device for 30 days (not recommended on shared devices)
                </label>

                <Button type="submit" size="lg" className="mt-6 w-full" disabled={!isOfAge}>
                  Enter
                </Button>
                <button
                  type="button"
                  onClick={() => setDenied(true)}
                  className="mt-3 w-full py-2 text-xs tracking-[0.14em] text-muted uppercase transition-colors hover:text-cream"
                >
                  I am under 19
                </button>
              </form>

              <div className="mt-6 flex gap-3 rounded-2xl border border-line bg-ink/50 p-4 text-left text-[11px] leading-relaxed text-muted">
                <ShieldCheck className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden />
                <p>
                  No personal information is collected for this check. This confirmation is not
                  identity verification — valid government-issued photo ID is required for any purchase.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
