import { NextResponse } from "next/server";

/**
 * HTTP Basic Auth для всього сайту.
 * Пароль задається через env var AUTH_PASSWORD у Vercel
 * (Settings → Environment Variables → Add AUTH_PASSWORD).
 * Якщо env не задано — використовується дефолт "mimibon2026".
 *
 * Логін — будь-який (наприклад "admin").
 * Логаут — закрити вкладку браузера.
 */
export function middleware(req) {
  const expected = process.env.AUTH_PASSWORD || "mimibon2026";

  const auth = req.headers.get("authorization");
  if (auth && auth.startsWith("Basic ")) {
    const encoded = auth.slice(6);
    try {
      // atob is available in edge runtime
      const decoded = atob(encoded);
      const idx = decoded.indexOf(":");
      const pass = idx >= 0 ? decoded.slice(idx + 1) : "";
      if (pass === expected) {
        return NextResponse.next();
      }
    } catch (e) {
      // fall through to 401
    }
  }

  return new NextResponse("Authentication required", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="MimiBon Analytics — demo", charset="UTF-8"',
    },
  });
}

export const config = {
  // Apply to everything except Next internals & static assets
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};
