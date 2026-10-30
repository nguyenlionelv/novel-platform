import { readFileSync, existsSync } from "node:fs";
import type { BrowserContext } from "@playwright/test";

export interface TestReader { id: string; email: string; password: string; displayName: string }
export function testReaders(): TestReader[] {
  const path = ".local/reader-test-accounts.json";
  if (!existsSync(path)) throw new Error("Provision two isolated Supabase Auth test users in .local/reader-test-accounts.json before running account E2E; see docs/READER_ACCOUNTS.md");
  return JSON.parse(readFileSync(path, "utf8").replace(/^\uFEFF/, ""));
}
export async function loginReader(context: BrowserContext, reader: TestReader, base = "http://localhost:3100") {
  const response = await context.request.post(`${base}/api/reader/auth`, { headers: { origin: base }, data: { action: "login", email: reader.email, password: reader.password } });
  if (response.status() !== 200) throw new Error(`Test reader login failed with status ${response.status()}; credentials hidden`);
}
