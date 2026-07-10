import mongoose from 'mongoose';

const PROJECT_STATUSES = ['DRAFT', 'PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'];

const keywordProjectSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true, trim: true, maxlength: 200 },
  description: { type: String, trim: true, maxlength: 1000 },
  targetCountryCode: { type: String, required: true, trim: true },
  targetCountryName: { type: String, required: true, trim: true },
  languageCode: { type: String, required: true, trim: true },
  languageName: { type: String, required: true, trim: true },
  network: { type: String, required: true, enum: ['SEARCH', 'DISPLAY', 'SEARCH_AND_DISPLAY'] },
  status: { type: String, required: true, enum: PROJECT_STATUSES, default: 'DRAFT' },
  totalKeywords: { type: Number, default: 0, min: 0 },
  uniqueKeywords: { type: Number, default: 0, min: 0 },
  duplicateKeywords: { type: Number, default: 0, min: 0 },
  processedKeywords: { type: Number, default: 0, min: 0 },
  failedKeywords: { type: Number, default: 0, min: 0 },
  metricsStatus: {
    type: String,
    enum: ['NOT_STARTED', 'PENDING', 'PROCESSING', 'PAUSED', 'COMPLETED', 'FAILED'],
    default: 'NOT_STARTED',
  },
  metricsTotal: { type: Number, default: 0, min: 0 },
  metricsProcessed: { type: Number, default: 0, min: 0 },
  metricsSucceeded: { type: Number, default: 0, min: 0 },
  metricsFailed: { type: Number, default: 0, min: 0 },
  metricsCached: { type: Number, default: 0, min: 0 },
  metricsCurrentBatch: { type: Number, default: 0, min: 0 },
  metricsLastCursor: { type: String, default: null },
  metricsStartedAt: { type: Date, default: null },
  metricsCompletedAt: { type: Date, default: null },
  metricsLastError: { type: String, default: null },
  metricsApiVersion: { type: String, default: null },
  metricsLock: {
    owner: { type: String, default: null },
    acquiredAt: { type: Date, default: null },
    expiresAt: { type: Date, default: null },
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, { timestamps: true });

keywordProjectSchema.index({ userId: 1 });
keywordProjectSchema.index({ status: 1 });
keywordProjectSchema.index({ metricsStatus: 1 });

const KeywordProject = mongoose.models.KeywordProject || mongoose.model('KeywordProject', keywordProjectSchema);
export default KeywordProject;
