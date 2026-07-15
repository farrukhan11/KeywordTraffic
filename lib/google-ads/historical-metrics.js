import { decryptSecret } from "@/lib/security/encryption";

const TOKEN_URL = "https://oauth2.googleapis.com/token";
const API_VERSION = process.env.GOOGLE_ADS_API_VERSION || "v24";

const COUNTRY_IDS = {
  "United Kingdom": "2826",
  "United States": "2840",
  Pakistan: "2586",
  Canada: "2124",
  Australia: "2036",
  "United Arab Emirates": "2784",
};

const LANGUAGE_IDS = {
  English: "1000",
  German: "1001",
  French: "1002",
  Arabic: "1019",
  Urdu: "1041",
};

function required(name) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is missing`);
  return value;
}

async function getAccessToken(encryptedRefreshToken) {
  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: required("GOOGLE_ADS_CLIENT_ID"),
      client_secret: required("GOOGLE_ADS_CLIENT_SECRET"),
      refresh_token: decryptSecret(encryptedRefreshToken),
      grant_type: "refresh_token",
    }),
    cache: "no-store",
  });

  const data = await response.json();
  if (!response.ok || !data.access_token) {
    throw new Error(data.error_description || data.error || "Unable to refresh Google access token");
  }
  return data.access_token;
}

function microsToCurrency(value) {
  if (value == null) return null;
  const number = Number(value);
  return Number.isFinite(number) ? number / 1_000_000 : null;
}

export async function getHistoricalMetrics(connection, keywords, country, language) {
  const customerId = String(connection.customerId || process.env.GOOGLE_ADS_CUSTOMER_ID || "").replace(/-/g, "");
  const managerId = String(connection.managerCustomerId || process.env.GOOGLE_ADS_MANAGER_ACCOUNT_ID || "").replace(/-/g, "");
  if (!customerId) throw new Error("GOOGLE_ADS_CUSTOMER_ID is missing");

  const geoId = COUNTRY_IDS[country];
  const languageId = LANGUAGE_IDS[language];
  if (!geoId) throw new Error(`Unsupported country: ${country}`);
  if (!languageId) throw new Error(`Unsupported language: ${language}`);

  const accessToken = await getAccessToken(connection.refreshTokenEncrypted);
  const response = await fetch(
    `https://googleads.googleapis.com/${API_VERSION}/customers/${customerId}:generateKeywordHistoricalMetrics`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "developer-token": required("GOOGLE_ADS_DEVELOPER_TOKEN"),
        ...(managerId ? { "login-customer-id": managerId } : {}),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        keywords,
        geoTargetConstants: [`geoTargetConstants/${geoId}`],
        language: `languageConstants/${languageId}`,
        keywordPlanNetwork: "GOOGLE_SEARCH",
      }),
      cache: "no-store",
    }
  );

  const data = await response.json();
  if (!response.ok) {
    // Log full error for debugging - remove after issue is resolved
    console.error("[Google Ads API] Full error response:", JSON.stringify(data, null, 2));
    const detail = data?.error?.details?.[0]?.errors?.[0];
    const errorCode = detail?.errorCode ? JSON.stringify(detail.errorCode) : null;
    const message = errorCode
      ? `${data?.error?.message} [Code: ${errorCode}]`
      : data?.error?.message || detail?.message || "Google Ads metrics request failed";
    throw new Error(message);
  }

  const rows = data.results || data.keywordMetrics || [];
  return rows.map((row) => {
    const metrics = row.keywordMetrics || row.metrics || {};
    return {
      keyword: row.text || row.keyword?.text || "",
      closeVariants: row.closeVariants || [],
      averageMonthlySearches: Number(metrics.avgMonthlySearches ?? metrics.averageMonthlySearches ?? 0),
      competition: metrics.competition || null,
      competitionIndex: metrics.competitionIndex == null ? null : Number(metrics.competitionIndex),
      lowTopOfPageBid: microsToCurrency(metrics.lowTopOfPageBidMicros),
      highTopOfPageBid: microsToCurrency(metrics.highTopOfPageBidMicros),
      monthlySearchVolumes: metrics.monthlySearchVolumes || [],
    };
  });
}
