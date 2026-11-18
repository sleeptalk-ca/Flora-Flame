import type { Metadata } from "next";
import { BarChart3, CircleDollarSign, Receipt, Warehouse } from "lucide-react";
import { Card, EmptyState, Notice, PageHeader, StatCard } from "@/components/admin/ui";
import { BarList, ColumnChart } from "@/components/admin/charts";
import { requireAdmin } from "@/lib/auth/guard";
import { getStore } from "@/lib/data";
import { summarize } from "@/lib/analytics";
import { formatCAD, ORDER_STATUS_LABEL } from "@/lib/utils";
import { ORDER_STATUSES } from "@/lib/types";

// Session-bound admin data: allowed to block on navigation.
export const instant = false;

export const metadata: Metadata = { title: "Analytics" };

export default async function AnalyticsPage() {
  await requireAdmin();
  const store = getStore();
  const [products, categories, orders] = await Promise.all([store.listProducts(), store.listCategories(), store.listOrders()]);
  const s = summarize(orders, products, categories, new Date());
  const statusCounts = ORDER_STATUSES.map((st) => ({
    label: ORDER_STATUS_LABEL[st],
    value: orders.filter((o) => o.status === st).length,
  }));

  return (
    <>
      <PageHeader title="Sales analytics" description="Revenue is shown in CAD before tax and excludes cancelled and refunded orders." />
      {s.hasDemo && (
        <div className="mb-6">
          <Notice tone="warning">
            These figures include <strong>demo orders</strong>. Clear them from the Orders page once you start recording real orders.
          </Notice>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Revenue" value={formatCAD(s.totalRevenue)} icon={CircleDollarSign} />
        <StatCard label="Orders" value={s.orderCount} hint="Counted toward revenue" icon={Receipt} />
        <StatCard label="Average order" value={formatCAD(s.avgOrder)} icon={BarChart3} />
        <StatCard label="Inventory value" value={formatCAD(s.inventoryValue)} hint="At current list prices" icon={Warehouse} />
      </div>

      {orders.length === 0 ? (
        <div className="mt-6">
          <EmptyState icon={BarChart3} title="No orders yet">
            Analytics will appear once orders are recorded.
          </EmptyState>
        </div>
      ) : (
        <>
          <div className="mt-6">
            <Card title="Revenue by month (CAD)">
              <ColumnChart
                height={260}
                caption="Revenue by month"
                valueLabel="Revenue"
                data={s.monthly.map((m) => ({ label: m.label, value: m.cents, display: formatCAD(m.cents) }))}
              />
            </Card>
          </div>
          <div className="mt-6 grid gap-6 xl:grid-cols-3">
            <Card title="Revenue by category">
              <BarList
                caption="Revenue by category"
                valueLabel="Revenue"
                data={s.byCategory.map((c) => ({ label: c.name, value: c.cents, display: formatCAD(c.cents) }))}
              />
            </Card>
            <Card title="Top products by revenue">
              <BarList
                caption="Top products by revenue"
                valueLabel="Revenue"
                data={s.topProducts.map((p) => ({ label: `${p.name} (${p.units} sold)`, value: p.cents, display: formatCAD(p.cents) }))}
              />
            </Card>
            <Card title="Orders by status">
              <BarList
                caption="Orders by status"
                valueLabel="Orders"
                data={statusCounts.map((d) => ({ ...d, display: String(d.value) }))}
              />
            </Card>
          </div>
        </>
      )}
    </>
  );
}
