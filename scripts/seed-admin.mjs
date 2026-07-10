import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const uri = process.env.MONGODB_URI;
const email = (process.env.ADMIN_EMAIL || "maxshopk@gmail.com").toLowerCase().trim();
const password = process.env.ADMIN_PASSWORD;
const name = process.env.ADMIN_NAME || "Max Shop Admin";

if (!uri) {
  throw new Error("MONGODB_URI is required");
}

if (!password || password.length < 10) {
  throw new Error("ADMIN_PASSWORD is required and must be at least 10 characters");
}

await mongoose.connect(uri, { bufferCommands: false });

const User = mongoose.models.User || mongoose.model("User", new mongoose.Schema({
  name: { type: String, trim: true, maxlength: 100 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ["admin", "user"], default: "user" },
}, { timestamps: true }));

const passwordHash = await bcrypt.hash(password, 12);

await User.findOneAndUpdate(
  { email },
  { name, email, passwordHash, role: "admin" },
  { upsert: true, new: true, runValidators: true }
);

console.log(`Admin account ready: ${email}`);
await mongoose.disconnect();
