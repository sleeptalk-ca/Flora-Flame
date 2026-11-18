"use client";

import { useEffect } from "react";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SiteError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-6 py-24 text-center">
      <p className="text-[11px] tracking-[0.3em] text-muted uppercase">Something went wrong</p>
      <h1 className="mt-4 font-display text-5xl">We hit a snag.</h1>
      <p className="mt-4 text-muted">Please try again. If the problem continues, contact us and we&rsquo;ll help.</p>
      {error.digest && <p className="mt-2 text-xs text-muted/60">Reference: {error.digest}</p>}
      <Button onClick={reset} className="mt-8">
        <RotateCcw className="size-4" /> Try again
      </Button>
    </div>
  );
}
