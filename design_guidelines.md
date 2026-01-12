# Full Loop Report Landing Page - Design Guidelines

## Design Approach: Premium Dark Landing Page

**Rationale**: Landing page for Full Loop Report requires elevated visual design to convert visitors while maintaining sophisticated, professional aesthetic. Dark theme with subtle gradients creates premium feel appropriate for enterprise field management software.

**Visual Treatment Note**: Dark theme with subtle gradients throughout (specific color values defined separately).

## Typography

**Font Family**: Inter (via Google Fonts CDN) - modern, professional alternative to Roboto
- Hero Display: Inter Bold, 56px (mobile: 36px) - Main headline
- Section Headers: Inter SemiBold, 40px (mobile: 28px) - Feature sections
- Subheadings: Inter Medium, 24px (mobile: 20px) - Supporting headlines
- Body Large: Inter Regular, 18px - Feature descriptions, CTAs
- Body: Inter Regular, 16px - Secondary content
- Caption: Inter Regular, 14px - Fine print, labels

## Layout System

**Spacing Units**: Tailwind units of 4, 8, 12, 16, 20 (for generous landing page spacing)

**Container Strategy**:
- Max width: max-w-7xl with px-4 (mobile) to px-8 (desktop)
- Section padding: py-20 (desktop), py-12 (mobile)
- Generous whitespace between elements: space-y-8 to space-y-12

## Landing Page Structure

### 1. Hero Section (80vh minimum)
**Layout**: Two-column split (lg:grid-cols-2) on desktop, stacked on mobile
- Left column: Headline, subheadline (max-w-xl), dual CTA buttons (primary + secondary), trust indicator ("Trusted by 500+ field teams")
- Right column: Hero image/product screenshot with subtle glow effect, rounded-2xl, shadow-2xl
- Background: Subtle radial gradient overlay from top
- Buttons on blurred backdrop if over image area

### 2. Social Proof Bar (h-20)
**Layout**: Horizontal scroll on mobile, flex row on desktop
- Logo cloud: 5-6 client logos, grayscale with opacity, hover brightens
- Centered, even spacing with gap-12

### 3. Features Grid (py-24)
**Layout**: Three-column grid (lg:grid-cols-3, md:grid-cols-2, grid-cols-1), gap-8
- Six feature cards total
- Each card: Icon (32px Material Icons), heading, description, subtle hover lift
- Cards with rounded-xl, p-8, backdrop blur effect, border with gradient

### 4. Product Showcase (py-24)
**Layout**: Alternating two-column sections (3 total showcases)
- Image left, content right (then reverse, then left again)
- Large screenshot (w-full, rounded-xl, shadow-2xl)
- Content: Badge label, heading, bullet points, supporting text
- Mobile: Stack image above content

### 5. Statistics/Impact Section (py-20)
**Layout**: Four-column grid (lg:grid-cols-4, sm:grid-cols-2)
- Large numbers (Inter Bold, 48px), labels below
- Centered alignment, minimal decoration
- Subtle separators between columns on desktop

### 6. Testimonials (py-24)
**Layout**: Three-column grid (lg:grid-cols-3, md:grid-cols-2)
- Cards with quote, author photo (rounded-full, w-12, h-12), name, role, company
- Staggered heights for visual interest
- Card styling matches feature cards

### 7. Final CTA Section (py-32)
**Layout**: Centered, max-w-3xl
- Large headline, supporting text, dual CTAs
- Optional: Background with subtle pattern or image with heavy overlay
- Generous padding, stands alone visually

### 8. Footer (py-16)
**Layout**: Four-column grid (lg:grid-cols-4, md:grid-cols-2) plus bottom bar
- Columns: Product links, Company links, Resources, Contact/Newsletter signup
- Bottom bar: Copyright, social icons, legal links
- Full-width separator line above footer

## Component Library

### Buttons
**Primary**: h-12, px-8, rounded-lg, font-medium, w-full (mobile) or w-auto (desktop)
**Secondary**: h-12, px-8, rounded-lg, border-2, font-medium
**Blurred backdrop**: When over images, bg with blur-md and bg-opacity-20

### Cards
**Feature/Testimonial Cards**: rounded-xl, p-8, backdrop-blur-sm, border with gradient, hover:translate-y-[-4px] transition
**Product Cards**: rounded-2xl, overflow-hidden, shadow-2xl for screenshots

### Badges/Labels
**Status/Category**: rounded-full, px-4, py-1, text-sm, font-medium, uppercase tracking-wide

### Form Elements (Newsletter/Contact)
**Input Fields**: h-12, rounded-lg, px-4, border-2, focus:ring-2
**Submit Buttons**: Matches primary button style

## Images

### Hero Image
Large product screenshot or field worker using app on tablet (professional, high-quality). Position: Right side of hero section, w-full on mobile, 50% width on desktop. Treatment: rounded-2xl, shadow-2xl with subtle glow effect.

### Product Showcase Images
Three high-quality screenshots showing key features: violation logging interface, dashboard view, reporting screen. Each full-width within column, rounded-xl, shadow-xl.

### Testimonial Photos
Three authentic team photos (headshots), circular crop, professional quality.

### Optional Background Textures
Subtle grid patterns or geometric shapes for section backgrounds (very low opacity).

## Interactive Elements

**Hover States**: Subtle scale (scale-105) or translate-y for cards, brightness increase for images
**Scroll Animations**: Fade-in-up for section entrances (keep minimal, not every element)
**Blur Effects**: Strategic backdrop blur on cards and buttons over images
**Smooth Transitions**: transition-all duration-300 for interactive elements

## Accessibility

- Maintain 4.5:1 contrast minimum (critical on dark theme)
- All interactive elements h-12 minimum
- Focus rings: ring-2 ring-offset-2 for keyboard navigation
- Alt text for all images
- Semantic HTML structure (header, main, sections, footer)
- Skip to content link at top
- Screen reader labels for icon-only elements

**Critical**: Every section purposeful and complete. No sparse, single-element sections. Rich, comprehensive landing experience that demonstrates enterprise-grade quality.