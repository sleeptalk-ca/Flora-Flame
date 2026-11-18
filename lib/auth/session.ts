import { SignJWT, jwtVerify } from "jose";

/**
 * Stateless admin session: an HS256-signed JWT in an httpOnly, SameSite=Strict cookie.
 * Edge-safe (no Node APIs) so it can be verified in proxy.ts as well as on the server.
 */
export const SESSION_TTL_SECONDS = 60 * 60 * 8; // 8 hours
const ISSUER = "flora-and-flame";
const AUDIENCE = "admin";

export interface AdminSession {
  email: string;
  role: "admin";
}

function secretKey() {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("ADMIN_SESSION_SECRET must be set to a random string of at least 32 characters");
  }
  return new TextEncoder().encode(secret);
}

export async function signSession(email: string) {
  return new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(email)
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(secretKey());
}

export async function verifySessionToken(token: string | undefined | null): Promise<AdminSession | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey(), {
      issuer: ISSUER,
      audience: AUDIENCE,
      algorithms: ["HS256"],
    });
    if (payload.role !== "admin" || typeof payload.sub !== "string") return null;
    return { email: payload.sub, role: "admin" };
  } catch {
    return null;
  }
}
