import "server-only";
import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(scryptCallback);

export async function hashPassword(password: string): Promise<string> {
  if (password.length < 12 || password.length > 256) throw new Error("Password must have 12–256 characters");
  const salt = randomBytes(16).toString("hex");
  const hash = await scrypt(password, salt, 64) as Buffer;
  return `scrypt:${salt}:${hash.toString("hex")}`;
}

export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  if (!password || password.length > 256) return false;
  const match = /^scrypt:([a-f0-9]{32}):([a-f0-9]{128})$/.exec(storedHash);
  if (!match) return false;
  const actual = await scrypt(password, match[1], 64) as Buffer;
  return timingSafeEqual(actual, Buffer.from(match[2], "hex"));
}
