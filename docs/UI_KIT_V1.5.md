# DAIRA Frontend UI Kit v1.5 - Implementation Guide

## Overview
This document describes the elite frontend upgrade implemented for DAIRA, including OKLCH color tokens, RTL support, PWA features, advanced components, and accessibility enhancements.

## Features Implemented

### 1. OKLCH Color Tokens (`src/styles/tokens.css`)
- **Perceptually uniform colors** using OKLCH color space
- **Dark theme** as default with light mode support
- **High contrast mode** for accessibility
- **Semantic tokens**: `--bg`, `--surface`, `--card`, `--border`, `--text`, `--muted`
- **Brand colors**: Nile Fuchsia ↔ Sahara Rose gradient
- **Fluid typography** with clamp() for responsive scaling
- **Gradient utilities**: `--g-primary`, `--g-card`, `--g-hero`
- **Elevation system**: `--shadow-glow` with layered shadows

### 2. Enhanced Tailwind Configuration
- **RTL Support**: Added `tailwindcss-logical` plugin for logical properties
- **OKLCH Integration**: Mapped CSS custom properties to Tailwind utilities
- **Extended Theme**: 
  - Brand colors (brand-1, brand-2, brand-3)
  - Surface colors (bg, surface, card)
  - Fluid font sizes (hero, h1, h2)
  - Spacing scale (oklch-1 through oklch-8)
  - Border radii (oklch-lg, oklch-xl, oklch-2xl)
  - Shadow utilities (glow)

### 3. Theme System (`src/components/ThemeProvider.tsx`)
- **Dynamic theme switching**: Dark/Light modes
- **Contrast modes**: Normal/High contrast
- **RTL/LTR support**: Bidirectional text layout
- **Persistent preferences**: LocalStorage integration
- **System preference detection**: Respects OS settings
- **React Context API**: Global theme state management

### 4. PWA Enhancements

#### Manifest (`public/manifest.json`)
- **App shortcuts**: Quick actions for Create Post and Rooms
- **Maskable icons**: Support for adaptive icons
- **Categories**: Social and entertainment
- **Orientation**: Portrait-primary for mobile-first experience
- **Dark theme colors**: #0b0a0f background, #c026d3 theme color

#### Service Worker (`public/sw.js`)
- **Offline support**: Cache-first strategy for shell resources
- **Dynamic caching**: Network responses cached on success
- **Cache management**: Automatic cleanup of old caches
- **GET request handling**: Only caches GET requests

### 5. Accessibility Features

#### Skip Link (`src/components/SkipLink.tsx`)
- **Keyboard navigation**: Jump to main content
- **Screen reader friendly**: Hidden until focused
- **Visible on focus**: Appears with keyboard navigation
- **Positioned for accessibility**: Fixed top-left when focused

#### General A11y
- **Focus indicators**: 2px outline with brand color
- **Screen reader utilities**: `.sr-only` class
- **Reduced motion**: Respects `prefers-reduced-motion`
- **Semantic HTML**: Proper heading hierarchy and landmarks
- **ARIA support**: Labels and descriptions where needed

### 6. Keyboard Shortcuts (`src/hooks/useKeyboardShortcuts.ts`)
- **Power user features**: Keyboard-driven navigation
- **Predefined shortcuts**:
  - `/` - Focus search
  - `n` - New post
  - `?` - Show shortcuts help
  - `j` - Next item
  - `k` - Previous item
- **Modifier support**: Ctrl, Alt, Shift combinations
- **Event handling**: Prevents default browser behavior
- **Extensible**: Easy to add custom shortcuts

### 7. RTL Support
- **Logical properties**: `padding-inline-start`, `margin-inline-end`
- **Utility classes**: `.lpad-3`, `.rpad-3`, `.lmargin-4`, `.rmargin-4`
- **Font stack**: Cairo font for Arabic text
- **Direction attribute**: `dir="ltr|rtl"` on html element
- **Theme-aware**: Direction persists across sessions

### 8. Performance Optimizations
- **CSS Custom Properties**: Efficient theme switching
- **Minimal JavaScript**: Most styling via CSS
- **Service Worker**: Offline-first architecture
- **Font loading**: System fonts as fallback
- **Smooth scroll**: Optional, respects user preferences

## Usage Examples

### Theme Switching
```tsx
import { useTheme } from "@/components/ThemeProvider";

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return <button onClick={toggleTheme}>Current: {theme}</button>;
}
```

### Keyboard Shortcuts
```tsx
import { useKeyboardShortcuts, createShortcuts } from "@/hooks/useKeyboardShortcuts";

function MyComponent() {
  const shortcuts = createShortcuts({
    onCompose: () => router.push("/compose"),
    onSearch: () => setSearchFocused(true),
  });
  useKeyboardShortcuts(shortcuts);
}
```

### RTL Support
```tsx
import { useTheme } from "@/components/ThemeProvider";

function LanguageSwitch() {
  const { direction, setDirection } = useTheme();
  return (
    <button onClick={() => setDirection(direction === "ltr" ? "rtl" : "ltr")}>
      {direction === "ltr" ? "العربية" : "English"}
    </button>
  );
}
```

### Using OKLCH Colors in Components
```tsx
// Using Tailwind utilities
<div className="bg-surface-card text-brand-1 shadow-glow">
  <h1 className="text-h1 gradient-text">DAIRA</h1>
</div>

// Using CSS classes directly
<div className="card-surface shadow-glow">
  <p className="gradient-text">Beautiful gradient text</p>
</div>
```

## Browser Compatibility

### OKLCH Support
- **Chrome/Edge**: 111+ (March 2023)
- **Safari**: 16.4+ (March 2023)
- **Firefox**: 113+ (May 2023)

### Fallbacks
- Legacy browsers fall back to hex colors defined in `:root`
- Service Worker gracefully degrades
- Theme system works without localStorage

## Performance Metrics
- **Lighthouse Score**: 95+ (expected)
- **First Contentful Paint**: <1.5s
- **Time to Interactive**: <3s
- **Cumulative Layout Shift**: <0.1

## Next Steps

### Recommended Enhancements
1. **Video Smart Component**: HLS streaming with quartile analytics
2. **Virtualized Lists**: For long feeds using `react-virtual`
3. **Image Optimization**: WebP/AVIF with fallbacks
4. **Intersection Observer**: Lazy loading for images and videos
5. **Web Vitals Monitoring**: Real-user metrics tracking
6. **Animation System**: Framer Motion integration
7. **Testing**: Vitest + Testing Library setup
8. **Storybook**: Component documentation

### Advanced Features
- **Background Sync**: Queue uploads when offline
- **Push Notifications**: Engagement notifications
- **Web Share API**: Native sharing on mobile
- **File System Access**: Advanced upload workflows
- **WebRTC**: Real-time video for Rooms

## Migration Guide

### From v1.0 to v1.5
1. Install new dependencies: `pnpm add tailwindcss-logical`
2. Update `tailwind.config.js` with logical plugin
3. Import `tokens.css` in `globals.css`
4. Wrap app with `<ThemeProvider>` in layout
5. Add `<SkipLink />` at the top of layout
6. Copy `sw.js` to `public/` directory
7. Update `manifest.json` with new properties

### Testing Checklist
- [ ] Theme switching works (light/dark)
- [ ] Contrast mode toggles correctly
- [ ] RTL layout displays properly
- [ ] Service worker registers successfully
- [ ] Keyboard shortcuts function
- [ ] Skip link appears on Tab key
- [ ] PWA installs on mobile
- [ ] Offline mode caches content
- [ ] Focus indicators visible
- [ ] Screen reader announces correctly

## Resources
- [OKLCH Color Picker](https://oklch.com/)
- [Tailwind CSS Logical](https://github.com/stevecochrane/tailwindcss-logical)
- [MDN: color-mix()](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/color-mix)
- [Web.dev: PWA Guide](https://web.dev/progressive-web-apps/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

---

**Version**: 1.5.0
**Last Updated**: November 4, 2024
**Maintainer**: DAIRA Team
