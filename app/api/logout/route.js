import { NextResponse } from "next/server";

export async function POST(req) {
  const response = NextResponse.redirect(new URL("/login", req.url));
  response.cookies.set("mimibon_auth", "", { path: "/", maxAge: 0 });
  return response;
}

export async function GET(req) {
  return POST(req);
}
