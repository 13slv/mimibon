import { NextResponse } from "next/server";

export async function POST(req) {
  const formData = await req.formData();
  const password = formData.get("password");
  const from = (formData.get("from") || "/").toString();
  const expected = process.env.AUTH_PASSWORD || "mimibon2026";

  // Safety: only allow internal paths in `from`
  const safeFrom = from.startsWith("/") && !from.startsWith("//") ? from : "/";

  if (password === expected) {
    const response = NextResponse.redirect(new URL(safeFrom, req.url));
    response.cookies.set("mimibon_auth", expected, {
      httpOnly: true,
      sameSite: "lax",
      secure: true,
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    });
    return response;
  }

  // Wrong password — back to login with error
  const loginUrl = new URL("/login", req.url);
  loginUrl.searchParams.set("error", "1");
  if (safeFrom !== "/") loginUrl.searchParams.set("from", safeFrom);
  return NextResponse.redirect(loginUrl);
}
