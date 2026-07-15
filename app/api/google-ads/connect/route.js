import crypto from "crypto";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { buildGoogleAdsAuthorizationUrl } from "@/lib/google-ads/oauth";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.redirect(new URL("/login", process.env.AUTH_URL || "http://localhost:3000"));

  const state = crypto.randomBytes(24).toString("hex");
  const response = NextResponse.redirect(buildGoogleAdsAuthorizationUrl(state));
  response.cookies.set("google_ads_oauth_state", state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 600,
  });
  return response;
}
