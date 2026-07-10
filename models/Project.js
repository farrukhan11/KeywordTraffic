import mongoose from "mongoose";

const ProjectSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  name: { type: String, required: true, trim: true, maxlength: 150 },
  country: { type: String, required: true, default: "United Kingdom" },
  language: { type: String, required: true, default: "English" },
  keywords: [{ type: String, trim: true }],
  status: { type: String, enum: ["DRAFT", "READY", "PROCESSING", "COMPLETED", "FAILED"], default: "DRAFT" },
}, { timestamps: true });

export default mongoose.models.Project || mongoose.model("Project", ProjectSchema);
