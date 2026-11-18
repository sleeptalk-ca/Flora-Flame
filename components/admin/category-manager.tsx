"use client";

import { useActionState, useState } from "react";
import { ChevronDown, Plus, Trash2 } from "lucide-react";
import { deleteCategoryAction, saveCategoryAction, type ActionState } from "@/app/admin/actions";
import { SelectField, TextAreaField, TextField } from "@/components/ui/field";
import { useSubmitWithoutReset, ActionFeedback, ConfirmSubmit, SubmitButton } from "./form-bits";
import { ImageInput } from "./image-input";
import { RESTRICTED_CLASSES, type Category } from "@/lib/types";
import { RESTRICTED_LABEL, slugify, cn } from "@/lib/utils";

const initial: ActionState = { status: "idle" };

function CategoryForm({ category, onDone }: { category?: Category; onDone?: () => void }) {
  const [state, action, pending] = useActionState(async (prev: ActionState, fd: FormData) => {
    const res = await saveCategoryAction(prev, fd);
    if (res.status === "success" && !category) onDone?.();
    return res;
  }, initial);
  const onSubmit = useSubmitWithoutReset(action);
  const [slug, setSlug] = useState(category?.slug ?? "");
  const [touched, setTouched] = useState(Boolean(category));
  const e = state.errors ?? {};

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      {category && <input type="hidden" name="id" value={category.id} />}
      <ActionFeedback state={state} />
      <div className="grid gap-5 md:grid-cols-2">
        <TextField
          name="name"
          label="Name"
          defaultValue={category?.name}
          onChange={(ev) => !touched && setSlug(slugify(ev.target.value))}
          error={e.name}
          required
        />
        <TextField
          name="slug"
          label="Slug"
          value={slug}
          onChange={(ev) => {
            setTouched(true);
            setSlug(slugify(ev.target.value));
          }}
          error={e.slug}
          required
        />
      </div>
      <TextAreaField name="description" label="Description" rows={3} defaultValue={category?.description} error={e.description} />
      <div className="grid gap-5 md:grid-cols-2">
        <SelectField
          name="restricted"
          label="Regulatory class"
          hint="Controls sales gating"
          defaultValue={category?.restricted ?? "none"}
          error={e.restricted}
        >
          {RESTRICTED_CLASSES.map((r) => (
            <option key={r} value={r}>
              {RESTRICTED_LABEL[r]}
            </option>
          ))}
        </SelectField>
        <TextField name="sort_order" label="Sort order" type="number" min={0} defaultValue={category?.sort_order ?? 0} error={e.sort_order} />
      </div>
      <ImageInput name="image_url" label="Category image" defaultValue={category?.image_url} error={e.image_url} aspect="aspect-[3/4]" />
      <SubmitButton pending={pending}>{category ? "Save category" : "Create category"}</SubmitButton>
    </form>
  );
}

function DeleteCategory({ category, productCount }: { category: Category; productCount: number }) {
  const [state, action] = useActionState(deleteCategoryAction, initial);
  return (
    <form action={action} className="space-y-2">
      <input type="hidden" name="id" value={category.id} />
      <ActionFeedback state={state} />
      <ConfirmSubmit message={`Delete category “${category.name}”?`} variant="danger">
        <Trash2 className="size-3.5" /> Delete category
      </ConfirmSubmit>
      {productCount > 0 && <p className="text-xs text-muted">Contains {productCount} product(s) — move or delete them first.</p>}
    </form>
  );
}

export function CategoryManager({ categories, counts }: { categories: Category[]; counts: Record<string, number> }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  return (
    <div className="space-y-3">
      {categories.map((c) => {
        const open = openId === c.id;
        return (
          <div key={c.id} className="overflow-hidden rounded-2xl border border-line bg-surface">
            <button
              type="button"
              onClick={() => setOpenId(open ? null : c.id)}
              aria-expanded={open}
              className="flex w-full items-center gap-4 p-4 text-left transition-colors hover:bg-surface-2"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {c.image_url ? <img src={c.image_url} alt="" className="size-12 rounded-lg object-cover" /> : <span className="size-12 rounded-lg bg-ink" />}
              <span className="min-w-0 flex-1">
                <span className="block font-medium">{c.name}</span>
                <span className="block text-xs text-muted">
                  /{c.slug} · {counts[c.id] ?? 0} products · {RESTRICTED_LABEL[c.restricted]}
                </span>
              </span>
              <ChevronDown className={cn("size-4 text-muted transition-transform", open && "rotate-180")} />
            </button>
            {open && (
              <div className="space-y-6 border-t border-line p-5">
                <CategoryForm category={c} />
                <div className="border-t border-line pt-5">
                  <DeleteCategory category={c} productCount={counts[c.id] ?? 0} />
                </div>
              </div>
            )}
          </div>
        );
      })}

      {creating ? (
        <div className="rounded-2xl border border-accent/30 bg-surface p-5">
          <h2 className="mb-5 text-sm font-semibold">New category</h2>
          <CategoryForm onDone={() => setCreating(false)} />
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setCreating(true)}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-line-strong p-5 text-sm text-muted transition-colors hover:border-accent hover:text-accent"
        >
          <Plus className="size-4" /> Add category
        </button>
      )}
    </div>
  );
}
