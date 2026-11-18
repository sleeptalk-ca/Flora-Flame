"use client";

import { useSubmitWithoutReset } from "@/components/admin/form-bits";
import { useActionState, useEffect, useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { updateInventoryAction, type ActionState } from "@/app/admin/actions";
import { AVAILABILITY, type Product } from "@/lib/types";
import { AVAILABILITY_LABEL, centsToDollarsString, cn } from "@/lib/utils";

const initial: ActionState = { status: "idle" };
const cell = "w-full rounded-lg border border-line bg-ink/60 px-2.5 py-2 text-sm tabular-nums focus:border-accent focus:outline-none";

export function InventoryRow({ product, category }: { product: Product; category: string }) {
  const [state, action, pending] = useActionState(updateInventoryAction, initial);
  const onSubmit = useSubmitWithoutReset(action);
  const [dirty, setDirty] = useState(false);
  const [seenAt, setSeenAt] = useState(state.at);
  const [flashClearedAt, setFlashClearedAt] = useState<number | undefined>(undefined);
  const formId = `inv-${product.id}`;

  // React to a new action result during render (not in an effect).
  if (state.at !== seenAt) {
    setSeenAt(state.at);
    if (state.status === "success") setDirty(false);
  }
  const flash = state.status === "success" && flashClearedAt !== state.at;

  useEffect(() => {
    if (state.status !== "success") return;
    const t = setTimeout(() => setFlashClearedAt(state.at), 2000);
    return () => clearTimeout(t);
  }, [state.at, state.status]);

  return (
    <tr className={cn(dirty && "bg-accent/5")}>
      <td>
        <form id={formId} onSubmit={onSubmit} onChange={() => setDirty(true)}>
          <input type="hidden" name="id" value={product.id} />
        </form>
        <p className="font-medium">{product.name}</p>
        <p className="text-xs text-muted">
          {category}
          {product.sku ? ` · ${product.sku}` : ""}
        </p>
      </td>
      <td className="w-36">
        <div className="relative">
          <span className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-xs text-muted">$</span>
          <input
            form={formId}
            name="price"
            inputMode="decimal"
            aria-label={`Price for ${product.name} (CAD)`}
            defaultValue={centsToDollarsString(product.price_cents)}
            onChange={() => setDirty(true)}
            className={cn(cell, "pl-6")}
          />
        </div>
      </td>
      <td className="w-28">
        <input
          form={formId}
          name="inventory"
          type="number"
          min={0}
          aria-label={`Stock for ${product.name}`}
          defaultValue={product.inventory}
          onChange={() => setDirty(true)}
          className={cell}
        />
      </td>
      <td className="w-44">
        <select
          form={formId}
          name="availability"
          aria-label={`Availability for ${product.name}`}
          defaultValue={product.availability}
          onChange={() => setDirty(true)}
          className={cell}
        >
          {AVAILABILITY.map((a) => (
            <option key={a} value={a}>
              {AVAILABILITY_LABEL[a]}
            </option>
          ))}
        </select>
      </td>
      <td className="w-40 text-right">
        <button
          type="submit"
          form={formId}
          disabled={pending || !dirty}
          className="inline-flex h-9 items-center gap-1.5 rounded-full bg-accent px-4 text-xs font-medium text-ink transition-opacity disabled:opacity-30"
        >
          {pending ? <Loader2 className="size-3.5 animate-spin" /> : flash ? <Check className="size-3.5" /> : null}
          {flash ? "Saved" : "Save"}
        </button>
        {state.status === "error" && <p className="mt-1 text-xs text-danger">{state.message}</p>}
      </td>
    </tr>
  );
}
