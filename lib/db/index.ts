import { Photo, User, YearSummary, MonthSummary, FlashbackSummary, FlashbackYearGroup, ShareLink, MonthPreference } from '../types';
import { SEED_USER, SEED_PHOTOS, SEED_MONTH_PREFERENCES, SEED_SHARE_LINKS } from './seed';
import { getMonthName } from '../exif';

// In-Memory Database Store (Simulating PostgreSQL/Supabase with local reactivity & persistence)
class MemoryDatabase {
  private users: Map<string, User> = new Map();
  private photos: Map<string, Photo> = new Map();
  private monthPrefs: Map<string, MonthPreference> = new Map();
  private shareLinks: Map<string, ShareLink> = new Map();

  constructor() {
    this.seed();
  }

  private seed() {
    this.users.set(SEED_USER.id, { ...SEED_USER });
    for (const p of SEED_PHOTOS) {
      this.photos.set(p.id, { ...p });
    }
    for (const pref of SEED_MONTH_PREFERENCES) {
      this.monthPrefs.set(`${pref.user_id}_${pref.year}_${pref.month}`, { ...pref });
    }
    for (const link of SEED_SHARE_LINKS) {
      this.shareLinks.set(link.token, { ...link });
    }
  }

  public async getUser(userId: string): Promise<User | null> {
    return this.users.get(userId) || null;
  }

  public async createUser(user: Partial<User> & { id: string; email: string }): Promise<User> {
    const newUser: User = {
      id: user.id,
      email: user.email,
      name: user.name || user.email.split('@')[0],
      avatar_url: user.avatar_url || undefined,
      storage_used_bytes: user.storage_used_bytes || 0,
      created_at: new Date().toISOString(),
    };
    this.users.set(user.id, newUser);
    return newUser;
  }

  public async getPhotos(userId: string, filter?: { year?: number; month?: number; is_favorite?: boolean; search?: string }): Promise<Photo[]> {
    let result = Array.from(this.photos.values()).filter(p => p.user_id === userId);

    if (filter?.year) {
      result = result.filter(p => p.year === filter.year);
    }
    if (filter?.month) {
      result = result.filter(p => p.month === filter.month);
    }
    if (filter?.is_favorite !== undefined) {
      result = result.filter(p => p.is_favorite === filter.is_favorite);
    }
    if (filter?.search) {
      const q = filter.search.toLowerCase().trim();
      result = result.filter(p => 
        (p.caption && p.caption.toLowerCase().includes(q)) ||
        (p.location_name && p.location_name.toLowerCase().includes(q)) ||
        (p.filename && p.filename.toLowerCase().includes(q)) ||
        (p.camera_model && p.camera_model.toLowerCase().includes(q)) ||
        p.year.toString().includes(q) ||
        getMonthName(p.month).toLowerCase().includes(q)
      );
    }

    // Sort chronologically descending (newest capture first)
    return result.sort((a, b) => new Date(b.captured_at).getTime() - new Date(a.captured_at).getTime());
  }

  public async getPhotoById(userId: string, photoId: string): Promise<Photo | null> {
    const p = this.photos.get(photoId);
    if (!p || p.user_id !== userId) return null;
    return p;
  }

  public async addPhoto(photo: Photo): Promise<Photo> {
    this.photos.set(photo.id, photo);
    const user = this.users.get(photo.user_id);
    if (user) {
      user.storage_used_bytes += photo.file_size;
    }
    return photo;
  }

  public async updatePhoto(userId: string, photoId: string, updates: Partial<Photo>): Promise<Photo | null> {
    const p = this.photos.get(photoId);
    if (!p || p.user_id !== userId) return null;

    const updated = {
      ...p,
      ...updates,
      updated_at: new Date().toISOString(),
    };
    this.photos.set(photoId, updated);
    return updated;
  }

  public async deletePhoto(userId: string, photoId: string): Promise<boolean> {
    const p = this.photos.get(photoId);
    if (!p || p.user_id !== userId) return false;

    this.photos.delete(photoId);
    const user = this.users.get(userId);
    if (user) {
      user.storage_used_bytes = Math.max(0, user.storage_used_bytes - p.file_size);
    }
    return true;
  }

  public async getAvailableYears(userId: string): Promise<number[]> {
    const photos = await this.getPhotos(userId);
    const yearSet = new Set<number>();
    for (const p of photos) {
      yearSet.add(p.year);
    }
    return Array.from(yearSet).sort((a, b) => b - a);
  }

  public async getChronologicalStream(userId: string, selectedYear?: number): Promise<YearSummary[]> {
    const userPhotos = await this.getPhotos(userId);
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
        const photosInMonth = monthMap.get(mo)!.sort((a, b) => 
          new Date(b.captured_at).getTime() - new Date(a.captured_at).getTime()
        );
        totalMemoriesInYear += photosInMonth.length;

        // Distinct days captured
        const days = new Set(photosInMonth.map(p => p.day));

        // Check preference for custom cover
        const prefKey = `${userId}_${yr}_${mo}`;
        const pref = this.monthPrefs.get(prefKey);
        let cover = photosInMonth.find(p => p.id === pref?.cover_photo_id) || photosInMonth.find(p => p.is_cover) || photosInMonth[0];

        // Check share status
        const share = Array.from(this.shareLinks.values()).find(
          s => s.user_id === userId && s.year === yr && s.month === mo && !s.is_revoked
        );

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

  public async getMonthDetails(userId: string, year: number, month: number): Promise<MonthSummary | null> {
    const photosInMonth = await this.getPhotos(userId, { year, month });
    if (photosInMonth.length === 0) return null;

    const days = new Set(photosInMonth.map(p => p.day));
    const prefKey = `${userId}_${year}_${month}`;
    const pref = this.monthPrefs.get(prefKey);
    let cover = photosInMonth.find(p => p.id === pref?.cover_photo_id) || photosInMonth.find(p => p.is_cover) || photosInMonth[0];

    const share = Array.from(this.shareLinks.values()).find(
      s => s.user_id === userId && s.year === year && s.month === month && !s.is_revoked
    );

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

  public async setMonthCover(userId: string, year: number, month: number, photoId: string): Promise<boolean> {
    const photo = await this.getPhotoById(userId, photoId);
    if (!photo || photo.year !== year || photo.month !== month) return false;

    const prefKey = `${userId}_${year}_${month}`;
    const existing = this.monthPrefs.get(prefKey) || {
      id: `pref_${year}_${month}_${Date.now()}`,
      user_id: userId,
      year,
      month,
      visibility: 'private',
    };

    existing.cover_photo_id = photoId;
    this.monthPrefs.set(prefKey, existing);
    return true;
  }

  public async getFlashback(userId: string, month: number): Promise<FlashbackSummary> {
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
      const photos = yearMap.get(yr)!.sort((a, b) => new Date(b.captured_at).getTime() - new Date(a.captured_at).getTime());
      const days = new Set(photos.map(p => p.day));
      const prefKey = `${userId}_${yr}_${month}`;
      const pref = this.monthPrefs.get(prefKey);
      const cover = photos.find(p => p.id === pref?.cover_photo_id) || photos.find(p => p.is_cover) || photos[0];

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

  public async createOrGetShareLink(userId: string, year: number, month: number): Promise<ShareLink> {
    const existing = Array.from(this.shareLinks.values()).find(
      s => s.user_id === userId && s.year === year && s.month === month && !s.is_revoked
    );
    if (existing) return existing;

    const token = `${getMonthName(month).toLowerCase()}-${year}-${Math.random().toString(36).substring(2, 10)}`;
    const newLink: ShareLink = {
      id: `share_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      user_id: userId,
      year,
      month,
      token,
      is_revoked: false,
      created_at: new Date().toISOString(),
      access_count: 0,
    };
    this.shareLinks.set(token, newLink);
    return newLink;
  }

  public async revokeShareLink(userId: string, token: string): Promise<boolean> {
    const link = this.shareLinks.get(token);
    if (!link || link.user_id !== userId) return false;
    link.is_revoked = true;
    this.shareLinks.set(token, link);
    return true;
  }

  public async getSharedMonthByToken(token: string): Promise<{ month: MonthSummary; ownerName: string } | null> {
    const link = this.shareLinks.get(token);
    if (!link || link.is_revoked) return null;

    link.access_count += 1;
    const user = this.users.get(link.user_id);
    const monthDetails = await this.getMonthDetails(link.user_id, link.year, link.month);
    if (!monthDetails) return null;

    return {
      month: monthDetails,
      ownerName: user?.name || 'An Archivist',
    };
  }
}

// Global Singleton Database Instance
const globalDb = (global as any).__meta_memory_db || new MemoryDatabase();
if (process.env.NODE_ENV !== 'production') {
  (global as any).__meta_memory_db = globalDb;
}

export const db = globalDb as MemoryDatabase;
