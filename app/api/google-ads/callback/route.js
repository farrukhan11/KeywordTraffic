import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/mongodb";
import { encryptSecret } from "@/lib/security/encryption";
import { exchangeAuthorizationCode, getGoogleUserInfo } from "@/lib/google-ads/oauth";
import GoogleAdsConnection from "@/models/GoogleAdsConnection";

export async function GET(request) {
  const session = await auth();
  const baseUrl = process.env.AUTH_URL || new URL(request.url).origin;
  if (!session?.user?.id) return NextResponse.redirect(new URL("/login", baseUrl));

  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");
  const cookieStore = await cookies();
  const expectedState = cookieStore.get("google_ads_oauth_state")?.value;

  if (error) return NextResponse.redirect(new URL(`/dashboard?googleAds=error&reason=${encodeURIComponent(error)}`, baseUrl));
  if (!code || !state || !expectedState || state !== expectedState) {
    return NextResponse.redirect(new URL("/dashboard?googleAds=invalid-state", baseUrl));
  }

  try {
    const tokens = await exchangeAuthorizationCode(code);
    if (!tokens.refresh_token) throw new Error("Google did not return a refresh token. Reconnect and approve access again.");
    const profile = tokens.access_token ? await getGoogleUserInfo(tokens.access_token) : null;

    await connectDB();
    await GoogleAdsConnection.findOneAndUpdate(
      { userId: session.user.id },
      {
        userId: session.user.id,
        refreshTokenEncrypted: encryptSecret(tokens.refresh_token),
        googleEmail: profile?.email || null,
        managerCustomerId: process.env.GOOGLE_ADS_MANAGER_ACCOUNT_ID?.replace(/-/g, "") || null,
        customerId: process.env.GOOGLE_ADS_CUSTOMER_ID?.replace(/-/g, "") || null,
        connectedAt: new Date(),
        lastValidatedAt: new Date(),
      },
      { upsert: true, new: true, runValidators: true }
    );

    const response = NextResponse.redirect(new URL("/dashboard?googleAds=connected", baseUrl));
    response.cookies.delete("google_ads_oauth_state");
    return response;
  } catch (error) {
    return NextResponse.redirect(new URL(`/dashboard?googleAds=error&reason=${encodeURIComponent(error.message)}`, baseUrl));
  }
}
