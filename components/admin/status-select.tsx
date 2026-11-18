"use client";

import { useRef } from "react";
import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";

function Inner({ name, value, options, label }: { name: string; value: string; options: { value: string; label: string }[]; label: string }) {
  const { pending } = useFormStatus();
  return (
    <div className="relative inline-flex items-center gap-2">
      <select
        name={name}
        defaultValue={value}
        aria-label={label}
        disabled={pending}
        onChange={(e) => e.currentTarget.form?.requestSubmit()}
        className="rounded-lg border border-line bg-ink/60 px-2.5 py-1.5 text-xs focus:border-accent focus:outline-none"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {pending && <Loader2 className="size-3.5 animate-spin text-accent" aria-label="Saving" />}
    </div>
  );
}

/** A select that submits its server-action form as soon as it changes. */
export function StatusSelect({
  action,
  id,
  value,
  options,
  label,
}: {
  action: (fd: FormData) => Promise<void>;
  id: string;
  value: string;
  options: { value: string; label: string }[];
  label: string;
}) {
  const ref = useRef<HTMLFormElement>(null);
  return (
    <form ref={ref} action={action}>
      <input type="hidden" name="id" value={id} />
      <Inner name="status" value={value} options={options} label={label} />
    </form>
  );
}
