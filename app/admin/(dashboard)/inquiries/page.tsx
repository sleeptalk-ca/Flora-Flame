import type { Metadata } from "next";
import Link from "next/link";
import { Inbox, Mail, Phone, Trash2 } from "lucide-react";
import { EmptyState, PageHeader } from "@/components/admin/ui";
import { StatusSelect } from "@/components/admin/status-select";
import { ConfirmSubmit } from "@/components/admin/form-bits";
import { Badge } from "@/components/ui/badge";
import { requireAdmin } from "@/lib/auth/guard";
import { getStore } from "@/lib/data";
import { deleteInquiryAction, updateInquiryStatusAction } from "@/app/admin/actions";
import { INQUIRY_STATUSES } from "@/lib/types";
import { formatDate, INQUIRY_STATUS_LABEL, telHref } from "@/lib/utils";

// Session-bound admin data: allowed to block on navigation.
export const instant = false;

export const metadata: Metadata = { title: "Inquiries" };

type SearchParams = Promise<{ [k: string]: string | string[] | undefined }>;

export default async function InquiriesPage({ searchParams }: { searchParams: SearchParams }) {
  await requireAdmin();
  const sp = await searchParams;
  const store = getStore();
  const [inquiries, products] = await Promise.all([store.listInquiries(), store.listProducts()]);
  const productName = new Map(products.map((p) => [p.id, p]));
  const filter = typeof sp.status === "string" && (INQUIRY_STATUSES as readonly string[]).includes(sp.status) ? sp.status : "";
  const list = filter ? inquiries.filter((i) => i.status === filter) : inquiries.filter((i) => i.status !== "archived");
  const options = INQUIRY_STATUSES.map((s) => ({ value: s, label: INQUIRY_STATUS_LABEL[s] }));

  return (
    <>
      <PageHeader title="Customer inquiries" description="Messages from the contact form. Personal information — handle according to the privacy policy." />
      <div className="mb-6 flex flex-wrap gap-2 text-xs">
        <Link href="/admin/inquiries" className={`rounded-full border px-3 py-1.5 ${!filter ? "border-accent text-accent" : "border-line text-muted hover:text-cream"}`}>
          Open
        </Link>
        {INQUIRY_STATUSES.map((s) => (
          <Link
            key={s}
            href={`/admin/inquiries?status=${s}`}
            className={`rounded-full border px-3 py-1.5 ${filter === s ? "border-accent text-accent" : "border-line text-muted hover:text-cream"}`}
          >
            {INQUIRY_STATUS_LABEL[s]} ({inquiries.filter((i) => i.status === s).length})
          </Link>
        ))}
      </div>

      {list.length === 0 ? (
        <EmptyState icon={Inbox} title="Inbox zero">
          No inquiries in this view.
        </EmptyState>
      ) : (
        <ul className="space-y-4">
          {list.map((i) => {
            const product = i.product_id ? productName.get(i.product_id) : null;
            return (
              <li key={i.id} className="rounded-2xl border border-line bg-surface p-5">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-medium">{i.subject}</h2>
                      {i.status === "new" && <Badge tone="accent">New</Badge>}
                    </div>
                    <p className="mt-1 text-xs text-muted">
                      {i.name} · {formatDate(i.created_at, { dateStyle: "medium", timeStyle: "short" })}
                      {product && (
                        <>
                          {" "}· About{" "}
                          <Link href={`/admin/products/${product.id}`} className="text-accent hover:underline">
                            {product.name}
                          </Link>
                        </>
                      )}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <StatusSelect action={updateInquiryStatusAction} id={i.id} value={i.status} options={options} label={`Status for inquiry from ${i.name}`} />
                    <form action={deleteInquiryAction}>
                      <input type="hidden" name="id" value={i.id} />
                      <ConfirmSubmit message="Delete this inquiry permanently?" variant="subtle">
                        <Trash2 className="size-3.5" />
                        <span className="sr-only">Delete</span>
                      </ConfirmSubmit>
                    </form>
                  </div>
                </div>
                <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-cream/85">{i.message}</p>
                <div className="mt-4 flex flex-wrap gap-4 border-t border-line pt-4 text-xs">
                  <a
                    href={`mailto:${i.email}?subject=${encodeURIComponent(`Re: ${i.subject}`)}`}
                    className="inline-flex items-center gap-1.5 text-accent hover:underline"
                  >
                    <Mail className="size-3.5" /> {i.email}
                  </a>
                  {i.phone && (
                    <a href={telHref(i.phone)} className="inline-flex items-center gap-1.5 text-muted hover:text-cream">
                      <Phone className="size-3.5" /> {i.phone}
                    </a>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
