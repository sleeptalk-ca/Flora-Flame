import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE } from "../brand";
import { verifySessionToken, type AdminSession } from "./session";

/** Returns the admin session or null. Reads the request cookie — call inside <Suspense> / actions / routes. */
export async function getAdminSession(): Promise<AdminSession | null> {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  return verifySessionToken(token);
}

/** For pages & server actions: redirect to login when not authenticated. */
export async function requireAdmin(): Promise<AdminSession> {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  return session;
}

/** For route handlers: throw-free variant returning a 401 marker. */
export async function assertAdminForApi(): Promise<AdminSession | null> {
  return getAdminSession();
}
