import { test, expect } from "@playwright/test";
import { readFileSync, existsSync, mkdirSync } from "node:fs";
import { createHmac, randomUUID } from "node:crypto";
import nextEnv from "@next/env";
import postgres from "postgres";
import { del } from "@vercel/blob";

nextEnv.loadEnvConfig(process.cwd());
const origin = "http://localhost:3100";

test("admin authentication, authorization, novel cover and chapter lifecycle", async ({ page, context, request }) => {
  if (process.env.DATABASE_SCHEMA !== "novel_preview") throw new Error("E2E is restricted to the preview schema");
  const password = /^preview admin password: (.+)$/m.exec(readFileSync(".local/admin-access.txt", "utf8"))?.[1];
  if (!password) throw new Error("Missing local preview admin password; values hidden");
  const sql = postgres(process.env.DATABASE_URL!, { ssl: { ca: JSON.parse(readFileSync("src/lib/db/supabase-ca.json", "utf8")), rejectUnauthorized: true }, prepare: false, max: 1, onnotice: () => {} });
  const prefix = `E2E-${randomUUID().slice(0, 8)}`;
  const [original] = await sql`select * from novel_preview.novels where id = 1`;
  const rateKey = createHmac("sha256", process.env.RATE_LIMIT_SECRET!).update("admin-login:local-or-unknown").digest("hex");
  const [originalRate] = await sql`select * from novel_preview.rate_limits where key = ${rateKey}`;
  let uploadedCover: string | undefined;
  const optionalReview = existsSync(".local/e2e-review.json") ? JSON.parse(readFileSync(".local/e2e-review.json", "utf8")) as { id: string; name: string } : null;
  try {
    await sql`delete from novel_preview.rate_limits where key = ${rateKey}`;
    for (const endpoint of ["overview", "chapters", "reviews"]) expect((await request.get(`/api/admin/${endpoint}`)).status()).toBe(401);
    for (const endpoint of ["novel", "chapters", "reviews"]) expect((await request.post(`/api/admin/${endpoint}`, { headers: { origin }, data: {} })).status()).toBe(401);
    expect((await request.post("/api/admin/session", { headers: { origin: "https://attacker.example" }, data: { password: "wrong" } })).status()).toBe(403);
    expect((await request.post("/api/admin/session", { data: { password: "wrong" } })).status()).toBe(403);
    expect((await request.post("/api/admin/session", { headers: { origin }, data: { password: "x".repeat(5000) } })).status()).toBe(413);

    await page.goto("/admin");
    await expect(page.getByRole("heading", { name: "Vào quản trị", exact: true })).toBeVisible();
    await page.getByLabel("Mật khẩu quản trị").fill("this-is-not-the-password");
    await page.getByRole("button", { name: "Vào quản trị", exact: true }).click();
    await expect(page.getByRole("alert").filter({ hasText: "Mật khẩu không đúng." })).toHaveText("Mật khẩu không đúng.");
    await page.getByLabel("Mật khẩu quản trị").fill(password).catch(() => { throw new Error("Could not fill admin password (value hidden)"); });
    await page.getByRole("button", { name: "Vào quản trị", exact: true }).click();
    await expect(page.getByRole("heading", { name: "Quản trị truyện", exact: true })).toBeVisible();
    const cookie = (await context.cookies()).find(cookie => cookie.name === "novel_admin");
    expect(Boolean(cookie?.httpOnly)).toBe(true);
    expect(cookie?.sameSite === "Lax").toBe(true);
    const concurrentReads = await Promise.all(Array.from({ length: 6 }, (_, index) => context.request.get(index % 2 ? "/api/health" : "/api/admin/overview")));
    expect(concurrentReads.map(response => response.status())).toEqual([200, 200, 200, 200, 200, 200]);
    expect((await context.request.post("/api/admin/chapters", { headers: { origin: "https://attacker.example" }, data: {} })).status()).toBe(403);
    expect((await context.request.post("/api/admin/chapters", { data: {} })).status()).toBe(403);
    mkdirSync(".local", { recursive: true });
    await page.screenshot({ path: ".local/stage3-admin-desktop.png", fullPage: true });
    await page.setViewportSize({ width: 390, height: 844 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await page.screenshot({ path: ".local/stage3-admin-mobile.png", fullPage: true });
    await page.setViewportSize({ width: 1280, height: 900 });

    await page.getByLabel("Tên truyện", { exact: true }).fill(`${prefix} truyện thử`);
    await page.getByLabel("Tác giả", { exact: true }).fill("Tác giả thử nghiệm");
    await page.getByLabel("Giới thiệu", { exact: true }).fill("Giới thiệu kiểm thử. Sẽ được khôi phục.");
    await page.getByLabel("Ảnh bìa", { exact: true }).setInputFiles({ name: "bad.svg", mimeType: "image/svg+xml", buffer: Buffer.from("<svg/>") });
    await expect(page.locator("#thong-tin").getByRole("alert")).toContainText("Chọn ảnh JPEG, PNG hoặc WebP, tối đa 2 MB.");
    const chooserPromise = page.waitForEvent("filechooser");
    await page.getByRole("button", { name: "Tải ảnh bìa lên", exact: true }).click();
    const chooser = await chooserPromise;
    const coverFile = { name: "cover.png", mimeType: "image/png", buffer: Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=", "base64") };
    await chooser.setFiles(coverFile);
    await expect(page.getByRole("img", { name: "Xem trước ảnh bìa" })).toHaveAttribute("src", /^blob:/);
    await page.getByRole("button", { name: "Huỷ ảnh đã chọn", exact: true }).click();
    await expect(page.getByRole("img", { name: "Xem trước ảnh bìa" })).toHaveCount(0);
    await page.getByLabel("Ảnh bìa", { exact: true }).setInputFiles(coverFile);
    await page.getByRole("button", { name: "Lưu thông tin", exact: true }).click();
    await expect(page.getByRole("status")).toHaveText("Đã lưu thông tin truyện.");
    const [updated] = await sql`select title, cover_url from novel_preview.novels where id = 1`;
    expect(updated.title === `${prefix} truyện thử`).toBe(true);
    expect(Boolean(updated.cover_url?.includes("/covers/novel_preview/"))).toBe(true);
    uploadedCover = updated.cover_url;
    expect((await request.get("/")).status()).toBe(200);
    expect((await (await request.get("/")).text()).includes(`${prefix} truyện thử`)).toBe(true);
    const invalidCover = await context.request.post("/api/admin/novel", { headers: { origin }, multipart: { title: "Test", author: "Test", description: "", status: "ongoing", cover: { name: "fake.png", mimeType: "image/png", buffer: Buffer.from("<script>bad</script>") } } });
    expect(invalidCover.status()).toBe(400);

    await page.getByRole("button", { name: "+ Thêm chương", exact: true }).click();
    await page.getByLabel("Thứ tự", { exact: true }).fill("2000000001");
    await page.getByLabel("Tiêu đề chương", { exact: true }).fill(`${prefix} chương một`);
    const paragraphs = "Đoạn một.\n\nĐoạn hai.\n";
    await page.getByLabel("Nội dung chương", { exact: true }).fill(paragraphs);
    await page.getByRole("button", { name: "Lưu nháp", exact: true }).click();
    await expect(page.getByRole("status").filter({ hasText: "Đã lưu bản nháp." })).toBeVisible();
    const [draft] = await sql`select id, content, status from novel_preview.chapters where title = ${`${prefix} chương một`}`;
    expect(draft.status).toBe("draft"); expect(draft.content).toBe(paragraphs);
    expect((await request.get(`/chuong/${draft.id}`)).status()).toBe(404);
    expect((await (await request.get("/admin")).text()).includes(`${prefix} chương một`)).toBe(false);
    await page.getByRole("button", { name: "Đăng chương", exact: true }).click();
    await expect(page.getByRole("status").filter({ hasText: "Đã đăng chương." })).toBeVisible();
    expect((await sql`select status from novel_preview.chapters where id = ${draft.id}`)[0].status).toBe("published");
    await page.getByLabel("Nội dung chương", { exact: true }).fill(`${paragraphs}Bổ sung.`);
    await page.getByRole("button", { name: "Lưu cập nhật", exact: true }).click();
    await expect(page.getByRole("status").filter({ hasText: "Đã cập nhật chương công khai." })).toBeVisible();
    expect((await sql`select content from novel_preview.chapters where id = ${draft.id}`)[0].content).toBe(`${paragraphs}Bổ sung.`);
    await page.getByRole("button", { name: "Gỡ về nháp", exact: true }).click();
    await expect(page.getByRole("status").filter({ hasText: "Đã gỡ chương về nháp." })).toBeVisible();
    expect((await sql`select status from novel_preview.chapters where id = ${draft.id}`)[0].status).toBe("draft");

    await page.getByRole("button", { name: "+ Thêm chương", exact: true }).click();
    await page.getByLabel("Thứ tự", { exact: true }).fill("2000000001");
    await page.getByLabel("Tiêu đề chương", { exact: true }).fill(`${prefix} chương hai`);
    await page.getByLabel("Nội dung chương", { exact: true }).fill("Bản nháp thứ hai.");
    await page.getByRole("button", { name: "Lưu nháp", exact: true }).click();
    await expect(page.getByRole("alert").filter({ hasText: "Thứ tự chương này đã tồn tại" })).toBeVisible();
    await expect(page.getByLabel("Nội dung chương", { exact: true })).toHaveValue("Bản nháp thứ hai.");
    await page.getByLabel("Thứ tự", { exact: true }).fill("2000000002");
    await context.clearCookies();
    await page.getByRole("button", { name: "Lưu nháp", exact: true }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await dialog.getByLabel("Mật khẩu quản trị").fill(password).catch(() => { throw new Error("Could not fill reauthentication password (value hidden)"); });
    await dialog.getByRole("button", { name: "Đăng nhập lại", exact: true }).click();
    await expect(dialog).not.toBeVisible();
    await expect(page.getByLabel("Nội dung chương", { exact: true })).toHaveValue("Bản nháp thứ hai.");
    await page.getByRole("button", { name: "Lưu nháp", exact: true }).click();
    await expect(page.getByRole("status").filter({ hasText: "Đã lưu bản nháp." })).toBeVisible();
    expect((await sql`select count(*)::int as count from novel_preview.chapters where title like ${`${prefix}%`}`)[0].count).toBe(2);

    await page.getByLabel("Nội dung chương", { exact: true }).fill("Thay đổi chưa lưu.");
    const selected = await page.getByLabel("Nội dung chương", { exact: true }).evaluate((element: HTMLTextAreaElement) => { element.select(); return element.selectionEnd - element.selectionStart; });
    expect(selected).toBe("Thay đổi chưa lưu.".length);
    page.once("dialog", dialog => dialog.dismiss());
    await page.getByRole("button", { name: "+ Thêm chương", exact: true }).click();
    await expect(page.getByLabel("Nội dung chương", { exact: true })).toHaveValue("Thay đổi chưa lưu.");
    page.once("dialog", dialog => dialog.dismiss());
    await page.getByRole("button", { name: "Xóa chương", exact: true }).click();
    await expect(page.getByLabel("Nội dung chương", { exact: true })).toHaveValue("Thay đổi chưa lưu.");
    page.once("dialog", dialog => dialog.accept());
    await page.getByRole("button", { name: "Xóa chương", exact: true }).click();
    await expect(page.getByRole("status").filter({ hasText: "Đã xóa chương." })).toBeVisible();
    expect((await sql`select count(*)::int as count from novel_preview.chapters where title = ${`${prefix} chương hai`}`)[0].count).toBe(0);

    if (optionalReview) {
      const row = page.locator("#danh-gia li").filter({ hasText: optionalReview.name });
      await row.getByRole("button", { name: "Ẩn đánh giá", exact: true }).click();
      await expect(row.getByRole("button", { name: "Đã ẩn", exact: true })).toBeDisabled();
      expect((await sql`select is_hidden from novel_preview.reviews where id = ${optionalReview.id}::uuid`)[0].is_hidden).toBe(true);
    }
    await page.getByRole("button", { name: "Đăng xuất", exact: true }).click();
    await expect(page.getByRole("heading", { name: "Vào quản trị", exact: true })).toBeVisible();
    expect((await context.request.get("/api/admin/overview")).status()).toBe(401);
    for (let index = 0; index < 5; index++) expect((await request.post("/api/admin/session", { headers: { origin }, data: { password: "incorrect-password" } })).status()).toBe(401);
    expect((await request.post("/api/admin/session", { headers: { origin }, data: { password: "incorrect-password" } })).status()).toBe(429);
  } finally {
    if (!uploadedCover) {
      const [current] = await sql`select cover_url from novel_preview.novels where id = 1`;
      if (current.cover_url !== original.cover_url && current.cover_url?.includes("/covers/novel_preview/")) uploadedCover = current.cover_url;
    }
    await sql`delete from novel_preview.chapters where title like ${`${prefix}%`}`;
    await sql`update novel_preview.novels set title = ${original.title}, author = ${original.author}, description = ${original.description}, cover_url = ${original.cover_url}, status = ${original.status}, updated_at = ${original.updated_at} where id = 1`;
    await sql`delete from novel_preview.rate_limits where key = ${rateKey}`;
    if (originalRate) await sql`insert into novel_preview.rate_limits (key, attempts, reset_at) values (${rateKey}, ${originalRate.attempts}, ${originalRate.reset_at})`;
    if (uploadedCover) await del(uploadedCover);
    await sql.end();
  }
});
