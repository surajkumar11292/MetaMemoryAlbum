import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUserDocument extends Document {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  created_at: string;
  storage_used_bytes: number;
}

const UserSchema = new Schema<IUserDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, index: true },
    name: { type: String, required: true },
    avatar_url: { type: String },
    created_at: { type: String, default: () => new Date().toISOString() },
    storage_used_bytes: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

export const UserModel: Model<IUserDocument> =
  mongoose.models.User || mongoose.model<IUserDocument>('User', UserSchema);
