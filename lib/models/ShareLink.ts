import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IShareLinkDocument extends Document {
  id: string;
  user_id: string;
  year: number;
  month: number;
  token: string;
  is_revoked: boolean;
  expires_at?: string;
  created_at: string;
  access_count: number;
}

const ShareLinkSchema = new Schema<IShareLinkDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    user_id: { type: String, required: true, index: true },
    year: { type: Number, required: true },
    month: { type: Number, required: true },
    token: { type: String, required: true, unique: true, index: true },
    is_revoked: { type: Boolean, default: false },
    expires_at: { type: String },
    created_at: { type: String, default: () => new Date().toISOString() },
    access_count: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

export const ShareLinkModel: Model<IShareLinkDocument> =
  mongoose.models.ShareLink || mongoose.model<IShareLinkDocument>('ShareLink', ShareLinkSchema);
