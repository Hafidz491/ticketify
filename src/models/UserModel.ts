import mongoose, { Schema, Model } from 'mongoose';
import { IUser } from '@/lib/types';

const UserSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    passwordSalt: { type: String, required: true },
    phone: { type: String, default: '' },
    identityNumber: { type: String, default: '' },
    avatar: { type: String, default: '' },
    bio: { type: String, default: '' },
    savedEventIds: { type: [String], default: [] },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
  },
  {
    timestamps: true,
  }
);

export const UserModel: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default UserModel;
