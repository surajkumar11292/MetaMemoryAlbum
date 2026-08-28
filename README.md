# MetaMemoryAlbum

> *Your life, remembered month by month.*

MetaMemoryAlbum is an editorial personal photo-memory web application designed around the core hierarchy:
**User → Year → Month → Memories**.

Photographs are automatically organized by the photo's original EXIF capture timestamp (`DateTimeOriginal`), enabling effortless rediscovery of past seasons and comparative multi-year reflection via the signature **Flashback** lens.

---

## Key Features

1. **Editorial Memory Archiving**: High-contrast, calm, quiet-luxury aesthetic inspired by the Google Stitch *Meta Memory Archive* design system.
2. **True Time Chronology**: Automatic extraction of camera EXIF timestamps, GPS coordinates, dimensions, and apparatus specs (`exifr`), grouping moments into monthly vaults.
3. **The Flashback Lens**: Compare how life looked in the exact same month (e.g. August) across multiple years (2026, 2025, 2024, 2023) side-by-side.
4. **Asymmetric Editorial Gallery**: Masonry layout that preserves authentic photograph aspect ratios (portrait, landscape, square) with optional day groupings.
5. **Full-Screen Lightbox**: Keyboard-navigated viewer (`←`, `→`, `ESC`, `F`) with dedicated EXIF inspector panel, cover selector, and note editor.
6. **Granular Private Sharing**: Isolated tokenized share URLs (`/share/[token]`) allowing view-only access to a specific month without exposing accounts or other archives.
7. **Favorites & Fast Discovery**: Chronological starred stream and instant search by year, month, location, camera, or caption.
8. **Dual Palette**: Obsidian Charcoal Dark mode & Warm Paper Light mode.

---

## Technology Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript (Strict)
- **Styling**: Tailwind CSS with custom editorial design tokens
- **Typography**: EB Garamond (display headers), Inter (UI body), JetBrains Mono (metadata)
- **Icons**: Lucide React (1px hairline stroke)
- **EXIF Extraction**: `exifr`
- **Database & Storage**: Dual architecture supporting in-memory/file local engine + Supabase PostgreSQL with complete SQL migrations (`supabase/migrations/001_initial_schema.sql`).

---

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Development Server
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to explore the application.

### 3. Build for Production
```bash
npm run build
```
