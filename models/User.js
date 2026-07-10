import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: { type: String, trim: true, maxlength: 100 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ["admin", "user"], default: "user", index: true },
}, { timestamps: true });

export default mongoose.models.User || mongoose.model("User", UserSchema);
