import mongoose from "mongoose";

const ApiQuotaSchema = new mongoose.Schema(
  {
    date: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    requestsUsed: {
      type: Number,
      default: 0,
      min: 0,
    },
    limit: {
      type: Number,
      default: 15000,
    },
    hardLimit: {
      type: Number,
      default: 14500,
    },
    warningThreshold: {
      type: Number,
      default: 14000,
    },
  },
  { timestamps: true }
);

ApiQuotaSchema.index({ date: 1 }, { unique: true });

export default mongoose.models.ApiQuota || mongoose.model("ApiQuota", ApiQuotaSchema);
