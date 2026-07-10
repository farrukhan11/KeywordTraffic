import { connectToDatabase } from '../lib/mongodb';
import KeywordMetric from '../models/KeywordMetric';
import Keyword from '../models/Keyword';
import KeywordProject from '../models/KeywordProject';
import { generateKeywordHistoricalMetrics } from '../lib/google-ads/historical-metrics-service';
import { getValidAccessToken } from './google-ads-connection.service';
import { calculateRetryDelay } from '../lib/google-ads/error-mapper';
import { GOOGLE_ADS_CONFIG } from '../lib/google-ads/config';
import crypto from 'crypto';

const MAX_RETRIES = 3;
const LOCK_TTL_MS = 5 * 60 * 1000;

export async function startMetricsRun(userId, projectId, options = {}) {
  await connectToDatabase();
  const project = await KeywordProject.findOne({ _id: projectId, userId });
  if (!project) throw new Error('Project not found');

  const activeLock = project.metricsStatus === 'PROCESSING'
    && project.metricsLock?.owner
    && project.metricsLock?.expiresAt > new Date();
  if (activeLock) throw new Error('This project is already being processed');

  const uniqueKeywords = await Keyword.find({ projectId, status: { $in: ['PENDING', 'COMPLETED'] } })
    .distinct('normalizedKeyword');
  if (!uniqueKeywords.length) throw new Error('Import at least one keyword before starting metrics');

  if (options.forceRefresh) {
    await KeywordMetric.deleteMany({ userId, projectId, normalizedKeyword: { $in: uniqueKeywords } });
  }

  const freshMetrics = await KeywordMetric.find({
    userId,
    projectId,
    normalizedKeyword: { $in: uniqueKeywords },
    expiresAt: { $gt: new Date() },
  }).select('normalizedKeyword');
  const freshSet = new Set(freshMetrics.map((metric) => metric.normalizedKeyword));
  const cachedCount = freshSet.size;
  const keywordsToFetch = uniqueKeywords.filter((keyword) => !freshSet.has(keyword));
  const lockToken = crypto.randomBytes(16).toString('hex');
  const now = new Date();

  await KeywordProject.findOneAndUpdate(
    { _id: projectId, userId },
    {
      metricsStatus: keywordsToFetch.length ? 'PROCESSING' : 'COMPLETED',
      metricsTotal: uniqueKeywords.length,
      metricsProcessed: cachedCount,
      metricsSucceeded: cachedCount,
      metricsFailed: 0,
      metricsCached: cachedCount,
      metricsCurrentBatch: 0,
      metricsStartedAt: now,
      metricsCompletedAt: keywordsToFetch.length ? null : now,
      metricsLastError: null,
      metricsApiVersion: GOOGLE_ADS_CONFIG.apiVersion,
      metricsLock: keywordsToFetch.length
        ? { owner: lockToken, acquiredAt: now, expiresAt: new Date(Date.now() + LOCK_TTL_MS) }
        : { owner: null, acquiredAt: null, expiresAt: null },
    },
    { runValidators: true }
  );

  return {
    projectId,
    totalKeywords: uniqueKeywords.length,
    keywordsToFetch: keywordsToFetch.length,
    cachedCount,
    lockToken: keywordsToFetch.length ? lockToken : null,
    completed: keywordsToFetch.length === 0,
    batchSize: GOOGLE_ADS_CONFIG.batchConfig.defaultBatchSize,
  };
}

export async function processNextBatch(userId, projectId, lockToken) {
  await connectToDatabase();
  const project = await KeywordProject.findOne({ _id: projectId, userId });
  if (!project) throw new Error('Project not found');
  if (project.metricsStatus !== 'PROCESSING') throw new Error('Project is not in processing state');
  if (!project.metricsLock?.owner || project.metricsLock.owner !== lockToken) throw new Error('Invalid lock token');
  if (new Date() > project.metricsLock.expiresAt) throw new Error('Lock has expired. Restart the metrics run.');

  const allKeywordDocs = await Keyword.find({ projectId, status: { $in: ['PENDING', 'COMPLETED'] } })
    .select('_id normalizedKeyword');
  const uniqueKeywords = [...new Set(allKeywordDocs.map((keyword) => keyword.normalizedKeyword))];
  const freshMetrics = await KeywordMetric.find({
    userId,
    projectId,
    normalizedKeyword: { $in: uniqueKeywords },
    expiresAt: { $gt: new Date() },
  }).select('normalizedKeyword');
  const fetchedSet = new Set(freshMetrics.map((metric) => metric.normalizedKeyword));
  const remaining = uniqueKeywords.filter((keyword) => !fetchedSet.has(keyword));

  if (!remaining.length) return completeProject(userId, projectId, project);

  const batchSize = GOOGLE_ADS_CONFIG.batchConfig.defaultBatchSize;
  const batch = remaining.slice(0, batchSize);
  const authResult = await getValidAccessToken(userId);
  if (authResult.error) {
    await failProject(userId, projectId, authResult.error);
    throw new Error(authResult.error);
  }

  let attempt = 0;
  while (attempt <= MAX_RETRIES) {
    try {
      const apiResult = await generateKeywordHistoricalMetrics(
        authResult.accessToken,
        project.selectedCustomerId || authResult.connection.selectedCustomerId,
        authResult.connection.selectedLoginCustomerId,
        batch,
        {
          countryCode: project.targetCountryCode,
          languageCode: project.languageCode,
          network: project.network,
        }
      );

      const saveResult = await saveMetricsResults({
        userId,
        project,
        keywordDocs: allKeywordDocs,
        batch,
        apiResult,
        apiVersion: GOOGLE_ADS_CONFIG.apiVersion,
      });
      const newProcessed = Math.min(project.metricsTotal, project.metricsProcessed + batch.length);
      const newSucceeded = project.metricsSucceeded + saveResult.succeeded;
      const newFailed = project.metricsFailed + saveResult.failed;
      const isComplete = remaining.length <= batchSize;
      const update = {
        metricsProcessed: newProcessed,
        metricsSucceeded: newSucceeded,
        metricsFailed: newFailed,
        metricsCurrentBatch: project.metricsCurrentBatch + 1,
        metricsLastError: saveResult.failed ? `${saveResult.failed} keyword(s) returned no metrics` : null,
        metricsLock: isComplete
          ? { owner: null, acquiredAt: null, expiresAt: null }
          : { ...project.metricsLock.toObject?.() || project.metricsLock, expiresAt: new Date(Date.now() + LOCK_TTL_MS) },
      };
      if (isComplete) {
        update.metricsStatus = 'COMPLETED';
        update.metricsCompletedAt = new Date();
      }
      await KeywordProject.findOneAndUpdate({ _id: projectId, userId }, update);

      return {
        completed: isComplete,
        batchNumber: project.metricsCurrentBatch + 1,
        batchSize: batch.length,
        savedCount: saveResult.succeeded,
        failedCount: saveResult.failed,
        totalProcessed: newProcessed,
        total: project.metricsTotal,
        remaining: Math.max(0, remaining.length - batchSize),
        progress: Math.round((newProcessed / project.metricsTotal) * 100),
      };
    } catch (error) {
      const mapped = mapGoogleAdsError(error);
      if (!mapped.isRetryable || attempt >= MAX_RETRIES) {
        await KeywordProject.findOneAndUpdate(
          { _id: projectId, userId },
          {
            metricsLastError: mapped.userMessage,
            ...(mapped.isAuthError ? {
              metricsStatus: 'FAILED',
              metricsLock: { owner: null, acquiredAt: null, expiresAt: null },
            } : {}),
          }
        );
        throw new Error(mapped.userMessage);
      }
      await new Promise((resolve) => setTimeout(resolve, calculateRetryDelay(attempt)));
      attempt += 1;
    }
  }
}

export async function pauseMetricsRun(userId, projectId, lockToken) {
  await connectToDatabase();
  const project = await KeywordProject.findOne({ _id: projectId, userId });
  if (!project) throw new Error('Project not found');
  if (!project.metricsLock?.owner || project.metricsLock.owner !== lockToken) throw new Error('Invalid lock token');

  await KeywordProject.findOneAndUpdate(
    { _id: projectId, userId },
    { metricsStatus: 'PAUSED', metricsLock: { owner: null, acquiredAt: null, expiresAt: null } }
  );
  return { success: true, status: 'PAUSED' };
}

export async function retryFailedMetrics(userId, projectId) {
  await connectToDatabase();
  await KeywordMetric.deleteMany({ userId, projectId, averageMonthlySearches: null });
  return startMetricsRun(userId, projectId, { forceRefresh: false });
}

export async function getMetricsStatus(userId, projectId) {
  await connectToDatabase();
  const project = await KeywordProject.findOne({ _id: projectId, userId })
    .select('metricsStatus metricsTotal metricsProcessed metricsSucceeded metricsFailed metricsCached metricsCurrentBatch metricsStartedAt metricsCompletedAt metricsLastError metricsApiVersion metricsLock');
  if (!project) throw new Error('Project not found');
  const lockValid = Boolean(project.metricsLock?.owner && new Date() < project.metricsLock.expiresAt);
  return { ...project.toObject(), isLocked: lockValid, lockExpiresAt: project.metricsLock?.expiresAt || null };
}

async function saveMetricsResults({ userId, project, keywordDocs, batch, apiResult, apiVersion }) {
  const keywordMap = new Map(keywordDocs.map((doc) => [doc.normalizedKeyword, doc]));
  const resultMap = new Map(apiResult.results.map((result) => [result.normalizedKeyword, result]));
  const now = new Date();
  const expiresAt = new Date(now.getTime() + GOOGLE_ADS_CONFIG.cacheConfig.ttlMs);
  const operations = batch.map((normalizedKeyword) => {
    const result = resultMap.get(normalizedKeyword);
    const keywordDoc = keywordMap.get(normalizedKeyword);
    const metrics = result?.metrics || {};
    return {
      updateOne: {
        filter: {
          userId,
          projectId: project._id,
          normalizedKeyword,
          countryCode: project.targetCountryCode,
          languageCode: project.languageCode,
          network: project.network,
        },
        update: {
          $set: {
            userId,
            projectId: project._id,
            keywordId: keywordDoc?._id || null,
            normalizedKeyword,
            countryCode: project.targetCountryCode,
            languageCode: project.languageCode,
            network: project.network,
            averageMonthlySearches: metrics.averageMonthlySearches ?? null,
            competition: metrics.competition ?? null,
            competitionIndex: metrics.competitionIndex ?? null,
            lowTopOfPageBidMicros: metrics.lowTopOfPageBidMicros ?? null,
            highTopOfPageBidMicros: metrics.highTopOfPageBidMicros ?? null,
            monthlySearchVolumes: metrics.monthlySearchVolumes || [],
            source: 'GOOGLE_ADS_API',
            apiVersion,
            fetchedAt: now,
            expiresAt,
            requestFingerprint: generateSingleKeywordFingerprint(
              normalizedKeyword,
              project.targetCountryCode,
              project.languageCode,
              project.network
            ),
          },
        },
        upsert: true,
      },
    };
  });

  if (operations.length) await KeywordMetric.bulkWrite(operations, { ordered: false });
  const succeeded = batch.filter((keyword) => resultMap.has(keyword)).length;
  return { succeeded, failed: batch.length - succeeded };
}

async function completeProject(userId, projectId, project) {
  await KeywordProject.findOneAndUpdate(
    { _id: projectId, userId },
    {
      metricsStatus: 'COMPLETED',
      metricsProcessed: project.metricsTotal,
      metricsCompletedAt: new Date(),
      metricsLock: { owner: null, acquiredAt: null, expiresAt: null },
    }
  );
  return { completed: true, processed: project.metricsTotal, total: project.metricsTotal, progress: 100 };
}

async function failProject(userId, projectId, message) {
  await KeywordProject.findOneAndUpdate(
    { _id: projectId, userId },
    {
      metricsStatus: 'FAILED',
      metricsLastError: message,
      metricsLock: { owner: null, acquiredAt: null, expiresAt: null },
    }
  );
}

function generateSingleKeywordFingerprint(keyword, countryCode, languageCode, network) {
  return crypto.createHash('sha256').update(JSON.stringify({
    keyword: keyword.toLowerCase().trim(), countryCode, languageCode, network,
  })).digest('hex');
}

function mapGoogleAdsError(error) {
  const status = error.status || 500;
  const rawData = error.rawData || {};
  const message = error.message || 'Unknown error';
  const safeMessages = {
    401: 'Google Ads authentication has expired. Please reconnect.',
    403: 'You do not have permission to access this Google Ads account.',
    429: 'Google Ads API rate limit exceeded. Please wait and try again.',
    UNAUTHENTICATED: 'Authentication required. Please reconnect Google Ads.',
    RESOURCE_EXHAUSTED: 'API quota exceeded. Please wait before retrying.',
  };
  return {
    userMessage: safeMessages[status] || safeMessages[rawData?.error?.code] || message,
    status,
    isRetryable: status === 429 || status >= 500,
    isAuthError: status === 401 || status === 403,
  };
}
