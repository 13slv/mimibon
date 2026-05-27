import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function clearAndRedirect(req) {
  const response = NextResponse.redirect(new URL("/login", req.url), 303);
  response.cookies.set("mimibon_auth", "", { path: "/", maxAge: 0 });
  return response;
}

export async function POST(req) { return clearAndRedirect(req); }
export async function GET(req)  { return clearAndRedirect(req); }
