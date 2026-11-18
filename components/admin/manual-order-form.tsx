"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { createManualOrderAction, type ActionState } from "@/app/admin/actions";
import { CheckboxField, SelectField, TextAreaField, TextField, inputClasses } from "@/components/ui/field";
import { useSubmitWithoutReset, ActionFeedback, SubmitButton } from "./form-bits";
import { formatCAD, cn } from "@/lib/utils";

const initial: ActionState = { status: "idle" };

type Option = { id: string; name: string; price_cents: number; inventory: number; restricted: string; blocked: boolean };

export function ManualOrderForm({ products }: { products: Option[] }) {
  const [state, action, pending] = useActionState(createManualOrderAction, initial);
  const onSubmit = useSubmitWithoutReset(action);
  const [rows, setRows] = useState([{ key: 0, product: "", qty: 1 }]);
  const nextKey = useRef(1);
  const formRef = useRef<HTMLFormElement>(null);
  const e = state.errors ?? {};

  useEffect(() => {
    if (state.status === "success") {
      formRef.current?.reset();
      setRows([{ key: nextKey.current++, product: "", qty: 1 }]);
    }
  }, [state.at, state.status]);

  const subtotal = rows.reduce((s, r) => s + (products.find((p) => p.id === r.product)?.price_cents ?? 0) * r.qty, 0);

  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate className="space-y-5">
      <ActionFeedback state={state} />
      <div className="grid gap-4 md:grid-cols-3">
        <TextField name="customer_name" label="Customer name" error={e.customer_name} />
        <TextField name="customer_email" label="Email" type="email" error={e.customer_email} />
        <TextField name="customer_phone" label="Phone" hint="Optional" error={e.customer_phone} />
      </div>

      <fieldset>
        <legend className="mb-2 text-xs font-medium tracking-[0.14em] text-muted uppercase">Items</legend>
        <div className="space-y-2">
          {rows.map((r, i) => (
            <div key={r.key} className="flex gap-2">
              <select
                name="item_product"
                aria-label={`Item ${i + 1} product`}
                value={r.product}
                onChange={(ev) => setRows((rs) => rs.map((x) => (x.key === r.key ? { ...x, product: ev.target.value } : x)))}
                className={cn(inputClasses, "flex-1")}
              >
                <option value="">Select a product…</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id} disabled={p.blocked || p.inventory === 0}>
                    {p.name} — {formatCAD(p.price_cents)} ({p.inventory} in stock){p.blocked ? " · blocked: authorization required" : ""}
                  </option>
                ))}
              </select>
              <input
                name="item_qty"
                type="number"
                min={1}
                max={99}
                aria-label={`Item ${i + 1} quantity`}
                value={r.qty}
                onChange={(ev) => setRows((rs) => rs.map((x) => (x.key === r.key ? { ...x, qty: Math.max(1, Number(ev.target.value) || 1) } : x)))}
                className={cn(inputClasses, "w-20")}
              />
              <button
                type="button"
                aria-label={`Remove item ${i + 1}`}
                disabled={rows.length === 1}
                onClick={() => setRows((rs) => rs.filter((x) => x.key !== r.key))}
                className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-line text-muted hover:text-danger disabled:opacity-30"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setRows((rs) => [...rs, { key: nextKey.current++, product: "", qty: 1 }])}
          className="mt-2 inline-flex items-center gap-1.5 text-xs text-accent hover:underline"
        >
          <Plus className="size-3.5" /> Add item
        </button>
        {e.items && <p className="mt-1 text-xs text-danger">{e.items}</p>}
        <p className="mt-3 text-sm text-muted">
          Subtotal <span className="text-cream tabular-nums">{formatCAD(subtotal)}</span> · HST (13%) added on save
        </p>
      </fieldset>

      <div className="grid gap-4 md:grid-cols-[200px_1fr]">
        <SelectField name="fulfillment" label="Fulfillment" defaultValue="pickup">
          <option value="pickup">Pickup</option>
          <option value="delivery">Delivery</option>
        </SelectField>
        <TextAreaField name="notes" label="Notes" rows={2} className="[&_textarea]:min-h-12" />
      </div>
      <CheckboxField
        name="confirm_age_verified"
        label="Customer's age (19+) was verified with valid government-issued photo ID"
        error={e.confirm_age_verified}
      />
      <SubmitButton pending={pending}>Record order</SubmitButton>
    </form>
  );
}
