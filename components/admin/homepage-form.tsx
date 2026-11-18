"use client";

import { useActionState, useState } from "react";
import { ArrowDown, ArrowUp, Plus, X } from "lucide-react";
import { saveHomepageAction, type ActionState } from "@/app/admin/actions";
import { TextAreaField, TextField } from "@/components/ui/field";
import { useSubmitWithoutReset, ActionFeedback, SubmitButton } from "./form-bits";
import { ImageInput } from "./image-input";
import type { SiteSettings } from "@/lib/types";

const initial: ActionState = { status: "idle" };

type Opt = { id: string; name: string; image_url: string; category: string; is_active: boolean };

export function HomepageForm({ settings, products }: { settings: SiteSettings; products: Opt[] }) {
  const [state, action, pending] = useActionState(saveHomepageAction, initial);
  const onSubmit = useSubmitWithoutReset(action);
  const [featured, setFeatured] = useState<string[]>(settings.featured_product_ids.filter((id) => products.some((p) => p.id === id)));
  const e = state.errors ?? {};
  const byId = new Map(products.map((p) => [p.id, p]));
  const available = products.filter((p) => !featured.includes(p.id));

  const move = (i: number, d: -1 | 1) =>
    setFeatured((f) => {
      const n = [...f];
      const j = i + d;
      if (j < 0 || j >= n.length) return n;
      [n[i], n[j]] = [n[j], n[i]];
      return n;
    });

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-6">
      <ActionFeedback state={state} />
      {featured.map((id) => (
        <input key={id} type="hidden" name="featured_product_ids" value={id} />
      ))}

      <section className="space-y-5 rounded-2xl border border-line bg-surface p-5 md:p-6">
        <h2 className="text-sm font-semibold">Hero</h2>
        <div className="grid gap-5 md:grid-cols-2">
          <TextField name="hero_eyebrow" label="Eyebrow" defaultValue={settings.hero_eyebrow} error={e.hero_eyebrow} />
          <TextField name="hero_title" label="Headline" defaultValue={settings.hero_title} error={e.hero_title} />
        </div>
        <TextAreaField name="hero_subtitle" label="Subheading" rows={3} defaultValue={settings.hero_subtitle} error={e.hero_subtitle} />
        <ImageInput name="hero_image_url" label="Hero image" defaultValue={settings.hero_image_url} error={e.hero_image_url} aspect="aspect-video" />
        <TextField
          name="announcement"
          label="Announcement bar"
          hint="Leave empty to hide"
          defaultValue={settings.announcement}
          error={e.announcement}
        />
      </section>

      <section className="space-y-4 rounded-2xl border border-line bg-surface p-5 md:p-6">
        <div className="flex items-baseline justify-between">
          <h2 className="text-sm font-semibold">Featured products</h2>
          <span className="text-xs text-muted">{featured.length}/12 · shown in this order</span>
        </div>
        {featured.length === 0 && <p className="text-sm text-muted">No products selected — products flagged “Featured” are used automatically.</p>}
        <ol className="space-y-2">
          {featured.map((id, i) => {
            const p = byId.get(id)!;
            return (
              <li key={id} className="flex items-center gap-3 rounded-xl border border-line bg-ink/40 p-2">
                <span className="w-6 text-center text-xs text-muted tabular-nums">{i + 1}</span>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.image_url} alt="" className="size-10 rounded-lg object-cover" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm">{p.name}</span>
                  <span className="block text-xs text-muted">
                    {p.category}
                    {!p.is_active && " · hidden on storefront"}
                  </span>
                </span>
                <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label={`Move ${p.name} up`} className="flex size-8 items-center justify-center rounded-lg text-muted hover:bg-surface-2 hover:text-cream disabled:opacity-30">
                  <ArrowUp className="size-4" />
                </button>
                <button type="button" onClick={() => move(i, 1)} disabled={i === featured.length - 1} aria-label={`Move ${p.name} down`} className="flex size-8 items-center justify-center rounded-lg text-muted hover:bg-surface-2 hover:text-cream disabled:opacity-30">
                  <ArrowDown className="size-4" />
                </button>
                <button type="button" onClick={() => setFeatured((f) => f.filter((x) => x !== id))} aria-label={`Remove ${p.name}`} className="flex size-8 items-center justify-center rounded-lg text-muted hover:bg-surface-2 hover:text-danger">
                  <X className="size-4" />
                </button>
              </li>
            );
          })}
        </ol>
        {available.length > 0 && featured.length < 12 && (
          <div className="flex flex-wrap gap-2 border-t border-line pt-4">
            {available.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setFeatured((f) => [...f, p.id])}
                className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-xs text-muted transition-colors hover:border-accent hover:text-accent"
              >
                <Plus className="size-3" /> {p.name}
              </button>
            ))}
          </div>
        )}
      </section>

      <SubmitButton pending={pending}>Save homepage</SubmitButton>
    </form>
  );
}
