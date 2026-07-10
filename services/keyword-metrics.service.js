import { connectToDatabase } from '../lib/mongodb';
import KeywordMetric from '../models/KeywordMetric';
import Keyword from '../models/Keyword';
import KeywordProject from '../models/KeywordProject';
import { generateKeywordHistoricalMetrics } from '../lib/google-ads/historical-metrics-service';
import { getValidAccessToken } from './google-ads-connection.service';
import { getGeoTargetResource, getLanguageResource, getKeywordPlanNetwork } from '../lib/google-ads/targeting-map';
import { calculateRetryDelay } from '../lib/google-ads/error-mapper';
import { GOOGLE_ADS_CONFIG } from '../lib/google-ads/config';
import crypto from 'crypto';

const MAX_RETRIES = 3;

export async function startMetricsRun(userId, projectId, options = {}) {
  await connectToDatabase();

  const project = await KeywordProject.findOne({ _id: projectId, userId });
  if (!project) throw new Error('Project not found');

  const existingLock = await KeywordProject.findOne({
    _id: projectId,
    metricsStatus: 'PROCESSING',
    'metricsLock.owner': { $exists: true, $ne: null },
    'metricsLock.expiresAt': { $gt: new Date() },
  });
  if (existingLock) {
    throw new Error('This project is already being processed by another request');
  }

  const uniqueKeywords = await Keyword.find({
    projectId,
    status: { $in: ['PENDING', 'COMPLETED'] },
  }).distinct('normalizedKeyword');

  const forceRefresh = options.forceRefresh || false;
  let cachedCount = 0;
  let keywordsToFetch = [];

  if (!forceRefresh) {
    const cachedMetrics = await KeywordMetric.find({
      projectId,
      normalizedKeyword: { $in: uniqueKeywords },
      expiresAt: { $gt: new Date() },
    }).select('normalizedKeyword');
    const cachedSet = new Set(cachedMetrics.map((m) => m.normalizedKeyword));
    cachedCount = cachedSet.size;
    keywordsToFetch = uniqueKeywords.filter((k) => !cachedSet.has(k));
  } else {
    keywordsToFetch = uniqueKeywords;
  }

  const lockToken = crypto.randomBytes(16).toString('hex');
  const lockExpiryMs = 5 * 60 * 1000;

  const fingerprint = generateRequestFingerprint(
    keywordsToFetch,
    project.targetCountryCode,
    project.languageCode,
    project.network
  );

  await KeywordProject.findOneAndUpdate(
    { _id: projectId },
    {
      metricsStatus: 'PROCESSING',
      metricsTotal: uniqueKeywords.length,
      metricsProcessed: 0,
      metricsSucceeded: 0,
      metricsFailed: 0,
      metricsCached: cachedCount,
      metricsCurrentBatch: 0,
      metricsLastCursor: null,
      metricsStartedAt: new Date(),
      metricsCompletedAt: null,
      metricsLastError: null,
      metricsApiVersion: GOOGLE_ADS_CONFIG.apiVersion,
      metricsLock: {
        owner: lockToken,
        acquiredAt: new Date(),
        expiresAt: new Date(Date.now() + lockExpiryMs),
      },
    },
    { runValidators: true }
  );

  return {
    projectId,
    totalKeywords: uniqueKeywords.length,
    keywordsToFetch: keywordsToFetch.length,
    cachedCount,
    lockToken,
    batchSize: GOOGLE_ADS_CONFIG.batchConfig.defaultBatchSize,
  };
}

export async function processNextBatch(userId, projectId, lockToken) {
  await connectToDatabase();

  const project = await KeywordProject.findOne({ _id: projectId, userId });
  if (!project) throw new Error('Project not found');
  if (project.metricsStatus !== 'PROCESSING') {
    throw new Error('Project is not in processing state');
  }

  if (!project.metricsLock || project.metricsLock.owner !== lockToken) {
    throw new Error('Invalid lock token');
  }
  if (new Date() > project.metricsLock.expiresAt) {
    throw new Error('Lock has expired. Please restart the metrics run.');
  }

  const batchSize = GOOGLE_ADS_CONFIG.batchConfig.defaultBatchSize;
  const allKeywords = await Keyword.find({
    projectId,
    status: { $in: ['PENDING', 'COMPLETED'] },
  }).select('normalizedKeyword');

  const uniqueKeywords = [...new Set(allKeywords.map((k) => k.normalizedKeyword))];
  const existingMetrics = await KeywordMetric.find({ projectId }).select('normalizedKeyword');
  const fetchedSet = new Set(existingMetrics.map((m) => m.normalizedKeyword));
  const remaining = uniqueKeywords.filter((k) => !fetchedSet.has(k));

  if (remaining.length === 0) {
    await KeywordProject.findOneAndUpdate(
      { _id: projectId },
      {
        metricsStatus: 'COMPLETED',
        metricsCompletedAt: new Date(),
        metricsLock: { owner: null, acquiredAt: null, expiresAt: null },
      }
    );
    return { completed: true, processed: project.metricsProcessed, total: project.metricsTotal };
  }

  const batch = remaining.slice(0, batchSize);
  const batchNumber = project.metricsCurrentBatch + 1;

  const authResult = await getValidAccessToken(userId);
  if (authResult.error) {
    await KeywordProject.findOneAndUpdate(
      { _id: projectId },
      {
        metricsStatus: 'FAILED',
        metricsLastError: authResult.error,
        metricsLock: { owner: null, acquiredAt: null, expiresAt: null },
      }
    );
    throw new Error(authResult.error);
  }

  let attempt = 0;
  let lastError = null;

  while (attempt <= MAX_RETRIES) {
    try {
      const targeting = {
        countryCode: project.targetCountryCode,
        languageCode: project.languageCode,
        network: project.network,
      };

      const apiResult = await generateKeywordHistoricalMetrics(
        authResult.accessToken,
        project.selectedCustomerId || authResult.connection.selectedCustomerId,
        authResult.connection.selectedLoginCustomerId,
        batch,
        targeting
      );

      const savedCount = await saveMetricsResults(
        userId,
        projectId,
        allKeywords,
        batch,
        apiResult,
        GOOGLE_ADS_CONFIG.apiVersion
      );

      const newProcessed = project.metricsProcessed + batch.length;
      const newSucceeded = project.metricsSucceeded + savedCount;
      const progress = Math.round((newProcessed / project.metricsTotal) * 100);

      await KeywordProject.findOneAndUpdate(
        { _id: projectId },
        {
          metricsProcessed: newProcessed,
          metricsSucceeded: newSucceeded,
          metricsCurrentBatch: batchNumber,
          metricsLock: {
            ...project.metricsLock,
            expiresAt: new Date(Date.now() + 5 * 60 * 1000),
          },
        }
      );

      return {
        completed: remaining.length <= batchSize,
        batchNumber,
        batchSize: batch.length,
        savedCount,
        totalProcessed: newProcessed,
        total: project.metricsTotal,
        remaining: Math.max(0, remaining.length - batchSize),
        progress,
      };
    } catch (error) {
      lastError = error;
      const mapped = mapGoogleAdsErrorFromModule(error);

      if (!mapped.isRetryable || attempt >= MAX_RETRIES) {
        const newFailed = project.metricsFailed + batch.length;
        await KeywordProject.findOneAndUpdate(
          { _id: projectId },
          {
            metricsFailed: newFailed,
            metricsProcessed: project.metricsProcessed + batch.length,
            metricsLastError: mapped.userMessage,
          }
        );

        if (mapped.isAuthError) {
          await KeywordProject.findOneAndUpdate(
            { _id: projectId },
            {
              metricsStatus: 'FAILED',
              metricsLock: { owner: null, acquiredAt: null, expiresAt: null },
            }
          );
        }

        throw new Error(mapped.userMessage);
      }

      const retryDelay = calculateRetryDelay(attempt);
      await new Promise((resolve) => setTimeout(resolve, retryDelay));
      attempt++;
    }
  }

  throw lastError;
}

export async function pauseMetricsRun(userId, projectId, lockToken) {
  await connectToDatabase();
  const project = await KeywordProject.findOne({ _id: projectId, userId });
  if (!project) throw new Error('Project not found');
  if (!project.metricsLock || project.metricsLock.owner !== lockToken) {
    throw new Error('Invalid lock token');
  }

  await KeywordProject.findOneAndUpdate(
    { _id: projectId },
    {
      metricsStatus: 'COMPLETED',
      metricsLock: { owner: null, acquiredAt: null, expiresAt: null },
    }
  );

  return { success: true };
}

export async function retryFailedMetrics(userId, projectId, lockToken) {
  await connectToDatabase();
  const failedMetrics = await KeywordMetric.find({
    projectId,
    userId,
    source: 'GOOGLE_ADS_API',
    averageMonthlySearches: null,
  });

  if (failedMetrics.length === 0) {
    return { retriedCount: 0 };
  }

  for (const metric of failedMetrics) {
    await KeywordMetric.deleteOne({ _id: metric._id });
  }

  return startMetricsRun(userId, projectId, { forceRefresh: true });
}

export async function getMetricsStatus(userId, projectId) {
  await connectToDatabase();
  const project = await KeywordProject.findOne({ _id: projectId, userId })
    .select('metricsStatus metricsTotal metricsProcessed metricsSucceeded metricsFailed metricsCached metricsCurrentBatch metricsStartedAt metricsCompletedAt metricsLastError metricsApiVersion');

  if (!project) throw new Error('Project not found');

  const lockValid = project.metricsLock &&
    project.metricsLock.owner &&
    new Date() < project.metricsLock.expiresAt;

  return {
    ...project.toObject(),
    isLocked: lockValid,
    lockExpiresAt: project.metricsLock?.expiresAt || null,
  };
}

async function saveMetricsResults(userId, projectId, allKeywords, batch, apiResult, apiVersion) {
  let savedCount = 0;
  const keywordDocs = await Keyword.find({ projectId }).select('normalizedKeyword');

  for (const result of apiResult.results) {
    const matchedKeyword = keywordDocs.find(
      (kw) => kw.normalizedKeyword === result.normalizedKeyword
    );

    if (!matchedKeyword) continue;

    const countryCode = (await KeywordProject.findById(projectId)).targetCountryCode;
    const languageCode = (await KeywordProject.findById(projectId)).languageCode;
    const network = (await KeywordProject.findById(projectId)).network;

    const fingerprint = generateSingleKeywordFingerprint(
      result.normalizedKeyword, countryCode, languageCode, network
    );

    const ttlMs = GOOGLE_ADS_CONFIG.cacheConfig.ttlMs;
    const now = new Date();

    await KeywordMetric.findOneAndUpdate(
      {
        userId,
        projectId,
        normalizedKeyword: result.normalizedKeyword,
        countryCode,
        languageCode,
        network,
      },
      {
        userId,
        projectId,
        keywordId: matchedKeyword._id,
        normalizedKeyword: result.normalizedKeyword,
        countryCode,
        languageCode,
        network,
        averageMonthlySearches: result.metrics.averageMonthlySearches,
        competition: result.metrics.competition,
        competitionIndex: result.metrics.competitionIndex,
        lowTopOfPageBidMicros: result.metrics.lowTopOfPageBidMicros,
        highTopOfPageBidMicros: result.metrics.highTopOfPageBidMicros,
        monthlySearchVolumes: result.metrics.monthlySearchVolumes,
        source: 'GOOGLE_ADS_API',
        apiVersion,
        fetchedAt: now,
        expiresAt: new Date(now.getTime() + ttlMs),
        requestFingerprint: fingerprint,
      },
      { upsert: true, new: true, runValidators: true }
    );

    savedCount++;
  }

  return savedCount;
}

function generateRequestFingerprint(keywords, countryCode, languageCode, network) {
  const data = JSON.stringify({
    keywords: [...keywords].sort(),
    countryCode,
    languageCode,
    network,
  });
  return crypto.createHash('sha256').update(data).digest('hex');
}

function generateSingleKeywordFingerprint(keyword, countryCode, languageCode, network) {
  const data = JSON.stringify({
    keyword: keyword.toLowerCase().trim(),
    countryCode,
    languageCode,
    network,
  });
  return crypto.createHash('sha256').update(data).digest('hex');
}

function mapGoogleAdsErrorFromModule(error) {
  const status = error.status || 500;
  const rawData = error.rawData || {};
  const message = error.message || 'Unknown error';

  const USER_SAFE_MESSAGES = {
    401: 'Google Ads authentication has expired. Please reconnect.',
    403: 'You do not have permission to access this Google Ads account.',
    429: 'Google Ads API rate limit exceeded. Please wait and try again.',
    UNAUTHENTICATED: 'Authentication required. Please reconnect Google Ads.',
    RESOURCE_EXHAUSTED: 'API quota exceeded. Please wait before retrying.',
  };

  const userMessage = USER_SAFE_MESSAGES[status]
    || USER_SAFE_MESSAGES[rawData?.error?.code]
    || message;

  return {
    userMessage,
    technicalMessage: message,
    status,
    isRetryable: status === 429 || status >= 500,
    isAuthError: status === 401 || status === 403,
  };
}
