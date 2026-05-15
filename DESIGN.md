# Design System: MetaMemory Precision System

<!-- impeccable:design-schema 1 -->

## Design North Star
"A modern memory archive."
An editorial consumer web application blending timeless typography, meticulous tonal stacking, razor-thin borders, and restrained amber accents. The interface recedes into a calm, cinematic, and authoritative backdrop that makes personal photography shine with dignity.

## Color Tokens

### Dark Mode (Primary Canvas)
- `--background`: `#010101` (Deep obsidian black canvas)
- `--foreground`: `#F9F9F9` (Clinical high-contrast white)
- `--surface`: `#121414` (Deep charcoal canvas surface)
- `--surface-raised`: `#151310` (Warm obsidian container surface)
- `--surface-overlay`: `#22201D` (Elevated modal/dropdown surface)
- `--surface-container-high`: `#282A2B`
- `--border`: `#33312E` (Crisp 1px muted bronze-charcoal border)
- `--border-subtle`: `#22201D` (Hairline partition)
- `--border-active`: `#FFC107` (1px focused Amber border)
- `--muted`: `#1E2020`
- `--muted-foreground`: `#CBC5C0` / `#9C8F78` (Refined warm grey)
- `--accent`: `#FFC107` (Precious amber / gold leaf)
- `--accent-foreground`: `#010101` (Deep obsidian black on accent)
- `--danger`: `#FFB4AB` / `#BA1A1A`
- `--success`: `#7FFC97` / `#006C2D`

### Light Mode (Warm Paper)
- `--background`: `#FDFBF7` (Soft warm paper canvas)
- `--foreground`: `#1A1C1C` (Deep charcoal black)
- `--surface`: `#F7F4EE` (Warm ivory card surface)
- `--surface-raised`: `#FFFFFF` (Crisp pure white elevated container)
- `--surface-overlay`: `#FFFFFF`
- `--border`: `#E5DFD7` (Hairline warm neutral border)
- `--border-subtle`: `#EFEAE2`
- `--border-active`: `#D97706` / `#FFC107`
- `--muted`: `#F0EAE1`
- `--muted-foreground`: `#6E6A64`
- `--accent`: `#B45309` / `#FFC107`
- `--accent-foreground`: `#FFFFFF` / `#010101`

## Typography Hierarchy

1. **Display & Storytelling (`font-display` / `font-serif`):**
   - Family: `EB Garamond`, Georgia, serif
   - Display LG: `64px` / `72px`, tracking `-0.02em`, weight `500`
   - Headline LG: `40px` / `48px`, weight `400`
   - Headline MD: `24px` / `32px`, weight `400`
2. **UI & Navigation (`font-sans`):**
   - Family: `Inter`, -apple-system, sans-serif
   - Body LG: `18px` / `28px`, weight `400`
   - Body MD: `16px` / `24px`, weight `400`
   - Body SM: `14px` / `20px`, weight `400` / `500`
3. **Data, Timestamps & Archival Metadata (`font-mono`):**
   - Family: `JetBrains Mono`, monospace
   - Label SM: `12px` / `16px`, tracking `0.05em`, uppercase, weight `500`
   - Label XS: `10px` / `14px`, tracking `0.05em`, uppercase, weight `500`

## Elevation & Depth (Zero Drop Shadows)
- **Forbidden:** No large blurry drop shadows or Material floating cards.
- **Allowed:**
  - Tonal Layering: Canvas (`#010101`) → Container (`#151310`) → Overlay (`#22201D`).
  - 1px Precise Borders: `#33312E` default, `#FFC107` active/hover.
  - Opacity hierarchy (100% active, 60% secondary, 35% tertiary).

## Shapes & Geometry
- **Border Radius:** Sharp `0px` for buttons, chips, tags, inputs, and memory vault containers; selective `2px`–`4px` for image frames where soft corners prevent harsh clipping.
- **Stroke Weights:** Strict 1px consistent stroke everywhere.

## Spacing System
- 4px baseline grid (`4px`, `8px`, `12px`, `16px`, `24px`, `32px`, `48px`, `64px`, `80px`).
- Desktop max-width: `1440px`.
- Desktop gutters: `24px`–`64px`.
- Section gaps: `80px` for generous editorial breathing room.

## Motion & Transitions
- Transition speeds: `150ms`–`300ms` with `ease-out`.
- Image hover: subtle scale `scale-[1.02]` with opacity lift.
- Lightbox reveal: crisp backdrop fade with zero spring bounce.
- All animations respect `prefers-reduced-motion: reduce`.

## Anti-AI-Slop Bans
- ❌ NO purple/indigo gradient hero sections
- ❌ NO generic SaaS 3-column pill cards
- ❌ NO glassmorphism everywhere (`backdrop-blur` with heavy white opacity)
- ❌ NO AI sparkle icons (`✨`) or fake hype copy
- ❌ NO uniform square cropping on every memory thumbnail
