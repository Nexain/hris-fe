#!/usr/bin/env node
// Generates the Cloud Run env values for per-user demo login:
//   DEMO_ACCOUNTS  JSON list of { user_id, name, password_hash } (PBKDF2-SHA256)
//   SESSION_SECRET random secret for signing session cookies
// Prints each plain password once, to hand to that user. Never commit the output.
//
// Usage: node scripts/create-demo-accounts.mjs [user_id:Name ...]
import { webcrypto as crypto } from "node:crypto";

const ITERATIONS = 210_000;
const b64url = (bytes) => Buffer.from(bytes).toString("base64url");

const args = process.argv.slice(2);
const accounts = (args.length ? args : ["user_001:Naufal", "user_002:Afif", "hr_admin_001:HR Admin"]).map(
  (arg) => {
    const [user_id, ...rest] = arg.split(":");
    return { user_id, name: rest.join(":") || user_id };
  }
);

async function hash(password) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, [
    "deriveBits",
  ]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt, iterations: ITERATIONS },
    key,
    256
  );
  return `pbkdf2-sha256$${ITERATIONS}$${b64url(salt)}$${b64url(new Uint8Array(bits))}`;
}

const records = [];
console.log("# Passwords (give each user their own; do not commit):");
for (const account of accounts) {
  const password = b64url(crypto.getRandomValues(new Uint8Array(12)));
  console.log(`#   ${account.user_id.padEnd(14)} ${account.name.padEnd(10)} ${password}`);
  records.push({ ...account, password_hash: await hash(password) });
}
console.log(`\nDEMO_ACCOUNTS='${JSON.stringify(records)}'`);
console.log(`SESSION_SECRET='${b64url(crypto.getRandomValues(new Uint8Array(48)))}'`);
