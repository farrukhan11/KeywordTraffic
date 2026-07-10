import mongoose from 'mongoose';

const CONNECTION_STATUSES = ['connected', 'disconnected', 'expired', 'revoked', 'error'];

const googleAdsConnectionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  googleAccountEmail: {
    type: String,
    trim: true,
    default: null,
  },
  encryptedRefreshToken: {
    type: String,
    required: true,
  },
  refreshTokenIv: {
    type: String,
    required: true,
  },
  refreshTokenAuthTag: {
    type: String,
    required: true,
  },
  scope: {
    type: String,
    required: true,
  },
  tokenType: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
    enum: CONNECTION_STATUSES,
    default: 'disconnected',
  },
  connectedAt: {
    type: Date,
    default: null,
  },
  disconnectedAt: {
    type: Date,
    default: null,
  },
  lastSuccessfulAuthAt: {
    type: Date,
    default: null,
  },
  lastAuthError: {
    type: String,
    default: null,
  },
  selectedCustomerId: {
    type: String,
    trim: true,
    default: null,
  },
  selectedCustomerName: {
    type: String,
    trim: true,
    default: null,
  },
  selectedLoginCustomerId: {
    type: String,
    trim: true,
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

// Ensure user has only one active connection
googleAdsConnectionSchema.index({ userId: 1, status: 1 });

const GoogleAdsConnection = mongoose.models.GoogleAdsConnection || mongoose.model('GoogleAdsConnection', googleAdsConnectionSchema);

export default GoogleAdsConnection;