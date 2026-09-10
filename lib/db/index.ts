import { connectToDatabase } from '../mongodb';
import { UserModel } from '../models/User';
import { PhotoModel } from '../models/Photo';
import { ShareLinkModel } from '../models/ShareLink';
import { MonthPreferenceModel } from '../models/MonthPreference';
import {
  Photo,
  User,
  YearSummary,
  MonthSummary,
  FlashbackSummary,
  FlashbackYearGroup,
  ShareLink,
  MonthPreference,
} from '../types';
import { getMonthName } from '../exif';

export class MongoDatabase {
  private async ensureConnected() {
    await connectToDatabase();
  }

  public async getUser(userId: string): Promise<User | null> {
    await this.ensureConnected();
    const doc = await UserModel.findOne({ id: userId }).lean().exec();
    if (!doc) return null;
    return {
      id: doc.id,
      email: doc.email,
      name: doc.name,
      avatar_url: doc.avatar_url,
      created_at: doc.created_at,
      storage_used_bytes: doc.storage_used_bytes,
    };
  }

  public async getUserByEmail(email: string): Promise<User | null> {
    await this.ensureConnected();
    const doc = await UserModel.findOne({ email: email.trim().toLowerCase() }).lean().exec();
    if (!doc) return null;
    return {
      id: doc.id,
      email: doc.email,
      name: doc.name,
      avatar_url: doc.avatar_url,
      created_at: doc.created_at,
      storage_used_bytes: doc.storage_used_bytes,
    };
  }

  public async createUser(user: Partial<User> & { id: string; email: string }): Promise<User> {
    await this.ensureConnected();
    const newUser: User = {
      id: user.id,
      email: user.email.trim().toLowerCase(),
      name: user.name || user.email.split('@')[0],
      avatar_url: user.avatar_url,
      storage_used_bytes: user.storage_used_bytes || 0,
      created_at: new Date().toISOString(),
    };

    await UserModel.findOneAndUpdate(
      { id: user.id },
      { $set: newUser },
      { upsert: true, new: true }
    ).exec();

    return newUser;
  }

  public async updateUser(userId: string, updates: Partial<User>): Promise<User | null> {
    await this.ensureConnected();
    const doc = await UserModel.findOneAndUpdate(
      { id: userId },
      { $set: updates },
      { new: true }
    ).lean().exec();

    if (!doc) return null;
    return {
      id: doc.id,
      email: doc.email,
      name: doc.name,
      avatar_url: doc.avatar_url,
      created_at: doc.created_at,
      storage_used_bytes: doc.storage_used_bytes,
    };
  }

  public async getPhotos(
    userId: string,
    filter?: { year?: number; month?: number; is_favorite?: boolean; search?: string }
  ): Promise<Photo[]> {
    await this.ensureConnected();

    const query: any = { user_id: userId };
    if (filter?.year) query.year = filter.year;
    if (filter?.month) query.month = filter.month;
    if (filter?.is_favorite !== undefined) query.is_favorite = filter.is_favorite;

    let docs = await PhotoModel.find(query).lean().exec();

    let photos: Photo[] = docs.map((p: any) => ({
      id: p.id,
      user_id: p.user_id,
      storage_key: p.storage_key,
      url: p.url,
      thumbnail_url: p.thumbnail_url,
      captured_at: p.captured_at,
      uploaded_at: p.uploaded_at,
      year: p.year,
      month: p.month,
      day: p.day,
      filename: p.filename,
      mime_type: p.mime_type,
      file_size: p.file_size,
      width: p.width,
      height: p.height,
      aspect_ratio: p.aspect_ratio,
      latitude: p.latitude,
      longitude: p.longitude,
      location_name: p.location_name,
      camera_model: p.camera_model,
      lens_model: p.lens_model,
      iso: p.iso,
      focal_length: p.focal_length,
      exposure_time: p.exposure_time,
      caption: p.caption,
      is_favorite: p.is_favorite,
      is_cover: p.is_cover,
      created_at: p.created_at,
      updated_at: p.updated_at,
    }));

    if (filter?.search) {
      const q = filter.search.toLowerCase().trim();
      photos = photos.filter(
        (p) =>
          (p.caption && p.caption.toLowerCase().includes(q)) ||
          (p.location_name && p.location_name.toLowerCase().includes(q)) ||
          (p.filename && p.filename.toLowerCase().includes(q)) ||
          (p.camera_model && p.camera_model.toLowerCase().includes(q)) ||
          p.year.toString().includes(q) ||
          getMonthName(p.month).toLowerCase().includes(q)
      );
    }

    return photos.sort(
      (a, b) => new Date(b.captured_at).getTime() - new Date(a.captured_at).getTime()
    );
  }

  public async getPhotoById(userId: string, photoId: string): Promise<Photo | null> {
    await this.ensureConnected();
    const doc: any = await PhotoModel.findOne({ id: photoId, user_id: userId }).lean().exec();
    if (!doc) return null;
    return {
      id: doc.id,
      user_id: doc.user_id,
      storage_key: doc.storage_key,
      url: doc.url,
      thumbnail_url: doc.thumbnail_url,
      captured_at: doc.captured_at,
      uploaded_at: doc.uploaded_at,
      year: doc.year,
      month: doc.month,
      day: doc.day,
      filename: doc.filename,
      mime_type: doc.mime_type,
      file_size: doc.file_size,
      width: doc.width,
      height: doc.height,
      aspect_ratio: doc.aspect_ratio,
      latitude: doc.latitude,
      longitude: doc.longitude,
      location_name: doc.location_name,
      camera_model: doc.camera_model,
      lens_model: doc.lens_model,
      iso: doc.iso,
      focal_length: doc.focal_length,
      exposure_time: doc.exposure_time,
      caption: doc.caption,
      is_favorite: doc.is_favorite,
      is_cover: doc.is_cover,
      created_at: doc.created_at,
      updated_at: doc.updated_at,
    };
  }

  public async addPhoto(photo: Photo): Promise<Photo> {
    await this.ensureConnected();
    await PhotoModel.create(photo);
    await UserModel.findOneAndUpdate(
      { id: photo.user_id },
      { $inc: { storage_used_bytes: photo.file_size } }
    ).exec();
    return photo;
  }

  public async updatePhoto(
    userId: string,
    photoId: string,
    updates: Partial<Photo>
  ): Promise<Photo | null> {
    await this.ensureConnected();
    const doc: any = await PhotoModel.findOneAndUpdate(
      { id: photoId, user_id: userId },
      { $set: { ...updates, updated_at: new Date().toISOString() } },
      { new: true }
    ).lean().exec();

    if (!doc) return null;
    return {
      id: doc.id,
      user_id: doc.user_id,
      storage_key: doc.storage_key,
      url: doc.url,
      thumbnail_url: doc.thumbnail_url,
      captured_at: doc.captured_at,
      uploaded_at: doc.uploaded_at,
      year: doc.year,
      month: doc.month,
      day: doc.day,
      filename: doc.filename,
      mime_type: doc.mime_type,
      file_size: doc.file_size,
      width: doc.width,
      height: doc.height,
      aspect_ratio: doc.aspect_ratio,
      latitude: doc.latitude,
      longitude: doc.longitude,
      location_name: doc.location_name,
      camera_model: doc.camera_model,
      lens_model: doc.lens_model,
      iso: doc.iso,
      focal_length: doc.focal_length,
      exposure_time: doc.exposure_time,
      caption: doc.caption,
      is_favorite: doc.is_favorite,
      is_cover: doc.is_cover,
      created_at: doc.created_at,
      updated_at: doc.updated_at,
    };
  }

  public async deletePhoto(userId: string, photoId: string): Promise<boolean> {
    await this.ensureConnected();
    const doc = await PhotoModel.findOneAndDelete({ id: photoId, user_id: userId }).lean().exec();
    if (!doc) return false;

    await UserModel.findOneAndUpdate(
      { id: userId },
      { $inc: { storage_used_bytes: -doc.file_size } }
    ).exec();

    return true;
  }

  public async getAvailableYears(userId: string): Promise<number[]> {
    await this.ensureConnected();
    const years = await PhotoModel.distinct('year', { user_id: userId }).exec();
    return (years as number[]).sort((a, b) => b - a);
  }

  public async getChronologicalStream(userId: string, selectedYear?: number): Promise<YearSummary[]> {
    await this.ensureConnected();
    const userPhotos = await this.getPhotos(userId);
    const prefsDocs = await MonthPreferenceModel.find({ user_id: userId }).lean().exec();
    const shareDocs = await ShareLinkModel.find({ user_id: userId, is_revoked: false }).lean().exec();

    const monthPrefs = new Map<string, any>();
    for (const pref of prefsDocs) {
      monthPrefs.set(`${pref.year}_${pref.month}`, pref);
    }

    const shareLinks = new Map<string, any>();
    for (const s of shareDocs) {
      shareLinks.set(`${s.year}_${s.month}`, s);
    }

    const grouped = new Map<number, Map<number, Photo[]>>();

    for (const p of userPhotos) {
      if (selectedYear && p.year !== selectedYear) continue;

      if (!grouped.has(p.year)) {
        grouped.set(p.year, new Map<number, Photo[]>());
      }
      const yearMap = grouped.get(p.year)!;
      if (!yearMap.has(p.month)) {
        yearMap.set(p.month, []);
      }
      yearMap.get(p.month)!.push(p);
    }

    const yearSummaries: YearSummary[] = [];
    const sortedYears = Array.from(grouped.keys()).sort((a, b) => b - a);

    for (const yr of sortedYears) {
      const monthMap = grouped.get(yr)!;
      const sortedMonths = Array.from(monthMap.keys()).sort((a, b) => b - a);

      const monthSummaries: MonthSummary[] = [];
      let totalMemoriesInYear = 0;

      for (const mo of sortedMonths) {
        const photosInMonth = monthMap.get(mo)!.sort(
          (a, b) => new Date(b.captured_at).getTime() - new Date(a.captured_at).getTime()
        );
        totalMemoriesInYear += photosInMonth.length;
        const days = new Set(photosInMonth.map((p) => p.day));

        const pref = monthPrefs.get(`${yr}_${mo}`);
        let cover =
          photosInMonth.find((p) => p.id === pref?.cover_photo_id) ||
          photosInMonth.find((p) => p.is_cover) ||
          photosInMonth[0];

        const share = shareLinks.get(`${yr}_${mo}`);

        monthSummaries.push({
          year: yr,
          month: mo,
          month_name: getMonthName(mo),
          photo_count: photosInMonth.length,
          days_captured: days.size,
          cover_photo: cover,
          photos: photosInMonth,
          is_shared: !!share,
          share_token: share?.token,
        });
      }

      yearSummaries.push({
        year: yr,
        total_memories: totalMemoriesInYear,
        months: monthSummaries,
      });
    }

    return yearSummaries;
  }

  public async getMonthDetails(
    userId: string,
    year: number,
    month: number
  ): Promise<MonthSummary | null> {
    await this.ensureConnected();
    const photosInMonth = await this.getPhotos(userId, { year, month });
    if (photosInMonth.length === 0) return null;

    const days = new Set(photosInMonth.map((p) => p.day));
    const pref = await MonthPreferenceModel.findOne({ user_id: userId, year, month }).lean().exec();
    let cover =
      photosInMonth.find((p) => p.id === pref?.cover_photo_id) ||
      photosInMonth.find((p) => p.is_cover) ||
      photosInMonth[0];

    const share = await ShareLinkModel.findOne({
      user_id: userId,
      year,
      month,
      is_revoked: false,
    }).lean().exec();

    return {
      year,
      month,
      month_name: getMonthName(month),
      photo_count: photosInMonth.length,
      days_captured: days.size,
      cover_photo: cover,
      photos: photosInMonth,
      is_shared: !!share,
      share_token: share?.token,
    };
  }

  public async setMonthCover(
    userId: string,
    year: number,
    month: number,
    photoId: string
  ): Promise<boolean> {
    await this.ensureConnected();
    const photo = await this.getPhotoById(userId, photoId);
    if (!photo || photo.year !== year || photo.month !== month) return false;

    await MonthPreferenceModel.findOneAndUpdate(
      { user_id: userId, year, month },
      {
        $set: {
          id: `pref_${year}_${month}_${Date.now()}`,
          user_id: userId,
          year,
          month,
          cover_photo_id: photoId,
          visibility: 'private',
        },
      },
      { upsert: true }
    ).exec();

    return true;
  }

  public async getFlashback(userId: string, month: number): Promise<FlashbackSummary> {
    await this.ensureConnected();
    const allPhotos = await this.getPhotos(userId, { month });
    const yearMap = new Map<number, Photo[]>();

    for (const p of allPhotos) {
      if (!yearMap.has(p.year)) {
        yearMap.set(p.year, []);
      }
      yearMap.get(p.year)!.push(p);
    }

    const sortedYears = Array.from(yearMap.keys()).sort((a, b) => b - a);
    const yearGroups: FlashbackYearGroup[] = [];

    for (const yr of sortedYears) {
      const photos = yearMap
        .get(yr)!
        .sort((a, b) => new Date(b.captured_at).getTime() - new Date(a.captured_at).getTime());
      const days = new Set(photos.map((p) => p.day));

      const pref = await MonthPreferenceModel.findOne({ user_id: userId, year: yr, month })
        .lean()
        .exec();
      const cover =
        photos.find((p) => p.id === pref?.cover_photo_id) ||
        photos.find((p) => p.is_cover) ||
        photos[0];

      yearGroups.push({
        year: yr,
        photos,
        photo_count: photos.length,
        days_captured: days.size,
        cover_photo: cover,
      });
    }

    return {
      month,
      month_name: getMonthName(month),
      years: yearGroups,
      total_photos: allPhotos.length,
      span_years: sortedYears,
    };
  }

  public async createOrGetShareLink(
    userId: string,
    year: number,
    month: number
  ): Promise<ShareLink> {
    await this.ensureConnected();
    const existing: any = await ShareLinkModel.findOne({
      user_id: userId,
      year,
      month,
      is_revoked: false,
    }).lean().exec();

    if (existing) {
      return {
        id: existing.id,
        user_id: existing.user_id,
        year: existing.year,
        month: existing.month,
        token: existing.token,
        is_revoked: existing.is_revoked,
        expires_at: existing.expires_at,
        created_at: existing.created_at,
        access_count: existing.access_count,
      };
    }

    const token = `${getMonthName(month).toLowerCase()}-${year}-${Math.random().toString(36).substring(2, 10)}`;
    const newLinkData = {
      id: `share_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      user_id: userId,
      year,
      month,
      token,
      is_revoked: false,
      created_at: new Date().toISOString(),
      access_count: 0,
    };

    const created: any = await ShareLinkModel.create(newLinkData);
    return {
      id: created.id,
      user_id: created.user_id,
      year: created.year,
      month: created.month,
      token: created.token,
      is_revoked: created.is_revoked,
      expires_at: created.expires_at,
      created_at: created.created_at,
      access_count: created.access_count,
    };
  }

  public async revokeShareLink(userId: string, token: string): Promise<boolean> {
    await this.ensureConnected();
    const result = await ShareLinkModel.findOneAndUpdate(
      { token, user_id: userId },
      { $set: { is_revoked: true } }
    ).exec();
    return !!result;
  }

  public async getSharedMonthByToken(
    token: string
  ): Promise<{ month: MonthSummary; ownerName: string } | null> {
    await this.ensureConnected();
    const link: any = await ShareLinkModel.findOneAndUpdate(
      { token, is_revoked: false },
      { $inc: { access_count: 1 } },
      { new: true }
    ).lean().exec();

    if (!link) return null;

    const user = await this.getUser(link.user_id);
    const monthDetails = await this.getMonthDetails(link.user_id, link.year, link.month);
    if (!monthDetails) return null;

    return {
      month: monthDetails,
      ownerName: user?.name || 'An Archivist',
    };
  }
}

export const db = new MongoDatabase();
