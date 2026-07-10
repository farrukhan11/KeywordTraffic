import { GOOGLE_ADS_CONFIG } from './config';

export class GoogleAdsClient {
  constructor(accessToken, loginCustomerId) {
    this.accessToken = accessToken;
    this.loginCustomerId = loginCustomerId;
    this.baseUrl = GOOGLE_ADS_CONFIG.baseUrl;
  }

  async request(method, path, body = null) {
    const url = `${this.baseUrl}${path}`;
    const headers = {
      'Authorization': `Bearer ${this.accessToken}`,
      'developer-token': GOOGLE_ADS_CONFIG.developerToken,
      'Content-Type': 'application/json',
    };

    if (this.loginCustomerId) {
      headers['login-customer-id'] = this.loginCustomerId.replace(/-/g, '');
    }

    const opts = { method, headers };
    if (body && method !== 'GET') {
      opts.body = JSON.stringify(body);
    }

    const response = await fetch(url, opts);
    const data = await response.json();

    if (!response.ok) {
      const error = new GoogleAdsError(data, response.status);
      throw error;
    }

    return data;
  }

  async get(path) {
    return this.request('GET', path);
  }

  async post(path, body) {
    return this.request('POST', path, body);
  }
}

export class GoogleAdsError extends Error {
  constructor(data, status) {
    const message = data?.error?.message || data?.message || `Google Ads API error ${status}`;
    super(message);
    this.name = 'GoogleAdsError';
    this.status = status;
    this.rawData = data;
    this.googleAdsErrors = data?.error?.details || [];
    this.requestId = null;
  }
}

export function createClient(accessToken, loginCustomerId) {
  return new GoogleAdsClient(accessToken, loginCustomerId);
}
