# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Next.js 14+ (App Router), React 18/19, TypeScript, Tailwind CSS with custom editorial design tokens, Lucide Icons, date-fns, exifr (EXIF metadata parsing), Supabase/PostgreSQL schema with local fallback engine and Cloudflare R2/S3 storage abstraction.

## Users

Individuals and families who take many photographs and desire a calm, permanent, beautifully organized memory archive. Rather than drowning in endless camera rolls or cold technical cloud folders, users want to experience their life chronologically by month and rediscover how life felt across the same season in different years.

## Product Purpose

MetaMemoryAlbum transforms photo uploads into a living, chronological memory archive organized strictly by original capture date (User → Year → Month → Memories). It prioritizes emotional nostalgia, visual storytelling, and intentional sharing over cold file management.

## Positioning

Unlike conventional cloud storage clones (Dropbox, Google Drive, iCloud) that treat images as generic files with storage quotas and folder trees, MetaMemoryAlbum is an editorial memory journal with automatic chronological categorization and the signature **Flashback** lens (revisiting the same month across multiple years).

## Operating Context

- Mobile and desktop web browsers.
- Quick drag-and-drop ingestion from laptops or mobile photo rolls.
- Re-visiting memories during quiet moments of reflection.
- Sharing private, curated month albums with close friends and family without requiring accounts or exposing entire libraries.

## Capabilities and Constraints

- **EXIF Extraction & Auto-Categorization:** Ingested images extract `DateTimeOriginal` to derive Year and Month automatically.
- **Hierarchical Memory Stream:** Dashboard presents chronological year/month flow with featured covers, memory counts, and day groupings.
- **Month Detail & Asymmetric Gallery:** Immersive editorial gallery preserving true aspect ratios (landscape, portrait, square) without aggressive uniform square cropping.
- **Photo Lightbox:** Full-screen focused viewer with keyboard navigation, metadata display (date, location, dimensions), and quick favorite toggling.
- **Flashback Mode:** Signature cross-year comparative view (e.g., all Augusts across 2026, 2025, 2024, 2023).
- **Secure Granular Sharing:** Tokenized standalone shareable URLs (`/share/[token]`) with private/shared visibility controls and revocation.
- **Favorites & Search:** Chronological favorites stream and instant search by year, month, tag, or caption.
- **Security & Privacy:** Row-level ownership validation, no client-side user spoofing, safe image serving, no invasive trackers or AI slop.

## Brand Commitments

- **Name:** MetaMemoryAlbum
- **Voice:** Calm, cinematic, refined, human, confident, slightly poetic.
- **Visual Identity:** Modern archivist aesthetic inspired by Google Stitch ("Meta Memory Archive") and Impeccable craft floor. Deep obsidian charcoal dark mode (`#010101`, `#151310`), warm paper light mode (`#FDFBF7`, `#F4EFE6`), crisp 1px borders (`#33312E` / `#E2DCD5`), authoritative EB Garamond display serifs, clinical Inter body, precision JetBrains Mono metadata, and precious amber gold leaf accent (`#FFC107`).
- **Anti-patterns Banned:** No generic AI purple-blue gradients, no floating Material cards, no glassmorphism everywhere, no cheesy sparkles, no fake testimonials.

## Evidence on Hand

- Google Stitch project `1794223935141515318` ("Meta Memory Archive") tokens, layouts, and screen specifications.
- Master Product Prompt specification defining all 86 core requirements and domain models.

## Product Principles

1. **Memory Over File Storage:** Optimize for storytelling, chronology, and emotional resonance rather than technical disk quotas and nested folders.
2. **True Time Capture:** The original moment the shutter clicked (`captured_at` from EXIF) dictates chronological placement, never upload date.
3. **Editorial Quiet Luxury:** The UI recedes to let the photographs lead; visual hierarchy is crafted through razor-thin borders, tonal stacking, and authoritative typography rather than noisy shadows.
4. **Private By Default:** Every photograph belongs strictly to its owner; sharing is an explicit, revocable, isolated act.
5. **No AI Gimmicks:** Build rock-solid consumer memory discovery before introducing synthetic enhancements.

## Accessibility & Inclusion

- WCAG AA contrast compliance across both dark and light modes.
- Full keyboard navigation for gallery grids, lightboxes, and modals.
- Respect for `prefers-reduced-motion`.
- Explicit ARIA attributes on icon controls, photo dialogs, and interactive carousels.
