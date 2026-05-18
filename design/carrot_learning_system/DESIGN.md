---
name: Carrot Learning System
colors:
  surface: '#fff8f6'
  surface-dim: '#ead6cd'
  surface-bright: '#fff8f6'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#fff1eb'
  surface-container: '#feeae0'
  surface-container-high: '#f8e4db'
  surface-container-highest: '#f2dfd5'
  on-surface: '#231914'
  on-surface-variant: '#564338'
  inverse-surface: '#3a2e28'
  inverse-on-surface: '#ffede5'
  outline: '#897266'
  outline-variant: '#ddc1b3'
  surface-tint: '#9b4500'
  primary: '#9b4500'
  on-primary: '#ffffff'
  primary-container: '#ff8c42'
  on-primary-container: '#6a2d00'
  inverse-primary: '#ffb68d'
  secondary: '#3c692b'
  on-secondary: '#ffffff'
  secondary-container: '#baeea0'
  on-secondary-container: '#406d2f'
  tertiary: '#00677f'
  on-tertiary: '#ffffff'
  tertiary-container: '#00b9e2'
  on-tertiary-container: '#004556'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdbc9'
  primary-fixed-dim: '#ffb68d'
  on-primary-fixed: '#331200'
  on-primary-fixed-variant: '#763300'
  secondary-fixed: '#bdf1a3'
  secondary-fixed-dim: '#a1d489'
  on-secondary-fixed: '#052100'
  on-secondary-fixed-variant: '#255015'
  tertiary-fixed: '#b7eaff'
  tertiary-fixed-dim: '#4cd6ff'
  on-tertiary-fixed: '#001f28'
  on-tertiary-fixed-variant: '#004e60'
  background: '#fff8f6'
  on-background: '#231914'
  surface-variant: '#f2dfd5'
typography:
  display-lg:
    fontFamily: Be Vietnam Pro
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Be Vietnam Pro
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Be Vietnam Pro
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Be Vietnam Pro
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Be Vietnam Pro
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Be Vietnam Pro
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Be Vietnam Pro
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
  base: 8px
  container-margin: 24px
  gutter: 16px
  stack-sm: 12px
  stack-md: 24px
  stack-lg: 48px
---

## Brand & Style

This design system centers on a "Sophisticated Minimalist" aesthetic tailored for focused language acquisition. It intentionally avoids the saturated colors and rounded mascots typical of the category, opting instead for a professional, editorial feel that treats the user as a serious student rather than a casual player.

The brand personality is **Intellectual, Precise, and Encouraging**. It leverages heavy whitespace to reduce cognitive load during complex character recognition (Kanji/Kana) and utilizes high-contrast typography to ensure content clarity. Visual interest is generated through geometric balance and a refined color palette rather than decorative illustration.

## Colors

The palette is anchored by **Refined Orange (#FF8C42)**, used sparingly for primary actions and progress indicators. **Balanced Green (#7FB069)** serves as a functional accent for success states and secondary navigational elements, providing a natural, harmonious contrast.

The foundation of the UI relies on a scale of warm grays and off-whites to maintain a clean environment. Text is rendered in a deep charcoal (#1A1A1A) rather than pure black to reduce eye strain. Borders are kept extremely light (#E5E5E5) to define structure without creating visual noise.

## Typography

**Be Vietnam Pro** is the sole typeface, chosen for its contemporary geometric construction and exceptional legibility at small sizes. 

- **Hierarchy:** Use bold weights (700) for Japanese characters to ensure stroke clarity.
- **Rhythm:** Scale font sizes conservatively. Body text is slightly enlarged (18px for body-lg) to accommodate the visual complexity of Kanji.
- **Spacing:** Tighten letter-spacing on display styles for a more "designed" editorial appearance; increase it slightly for labels to improve scanability.

## Layout & Spacing

The design system employs an **8px base grid** with a fluid-width philosophy for mobile and a centered, fixed-width column for desktop (max-width: 1100px). 

Layouts should prioritize vertical rhythm. Use 48px (stack-lg) to separate major content sections and 24px (stack-md) for internal component spacing. This generous use of "air" prevents the app from feeling overwhelming during intense study sessions. Content should be inset with a minimum 24px margin on mobile devices to maintain a premium, framed feel.

## Elevation & Depth

This design system utilizes **Tonal Layers** supplemented by **Ambient Shadows**. Most surfaces sit on a Flat plane (Level 0), using subtle #F9F9F9 fills to distinguish containers. 

When elevation is required (e.g., active cards or primary buttons), use a highly diffused shadow: 
- **Soft Shadow:** `0px 4px 20px rgba(0, 0, 0, 0.05)`
- **Interaction Shadow:** `0px 8px 30px rgba(255, 140, 66, 0.15)` (specifically for primary orange elements).

Avoid heavy dropshadows or inner glows. Depth should feel like layers of high-quality paper stacked cleanly.

## Shapes

The shape language follows a **Medium (ROUND_EIGHT)** logic. This 8px (0.5rem) base radius provides a friendly, modern approachable feel without appearing juvenile or "bubbly."

- **Cards & Inputs:** 8px (0.5rem)
- **Modals & Large Containers:** 16px (1rem)
- **Tags & Status Badges:** 24px (1.5rem) for a pill-shaped effect.

Iconography should follow a linear, 2px stroke weight with slight rounding on terminals to match the component radius.

## Components

### Buttons
- **Primary:** Solid #FF8C42 with white text. 8px radius. Medium shadow on hover.
- **Secondary:** Transparent with #FF8C42 border (1px) and text.
- **Ghost:** Minimal padding, charcoal text, no background until interaction.

### Inputs & Selection
- **Text Fields:** 1px #E5E5E5 border, 8px radius. On focus, the border transitions to #FF8C42.
- **Selection Chips:** Used for multiple-choice Kanji. Light gray fill, transitioning to #7FB069 with a white tick icon upon correct selection.

### Learning Cards
- Cards must use a white background and a 1px #E5E5E5 border. 
- Headlines within cards should use `headline-md` for English and `display-lg` for Japanese characters to emphasize the subject matter.

### Progress Indicators
- Linear progress bars using a 4px height. The track is a light gray (#F0F0F0) and the indicator uses the Secondary Green (#7FB069) to symbolize growth and success.