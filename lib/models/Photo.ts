import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPhotoDocument extends Document {
  id: string;
  user_id: string;
  storage_key: string;
  url: string;
  thumbnail_url: string;
  captured_at: string;
  uploaded_at: string;
  year: number;
  month: number;
  day: number;
  filename: string;
  mime_type: string;
  file_size: number;
  width?: number;
  height?: number;
  aspect_ratio?: number;
  latitude?: number;
  longitude?: number;
  location_name?: string;
  camera_model?: string;
  lens_model?: string;
  iso?: number;
  focal_length?: string;
  exposure_time?: string;
  caption?: string;
  is_favorite: boolean;
  is_cover: boolean;
  created_at: string;
  updated_at: string;
}

const PhotoSchema = new Schema<IPhotoDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    user_id: { type: String, required: true, index: true },
    storage_key: { type: String, required: true },
    url: { type: String, required: true },
    thumbnail_url: { type: String, required: true },
    captured_at: { type: String, required: true },
    uploaded_at: { type: String, default: () => new Date().toISOString() },
    year: { type: Number, required: true, index: true },
    month: { type: Number, required: true, index: true },
    day: { type: Number, required: true },
    filename: { type: String, required: true },
    mime_type: { type: String, required: true },
    file_size: { type: Number, required: true },
    width: { type: Number },
    height: { type: Number },
    aspect_ratio: { type: Number },
    latitude: { type: Number },
    longitude: { type: Number },
    location_name: { type: String },
    camera_model: { type: String },
    lens_model: { type: String },
    iso: { type: Number },
    focal_length: { type: String },
    exposure_time: { type: String },
    caption: { type: String },
    is_favorite: { type: Boolean, default: false, index: true },
    is_cover: { type: Boolean, default: false },
    created_at: { type: String, default: () => new Date().toISOString() },
    updated_at: { type: String, default: () => new Date().toISOString() },
  },
  {
    timestamps: true,
  }
);

// Compound index for user query performance
PhotoSchema.index({ user_id: 1, year: 1, month: 1 });
PhotoSchema.index({ user_id: 1, captured_at: -1 });

export const PhotoModel: Model<IPhotoDocument> =
  mongoose.models.Photo || mongoose.model<IPhotoDocument>('Photo', PhotoSchema);
