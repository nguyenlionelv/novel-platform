import "server-only";
import { createHash, timingSafeEqual } from "node:crypto";
import { getIronSession, type SessionOptions } from "iron-session";
import { cookies } from "next/headers";
import { requiredEnv, secretEnv } from "../env";

interface AdminSession {
  isAdmin?: boolean;
  expiresAt?: number;
  passwordVersion?: string;
}

function passwordVersion() {
  return createHash("sha256").update(requiredEnv("ADMIN_PASSWORD_HASH")).digest("hex");
}

function options(): SessionOptions {
  return {
    password: secretEnv("SESSION_SECRET"),
    cookieName: "novel_admin",
    ttl: 60 * 60 * 8,
    cookieOptions: { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/" },
  };
}

async function getSession() {
  return getIronSession<AdminSession>(await cookies(), options());
}

export async function createAdminSession() {
  const session = await getSession();
  session.isAdmin = true;
  session.expiresAt = Date.now() + 8 * 60 * 60 * 1000;
  session.passwordVersion = passwordVersion();
  await session.save();
}

export async function isAdmin(): Promise<boolean> {
  const session = await getSession();
  const version = passwordVersion();
  const actual = session.passwordVersion;
  return session.isAdmin === true && typeof session.expiresAt === "number" && session.expiresAt > Date.now()
    && typeof actual === "string" && /^[a-f0-9]{64}$/.test(actual)
    && timingSafeEqual(Buffer.from(actual), Buffer.from(version));
}

export async function requireAdmin() {
  if (!await isAdmin()) throw new Error("Unauthorized");
}

export async function destroyAdminSession() {
  (await getSession()).destroy();
}
