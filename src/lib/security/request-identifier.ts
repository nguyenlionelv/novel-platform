import "server-only";
import { isIP } from "node:net";

export function requestIdentifier(request: Request): string {
  // Only Vercel's overwritten header is trusted. Local callers share one bucket.
  const forwarded = process.env.VERCEL === "1" ? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() : undefined;
  return forwarded && isIP(forwarded) ? forwarded : "local-or-unknown";
}
