# Track 2: Frontend Architecture Implementation (Weeks 1-4)

**Owner:** Frontend Lead + UI/UX
**Timeline:** 28 days (parallel with legal/video tracks)
**Budget:** $0 (all open source)
**Goal:** <100KB bundle, RTL-first Arabic, optimized for 4GB RAM devices

---

## Week 1: Tailwind + Component System

### Day 1-2: Replace Material UI with Tailwind

**Status:** Material UI must be removed (breaks RTL, bloats bundle by 200KB+)

```typescript
// web/tailwind.config.ts
import type { Config } from 'tailwindcss'
import defaultTheme from 'tailwindcss/defaultTheme'
import plugin from 'tailwindcss/plugin'

export default {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './index.html',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#6366F1', // Egyptian Blue
          secondary: '#EC4899', // Vibrant Pink
          accent: '#F59E0B', // Gold
          background: '#0F172A', // Dark
          surface: '#1E293B', // Lighter dark
        },
      },
      fontFamily: {
        // Load Arabic-optimized fonts
        sans: ['Inter', 'Tajawal', ...defaultTheme.fontFamily.sans],
        arabic: ['Tajawal', 'Cairo', 'Simplified Arabic'],
      },
      fontSize: {
        'xs': ['12px', { lineHeight: '16px' }],
        'sm': ['14px', { lineHeight: '20px' }],
        'base': ['16px', { lineHeight: '24px' }],
        'lg': ['18px', { lineHeight: '28px' }],
        'xl': ['20px', { lineHeight: '28px' }],
      },
      spacing: {
        // Add extra spacing for comfortable mobile UI
        '3xs': '4px',
        '2xs': '8px',
        'xs': '12px',
        'sm': '16px',
        'md': '20px',
        'lg': '24px',
        'xl': '32px',
        '2xl': '48px',
      },
      // RTL-friendly utilities
      direction: ['ltr', 'rtl'],
    },
  },
  plugins: [
    // RTL plugin: automatically mirrors margin/padding/etc
    plugin(function ({ addUtilities, e, theme }) {
      const rtlUtilities = {}

      // Mirror margin utilities for RTL
      Object.entries(theme('margin')).forEach(([key, value]) => {
        rtlUtilities[`.rtl .${e(`ml-${key}`).substring(1)}`] = {
          marginLeft: '0',
          marginRight: value,
        }
      })

      addUtilities(rtlUtilities)
    }),
  ],
} satisfies Config
```

**Remove Material UI:**

```bash
# Remove from package.json
npm uninstall @mui/material @mui/icons-material @emotion/react @emotion/styled
```

**Add Tailwind + Radix UI (accessible base components):**

```bash
npm install -D tailwindcss postcss autoprefixer
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-tabs @radix-ui/react-select
npm install clsx tailwind-merge # Utility helpers
```

### Day 2-3: Build Reusable Component Library

**Deliverable:** Core Tailwind components (no Material UI)

```typescript
// web/src/components/ui/Button.tsx
import React from 'react'
import { clsx } from 'clsx'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading,
  children,
  className,
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-semibold transition-colors rounded-lg'

  const variantStyles = {
    primary: 'bg-brand-primary text-white hover:bg-brand-primary/90 disabled:bg-gray-400',
    secondary: 'bg-brand-secondary text-white hover:bg-brand-secondary/90 disabled:bg-gray-400',
    ghost: 'bg-transparent text-brand-primary hover:bg-brand-primary/10',
    danger: 'bg-red-600 text-white hover:bg-red-700 disabled:bg-gray-400',
  }

  const sizeStyles = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  }

  return (
    <button
      className={clsx(
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        isLoading && 'opacity-75 cursor-not-allowed',
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Spinner className="ltr:mr-2 rtl:ml-2" />}
      {children}
    </button>
  )
}

interface SpinnerProps {
  className?: string
}

const Spinner: React.FC<SpinnerProps> = ({ className }) => (
  <svg
    className={clsx('animate-spin h-4 w-4', className)}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
)
```

```typescript
// web/src/components/ui/Card.tsx
import React from 'react'
import { clsx } from 'clsx'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outline'
}

export const Card: React.FC<CardProps> = ({
  variant = 'default',
  className,
  children,
  ...props
}) => {
  const variantStyles = {
    default: 'bg-brand-surface border border-gray-700',
    elevated: 'bg-brand-surface shadow-lg shadow-brand-primary/20',
    outline: 'bg-transparent border border-brand-primary',
  }

  return (
    <div
      className={clsx(
        'rounded-lg p-4',
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
```

```typescript
// web/src/components/ui/Input.tsx
import React from 'react'
import { clsx } from 'clsx'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helper?: string
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helper,
  className,
  id,
  ...props
}) => {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label htmlFor={inputId} className="text-sm font-semibold text-gray-200">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={clsx(
          'px-3 py-2 rounded-lg bg-brand-surface border border-gray-700',
          'text-white placeholder-gray-500',
          'focus:outline-none focus:ring-2 focus:ring-brand-primary',
          error && 'border-red-500 focus:ring-red-500',
          className
        )}
        {...props}
      />
      {error && <p className="text-red-500 text-sm">{error}</p>}
      {helper && <p className="text-gray-500 text-sm">{helper}</p>}
    </div>
  )
}
```

### Day 3-5: RTL Support Architecture

**Deliverable:** RTL-first layout system

```typescript
// web/src/hooks/useRTL.ts
import { useI18n } from 'next-intl'

export const useRTL = () => {
  const i18n = useI18n()
  const locale = i18n.getLocale?.() || 'en'
  return locale.startsWith('ar')
}

// web/src/components/RTLWrapper.tsx
import { ReactNode } from 'react'
import { useRTL } from '../hooks/useRTL'

interface RTLWrapperProps {
  children: ReactNode
}

export const RTLWrapper: React.FC<RTLWrapperProps> = ({ children }) => {
  const isRTL = useRTL()

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} lang={isRTL ? 'ar-EG' : 'en'}>
      {children}
    </div>
  )
}
```

**RTL Component Example:**

```typescript
// web/src/components/Navbar.tsx
import { clsx } from 'clsx'
import { useRTL } from '@/hooks/useRTL'

export const Navbar: React.FC = () => {
  const isRTL = useRTL()

  return (
    <nav className="bg-brand-surface border-b border-gray-700">
      <div className={clsx(
        'flex items-center justify-between px-4 py-3 gap-4',
        'max-w-7xl mx-auto'
      )}>
        {/* Logo - always on left in LTR, right in RTL */}
        <div className={clsx(
          'flex-shrink-0',
          isRTL ? 'order-last' : 'order-first'
        )}>
          <h1 className="text-2xl font-bold text-brand-primary">D-A-I-R-A</h1>
        </div>

        {/* Navigation - flex-row or reversed based on direction */}
        <div className={clsx(
          'flex items-center gap-4',
          isRTL && 'flex-row-reverse'
        )}>
          <NavLink href="/discover">
            {isRTL ? 'اكتشف' : 'Discover'}
          </NavLink>
          <NavLink href="/profile">
            {isRTL ? 'ملفي الشخصي' : 'Profile'}
          </NavLink>
        </div>

        {/* Avatar - right side (always) */}
        <div className={clsx(
          'flex items-center gap-2',
          isRTL && 'flex-row-reverse'
        )}>
          <div className="w-10 h-10 rounded-full bg-brand-primary" />
        </div>
      </div>
    </nav>
  )
}
```

---

## Week 2: Bundle Optimization (<100KB target)

### Day 1-2: Code Splitting & Lazy Loading

**Deliverable:** <100KB initial bundle

```typescript
// web/vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  plugins: [
    react(),
    visualizer({
      open: true,
      gzipSize: true,
      filename: 'dist/stats.html',
    }),
  ],
  build: {
    target: 'es2020',
    rollupOptions: {
      output: {
        // Code splitting strategy
        manualChunks: {
          'vendor': [
            'react',
            'react-dom',
            'next-intl',
          ],
          'ui': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
          ],
          'utils': [
            'axios',
            'zustand',
          ],
        },
      },
    },
    // Minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log in production
      },
    },
  },
})
```

**Lazy Load Routes:**

```typescript
// web/src/router.tsx
import { lazy, Suspense } from 'react'

// Lazy load heavy routes
const DiscoverPage = lazy(() => import('./pages/Discover'))
const ProfilePage = lazy(() => import('./pages/Profile'))
const CreatePage = lazy(() => import('./pages/Create'))

const routes = [
  {
    path: '/',
    element: <HomePage />, // Quick landing page
  },
  {
    path: '/discover',
    element: (
      <Suspense fallback={<LoadingScreen />}>
        <DiscoverPage />
      </Suspense>
    ),
  },
  {
    path: '/profile/:username',
    element: (
      <Suspense fallback={<LoadingScreen />}>
        <ProfilePage />
      </Suspense>
    ),
  },
]
```

**Font Subsetting (Critical for Bundle Size):**

```typescript
// web/src/styles/fonts.css

/* Only load Arabic subset for ar-EG locale */
@font-face {
  font-family: 'Tajawal';
  src: url('/fonts/tajawal-subset-ar.woff2') format('woff2');
  font-weight: 400;
  font-display: swap; /* Don't block rendering */
  unicode-range: U+0600-06FF; /* Arabic block only */
}

/* Load Latin subset for English */
@font-face {
  font-family: 'Inter';
  src: url('/fonts/inter-subset-latin.woff2') format('woff2');
  font-weight: 400;
  font-display: swap;
  unicode-range: U+0000-00FF, U+0131, U+0152-0153;
}
```

### Day 3-4: Image Optimization

**Deliverable:** WebP + JPEG fallback, lazy loading

```typescript
// web/src/components/OptimizedImage.tsx
import React, { useState } from 'react'
import { clsx } from 'clsx'

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width = 640,
  height = 360,
  className,
}) => {
  const [isLoaded, setIsLoaded] = useState(false)

  // Convert to WebP with fallback
  const webpSrc = src.replace(/\.(jpg|png)$/, '.webp')

  return (
    <picture>
      {/* WebP for modern browsers */}
      <source srcSet={webpSrc} type="image/webp" />

      {/* JPEG fallback */}
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading="lazy" // Native lazy loading
        onLoad={() => setIsLoaded(true)}
        className={clsx(
          'transition-opacity duration-300',
          !isLoaded && 'opacity-0',
          isLoaded && 'opacity-100',
          className
        )}
      />

      {/* Placeholder blur */}
      {!isLoaded && (
        <div className={clsx(
          'absolute inset-0 bg-gray-800 animate-pulse',
          className
        )} />
      )}
    </picture>
  )
}
```

### Day 5: Performance Monitoring

**Deliverable:** Web Vitals tracking

```typescript
// web/src/lib/analytics.ts
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals'

export const reportWebVitals = () => {
  // Core Web Vitals
  getCLS(metric => console.log(`CLS: ${metric.value}`))
  getFID(metric => console.log(`FID: ${metric.value}`))
  getFCP(metric => console.log(`FCP: ${metric.value}`))
  getLCP(metric => console.log(`LCP: ${metric.value}`))
  getTTFB(metric => console.log(`TTFB: ${metric.value}`))
}

export const reportToAnalytics = (metric: any) => {
  // Send to analytics service
  if (navigator.sendBeacon) {
    const data = JSON.stringify(metric)
    navigator.sendBeacon('/api/metrics', data)
  }
}
```

---

## Week 3: Arabic Typography & Text Rendering

### Day 1-3: Arabic-First Typography System

**Deliverable:** BiDi-safe text components

```typescript
// web/src/components/Typography.tsx
import React, { ReactNode } from 'react'
import { clsx } from 'clsx'

interface TextProps {
  children: ReactNode
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'caption'
  className?: string
}

export const H1: React.FC<TextProps> = ({ children, className }) => (
  <h1 className={clsx('text-3xl font-bold leading-tight', className)}>
    {children}
  </h1>
)

export const H2: React.FC<TextProps> = ({ children, className }) => (
  <h2 className={clsx('text-2xl font-bold leading-tight', className)}>
    {children}
  </h2>
)

export const Body: React.FC<TextProps> = ({ children, className }) => (
  <p className={clsx('text-base leading-relaxed', className)}>
    {children}
  </p>
)

export const Caption: React.FC<TextProps> = ({ children, className }) => (
  <span className={clsx('text-sm text-gray-500', className)}>
    {children}
  </span>
)

/**
 * BiDi-Safe Text Component
 * Automatically handles right-to-left text (Arabic) and left-to-right (English)
 */
export const BiDiText: React.FC<{ text: string }> = ({ text }) => {
  // Detect text direction
  const arabicRegex = /[\u0600-\u06FF]/
  const isArabic = arabicRegex.test(text)

  return (
    <span dir={isArabic ? 'rtl' : 'ltr'}>
      {text}
    </span>
  )
}
```

### Day 3-5: Arabic Search & Tokenization

**Deliverable:** Arabic search normalization

```typescript
// web/src/lib/arabic-text.ts

/**
 * Normalize Arabic text for search
 * Handles diacritics, alif variations, taa marbuta
 */
export const normalizeArabic = (text: string): string => {
  return text
    // Remove diacritics
    .replace(/[\u064B-\u065F]/g, '')
    // Normalize alif variations: أ إ آ ا → ا
    .replace(/[أإآ]/g, 'ا')
    // Normalize taa marbuta: ة → ه
    .replace(/ة/g, 'ه')
    // Normalize alif maksura: ى ي → ي
    .replace(/ى/g, 'ي')
    // Normalize hamza: ء → remove
    .replace(/ء/g, '')
    .toLowerCase()
}

/**
 * Tokenize Arabic text for search
 */
export const tokenizeArabic = (text: string): string[] => {
  const normalized = normalizeArabic(text)

  // Split on spaces, punctuation
  return normalized
    .split(/[\s\.,،؛:؟!،\-]+/)
    .filter(token => token.length > 0)
}

/**
 * Calculate string similarity (Levenshtein for typo tolerance)
 */
export const levenshteinDistance = (a: string, b: string): number => {
  const matrix: number[][] = []

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i]
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        )
      }
    }
  }

  return matrix[b.length][a.length]
}

/**
 * Fuzzy search with Arabic normalization
 */
export const arabicFuzzySearch = (query: string, items: string[], threshold = 2): string[] => {
  const normalizedQuery = normalizeArabic(query)

  return items.filter(item => {
    const normalizedItem = normalizeArabic(item)
    const distance = levenshteinDistance(normalizedQuery, normalizedItem)
    return distance <= threshold
  })
}
```

---

## Week 4: Optimistic UI & Offline Support

### Day 1-3: Optimistic Updates

**Deliverable:** Instant feedback without network roundtrip

```typescript
// web/src/hooks/useOptimisticLike.ts
import { useState, useCallback } from 'react'
import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/api'

export const useOptimisticLike = (postId: string) => {
  const [optimisticCount, setOptimisticCount] = useState(0)

  const { mutate: toggleLike } = useMutation({
    mutationFn: async (isLiking: boolean) => {
      // Update UI immediately (optimistic)
      setOptimisticCount(prev => isLiking ? prev + 1 : prev - 1)

      try {
        // Send to server
        const response = await api.post(`/posts/${postId}/like`, { action: isLiking ? 'like' : 'unlike' })
        return response.data
      } catch (error) {
        // Revert on error
        setOptimisticCount(prev => isLiking ? prev - 1 : prev + 1)
        throw error
      }
    },
  })

  return { optimisticCount, toggleLike }
}
```

**Skeleton Loading:**

```typescript
// web/src/components/Skeleton.tsx
import { clsx } from 'clsx'

export const PostSkeleton: React.FC = () => (
  <div className="bg-brand-surface rounded-lg p-4 space-y-3 animate-pulse">
    <div className="flex gap-3">
      <div className="w-10 h-10 rounded-full bg-gray-700" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-700 rounded w-1/2" />
        <div className="h-3 bg-gray-700 rounded w-1/4" />
      </div>
    </div>
    <div className="h-64 bg-gray-700 rounded" />
    <div className="flex gap-4">
      <div className="h-4 bg-gray-700 rounded w-16" />
      <div className="h-4 bg-gray-700 rounded w-16" />
    </div>
  </div>
)
```

### Day 4-5: Service Worker for Offline

**Deliverable:** Basic offline support

```typescript
// web/public/sw.js
const CACHE_NAME = 'daira-v1'

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        '/',
        '/index.html',
        '/manifest.json',
      ])
    })
  )
})

self.addEventListener('fetch', (event) => {
  if (event.request.method === 'GET') {
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request)
      })
    )
  }
})
```

---

## Deliverables Summary (Track 2, Week 1-4)

| Week | Day | Deliverable | Status |
|-----|-----|-------------|--------|
| 1 | 1-2 | Tailwind config + remove Material UI | Code ✅ |
| 1 | 2-3 | Component library (Button, Card, Input) | Code ✅ |
| 1 | 3-5 | RTL support system | Code ✅ |
| 2 | 1-2 | Code splitting + lazy loading | Config ✅ |
| 2 | 3-4 | Image optimization + WebP | Code ✅ |
| 2 | 5 | Web Vitals tracking | Code ✅ |
| 3 | 1-3 | Arabic typography system | Code ✅ |
| 3 | 3-5 | Arabic search + tokenization | Code ✅ |
| 4 | 1-3 | Optimistic UI patterns | Code ✅ |
| 4 | 4-5 | Service Worker (offline) | Code ✅ |

**Bundle Size Target:** 85-100KB (vs. 400KB+ before optimization)
**Performance Target:**
- Lighthouse Score: >90 (Performance)
- FCP: <1.5s
- LCP: <2.5s
- CLS: <0.1
- TTI: <3s on 3G

---

## Files to Create in Repo

```
web/tailwind.config.ts (update)
web/src/components/ui/Button.tsx
web/src/components/ui/Card.tsx
web/src/components/ui/Input.tsx
web/src/components/RTLWrapper.tsx
web/src/components/Navbar.tsx (RTL-first)
web/src/components/OptimizedImage.tsx
web/src/components/Typography.tsx
web/src/components/Skeleton.tsx
web/src/hooks/useRTL.ts
web/src/hooks/useOptimisticLike.ts
web/src/lib/arabic-text.ts
web/src/lib/analytics.ts
web/vite.config.ts (update)
web/public/sw.js
```
