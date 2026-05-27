import { NextResponse } from "next/server";

/**
 * Cookie-based auth.
 * Пароль через env var AUTH_PASSWORD (Vercel → Settings → Environment Variables).
 * Дефолт — "mimibon2026".
 *
 * Якщо cookie немає або не співпадає — редірект на /login.
 */
export function middleware(req) {
  const { pathname } = req.nextUrl;

  // Pages/APIs accessible without auth
  if (pathname === "/login" || pathname === "/api/login" || pathname === "/api/logout") {
    return NextResponse.next();
  }

  const expected = process.env.AUTH_PASSWORD || "mimibon2026";
  const token = req.cookies.get("mimibon_auth")?.value;

  if (token === expected) {
    return NextResponse.next();
  }

  // Redirect to login, preserving original URL as ?from=
  const loginUrl = req.nextUrl.clone();
  loginUrl.pathname = "/login";
  loginUrl.searchParams.set("from", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};
