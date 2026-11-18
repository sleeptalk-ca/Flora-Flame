import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, ArrowRight, CircleDollarSign, Inbox, Package, PackageX, Plus, ShieldAlert, ShieldCheck } from "lucide-react";
import { Card, PageHeader, StatCard, Notice } from "@/components/admin/ui";
import { ColumnChart } from "@/components/admin/charts";
import { LinkButton } from "@/components/ui/button";
import { AvailabilityBadge, Badge } from "@/components/ui/badge";
import { requireAdmin } from "@/lib/auth/guard";
import { getStore } from "@/lib/data";
import { summarize } from "@/lib/analytics";
import { getCheckoutStatus } from "@/lib/payments";
import { formatCAD, formatDate } from "@/lib/utils";

// Session-bound admin data: allowed to block on navigation.
export const instant = false;

export const metadata: Metadata = { title: "Overview" };

export default async function AdminOverview() {
  await requireAdmin();
  const store = getStore();
  const [products, categories, orders, inquiries, settings] = await Promise.all([
    store.listProducts(),
    store.listCategories(),
    store.listOrders(),
    store.listInquiries(),
    store.getSettings(),
  ]);
  const stats = summarize(orders, products, categories, new Date());
  const lowStock = products.filter((p) => p.availability === "low_stock" || (p.inventory > 0 && p.inventory <= 5));
  const outOfStock = products.filter((p) => p.availability === "out_of_stock" || p.inventory === 0);
  const newInquiries = inquiries.filter((i) => i.status === "new");
  const checkout = getCheckoutStatus(settings.compliance);
  const c = settings.compliance;

  return (
    <>
      <PageHeader
        title="Overview"
        description={`Store backend: ${store.kind === "supabase" ? "Supabase" : "Local file (development)"}`}
        actions={
          <LinkButton href="/admin/products/new">
            <Plus className="size-4" /> New product
          </LinkButton>
        }
      />

      {store.kind === "local" && (
        <div className="mb-6">
          <Notice tone="warning">
            Running on the local JSON data store — fine for development and demos. Configure Supabase before deploying (see README).
          </Notice>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Products" value={products.length} hint={`${products.filter((p) => p.is_active).length} published`} icon={Package} />
        <StatCard
          label="Stock alerts"
          value={lowStock.length + outOfStock.length}
          hint={`${lowStock.length} low · ${outOfStock.length} out`}
          icon={PackageX}
          tone={outOfStock.length ? "warning" : "default"}
        />
        <StatCard label="New inquiries" value={newInquiries.length} hint={`${inquiries.length} total`} icon={Inbox} />
        <StatCard
          label="Revenue (all time)"
          value={formatCAD(stats.totalRevenue)}
          hint={stats.hasDemo ? "Includes demo orders" : `${stats.orderCount} orders, before tax`}
          icon={CircleDollarSign}
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <Card
          title="Revenue, last 6 months (CAD, before tax)"
          action={
            <Link href="/admin/analytics" className="inline-flex items-center gap-1 text-xs text-accent hover:underline">
              Analytics <ArrowRight className="size-3" />
            </Link>
          }
        >
          {stats.hasDemo && (
            <p className="mb-4">
              <Badge>Demo data</Badge>
            </p>
          )}
          <ColumnChart
            caption="Monthly revenue"
            valueLabel="Revenue"
            data={stats.monthly.map((m) => ({ label: m.label, value: m.cents, display: formatCAD(m.cents) }))}
          />
        </Card>

        <Card title="Compliance status">
          <ul className="space-y-3 text-sm">
            {[
              { ok: c.cannabis_retail_authorized, label: "Cannabis retail authorization (AGCO)" },
              { ok: c.tobacco_retail_authorized, label: "Tobacco retail authorization" },
              { ok: c.payment_provider !== "none" && Boolean(c.payment_provider_approval_reference), label: "Approved payment provider" },
              { ok: checkout.enabled, label: "Online checkout" },
            ].map((row) => (
              <li key={row.label} className="flex items-center gap-3">
                {row.ok ? (
                  <ShieldCheck className="size-4 shrink-0 text-accent" aria-hidden />
                ) : (
                  <ShieldAlert className="size-4 shrink-0 text-warning" aria-hidden />
                )}
                <span className="flex-1">{row.label}</span>
                <span className={row.ok ? "text-xs text-accent" : "text-xs text-warning"}>{row.ok ? "Active" : "Not active"}</span>
              </li>
            ))}
          </ul>
          <p className="mt-5 text-xs leading-relaxed text-muted">
            Restricted sales stay blocked until each authorization is recorded.{" "}
            <Link href="/admin/settings" className="text-accent hover:underline">
              Manage compliance
            </Link>
          </p>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Card
          title="Latest inquiries"
          action={
            <Link href="/admin/inquiries" className="text-xs text-accent hover:underline">
              View all
            </Link>
          }
        >
          {inquiries.length === 0 ? (
            <p className="text-sm text-muted">No inquiries yet.</p>
          ) : (
            <ul className="divide-y divide-line">
              {inquiries.slice(0, 5).map((i) => (
                <li key={i.id} className="flex items-start justify-between gap-4 py-3 first:pt-0 last:pb-0">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{i.subject}</p>
                    <p className="truncate text-xs text-muted">
                      {i.name} · {formatDate(i.created_at, { dateStyle: "medium", timeStyle: "short" })}
                    </p>
                  </div>
                  {i.status === "new" && <Badge tone="accent">New</Badge>}
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card
          title="Stock alerts"
          action={
            <Link href="/admin/inventory" className="text-xs text-accent hover:underline">
              Manage inventory
            </Link>
          }
        >
          {lowStock.length + outOfStock.length === 0 ? (
            <p className="text-sm text-muted">All products are well stocked.</p>
          ) : (
            <ul className="divide-y divide-line">
              {[...outOfStock, ...lowStock.filter((p) => !outOfStock.includes(p))].slice(0, 6).map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
                  <Link href={`/admin/products/${p.id}`} className="min-w-0 truncate text-sm hover:text-accent">
                    {p.name}
                  </Link>
                  <div className="flex shrink-0 items-center gap-3">
                    <span className="text-xs tabular-nums text-muted">{p.inventory} left</span>
                    <AvailabilityBadge value={p.availability} />
                  </div>
                </li>
              ))}
            </ul>
          )}
          {outOfStock.length > 0 && (
            <p className="mt-4 flex items-center gap-2 text-xs text-warning">
              <AlertTriangle className="size-3.5" /> {outOfStock.length} product(s) out of stock
            </p>
          )}
        </Card>
      </div>
    </>
  );
}
