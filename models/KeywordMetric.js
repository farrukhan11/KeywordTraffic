import mongoose from 'mongoose';

const keywordMetricSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'KeywordProject',
    required: true,
  },
  keywordId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Keyword',
    required: true,
  },
  normalizedKeyword: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200,
  },
  countryCode: {
    type: String,
    required: true,
    trim: true,
  },
  languageCode: {
    type: String,
    required: true,
    trim: true,
  },
  network: {
    type: String,
    required: true,
    enum: ['SEARCH', 'DISPLAY', 'SEARCH_AND_DISPLAY'],
  },
  averageMonthlySearches: {
    type: Number,
    default: null,
    min: 0,
  },
  competition: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH'],
    default: null,
  },
  competitionIndex: {
    type: Number,
    default: null,
    min: 0,
    max: 1,
  },
  lowTopOfPageBidMicros: {
    type: Number,
    default: null,
    min: 0,
  },
  highTopOfPageBidMicros: {
    type: Number,
    default: null,
    min: 0,
  },
  monthlySearchVolumes: [{
    year: {
      type: Number,
      required: true,
      min: 2000,
      max: 2100,
    },
    month: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },
    monthlySearches: {
      type: Number,
      required: true,
      min: 0,
    },
  }],
  source: {
    type: String,
    required: true,
    enum: ['GOOGLE_ADS_API', 'CACHED'],
  },
  apiVersion: {
    type: String,
    required: true,
  },
  fetchedAt: {
    type: Date,
    default: Date.now,
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
  },
  requestFingerprint: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Prevent duplicate metric records for the same keyword and targeting combination
keywordMetricSchema.index({ 
  userId: 1, 
  projectId: 1, 
  normalizedKeyword: 1, 
  countryCode: 1, 
  languageCode: 1, 
  network: 1 
}, { unique: true });

keywordMetricSchema.index({ projectId: 1 });
keywordMetricSchema.index({ userId: 1 });
keywordMetricSchema.index({ expiresAt: 1 });

const KeywordMetric = mongoose.models.KeywordMetric || mongoose.model('KeywordMetric', keywordMetricSchema);

export default KeywordMetric;