import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IMonthPreferenceDocument extends Document {
  id: string;
  user_id: string;
  year: number;
  month: number;
  cover_photo_id?: string;
  note?: string;
  visibility: 'private' | 'link' | 'public';
}

const MonthPreferenceSchema = new Schema<IMonthPreferenceDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    user_id: { type: String, required: true, index: true },
    year: { type: Number, required: true },
    month: { type: Number, required: true },
    cover_photo_id: { type: String },
    note: { type: String },
    visibility: {
      type: String,
      enum: ['private', 'link', 'public'],
      default: 'private',
    },
  },
  {
    timestamps: true,
  }
);

MonthPreferenceSchema.index({ user_id: 1, year: 1, month: 1 }, { unique: true });

export const MonthPreferenceModel: Model<IMonthPreferenceDocument> =
  mongoose.models.MonthPreference ||
  mongoose.model<IMonthPreferenceDocument>('MonthPreference', MonthPreferenceSchema);
