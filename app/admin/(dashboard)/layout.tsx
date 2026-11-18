import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { AdminSidebar } from "@/components/admin/sidebar";
import { requireAdmin } from "@/lib/auth/guard";
import { getStore } from "@/lib/data";

// Admin is per-request and session-bound; it is allowed to block on navigation.
export const instant = false;

async function AuthenticatedShell({ children }: { children: React.ReactNode }) {
  const session = await requireAdmin();
  const inquiries = await getStore().listInquiries().catch(() => []);
  const newCount = inquiries.filter((i) => i.status === "new").length;
  return (
    <div className="lg:flex">
      <AdminSidebar email={session.email} newInquiries={newCount} />
      <main className="min-w-0 flex-1 px-4 py-8 md:px-8 lg:px-12 lg:py-10">{children}</main>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="size-6 animate-spin text-accent" aria-label="Loading" />
        </div>
      }
    >
      <AuthenticatedShell>{children}</AuthenticatedShell>
    </Suspense>
  );
}
