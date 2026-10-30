import nextEnv from "@next/env";

nextEnv.loadEnvConfig(process.cwd());
const required = ["DATABASE_URL", "DATABASE_SCHEMA", "ADMIN_PASSWORD_HASH", "SESSION_SECRET", "RATE_LIMIT_SECRET", "BLOB_READ_WRITE_TOKEN", "NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"];
const missing = required.filter((key) => !process.env[key]?.trim());
const invalid: string[] = [];
if (process.env.DATABASE_URL) {
  try {
    const url = new URL(process.env.DATABASE_URL);
    if (!["postgres:", "postgresql:"].includes(url.protocol) || !url.password || !url.hostname.endsWith(".pooler.supabase.com")) invalid.push("DATABASE_URL");
  } catch { invalid.push("DATABASE_URL"); }
}
if (process.env.DATABASE_SCHEMA && !["novel_preview", "novel_production"].includes(process.env.DATABASE_SCHEMA)) invalid.push("DATABASE_SCHEMA");
if (process.env.ADMIN_PASSWORD_HASH && !/^scrypt:[a-f0-9]{32}:[a-f0-9]{128}$/.test(process.env.ADMIN_PASSWORD_HASH)) invalid.push("ADMIN_PASSWORD_HASH");
for (const name of ["SESSION_SECRET", "RATE_LIMIT_SECRET"]) {
  if (process.env[name] && (process.env[name]!.length < 32 || process.env[name]!.startsWith("REPLACE_"))) invalid.push(name);
}
if (process.env.BLOB_READ_WRITE_TOKEN?.startsWith("REPLACE_")) invalid.push("BLOB_READ_WRITE_TOKEN");
if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL !== "https://fbtpriygrhtalsblzbhh.supabase.co") invalid.push("NEXT_PUBLIC_SUPABASE_URL");
if (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY && !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.startsWith("sb_publishable_")) invalid.push("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");
if (missing.length) {
  console.error(`Missing environment variable names: ${missing.join(", ")}`);
  process.exitCode = 1;
} else if (invalid.length) {
  console.error(`Invalid environment variable names: ${invalid.join(", ")}. Values hidden.`);
  process.exitCode = 1;
} else {
  console.log(`Environment: ${required.length}/${required.length} required keys present. Values hidden.`);
}
