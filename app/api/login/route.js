import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function handle(req) {
  const formData = await req.formData();
  const password = (formData.get("password") || "").toString();
  const from = (formData.get("from") || "/").toString();
  const expected = process.env.AUTH_PASSWORD || "mimibon2026";

  const safeFrom = from.startsWith("/") && !from.startsWith("//") ? from : "/";

  if (password === expected) {
    const response = NextResponse.redirect(new URL(safeFrom, req.url), 303);
    response.cookies.set("mimibon_auth", expected, {
      httpOnly: true,
      sameSite: "lax",
      secure: true,
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });
    return response;
  }

  const loginUrl = new URL("/login", req.url);
  loginUrl.searchParams.set("error", "1");
  if (safeFrom !== "/") loginUrl.searchParams.set("from", safeFrom);
  return NextResponse.redirect(loginUrl, 303);
}

export async function POST(req) {
  return handle(req);
}

// GET fallback (debug + redirect to /login if someone hits this URL directly)
export async function GET() {
  return NextResponse.redirect(new URL("/login", "http://example.com"), 302);
}
