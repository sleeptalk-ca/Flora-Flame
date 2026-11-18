import "server-only";
import { scrypt as scryptCb, randomBytes, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(scryptCb) as (pw: string, salt: Buffer, keylen: number, opts: object) => Promise<Buffer>;

/**
 * Password hashes use the format  scrypt:<N>:<saltHex>:<hashHex>
 * (no "$" characters, so they are safe inside .env files).
 * Generate one with:  npm run hash-password -- "your password"
 */
export async function hashPassword(password: string, N = 16384) {
  const salt = randomBytes(16);
  const hash = await scrypt(password, salt, 64, { N, r: 8, p: 1, maxmem: 64 * 1024 * 1024 });
  return `scrypt:${N}:${salt.toString("hex")}:${hash.toString("hex")}`;
}

export async function verifyPassword(password: string, stored: string) {
  const [scheme, nStr, saltHex, hashHex] = stored.split(":");
  if (scheme !== "scrypt" || !nStr || !saltHex || !hashHex) return false;
  const expected = Buffer.from(hashHex, "hex");
  const actual = await scrypt(password, Buffer.from(saltHex, "hex"), expected.length, {
    N: Number(nStr),
    r: 8,
    p: 1,
    maxmem: 64 * 1024 * 1024,
  });
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}
