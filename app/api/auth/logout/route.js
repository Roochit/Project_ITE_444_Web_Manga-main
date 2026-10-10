import { NextResponse } from "next/server";
import { removeAuthCookie } from "@/lib/auth";

export async function POST() {
  await removeAuthCookie();
  return NextResponse.json({ success: true, message: "Logged out successfully" });
}

export async function GET(request) {
  await removeAuthCookie();
  const url = new URL(request.url);
  const redirectTarget = url.searchParams.get("redirect") || "/login";
  return NextResponse.redirect(new URL(redirectTarget, request.url));
}
