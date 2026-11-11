import { test } from "node:test";
import assert from "node:assert/strict";
import { AUTH_COOKIE_NAME, SESSION_TTL_SECONDS, signSession, verifySession } from "@/lib/auth";
import { authenticate, hashPassword, verifyPassword } from "@/lib/accounts";

const SECRET = "test-session-secret-0123456789-abcdefghijkl";
const env = process.env as Record<string, string | undefined>;
env.SESSION_SECRET = SECRET;

test("cookie name is unchanged so old cookies get replaced", () => {
  assert.equal(AUTH_COOKIE_NAME, "dayone_access");
});

test("a signed session verifies and carries the user id", async () => {
  const session = await verifySession(await signSession("user_002"));
  assert.equal(session?.uid, "user_002");
  assert.ok(session!.exp > Date.now() / 1000);
});

test("sessions expire after 8 hours", async () => {
  const now = Date.now();
  const token = await signSession("user_002", now);
  assert.ok(await verifySession(token, now + (SESSION_TTL_SECONDS - 60) * 1000));
  assert.equal(await verifySession(token, now + (SESSION_TTL_SECONDS + 1) * 1000), null);
});

test("a tampered payload is rejected (cannot change uid to HR)", async () => {
  const [, sig] = (await signSession("user_002")).split(".");
  const forged = Buffer.from(JSON.stringify({ uid: "hr_admin_001", exp: 9999999999 })).toString("base64url");
  assert.equal(await verifySession(`${forged}.${sig}`), null);
});

test("a token signed with another secret is rejected", async () => {
  const token = await signSession("user_001");
  env.SESSION_SECRET = "a-completely-different-secret-0123456789xyz";
  try {
    assert.equal(await verifySession(token), null);
  } finally {
    env.SESSION_SECRET = SECRET;
  }
});

test("the old passcode-hash cookie and junk values are not valid sessions", async () => {
  // The old cookie held sha256("<passcode>:dayone-salt-hris-2026") as hex.
  const legacy = "246987a1c3f0e2d4b6a8c0e2f4a6b8d0c2e4f6a8b0d2c4e6f8a0b2d4c6e8f0a2";
  assert.equal(await verifySession(legacy), null);
  assert.equal(await verifySession(""), null);
  assert.equal(await verifySession(undefined), null);
  assert.equal(await verifySession("a.b.c"), null);
});

test("production without SESSION_SECRET accepts no session", async () => {
  const token = await signSession("user_001");
  const saved = env.NODE_ENV;
  delete env.SESSION_SECRET;
  env.NODE_ENV = "production";
  try {
    assert.equal(await verifySession(token), null);
    await assert.rejects(signSession("user_001"));
  } finally {
    env.SESSION_SECRET = SECRET;
    env.NODE_ENV = saved;
  }
});

test("PBKDF2 password hashes verify only the right password", async () => {
  const hash = await hashPassword("correct horse", 100_000);
  assert.match(hash, /^pbkdf2-sha256\$100000\$/);
  assert.equal(await verifyPassword("correct horse", hash), true);
  assert.equal(await verifyPassword("wrong", hash), false);
  assert.equal(await verifyPassword("correct horse", "sha256$abc"), false);
  // Too few iterations is rejected even with the right password.
  assert.equal(await verifyPassword("x", await hashPassword("x", 1000)), false);
});

test("authenticate checks DEMO_ACCOUNTS by user id", async () => {
  env.DEMO_ACCOUNTS = JSON.stringify([
    { user_id: "user_002", name: "Afif", password_hash: await hashPassword("afif-pass", 100_000) },
  ]);
  assert.equal((await authenticate("user_002", "afif-pass"))?.name, "Afif");
  assert.equal((await authenticate("USER_002", "afif-pass"))?.user_id, "user_002");
  assert.equal(await authenticate("user_002", "nope"), null);
  assert.equal(await authenticate("hr_admin_001", "afif-pass"), null);
  env.DEMO_ACCOUNTS = "not json";
  assert.equal(await authenticate("user_002", "afif-pass"), null);
});
