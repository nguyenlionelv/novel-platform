import "server-only";

export function requiredEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing server configuration: ${name}`);
  return value;
}

export function secretEnv(name: string): string {
  const value = requiredEnv(name);
  if (value.length < 32) throw new Error(`Server configuration ${name} must have at least 32 characters`);
  return value;
}
