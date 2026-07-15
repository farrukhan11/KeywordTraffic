import mongoose from "mongoose";

const GoogleAdsConnectionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true, index: true },
  refreshTokenEncrypted: { type: String, required: true },
  googleEmail: { type: String, default: null },
  managerCustomerId: { type: String, default: null },
  customerId: { type: String, default: null },
  connectedAt: { type: Date, default: Date.now },
  lastValidatedAt: { type: Date, default: null },
}, { timestamps: true });

export default mongoose.models.GoogleAdsConnection || mongoose.model("GoogleAdsConnection", GoogleAdsConnectionSchema);
