import assert from "node:assert/strict";
import test from "node:test";
import { hashPassword, verifyPassword } from "../src/lib/auth/password";
import { isSameOrigin } from "../src/lib/security/origin";

test("admin passwords reject wrong passwords and corrupted hashes", async () => {
  const hash = await hashPassword("test-only-long-password");
  assert.equal(await verifyPassword("test-only-long-password", hash), true);
  assert.equal(await verifyPassword("wrong-password", hash), false);
  assert.equal(await verifyPassword("test-only-long-password", "scrypt:bad:hash"), false);
  assert.equal(await verifyPassword("x".repeat(257), hash), false);
});

test("admin writes require the exact origin, including protocol and port", () => {
  const request = (origin?: string) => new Request("https://novel.example/api/admin", { headers: origin ? { origin } : {} });
  assert.equal(isSameOrigin(request("https://novel.example")), true);
  assert.equal(isSameOrigin(request("https://attacker.example")), false);
  assert.equal(isSameOrigin(request("http://novel.example")), false);
  assert.equal(isSameOrigin(request("https://novel.example:444")), false);
  assert.equal(isSameOrigin(request()), false);
  assert.equal(isSameOrigin(request("null")), false);
});
