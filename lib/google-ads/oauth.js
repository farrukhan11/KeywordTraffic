const AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const TOKEN_URL = "https://oauth2.googleapis.com/token";
const USERINFO_URL = "https://openidconnect.googleapis.com/v1/userinfo";

function required(name) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is missing`);
  return value;
}

export function buildGoogleAdsAuthorizationUrl(state) {
  const params = new URLSearchParams({
    client_id: required("GOOGLE_ADS_CLIENT_ID"),
    redirect_uri: required("GOOGLE_ADS_REDIRECT_URI"),
    response_type: "code",
    scope: "openid email https://www.googleapis.com/auth/adwords",
    access_type: "offline",
    prompt: "consent",
    include_granted_scopes: "true",
    state,
  });
  return `${AUTH_URL}?${params.toString()}`;
}

export async function exchangeAuthorizationCode(code) {
  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: required("GOOGLE_ADS_CLIENT_ID"),
      client_secret: required("GOOGLE_ADS_CLIENT_SECRET"),
      redirect_uri: required("GOOGLE_ADS_REDIRECT_URI"),
      grant_type: "authorization_code",
    }),
    cache: "no-store",
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error_description || data.error || "Google OAuth token exchange failed");
  return data;
}

export async function getGoogleUserInfo(accessToken) {
  const response = await fetch(USERINFO_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });
  if (!response.ok) return null;
  return response.json();
}
