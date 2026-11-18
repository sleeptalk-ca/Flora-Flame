import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

export const inputClasses =
  "w-full rounded-xl border border-line bg-ink/60 px-4 py-3 text-sm text-cream placeholder:text-muted/70 transition-colors duration-300 hover:border-line-strong focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/40 aria-[invalid=true]:border-danger/70";

export function Label({ htmlFor, children, hint }: { htmlFor: string; children: ReactNode; hint?: string }) {
  return (
    <label htmlFor={htmlFor} className="mb-2 flex items-baseline justify-between gap-2 text-xs font-medium uppercase tracking-[0.14em] text-muted">
      <span>{children}</span>
      {hint && <span className="normal-case tracking-normal text-muted/70">{hint}</span>}
    </label>
  );
}

export function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="mt-1.5 text-xs text-danger">
      {message}
    </p>
  );
}

type FieldProps = {
  name: string;
  label: string;
  error?: string;
  hint?: string;
  className?: string;
};

export function TextField({ name, label, error, hint, className, ...rest }: FieldProps & ComponentProps<"input">) {
  const id = rest.id ?? `f-${name}`;
  return (
    <div className={className}>
      <Label htmlFor={id} hint={hint}>
        {label}
      </Label>
      <input
        id={id}
        name={name}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-err` : undefined}
        className={inputClasses}
        {...rest}
      />
      <FieldError id={`${id}-err`} message={error} />
    </div>
  );
}

export function TextAreaField({ name, label, error, hint, className, ...rest }: FieldProps & ComponentProps<"textarea">) {
  const id = rest.id ?? `f-${name}`;
  return (
    <div className={className}>
      <Label htmlFor={id} hint={hint}>
        {label}
      </Label>
      <textarea
        id={id}
        name={name}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-err` : undefined}
        className={cn(inputClasses, "min-h-32 resize-y leading-relaxed")}
        {...rest}
      />
      <FieldError id={`${id}-err`} message={error} />
    </div>
  );
}

export function SelectField({
  name,
  label,
  error,
  hint,
  className,
  children,
  ...rest
}: FieldProps & ComponentProps<"select">) {
  const id = rest.id ?? `f-${name}`;
  return (
    <div className={className}>
      <Label htmlFor={id} hint={hint}>
        {label}
      </Label>
      <select
        id={id}
        name={name}
        aria-invalid={error ? true : undefined}
        className={cn(inputClasses, "appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2212%22 height=%2212%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%2392968D%22 stroke-width=%222%22><path d=%22m6 9 6 6 6-6%22/></svg>')] bg-[right_1rem_center] bg-no-repeat pr-10")}
        {...rest}
      >
        {children}
      </select>
      <FieldError id={`${id}-err`} message={error} />
    </div>
  );
}

export function CheckboxField({
  name,
  label,
  error,
  description,
  className,
  ...rest
}: Omit<FieldProps, "hint"> & { description?: ReactNode } & ComponentProps<"input">) {
  const id = rest.id ?? `f-${name}`;
  return (
    <div className={className}>
      <label htmlFor={id} className="flex cursor-pointer items-start gap-3 text-sm text-cream">
        <input
          id={id}
          name={name}
          type="checkbox"
          aria-invalid={error ? true : undefined}
          className="mt-0.5 size-4 shrink-0 cursor-pointer appearance-none rounded border border-line-strong bg-ink transition-colors checked:border-accent checked:bg-accent checked:bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%2310120F%22 stroke-width=%223.5%22><path d=%22M5 12l5 5L20 7%22/></svg>')] bg-center bg-no-repeat"
          {...rest}
        />
        <span>
          <span className="font-medium">{label}</span>
          {description && <span className="mt-0.5 block text-xs leading-relaxed text-muted">{description}</span>}
        </span>
      </label>
      <FieldError id={`${id}-err`} message={error} />
    </div>
  );
}

export function FormMessage({ tone, children }: { tone: "success" | "error"; children: ReactNode }) {
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "rounded-xl border px-4 py-3 text-sm",
        tone === "success" ? "border-accent/40 bg-accent/10 text-accent" : "border-danger/40 bg-danger/10 text-danger",
      )}
    >
      {children}
    </div>
  );
}
