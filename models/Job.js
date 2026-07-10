import mongoose from 'mongoose';

const JOB_TYPES = ['KEYWORD_IMPORT', 'METRICS_FETCH'];
const JOB_STATUSES = ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'];

const jobSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'KeywordProject',
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    required: true,
    enum: JOB_TYPES,
  },
  status: {
    type: String,
    required: true,
    enum: JOB_STATUSES,
    default: 'PENDING',
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  totalItems: {
    type: Number,
    default: 0,
    min: 0,
  },
  processedItems: {
    type: Number,
    default: 0,
    min: 0,
  },
  failedItems: {
    type: Number,
    default: 0,
    min: 0,
  },
  startedAt: {
    type: Date,
    default: null,
  },
  completedAt: {
    type: Date,
    default: null,
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

// Ensure user can only access their own jobs
jobSchema.index({ userId: 1 });
jobSchema.index({ projectId: 1 });
jobSchema.index({ status: 1 });
jobSchema.index({ type: 1 });

const Job = mongoose.models.Job || mongoose.model('Job', jobSchema);

export default Job;