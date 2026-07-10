import mongoose from 'mongoose';

const KEYWORD_STATUSES = ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'];
const KEYWORD_SOURCES = ['PASTE', 'CSV'];

const keywordSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'KeywordProject',
    required: true,
  },
  originalKeyword: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200,
  },
  normalizedKeyword: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200,
  },
  status: {
    type: String,
    required: true,
    enum: KEYWORD_STATUSES,
    default: 'PENDING',
  },
  source: {
    type: String,
    required: true,
    enum: KEYWORD_SOURCES,
  },
  rowNumber: {
    type: Number,
    required: true,
    min: 1,
  },
  errorMessage: {
    type: String,
    default: null,
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

// Ensure unique normalized keywords within the same project
keywordSchema.index({ projectId: 1, normalizedKeyword: 1 }, { unique: true });
keywordSchema.index({ projectId: 1 });
keywordSchema.index({ status: 1 });

const Keyword = mongoose.models.Keyword || mongoose.model('Keyword', keywordSchema);

export default Keyword;