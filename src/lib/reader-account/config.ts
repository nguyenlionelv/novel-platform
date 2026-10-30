// Authentication stays on the server. No service-role key is used.
export function authConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error("Reader authentication configuration missing");
  return { url, key };
}

export function authCookieOptions() {
  return { name: `novel_reader_${process.env.DATABASE_SCHEMA === "novel_production" ? "production" : "preview"}`, httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax" as const, path: "/" };
}
