import { GOOGLE_ADS_CONFIG } from './config';
import crypto from 'crypto';

const STATE_EXPIRY_MS = 10 * 60 * 1000;

export function generateOAuthState(userId) {
  const state = crypto.randomBytes(32).toString('hex');
  const expiresAt = Date.now() + STATE_EXPIRY_MS;
  return { state, userId, expiresAt };
}

export function buildOAuthUrl(userId) {
  const { state, expiresAt } = generateOAuthState(userId);
  const stateData = JSON.stringify({ state, userId, expiresAt });
  const encodedState = Buffer.from(stateData).toString('base64url');

  const params = new URLSearchParams({
    client_id: GOOGLE_ADS_CONFIG.customerId,
    redirect_uri: GOOGLE_ADS_CONFIG.redirectUri,
    response_type: 'code',
    scope: GOOGLE_ADS_CONFIG.scope,
    access_type: 'offline',
    prompt: 'consent',
    state: encodedState,
  });

  return { url: `${GOOGLE_ADS_CONFIG.authUrl}?${params.toString()}`, state: encodedState };
}

export function validateOAuthState(encodedState) {
  try {
    const stateData = JSON.parse(Buffer.from(encodedState, 'base64url').toString('utf8'));
    if (!stateData.state || !stateData.userId || !stateData.expiresAt) {
      return null;
    }
    if (Date.now() > stateData.expiresAt) {
      return null;
    }
    return stateData;
  } catch {
    return null;
  }
}

export async function exchangeCodeForTokens(code) {
  const body = new URLSearchParams({
    code,
    client_id: GOOGLE_ADS_CONFIG.customerId,
    client_secret: GOOGLE_ADS_CONFIG.clientSecret,
    redirect_uri: GOOGLE_ADS_CONFIG.redirectUri,
    grant_type: 'authorization_code',
  });

  const response = await fetch(GOOGLE_ADS_CONFIG.tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error_description || data.error || 'Token exchange failed');
  }

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token || null,
    tokenType: data.token_type || 'Bearer',
    scope: data.scope || GOOGLE_ADS_CONFIG.scope,
    expiresIn: data.expires_in,
  };
}

export async function refreshAccessToken(refreshToken) {
  const body = new URLSearchParams({
    client_id: GOOGLE_ADS_CONFIG.customerId,
    client_secret: GOOGLE_ADS_CONFIG.clientSecret,
    refresh_token: refreshToken,
    grant_type: 'refresh_token',
  });

  const response = await fetch(GOOGLE_ADS_CONFIG.tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error_description || data.error || 'Token refresh failed');
  }

  return {
    accessToken: data.access_token,
    tokenType: data.token_type || 'Bearer',
    expiresIn: data.expires_in,
  };
}

export async function revokeToken(token) {
  try {
    await fetch(`${GOOGLE_ADS_CONFIG.revokeUrl}?token=${token}`, {
      method: 'POST',
    });
  } catch {
    // Best-effort revocation
  }
}
