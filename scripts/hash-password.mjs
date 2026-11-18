#!/usr/bin/env node
// Usage: npm run hash-password -- "your strong password"
// Prints an ADMIN_PASSWORD_HASH value (scrypt; contains no "$" so it is .env-safe).
import { scryptSync, randomBytes } from "node:crypto";

const password = process.argv[2];
if (!password || password.length < 12) {
  console.error('Usage: npm run hash-password -- "a password of at least 12 characters"');
  process.exit(1);
}
const N = 16384;
const salt = randomBytes(16);
const hash = scryptSync(password, salt, 64, { N, r: 8, p: 1, maxmem: 64 * 1024 * 1024 });
console.log(`ADMIN_PASSWORD_HASH=scrypt:${N}:${salt.toString("hex")}:${hash.toString("hex")}`);
