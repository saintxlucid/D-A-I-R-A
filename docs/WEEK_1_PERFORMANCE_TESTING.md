# Week 1 Performance Testing & Validation

**Objective:** Achieve Lighthouse scores >90 and validate FCP <1.5s on 3G throttle

## Performance Budget

| Metric | Target | Status |
|--------|--------|--------|
| **Lighthouse Performance** | >90 | 🎯 |
| **First Contentful Paint (FCP)** | <1.5s (3G) | 🎯 |
| **Time to Interactive (TTI)** | <2.5s (3G) | 🎯 |
| **JavaScript Bundle** | <100KB (gzipped) | 🎯 |
| **CSS Bundle** | <30KB (gzipped) | 🎯 |
| **Total Page Size** | <200KB | 🎯 |
| **Cumulative Layout Shift (CLS)** | <0.1 | 🎯 |
| **First Input Delay (FID)** | <100ms | 🎯 |

## Day 6: Performance Testing Setup

### 1. Local Testing

```bash
# Install dependencies
npm install -D next-bundle-analyzer

# Build Next.js application
npm run build

# Verify bundle size
npm run bundle-analyze
```

### 2. Lighthouse CLI Testing

```bash
# Install Lighthouse globally
npm install -g lighthouse

# Run Lighthouse audit on desktop
lighthouse http://localhost:3000 \
  --view \
  --chrome-flags="--headless" \
  --output-path=./lighthouse-report-desktop.html

# Run Lighthouse audit on mobile (emulated Moto G4)
lighthouse http://localhost:3000 \
  --view \
  --chrome-flags="--headless" \
  --emulated-form-factor=mobile \
  --output-path=./lighthouse-report-mobile.html
```

### 3. Chrome DevTools Testing

**Steps:**
1. Open Chrome DevTools (F12)
2. Go to **Lighthouse** tab
3. Select **Mobile** device class
4. Select **Throttle** option: "Slow 3G"
5. Click **Analyze page load**

**Key Metrics to Track:**
- First Contentful Paint (FCP) — target <1.5s
- Largest Contentful Paint (LCP) — target <2.5s
- Cumulative Layout Shift (CLS) — target <0.1
- Total Blocking Time (TBT) — target <300ms

## Day 7: Performance Optimization Checklist

### Image Optimization
- [x] Use Next.js `Image` component (automatic optimization)
- [x] Set `quality={75}` for Egyptian market bandwidth
- [x] Enable `priority={false}` for below-fold images
- [x] Use modern formats: AVIF + WebP fallbacks
- [ ] Verify responsive images with `srcSet`

### JavaScript Optimization
- [ ] Code splitting by route (automatic with Next.js)
- [ ] Remove unused dependencies
- [ ] Check for console.log statements in production
- [ ] Verify no console errors in DevTools

### CSS Optimization
- [x] Tailwind CSS with production purging
- [x] Remove unused Tailwind utilities
- [ ] Minimize critical CSS inline size
- [ ] Test dark mode CSS efficiency

### HTML Optimization
- [x] Semantic HTML (section, article, nav)
- [ ] Proper heading hierarchy (h1, h2, h3)
- [ ] Image alt text (accessibility + SEO)
- [ ] Meta descriptions

### Font Optimization
- [ ] Preload system fonts
- [ ] Minimize custom fonts (max 2-3)
- [ ] Use `font-display: swap` for safety

### Third-Party Scripts
- [ ] Lazy load analytics
- [ ] Defer non-critical scripts
- [ ] Monitor script impact in DevTools

## Expected Results After Optimization

### Desktop Lighthouse Scores
```
✅ Performance: 95+
✅ Accessibility: 95+
✅ Best Practices: 95+
✅ SEO: 95+
```

### Mobile Lighthouse Scores (Moto G4 + Slow 3G)
```
✅ Performance: 90+
✅ FCP: <1.5s
✅ LCP: <2.5s
✅ CLS: <0.1
```

## Testing Against Real Devices

### Test Devices
- **Low-end Android:** Samsung Galaxy A12 (4GB RAM, Snapdragon 450)
- **Network:** 3G or 4G with throttle

### Test Script

```typescript
// pages/api/perf-test.ts (optional endpoint for metrics)
import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json({
    message: 'Performance test endpoint',
    timestamp: new Date().toISOString(),
  });
}
```

### Manual Testing Checklist
- [ ] Login page loads in <1.5s on 3G
- [ ] Feed page loads in <1.5s on 3G
- [ ] Images display without layout shift
- [ ] Buttons respond within 100ms
- [ ] No console errors
- [ ] RTL layout works correctly
- [ ] Arabic text renders properly

## Continuous Monitoring

### Setup Sentry for Error Tracking
```typescript
// web/sentry.client.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
  beforeSend(event) {
    return event;
  },
});
```

### Setup Web Vitals Monitoring
```typescript
// web/src/lib/web-vitals.ts
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

function sendToAnalytics(metric: any) {
  console.log('Web Vital:', metric.name, metric.value);
  // Send to your analytics service
}

getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getFCP(sendToAnalytics);
getLCP(sendToAnalytics);
getTTFB(sendToAnalytics);
```

## Success Criteria

✅ **Phase 1 Complete When:**
1. Lighthouse desktop score >90
2. Lighthouse mobile score >80
3. FCP <1.5s on Slow 3G emulation
4. No console errors
5. RTL layout fully functional
6. Bundle size <100KB gzipped

**If targets not met:**
- Analyze slowest resources in DevTools
- Check image optimization
- Review unused CSS
- Profile JavaScript execution
- Consider lazy loading components

---

**Next:** Week 2 - Media Infrastructure (BullMQ + FFmpeg + HLS)
