import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  image: {
    type: String,
    default: null,
  },
  firebaseUid: {
    type: String,
    required: true,
    unique: true,
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

userSchema.index({ email: 1 });
userSchema.index({ firebaseUid: 1 });

const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;