import test from "node:test";
import assert from "node:assert/strict";
import { credentials, displayName, readingPosition, safeNext } from "../src/lib/reader-account/validation";

test("authentication callbacks only return to allowed local reader pages", () => {
  for (const value of ["https://evil.example", "//evil.example", "/\\evil.example", "/admin", "/tai-khoan/other", "/chuong/bad", "/\r\nLocation:evil"]) assert.equal(safeNext(value), "/tai-khoan");
  assert.equal(safeNext("/"), "/");
  assert.equal(safeNext("/chuong/12345678-1234-1234-1234-123456789abc#danh-gia"), "/chuong/12345678-1234-1234-1234-123456789abc#danh-gia");
});

test("reader credentials, profile and bookmark inputs enforce bounds", () => {
  assert.equal(displayName(" Nguyễn "), "Nguyễn");
  assert.throws(() => displayName(" ")); assert.throws(() => displayName("a".repeat(51)));
  assert.deepEqual(credentials({ email: " reader@example.invalid ", password: "Some pass 123" }), { email: "reader@example.invalid", password: "Some pass 123" });
  for (const data of [{ email: "bad", password: "a".repeat(12) }, { email: "a@b.co", password: "short" }, { email: "a@b.co", password: "a".repeat(129) }]) assert.throws(() => credentials(data));
  assert.deepEqual(readingPosition({ paragraph: 0, offset: .8 }), { paragraph: 0, offset: .8 });
  for (const data of [{ paragraph: -1, offset: 0 }, { paragraph: 1.5, offset: 0 }, { paragraph: 0, offset: Infinity }, { paragraph: 0, offset: 1.1 }]) assert.throws(() => readingPosition(data));
});
