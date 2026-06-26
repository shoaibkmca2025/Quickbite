---
name: QuickBite Narrative
colors:
  surface: '#f9f9f9'
  surface-dim: '#dadada'
  surface-bright: '#f9f9f9'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f3f3'
  surface-container: '#eeeeee'
  surface-container-high: '#e8e8e8'
  surface-container-highest: '#e2e2e2'
  on-surface: '#1a1c1c'
  on-surface-variant: '#5b4038'
  inverse-surface: '#2f3131'
  inverse-on-surface: '#f1f1f1'
  outline: '#8f7067'
  outline-variant: '#e4beb3'
  surface-tint: '#ae3200'
  primary: '#ae3200'
  on-primary: '#ffffff'
  primary-container: '#ff5a1f'
  on-primary-container: '#541400'
  inverse-primary: '#ffb59e'
  secondary: '#5f5e5e'
  on-secondary: '#ffffff'
  secondary-container: '#e2dfde'
  on-secondary-container: '#636262'
  tertiary: '#006d37'
  on-tertiary: '#ffffff'
  tertiary-container: '#1ba75a'
  on-tertiary-container: '#003216'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdbd0'
  primary-fixed-dim: '#ffb59e'
  on-primary-fixed: '#3a0b00'
  on-primary-fixed-variant: '#852400'
  secondary-fixed: '#e5e2e1'
  secondary-fixed-dim: '#c8c6c5'
  on-secondary-fixed: '#1c1b1b'
  on-secondary-fixed-variant: '#474746'
  tertiary-fixed: '#7efba4'
  tertiary-fixed-dim: '#61de8a'
  on-tertiary-fixed: '#00210c'
  on-tertiary-fixed-variant: '#005228'
  background: '#f9f9f9'
  on-background: '#1a1c1c'
  surface-variant: '#e2e2e2'
typography:
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 40px
    fontWeight: '800'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '700'
    lineHeight: 28px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px
  container-margin: 20px
  gutter: 16px
---

## Brand & Style
The design system is anchored in efficiency and appetite-appeal. It balances the urgency of food delivery with the reliability of a high-end logistics service. The aesthetic is **Minimalist with Tactile Accents**, focusing on high-quality food photography as the primary visual driver. By utilizing ample whitespace and a clean, systematic layout, the interface avoids the cluttered feel typical of food aggregators, instead providing a calm, curated browsing experience. The emotional response is one of trust, speed, and culinary excitement.

## Colors
The palette is dominated by **Vibrant Foodie Orange**, a high-energy hue designed to stimulate appetite and drive "Order Now" actions. **Deep Charcoal** provides the structural grounding, used for critical typography and primary navigation elements to ensure maximum legibility and a premium feel. 

Backgrounds utilize a tiered neutral system:
- **Primary Background:** `#F9F9F9` to reduce screen glare and provide a soft canvas for cards.
- **Surface:** Pure white (`#FFFFFF`) for interactive components and content containers to create clear separation.
- **Semantic Colors:** Success Green is reserved for completed states (e.g., "Delivered"), while Warning Yellow indicates active, high-attention states (e.g., "Preparing").

## Typography
This design system utilizes **Plus Jakarta Sans** for its modern, friendly, and highly legible characteristics. The type scale is optimized for rapid scanning on mobile devices. 

- **Headlines:** Use Bold or ExtraBold weights with slight negative letter-spacing to create a strong, "editorial" impact for restaurant names and category titles.
- **Body Text:** Uses a generous 1.5x line height to ensure descriptions are readable even at smaller sizes.
- **Labels:** Medium and SemiBold weights are used for utility text (prices, ratings, delivery times) to ensure they stand out against body copy without requiring excessive scale.

## Layout & Spacing
The layout follows a **Fluid Grid** model with a focus on mobile-first ergonomics.
- **Mobile:** 4-column grid with 20px outside margins. Most cards span the full width or 2 columns in a horizontal scroll.
- **Desktop:** 12-column grid with a max-width of 1280px. Content is centered to maintain focus.
- **Rhythm:** Spacing follows an 8px baseline. Use `lg` (24px) for vertical padding between sections to maintain the "airy," minimalist aesthetic and prevent the aggregator clutter.

## Elevation & Depth
Depth is communicated through **Ambient Shadows** and **Tonal Layering**. 
- **Level 1 (Cards):** Low-opacity, highly diffused shadow (`y: 4, blur: 12, color: rgba(0,0,0,0.04)`) to make restaurant cards appear slightly lifted from the light gray background.
- **Level 2 (Modals/Bottom Sheets):** Medium diffusion (`y: 8, blur: 24, color: rgba(0,0,0,0.08)`) with a dark backdrop blur (`4px`) to focus user attention on the selection process.
- **Interactive States:** On hover or press, cards should slightly increase elevation (shadow depth) rather than changing color, maintaining the tactile feel.

## Shapes
The shape language is **Rounded**, using a consistent 12px (`0.75rem`) radius for standard cards and inputs, and 16px (`1rem`) for large containers like bottom sheets. This "squircle-adjacent" approach makes the UI feel approachable and friendly, mirroring the organic nature of food. Buttons use the same 12px radius to maintain a cohesive structural language across the app.

## Components
- **Buttons:**
  - *Primary:* Orange background, white text. Bold weight. High-contrast and center-aligned.
  - *Secondary:* Deep Charcoal background or 1px border. Used for utility actions like "Add to Cart."
  - *Ghost:* No border or fill; used for "Cancel" or "View Details."
- **Status Badges:** 
  - Pill-shaped with low-opacity background tints (e.g., light green background with dark green text for "Delivered") to ensure they are visible but don't compete with primary actions.
- **Inputs:** 
  - Search bars feature a prominent "magnifying glass" icon and a soft `#F2F2F2` fill rather than a border to appear more integrated into the header.
- **Cards:** 
  - Restaurant cards must have a fixed aspect ratio (16:9) for the hero image. Information (Rating, Distance, Time) is grouped at the bottom with clear iconographic cues.
- **Navigation:**
  - *Customer:* A persistent bottom tab bar with labels. The "Cart" or "Orders" icon features a primary orange notification dot.
  - *Admin/Restaurant:* A collapsed sidebar on tablet/desktop to maximize the dashboard workspace for order management.