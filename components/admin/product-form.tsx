"use client";

import { useActionState, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { saveProductAction, type ActionState } from "@/app/admin/actions";
import { CheckboxField, SelectField, TextAreaField, TextField } from "@/components/ui/field";
import { useSubmitWithoutReset, ActionFeedback, SubmitButton } from "./form-bits";
import { GalleryInput, ImageInput } from "./image-input";
import { AVAILABILITY, type Category, type Product } from "@/lib/types";
import { AVAILABILITY_LABEL, centsToDollarsString, slugify } from "@/lib/utils";

const initial: ActionState = { status: "idle" };

export function ProductForm({ product, categories }: { product?: Product; categories: Category[] }) {
  const [state, action, pending] = useActionState(saveProductAction, initial);
  const onSubmit = useSubmitWithoutReset(action);
  const [name, setName] = useState(product?.name ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(product));
  const [categoryId, setCategoryId] = useState(product?.category_id ?? categories[0]?.id ?? "");
  const e = state.errors ?? {};
  const category = categories.find((c) => c.id === categoryId);

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-6 xl:grid-cols-[1fr_380px]">
      {product && <input type="hidden" name="id" value={product.id} />}

      <div className="space-y-6">
        <ActionFeedback state={state} />
        <section className="space-y-5 rounded-2xl border border-line bg-surface p-5 md:p-6">
          <h2 className="text-sm font-semibold">Basics</h2>
          <div className="grid gap-5 md:grid-cols-2">
            <TextField
              name="name"
              label="Product name"
              value={name}
              onChange={(ev) => {
                setName(ev.target.value);
                if (!slugTouched) setSlug(slugify(ev.target.value));
              }}
              error={e.name}
              required
            />
            <TextField
              name="slug"
              label="URL slug"
              hint={`/shop/${slug || "…"}`}
              value={slug}
              onChange={(ev) => {
                setSlugTouched(true);
                setSlug(slugify(ev.target.value));
              }}
              error={e.slug}
              required
            />
          </div>
          <TextField
            name="short_description"
            label="Short description"
            hint="Shown on product cards · max 200"
            maxLength={200}
            defaultValue={product?.short_description}
            error={e.short_description}
            required
          />
          <TextAreaField
            name="description"
            label="Full description"
            rows={7}
            defaultValue={product?.description}
            error={e.description}
            required
          />
          <TextAreaField
            name="details"
            label="Product details"
            hint="One per line — e.g. format, size, packaging"
            rows={4}
            defaultValue={product?.details}
            error={e.details}
          />
          {category?.restricted === "cannabis" && (
            <p className="flex items-start gap-2 rounded-xl border border-warning/30 bg-warning/5 p-3 text-xs leading-relaxed text-warning">
              <AlertTriangle className="mt-0.5 size-4 shrink-0" />
              Only publish potency, terpene or other regulated details exactly as printed on the licensed producer&rsquo;s label. Do not add
              health, effect or lifestyle claims.
            </p>
          )}
        </section>

        <section className="space-y-6 rounded-2xl border border-line bg-surface p-5 md:p-6">
          <h2 className="text-sm font-semibold">Images</h2>
          <ImageInput name="image_url" label="Main image" defaultValue={product?.image_url} error={e.image_url} />
          <GalleryInput name="gallery" defaultValue={product?.gallery} error={e.gallery} />
        </section>
      </div>

      <aside className="space-y-6">
        <section className="space-y-5 rounded-2xl border border-line bg-surface p-5 md:p-6">
          <h2 className="text-sm font-semibold">Pricing & inventory</h2>
          <TextField
            name="price"
            label="Price (CAD)"
            inputMode="decimal"
            placeholder="0.00"
            defaultValue={product ? centsToDollarsString(product.price_cents) : ""}
            error={e.price}
            required
          />
          <SelectField
            name="category_id"
            label="Category"
            value={categoryId}
            onChange={(ev) => setCategoryId(ev.target.value)}
            error={e.category_id}
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </SelectField>
          <SelectField name="availability" label="Availability" defaultValue={product?.availability ?? "in_stock"} error={e.availability}>
            {AVAILABILITY.map((a) => (
              <option key={a} value={a}>
                {AVAILABILITY_LABEL[a]}
              </option>
            ))}
          </SelectField>
          <div className="grid grid-cols-2 gap-4">
            <TextField name="inventory" label="Stock" type="number" min={0} defaultValue={product?.inventory ?? 0} error={e.inventory} />
            <TextField name="sku" label="SKU" defaultValue={product?.sku} error={e.sku} />
          </div>
        </section>

        <section className="space-y-4 rounded-2xl border border-line bg-surface p-5 md:p-6">
          <h2 className="text-sm font-semibold">Visibility</h2>
          <CheckboxField name="is_active" label="Published" description="Visible on the storefront" defaultChecked={product?.is_active ?? true} />
          <CheckboxField name="is_featured" label="Featured" description="Eligible for featured sections" defaultChecked={product?.is_featured} />
          <CheckboxField name="is_best_seller" label="Best seller" description="Shown in the best sellers row" defaultChecked={product?.is_best_seller} />
          <div className="border-t border-line pt-4" />
          <CheckboxField
            name="image_is_illustrative"
            label="Illustrative image"
            description="Labels the image as not depicting the actual product"
            defaultChecked={product?.image_is_illustrative ?? false}
          />
        </section>

        <div className="sticky bottom-4 rounded-2xl border border-line bg-surface/90 p-4 backdrop-blur-xl">
          <SubmitButton pending={pending} className="w-full">{product ? "Save changes" : "Create product"}</SubmitButton>
        </div>
      </aside>
    </form>
  );
}
