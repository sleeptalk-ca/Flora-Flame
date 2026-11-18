import type { Metadata } from "next";
import { Receipt, Trash2 } from "lucide-react";
import { Card, EmptyState, Notice, PageHeader, Table } from "@/components/admin/ui";
import { ManualOrderForm } from "@/components/admin/manual-order-form";
import { StatusSelect } from "@/components/admin/status-select";
import { ConfirmSubmit } from "@/components/admin/form-bits";
import { Badge } from "@/components/ui/badge";
import { requireAdmin } from "@/lib/auth/guard";
import { getStore } from "@/lib/data";
import { clearDemoOrdersAction, updateOrderStatusAction } from "@/app/admin/actions";
import { ORDER_STATUSES } from "@/lib/types";
import { formatCAD, formatDate, ORDER_STATUS_LABEL } from "@/lib/utils";

// Session-bound admin data: allowed to block on navigation.
export const instant = false;

export const metadata: Metadata = { title: "Orders" };

export default async function OrdersPage() {
  await requireAdmin();
  const store = getStore();
  const [orders, products, categories, settings] = await Promise.all([
    store.listOrders(),
    store.listProducts(),
    store.listCategories(),
    store.getSettings(),
  ]);
  const c = settings.compliance;
  const restrictedOf = new Map(categories.map((cat) => [cat.id, cat.restricted]));
  const options = products
    .filter((p) => p.is_active)
    .map((p) => {
      const r = restrictedOf.get(p.category_id) ?? "none";
      const blocked = (r === "cannabis" && !c.cannabis_retail_authorized) || (r === "tobacco" && !c.tobacco_retail_authorized);
      return { id: p.id, name: p.name, price_cents: p.price_cents, inventory: p.inventory, restricted: r, blocked };
    });
  const demoCount = orders.filter((o) => o.is_demo).length;
  const statusOptions = ORDER_STATUSES.map((s) => ({ value: s, label: ORDER_STATUS_LABEL[s] }));

  return (
    <>
      <PageHeader
        title="Orders"
        description="Online checkout is disabled. Record in-person or otherwise authorized orders here."
        actions={
          demoCount > 0 ? (
            <form action={clearDemoOrdersAction}>
              <ConfirmSubmit message={`Delete ${demoCount} demo orders?`} variant="outline" size="md">
                <Trash2 className="size-4" /> Clear {demoCount} demo orders
              </ConfirmSubmit>
            </form>
          ) : null
        }
      />

      {(!c.cannabis_retail_authorized || !c.tobacco_retail_authorized) && (
        <div className="mb-6">
          <Notice tone="warning">
            {!c.cannabis_retail_authorized && "Cannabis orders are blocked until an AGCO Retail Operator Licence and Retail Store Authorization are recorded. "}
            {!c.tobacco_retail_authorized && "Tobacco (grabba) orders are blocked until tobacco retail authorization is confirmed. "}
            Update this in Settings → Compliance.
          </Notice>
        </div>
      )}

      <Card title="Record an order" className="mb-8">
        <ManualOrderForm products={options} />
      </Card>

      {orders.length === 0 ? (
        <EmptyState icon={Receipt} title="No orders yet" />
      ) : (
        <Table>
          <thead>
            <tr>
              <th>Order</th>
              <th>Customer</th>
              <th>Items</th>
              <th className="text-right">Total</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id}>
                <td>
                  <p className="font-medium tabular-nums">{o.order_number}</p>
                  <p className="text-xs text-muted">{formatDate(o.created_at, { dateStyle: "medium", timeStyle: "short" })}</p>
                  {o.is_demo && <Badge tone="muted" className="mt-1">Demo</Badge>}
                </td>
                <td>
                  <p>{o.customer_name}</p>
                  <p className="text-xs text-muted">{o.customer_email}</p>
                  <p className="text-xs text-muted capitalize">{o.fulfillment}</p>
                </td>
                <td className="text-xs text-muted">
                  {o.items.map((it) => (
                    <p key={it.product_id}>
                      {it.quantity} × {it.name}
                    </p>
                  ))}
                </td>
                <td className="text-right tabular-nums">
                  {formatCAD(o.total_cents)}
                  <p className="text-xs text-muted">incl. {formatCAD(o.tax_cents)} HST</p>
                </td>
                <td>
                  <StatusSelect action={updateOrderStatusAction} id={o.id} value={o.status} options={statusOptions} label={`Status for ${o.order_number}`} />
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </>
  );
}
