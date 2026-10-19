import "server-only";

export function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    const source = new URL(origin);
    const target = new URL(request.url);
    const host = request.headers.get("host");
    // Next's local URL can use localhost even when the browser requested 127.0.0.1.
    // Host is browser-controlled by the destination, unlike an arbitrary forwarded-host header.
    if (host) {
      const actual = new URL(`${target.protocol}//${host}`);
      if (actual.pathname !== "/" || actual.username || actual.password || actual.search || actual.hash) return false;
      target.host = actual.host;
    }
    return source.origin === origin && source.origin === target.origin;
  }
  catch { return false; }
}
