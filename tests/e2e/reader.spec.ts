import { test, expect } from "@playwright/test";
import { readFileSync, mkdirSync } from "node:fs";
import { createHmac, randomUUID } from "node:crypto";
import nextEnv from "@next/env";
import postgres from "postgres";
import type { ChapterPage, PublishedChapterSummary } from "../../src/lib/reader/types";

nextEnv.loadEnvConfig(process.cwd());
const origin = "http://localhost:3100";

test("published reading, private drafts, navigation, preferences, copy scope and fresh content", async ({ page, browser, request }) => {
  if (process.env.DATABASE_SCHEMA !== "novel_preview") throw new Error("Reader E2E is restricted to preview");
  const password = /^preview admin password: (.+)$/m.exec(readFileSync(".local/admin-access.txt", "utf8"))?.[1];
  if (!password) throw new Error("Missing preview password; value hidden");
  const sql = postgres(process.env.DATABASE_URL!, { ssl: { ca: JSON.parse(readFileSync("src/lib/db/supabase-ca.json", "utf8")), rejectUnauthorized: true }, prepare: false, max: 1, onnotice: () => {} });
  const admin = await browser.newContext({ baseURL: origin });
  const prefix = `E2E-reading-${randomUUID().slice(0, 8)}`;
  const [original] = await sql`select * from novel_preview.novels where id = 1`;
  const [existing] = await sql`select count(*)::int as count from novel_preview.chapters where status = 'published'`;
  const rateKey = createHmac("sha256", process.env.RATE_LIMIT_SECRET!).update("admin-login:local-or-unknown").digest("hex");
  const [originalRate] = await sql`select * from novel_preview.rate_limits where key = ${rateKey}`;
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  async function save(data: Record<string, unknown>) {
    const response = await admin.request.post("/api/admin/chapters", { headers: { origin }, data });
    expect(response.status()).toBe(200);
    return (await response.json()).chapter as PublishedChapterSummary;
  }
  try {
    await sql`delete from novel_preview.rate_limits where key = ${rateKey}`;
    if (!existing.count) {
      await page.goto("/");
      await expect(page.getByRole("button", { name: "Đọc từ đầu" })).toBeDisabled();
      await expect(page.getByText("Truyện chưa có chương được đăng.")).toBeVisible();
    }
    const login = await admin.request.post("/api/admin/session", { headers: { origin }, data: { password } }).catch(() => { throw new Error("Admin login request failed; value hidden"); });
    expect(login.status()).toBe(200);
    const novelTitle = `${prefix} — Những ngày gió về`;
    expect((await admin.request.post("/api/admin/novel", { headers: { origin }, multipart: { title: novelTitle, author: "Tác giả kiểm thử", description: "Một câu chuyện nhỏ về những lần trở về.\nNội dung kiểm thử, sẽ được dọn sau khi chạy.", status: "ongoing" } })).status()).toBe(200);
    const content = "Gió đi qua hàng cây, mang theo mùi hương của những ngày cũ.\n\nCô dừng lại trước hiên nhà. Cánh cửa vẫn mở, như thể chưa từng có cuộc chia xa nào.\n\n" + "Tiếng Việt: Trường, Đường, Ước, ngỡ, chuyện, Nguyễn.".normalize("NFD") + "\n\n<script>window.__novelXss = 1</script>\nDòng cuối giữ nguyên xuống dòng.\n";
    const secondInput = { position: 2000000030, title: `${prefix} — Bên kia ô cửa`, content: "Mặt trời lên sau dãy núi.\n\nMột ngày mới bắt đầu.", intent: "publish" };
    const second = await save(secondInput);
    const hidden = await save({ position: 2000000020, title: `${prefix}-PRIVATE-TITLE`, content: `${prefix}-PRIVATE-CONTENT`, intent: "draft" });
    const firstInput = { position: 2000000010, title: `${prefix} — Ngày trở về`, content, intent: "publish" };
    const first = await save(firstInput);
    for (const id of [hidden.id, randomUUID(), "not-a-uuid"]) {
      const response = await request.get(`/chuong/${id}`);
      expect(response.status()).toBe(404);
      const html = await response.text();
      expect(html.includes(`${prefix}-PRIVATE`)).toBe(false);
    }
    const homeResponse = await request.get("/");
    expect(homeResponse.headers()["cache-control"]).toContain("no-store");
    expect((await homeResponse.text()).includes(`${prefix}-PRIVATE`)).toBe(false);
    const publicPage: ChapterPage = await (await request.get("/api/chapters")).json();
    expect(publicPage.chapters.some(chapter => chapter.id === hidden.id)).toBe(false);
    expect(publicPage.chapters.filter(chapter => [first.id, second.id].includes(chapter.id)).map(chapter => chapter.id)).toEqual([first.id, second.id]);
    expect(publicPage.chapters.every(chapter => Object.keys(chapter).sort().join(",") === "id,position,title")).toBe(true);

    await page.goto("/");
    await expect(page.getByRole("heading", { name: novelTitle, exact: true })).toBeVisible();
    await expect(page).toHaveTitle(novelTitle);
    mkdirSync(".local", { recursive: true });
    await page.screenshot({ path: ".local/stage4-home-desktop.png", fullPage: true });
    await page.getByRole("link", { name: "Đọc từ đầu", exact: false }).click();
    await expect(page).toHaveURL(new RegExp(`/chuong/${publicPage.chapters[0].id}$`));
    await expect(page.getByRole("button", { name: "← Chương trước", exact: true })).toBeDisabled();
    await page.goto("/");
    await page.getByRole("link", { name: firstInput.title, exact: false }).click();
    await expect(page).toHaveURL(new RegExp(`/chuong/${first.id}$`));
    await expect(page).toHaveTitle(`Chương ${firstInput.position}: ${firstInput.title} — ${novelTitle}`);
    const article = page.getByRole("article", { name: "Nội dung chương" });
    await expect(page.getByLabel("Kiểu chữ", { exact: true })).toHaveValue("dejavu");
    await page.evaluate(() => document.fonts.ready);
    const cdp = await page.context().newCDPSession(page);
    await cdp.send("DOM.enable"); await cdp.send("CSS.enable");
    async function renderedFonts() {
      const { root } = await cdp.send("DOM.getDocument");
      const { nodeId } = await cdp.send("DOM.querySelector", { nodeId: root.nodeId, selector: ".chapter-content" });
      const { fonts } = await cdp.send("CSS.getPlatformFontsForNode", { nodeId });
      return fonts.map(font => font.familyName);
    }
    expect([...new Set(await renderedFonts())]).toEqual(["DejaVu Serif"]);
    await page.screenshot({ path: ".local/stage5-font-dejavu.png", fullPage: true });
    await page.getByLabel("Kiểu chữ", { exact: true }).selectOption("times");
    await expect(page.locator(".reader-page")).toHaveAttribute("data-font", "times");
    expect(await renderedFonts()).toContain("Times New Roman");
    await page.screenshot({ path: ".local/stage5-font-times.png", fullPage: true });
    expect(await article.textContent()).toBe(content);
    expect(await article.evaluate(element => getComputedStyle(element).whiteSpace)).toBe("pre-wrap");
    expect(await page.evaluate(() => "__novelXss" in window)).toBe(false);
    if (!existing.count) await expect(page.getByRole("button", { name: "← Chương trước", exact: true })).toBeDisabled();
    await expect(page.getByRole("link", { name: "Chương sau →", exact: true })).toHaveAttribute("href", `/chuong/${second.id}`);
    await expect(article).toHaveCSS("font-size", "20px");
    await page.getByRole("button", { name: "Tăng cỡ chữ" }).click();
    await expect(article).toHaveCSS("font-size", "22px");
    await page.getByRole("button", { name: "Tăng cỡ chữ" }).click();
    await expect(article).toHaveCSS("font-size", "24px");
    await expect(page.getByRole("button", { name: "Tăng cỡ chữ" })).toBeDisabled();
    await page.getByRole("button", { name: "Chuyển sang nền tối" }).click();
    await expect(page.locator(".reader-page")).toHaveAttribute("data-theme", "dark");
    await page.reload();
    await expect(page.getByLabel("Kiểu chữ", { exact: true })).toHaveValue("times");
    await expect(article).toHaveCSS("font-size", "24px");
    await expect(page.locator(".reader-page")).toHaveAttribute("data-theme", "dark");
    await page.setViewportSize({ width: 390, height: 844 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await page.screenshot({ path: ".local/stage4-reader-mobile-dark.png", fullPage: true });
    await page.getByRole("button", { name: "Chuyển sang nền sáng" }).click();
    for (let index = 0; index < 3; index++) await page.getByRole("button", { name: "Giảm cỡ chữ" }).click();
    await expect(article).toHaveCSS("font-size", "18px");
    await expect(page.getByRole("button", { name: "Giảm cỡ chữ" })).toBeDisabled();
    await page.screenshot({ path: ".local/stage4-reader-mobile-light.png", fullPage: true });
    await page.evaluate(() => { document.documentElement.style.zoom = "2"; });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await page.evaluate(() => { document.documentElement.style.zoom = ""; });
    for (const type of ["copy", "cut", "contextmenu", "dragstart"]) {
      expect(await article.evaluate((element, eventType) => !element.dispatchEvent(new Event(eventType, { bubbles: true, cancelable: true })), type)).toBe(true);
      expect(await page.locator("h1").evaluate((element, eventType) => element.dispatchEvent(new Event(eventType, { bubbles: true, cancelable: true })), type)).toBe(true);
    }
    expect(await article.evaluate(element => getComputedStyle(element).userSelect)).toBe("none");
    expect(await page.locator("h1").evaluate(element => getComputedStyle(element).userSelect)).not.toBe("none");
    expect(await page.evaluate(() => document.body.dispatchEvent(new KeyboardEvent("keydown", { key: "c", ctrlKey: true, bubbles: true, cancelable: true })))).toBe(true);
    await article.focus();
    await page.keyboard.press("Tab");
    expect(await page.getByRole("navigation", { name: "Điều hướng chương" }).evaluate(element => element.contains(document.activeElement))).toBe(true);
    await page.getByRole("link", { name: "Chương sau →", exact: true }).click();
    await expect(page.getByRole("heading", { name: secondInput.title, exact: true })).toBeVisible();
    await expect(page.getByRole("article")).toHaveCSS("font-size", "18px");
    await expect(page.getByLabel("Kiểu chữ", { exact: true })).toHaveValue("times");
    await expect(page.getByRole("link", { name: "← Chương trước", exact: true })).toHaveAttribute("href", `/chuong/${first.id}`);
    await expect(page.getByRole("button", { name: "Chương sau →", exact: true })).toBeDisabled();
    await page.getByRole("link", { name: "Mục lục", exact: true }).click();
    await expect(page).toHaveURL(`${origin}/#muc-luc`);
    await page.screenshot({ path: ".local/stage4-home-mobile.png", fullPage: true });

    await save({ ...secondInput, id: second.id, title: `${prefix} — Đã cập nhật`, content: "PUBLIC-UPDATED", intent: "update" });
    const updated = await request.get(`/chuong/${second.id}`);
    expect((await updated.text()).includes("PUBLIC-UPDATED")).toBe(true);
    expect((await (await request.get("/")).text()).includes(`${prefix} — Đã cập nhật`)).toBe(true);
    await save({ ...secondInput, id: second.id, intent: "unpublish" });
    const unpublished = await request.get(`/chuong/${second.id}`);
    expect(unpublished.status()).toBe(404);
    expect((await unpublished.text()).includes(secondInput.content)).toBe(false);
    await page.goto(`/chuong/${first.id}`);
    await expect(page.getByRole("button", { name: "Chương sau →", exact: true })).toBeDisabled();
    expect((await (await request.get("/api/chapters")).text()).includes(second.id)).toBe(false);
    await save({ ...secondInput, id: second.id, intent: "publish" });
    await page.reload();
    await expect(page.getByRole("link", { name: "Chương sau →", exact: true })).toHaveAttribute("href", `/chuong/${second.id}`);
    expect((await admin.request.post("/api/admin/chapters", { headers: { origin }, data: { id: second.id, intent: "delete", confirmed: true } })).status()).toBe(200);
    expect((await request.get(`/chuong/${second.id}`)).status()).toBe(404);
    await page.reload();
    await expect(page.getByRole("button", { name: "Chương sau →", exact: true })).toBeDisabled();

    await sql`insert into novel_preview.chapters (position, title, content, status, published_at) select 2000000100 + n, ${prefix} || ' — Mục lục ' || n, 'Pagination fixture only', 'published', now() from generate_series(1, 31) n`;
    await page.goto("/");
    const list = page.getByRole("list", { name: "Danh sách chương" });
    await expect(list.getByRole("link")).toHaveCount(30);
    await page.route("**/api/chapters?after=*", route => route.abort());
    await page.getByRole("button", { name: "Xem thêm chương" }).click();
    await expect(page.getByRole("alert").filter({ hasText: "Chưa tải được mục lục" })).toBeVisible();
    await expect(list.getByRole("link")).toHaveCount(30);
    await page.unroute("**/api/chapters?after=*");
    await page.getByRole("button", { name: "Xem thêm chương" }).click();
    await expect(list.getByRole("link")).toHaveCount(existing.count + 32);
    await expect(page.getByRole("button", { name: "Xem thêm chương" })).toHaveCount(0);
    for (const after of ["-1", "1e2", "2147483648", "999999999999"]) expect((await request.get(`/api/chapters?after=${after}`)).status()).toBe(400);
    expect((await (await request.get("/api/chapters?after=2147483647")).json()).chapters).toEqual([]);
    await page.evaluate(() => localStorage.setItem("novel-reading-v1", "broken json"));
    await page.goto(`/chuong/${first.id}`);
    await expect(page.getByRole("article")).toHaveCSS("font-size", "20px");
    await expect(page.locator(".reader-page")).toHaveAttribute("data-theme", "light");
    await page.evaluate(() => { Object.defineProperty(Storage.prototype, "setItem", { configurable: true, value: () => { throw new DOMException("Storage unavailable", "QuotaExceededError"); } }); });
    await page.getByRole("button", { name: "Tăng cỡ chữ" }).click();
    await expect(page.getByRole("article")).toHaveCSS("font-size", "22px");
    await page.getByRole("button", { name: "Chuyển sang nền tối" }).click();
    await expect(page.locator(".reader-page")).toHaveAttribute("data-theme", "dark");
    expect(errors).toEqual([]);
  } finally {
    await sql`delete from novel_preview.chapters where title like ${`${prefix}%`}`;
    await sql`update novel_preview.novels set title = ${original.title}, author = ${original.author}, description = ${original.description}, cover_url = ${original.cover_url}, status = ${original.status}, updated_at = ${original.updated_at} where id = 1`;
    await sql`delete from novel_preview.rate_limits where key = ${rateKey}`;
    if (originalRate) await sql`insert into novel_preview.rate_limits (key, attempts, reset_at) values (${rateKey}, ${originalRate.attempts}, ${originalRate.reset_at})`;
    await admin.close(); await sql.end();
  }
});
