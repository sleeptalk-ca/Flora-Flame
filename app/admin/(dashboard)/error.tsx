"use client";

import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="mx-auto max-w-lg py-24 text-center">
      <h1 className="font-display text-4xl">Something went wrong</h1>
      <p className="mt-3 text-sm text-muted">
        {error.message?.includes("Supabase") || error.message?.includes("local data")
          ? error.message
          : "The data could not be loaded. Check your database configuration and try again."}
      </p>
      {error.digest && <p className="mt-2 text-xs text-muted/60">Reference: {error.digest}</p>}
      <Button onClick={reset} className="mt-8">
        <RotateCcw className="size-4" /> Retry
      </Button>
    </div>
  );
}
