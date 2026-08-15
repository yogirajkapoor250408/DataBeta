import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  passwordHash?: string;
  fullName: string;
  googleId?: string;
  role: string;
  isAdmin: boolean;
  subscriptionStatus: 'free' | 'paid';
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String },
    fullName: { type: String, required: true, trim: true },
    googleId: { type: String, sparse: true },
    role: { type: String, default: 'owner' },
    isAdmin: { type: Boolean, default: false },
    subscriptionStatus: { type: String, enum: ['free', 'paid'], default: 'free' },
  },
  { timestamps: true }
);

export const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
