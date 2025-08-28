# Typography Recommendations for Decky Landing Page

## Current Typography

- **Primary Font**: Inter (Google Fonts)
- **Usage**: Clean, modern, excellent readability

## Alternative Google Font Pairings

### Option 1: Professional & Modern

```css
/* Primary: Inter (Headlines & Body) */
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap");

/* Accent: Manrope (CTAs & Features) */
@import url("https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap");
```

**Best for**: SaaS, Tech companies
**Character**: Clean, geometric, highly readable

### Option 2: Elegant & Trustworthy

```css
/* Primary: DM Sans (Headlines) */
@import url("https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap");

/* Secondary: Inter (Body text) */
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap");
```

**Best for**: Professional services, B2B
**Character**: Sophisticated, approachable, excellent legibility

### Option 3: Creative & Engaging

```css
/* Primary: Outfit (Headlines) */
@import url("https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap");

/* Secondary: Inter (Body text) */
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap");
```

**Best for**: Creative agencies, Design tools
**Character**: Modern, friendly, slightly playful

### Option 4: Bold & Impactful

```css
/* Primary: Space Grotesk (Headlines) */
@import url("https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap");

/* Secondary: Inter (Body text) */
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap");
```

**Best for**: Startups, Innovation-focused
**Character**: Distinctive, modern, tech-forward

### Option 5: Minimal & Refined

```css
/* Primary: Satoshi (Headlines) - via CDN or self-hosted */
/* Alternative: Work Sans */
@import url("https://fonts.googleapis.com/css2?family=Work+Sans:wght@400;500;600;700;800&display=swap");

/* Secondary: Inter (Body text) */
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap");
```

**Best for**: Minimalist brands, Design-focused
**Character**: Clean, neutral, highly functional

## Implementation Guide

### Step 1: Update globals.css

```css
/* Replace the existing Inter import with your chosen combination */
@import url("https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap");
```

### Step 2: Update Tailwind Config

```typescript
// tailwind.config.ts
fontFamily: {
  'primary': ['DM Sans', 'sans-serif'],    // For headlines
  'secondary': ['Inter', 'sans-serif'],     // For body text
  'mono': ['JetBrains Mono', 'monospace'], // For code
},
```

### Step 3: Apply in Components

```typescript
// Headlines
className = "font-primary font-bold text-4xl";

// Body text
className = "font-secondary text-base";

// CTAs
className = "font-primary font-semibold text-lg";
```

## Typography Hierarchy (Current Implementation)

### Headlines

- **Hero H1**: `text-4xl md:text-6xl lg:text-7xl font-bold`
- **Section H2**: `text-4xl md:text-5xl font-bold`
- **Feature H3**: `text-xl font-bold`

### Body Text

- **Large**: `text-xl` (Subtitles, important descriptions)
- **Regular**: `text-base` (Standard body text)
- **Small**: `text-sm` (Supporting text, metadata)

### Font Weights

- **Bold**: `font-bold` (700) - Headlines, CTAs
- **Semibold**: `font-semibold` (600) - Subheadings, buttons
- **Medium**: `font-medium` (500) - Navigation, labels
- **Regular**: `font-normal` (400) - Body text

## Accessibility Considerations

### Contrast Ratios

- Ensure minimum 4.5:1 contrast ratio for normal text
- Ensure minimum 3:1 contrast ratio for large text (18px+ or 14px+ bold)
- Current implementation meets WCAG AA standards

### Font Sizes

- Minimum 16px for body text on mobile
- Scalable units (rem/em) for better accessibility
- Line height 1.5+ for readability

### Font Loading

- Use `font-display: swap` for better performance
- Preload critical fonts
- Fallback to system fonts

## Performance Tips

### Font Loading Strategy

```css
/* Preload critical fonts */
<link rel="preload" href="font.woff2" as="font" type="font/woff2" crossorigin>

/* Use font-display: swap */
@font-face {
  font-family: "CustomFont";
  src: url("font.woff2") format("woff2");
  font-display: swap;
}
```

### Subsetting

- Only load required font weights (400, 500, 600, 700)
- Use Google Fonts API parameters: `&text=` for specific characters
- Consider variable fonts for better performance

## Recommended: Option 2 (DM Sans + Inter)

For Decky, I recommend **Option 2** because:

- DM Sans provides excellent readability for headlines
- Inter is perfect for body text and UI elements
- Both fonts are optimized for digital interfaces
- Great contrast between headline and body fonts
- Professional appearance suitable for B2B audience
- Excellent performance and loading characteristics
