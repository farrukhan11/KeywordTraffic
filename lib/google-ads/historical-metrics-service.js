import { createClient, GoogleAdsError } from './client';
import { getGeoTargetResource, getLanguageResource, getKeywordPlanNetwork } from './targeting-map';
import { GOOGLE_ADS_CONFIG } from './config';

export async function generateKeywordHistoricalMetrics(accessToken, customerId, loginCustomerId, keywords, targeting) {
  const client = createClient(accessToken, loginCustomerId || customerId);
  const normalizedCustomerId = customerId.replace(/-/g, '');

  const geoTargetConstants = targeting.geoTargetConstants || [getGeoTargetResource(targeting.countryCode)];
  const languageResource = getLanguageResource(targeting.languageCode);
  const keywordPlanNetwork = getKeywordPlanNetwork(targeting.network);

  const keywordsPayload = keywords.map((kw) => ({
    text: kw,
  }));

  const payload = {
    customerId: normalizedCustomerId,
    keywords: keywordsPayload,
    geoTargetConstants,
    language: languageResource,
    keywordPlanNetwork,
  };

  if (targeting.historicalMetricsOptions) {
    payload.historicalMetricsOptions = targeting.historicalMetricsOptions;
  }

  try {
    const result = await client.post(
      `/customers/${normalizedCustomerId}:generateKeywordHistoricalMetrics`,
      payload
    );

    return mapMetricsResponse(result, keywords);
  } catch (error) {
    if (error instanceof GoogleAdsError) throw error;
    throw new GoogleAdsError(
      { error: { message: `Historical metrics request failed: ${error.message}` } },
      error.status || 500
    );
  }
}

function mapMetricsResponse(result, submittedKeywords) {
  const results = [];
  const metrics = result.keywordMetrics || [];

  for (const metric of metrics) {
    const keyword = metric.keyword?.text || '';
    const normalizedKeyword = keyword.toLowerCase().trim();

    results.push({
      submittedKeyword: keyword,
      normalizedKeyword,
      metrics: {
        averageMonthlySearches: metric.keywordMetrics?.averageMonthlySearches != null
          ? parseInt(String(metric.keywordMetrics.averageMonthlySearches), 10)
          : null,
        competition: mapCompetitionLevel(metric.keywordMetrics?.competition),
        competitionIndex: metric.keywordMetrics?.competitionIndex != null
          ? parseFloat(String(metric.keywordMetrics.competitionIndex))
          : null,
        lowTopOfPageBidMicros: metric.keywordMetrics?.lowTopOfPageBidMicros != null
          ? parseInt(String(metric.keywordMetrics.lowTopOfPageBidMicros), 10)
          : null,
        highTopOfPageBidMicros: metric.keywordMetrics?.highTopOfPageBidMicros != null
          ? parseInt(String(metric.keywordMetrics.highTopOfPageBidMicros), 10)
          : null,
        monthlySearchVolumes: mapMonthlySearchVolumes(metric.keywordMetrics?.monthlySearchVolumes || []),
      },
    });
  }

  return {
    results,
    matchedCount: results.length,
    totalCount: submittedKeywords.length,
  };
}

function mapCompetitionLevel(competition) {
  const map = {
    'LOW': 'LOW',
    'MEDIUM': 'MEDIUM',
    'HIGH': 'HIGH',
    'UNSPECIFIED': null,
    'UNKNOWN': null,
  };
  return map[competition] || null;
}

function mapMonthlySearchVolumes(volumes) {
  return volumes.map((v) => ({
    year: parseInt(String(v.year), 10),
    month: parseInt(String(v.month), 10),
    monthlySearches: parseInt(String(v.monthlySearches), 10),
  }));
}
