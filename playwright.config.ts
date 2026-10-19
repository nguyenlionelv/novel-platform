import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  workers: 1,
  retries: 0,
  timeout: 180000,
  expect: { timeout: 15000 },
  reporter: "list",
  use: { baseURL: "http://localhost:3100", channel: "msedge", headless: true, trace: "off", video: "off", screenshot: "off" },
});
