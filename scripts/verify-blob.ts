import nextEnv from "@next/env";
import { randomUUID } from "node:crypto";
import { put, head, del } from "@vercel/blob";

nextEnv.loadEnvConfig(process.cwd());
let uploadedUrl: string | undefined;
try {
  const pixel = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=", "base64");
  const blob = await put(`checks/${randomUUID()}.png`, pixel, { access: "public", contentType: "image/png", addRandomSuffix: false });
  uploadedUrl = blob.url;
  const metadata = await head(blob.url);
  if (metadata.size !== pixel.byteLength) throw new Error("Unexpected test file size");
  console.log("Blob upload/read metadata verified. Temporary image will be removed.");
} catch {
  console.error("Blob verification failed. Credential values hidden.");
  process.exitCode = 1;
} finally {
  if (uploadedUrl) {
    try { await del(uploadedUrl); console.log("Temporary Blob test image removed."); }
    catch { console.error("Unable to remove the temporary Blob test image. Inspect the checks/ prefix in the project store."); process.exitCode = 1; }
  }
}
