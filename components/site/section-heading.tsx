import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Reveal } from "./reveal";

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cn("flex items-center gap-3 text-[11px] font-semibold tracking-[0.3em] text-accent uppercase", className)}>
      <span className="h-px w-8 bg-accent/60" aria-hidden />
      {children}
    </p>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  action,
  className,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: "left" | "center";
  action?: ReactNode;
  className?: string;
}) {
  return (
    <Reveal
      className={cn(
        "flex flex-col gap-6 md:flex-row md:items-end md:justify-between",
        align === "center" && "items-center text-center md:flex-col md:items-center",
        className,
      )}
    >
      <div className={cn("max-w-2xl", align === "center" && "mx-auto flex flex-col items-center")}>
        {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
        <h2 className="mt-5 font-display text-4xl leading-[1.05] tracking-tight text-balance md:text-6xl">{title}</h2>
        {description && <p className="mt-5 max-w-xl text-base leading-relaxed text-muted">{description}</p>}
      </div>
      {action}
    </Reveal>
  );
}

export function Container({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("mx-auto w-full max-w-[1440px] px-5 md:px-10", className)}>{children}</div>;
}

export function PageHero({
  eyebrow,
  title,
  description,
  image,
  children,
}: {
  eyebrow: string;
  title: ReactNode;
  description?: ReactNode;
  image?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <section className="relative -mt-20 overflow-hidden pt-20">
      {image && (
        <div className="absolute inset-0">
          {image}
          <div className="absolute inset-0 bg-gradient-to-b from-ink/70 via-ink/75 to-ink" />
        </div>
      )}
      <Container className="relative py-24 md:py-36">
        <div className="max-w-3xl animate-fade-up">
          <Eyebrow>{eyebrow}</Eyebrow>
          <h1 className="mt-6 font-display text-5xl leading-[1] tracking-tight text-balance md:text-7xl lg:text-8xl">{title}</h1>
          {description && <p className="mt-6 max-w-xl text-base leading-relaxed text-muted md:text-lg">{description}</p>}
          {children}
        </div>
      </Container>
    </section>
  );
}
