const USER_SAFE_MESSAGES = {
  401: 'Google Ads authentication has expired. Please reconnect.',
  403: 'You do not have permission to access this Google Ads account.',
  404: 'Google Ads account not found.',
  429: 'Google Ads API rate limit exceeded. Please wait and try again.',
  INVALID_ARGUMENT: 'Invalid request parameters.',
  NOT_FOUND: 'Resource not found.',
  PERMISSION_DENIED: 'Permission denied for this Google Ads account.',
  UNAUTHENTICATED: 'Authentication required. Please reconnect Google Ads.',
  RESOURCE_EXHAUSTED: 'API quota exceeded. Please wait before retrying.',
  INTERNAL: 'Google Ads service temporarily unavailable.',
  UNAVAILABLE: 'Google Ads service is currently unavailable.',
  DEADLINE_EXCEEDED: 'Request timed out. Please try again.',
  FAILED_PRECONDITION: 'Operation cannot be completed in the current state.',
  INVALID_CUSTOMER_ID: 'The selected Google Ads customer ID is invalid.',
  CUSTOMER_NOT_ENABLED: 'The selected Google Ads account is not enabled.',
  DEVELOPER_TOKEN_NOT_APPROVED: 'Developer token access is restricted. Please check your Google Ads API Center.',
};

export function mapGoogleAdsError(error) {
  const status = error.status || 500;
  const rawData = error.rawData || {};
  const message = error.message || 'Unknown error';

  const userMessage = USER_SAFE_MESSAGES[status]
    || USER_SAFE_MESSAGES[rawData?.error?.code]
    || USER_SAFE_MESSAGES[extractErrorType(rawData)]
    || 'An unexpected error occurred while accessing Google Ads.';

  return {
    userMessage,
    technicalMessage: message,
    status,
    isRetryable: isRetryableError(status, rawData),
    isAuthError: isAuthError(status, rawData),
    requestId: error.requestId || rawData?.requestId || null,
    rawErrorCode: rawData?.error?.code || null,
  };
}

function extractErrorType(rawData) {
  if (!rawData?.error?.details) return null;
  for (const detail of rawData.error.details) {
    if (detail?.errors) {
      for (const err of detail.errors) {
        if (err?.errorType) return err.errorType;
        if (err?.code) return err.code;
      }
    }
  }
  return rawData?.error?.code || null;
}

function isRetryableError(status, rawData) {
  if (status === 429) return true;
  if (status === 500 || status === 502 || status === 503) return true;
  const errorType = extractErrorType(rawData);
  if (errorType === 'RESOURCE_EXHAUSTED') return true;
  if (errorType === 'INTERNAL') return true;
  if (errorType === 'UNAVAILABLE') return true;
  if (errorType === 'DEADLINE_EXCEEDED') return true;
  return false;
}

function isAuthError(status, rawData) {
  if (status === 401 || status === 403) return true;
  const errorType = extractErrorType(rawData);
  if (errorType === 'UNAUTHENTICATED') return true;
  if (errorType === 'PERMISSION_DENIED') return true;
  return false;
}

export function isRetryableGoogleAdsError(error) {
  const mapped = mapGoogleAdsError(error);
  return mapped.isRetryable;
}

export function isAuthGoogleAdsError(error) {
  const mapped = mapGoogleAdsError(error);
  return mapped.isAuthError;
}

export function calculateRetryDelay(attempt, retryAfterMs) {
  const baseDelay = retryAfterMs || 1000;
  const exponentialDelay = baseDelay * Math.pow(2, attempt);
  const jitter = exponentialDelay * (0.5 + Math.random() * 0.5);
  return Math.min(jitter, 60000);
}
