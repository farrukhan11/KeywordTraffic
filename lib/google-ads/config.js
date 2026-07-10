export const GOOGLE_ADS_CONFIG = {
  apiVersion: process.env.GOOGLE_ADS_API_VERSION || 'v18',
  get baseUrl() {
    return `https://googleads.googleapis.com/${this.apiVersion}`;
  },
  get authUrl() {
    return 'https://accounts.google.com/o/oauth2/v2/auth';
  },
  get tokenUrl() {
    return 'https://oauth2.googleapis.com/token';
  },
  get revokeUrl() {
    return 'https://oauth2.googleapis.com/revoke';
  },
  get customerId() {
    return process.env.GOOGLE_ADS_CLIENT_ID;
  },
  get clientSecret() {
    return process.env.GOOGLE_ADS_CLIENT_SECRET;
  },
  get developerToken() {
    return process.env.GOOGLE_ADS_DEVELOPER_TOKEN;
  },
  get redirectUri() {
    return process.env.GOOGLE_ADS_REDIRECT_URI;
  },
  get managerAccountId() {
    return process.env.GOOGLE_ADS_MANAGER_ACCOUNT_ID || null;
  },
  scope: 'https://www.googleapis.com/auth/adwords',
  batchConfig: {
    get defaultBatchSize() {
      return parseInt(process.env.GOOGLE_ADS_KEYWORD_BATCH_SIZE || '50', 10);
    },
    maxBatchSize: 50,
    minBatchSize: 10,
  },
  rateLimitConfig: {
    requestsPerSecond: 1,
  },
  cacheConfig: {
    defaultTtlDays: 30,
    get ttlMs() {
      return this.defaultTtlDays * 24 * 60 * 60 * 1000;
    },
  },
};

export function getGoogleAdsHeaders(loginCustomerId) {
  const headers = {
    'Authorization': 'Bearer {access_token}',
    'developer-token': GOOGLE_ADS_CONFIG.developerToken,
    'Content-Type': 'application/json',
  };
  if (loginCustomerId) {
    headers['login-customer-id'] = loginCustomerId.replace(/-/g, '');
  }
  return headers;
}

export function normalizeCustomerId(customerId) {
  if (!customerId) return null;
  return customerId.replace(/-/g, '');
}

export function formatCustomerId(customerId) {
  const normalized = normalizeCustomerId(customerId);
  if (!normalized || normalized.length !== 10) return normalized;
  return `${normalized.slice(0, 3)}-${normalized.slice(3, 6)}-${normalized.slice(6)}`;
}
