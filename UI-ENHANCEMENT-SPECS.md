# UI ENHANCEMENT SPECS - SA ĐÉC MARKETING HUB

**Date:** 2026-03-14 | **Version:** 1.0 | **Status:** Approved

---

## TỔNG QUAN

Nâng cấp UI với micro-animations, loading states và hover effects theo Material Design 3 Expressive.

### Phạm vi
- **Target:** `/Users/mac/mekong-cli/apps/sadec-marketing-hub`
- **Files chính:** `index.html`, CSS enhancements, JS interactions
- **Priority:** High-impact visual improvements

---

## 1. MICRO-ANIMATIONS

### 1.1 Button Micro-interactions

| Element | Animation | Duration | Easing |
|---------|-----------|----------|--------|
| Primary Button | Shine sweep + lift | 400ms | cubic-bezier(0.2, 0, 0, 1) |
| Secondary Button | Pulse glow | 300ms | cubic-bezier(0.4, 0, 0.2, 1) |
| Icon Button | Rotate 15deg | 200ms | cubic-bezier(0.68, -0.55, 0.265, 1.55) |
| Text Button | Background fill | 250ms | cubic-bezier(0.4, 0, 0.2, 1) |

**Implementation:**
```css
/* Primary Button Shine */
.btn-filled::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 50%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
  transition: left 0.5s ease;
}
.btn-filled:hover::before {
  left: 150%;
}

/* Lift effect */
.btn-filled:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 106, 96, 0.4);
}
```

### 1.2 Card Hover Animations

| Card Type | Effect | Transform | Shadow |
|-----------|--------|-----------|--------|
| Service Card | Lift + shimmer | translateY(-6px) scale(1.01) | 0 20px 60px rgba(0,106,96,0.2) |
| Pricing Card | Glow border | translateY(-4px) | 0 0 20px rgba(156,104,0,0.3) |
| Testimonial | Lift + tilt | translateY(-3px) rotateX(2deg) | 0 15px 40px rgba(0,0,0,0.15) |
| Case Study | Image zoom | scale(1.05) on image | None |

### 1.3 Navigation Hover Effects

```css
/* Nav Link Underline Slide */
.nav-link::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 0;
  width: 0;
  height: 2px;
  background: currentColor;
  transition: width 0.3s cubic-bezier(0.2, 0, 0, 1);
}
.nav-link:hover::after {
  width: 100%;
}

/* Logo Drop Animation */
.nav-logo:hover {
  animation: logoDrop 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}
@keyframes logoDrop {
  0% { transform: translateY(0); }
  50% { transform: translateY(-3px); }
  100% { transform: translateY(0); }
}
```

### 1.4 Scroll-triggered Animations

| Class | Effect | Trigger |
|-------|--------|---------|
| `.reveal-on-scroll` | Fade up 30px → 0 | IntersectionObserver |
| `.reveal-from-left` | Slide from -50px | IntersectionObserver |
| `.reveal-from-right` | Slide from 50px | IntersectionObserver |
| `.scale-in-on-scroll` | Scale 0.9 → 1 | IntersectionObserver |

**Stagger Delays:**
```css
.delay-1 { transition-delay: 0ms; }
.delay-2 { transition-delay: 100ms; }
.delay-3 { transition-delay: 200ms; }
.delay-4 { transition-delay: 300ms; }
```

---

## 2. LOADING STATES

### 2.1 Page Loader

```html
<div class="page-loader" id="pageLoader">
  <div class="spinner-modern lg"></div>
  <p>Đang tải...</p>
</div>
```

**Animation:**
- Spinner rotation: 0.8s linear infinite
- Fade out on load: 0.3s ease-out
- Background: surface color with 95% opacity

### 2.2 Button Loading State

```css
.btn-loading {
  position: relative;
  color: transparent !important;
  pointer-events: none;
}
.btn-loading::after {
  content: '';
  position: absolute;
  width: 16px;
  height: 16px;
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
```

### 2.3 Skeleton Loaders

| Component | Skeleton Variant | Animation |
|-----------|------------------|-----------|
| Avatar | Circle 48px | Shimmer 1.5s |
| Title | Height 24px, 60% width | Shimmer 1.5s |
| Text | Height 16px, 100% width | Shimmer 1.5s |
| Card | Full card with padding | Shimmer 1.5s |
| Stat Card | Icon + value + label | Shimmer 1.5s |

```css
.skeleton-base {
  background: linear-gradient(
    90deg,
    var(--md-sys-color-surface-variant) 25%,
    color-mix(in srgb, var(--md-sys-color-outline-variant) 50%, var(--md-sys-color-surface-variant)) 50%,
    var(--md-sys-color-surface-variant) 75%
  );
  background-size: 200% 100%;
  animation: skeleton-shimmer 1.5s ease-in-out infinite;
}
@keyframes skeleton-shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

### 2.4 Progress Indicators

**Linear Progress (Indeterminate):**
```css
.progress-linear.indeterminate::after {
  width: 30%;
  animation: progress-indeterminate 1.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
}
@keyframes progress-indeterminate {
  0% { left: -30%; }
  50% { left: 100%; }
  100% { left: -30%; }
}
```

**Pulsing Dots:**
```css
.loading-dots span {
  animation: pulse 1.4s cubic-bezier(0.4, 0, 0.2, 1) infinite;
}
@keyframes pulse {
  0%, 80%, 100% { transform: scale(0.6); opacity: 0.5; }
  40% { transform: scale(1); opacity: 1; }
}
```

---

## 3. HOVER EFFECTS

### 3.1 Link Hover Effects

| Effect | Description | CSS |
|--------|-------------|-----|
| Arrow Slide | Gap increases, arrow translates | `gap: 4px → 8px`, `transform: translateX(4px)` |
| Color Shift | Gradient background slides | `background-position: 0 100% → 0 0` |
| Underline | Width 0 → 100% | `width: 0 → 100%` |

### 3.2 Form Input Focus

```css
.input-floating input:focus {
  border-color: var(--md-sys-color-primary);
  box-shadow: 0 0 0 2px rgba(0, 106, 96, 0.4);
}
.input-floating input:focus ~ label {
  top: 0;
  font-size: 12px;
  color: var(--md-sys-color-primary);
}
```

### 3.3 Image Hover Effects

| Image Type | Effect | Transform |
|------------|--------|-----------|
| Service Icon | Zoom + lift | scale(1.1) translateY(-10px) |
| Case Study | Floating | translateY(-20px) at 50% |
| Team Avatar | Scale | scale(1.05) |

---

## 4. SUCCESS/ERROR ANIMATIONS

### 4.1 Success Checkmark

```css
.success-checkmark {
  animation: successPop 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}
.success-checkmark::after {
  animation: checkmarkDraw 0.3s cubic-bezier(0.2, 0, 0, 1) 0.2s forwards;
}
@keyframes successPop {
  0% { transform: scale(0); }
  80% { transform: scale(1.1); }
  100% { transform: scale(1); }
}
```

### 4.2 Error Shake

```css
.error-shake {
  animation: errorShake 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}
@keyframes errorShake {
  0%, 100% { transform: translateX(0); }
  20%, 60% { transform: translateX(-8px); }
  40%, 80% { transform: translateX(8px); }
}
```

---

## 5. IMPLEMENTATION CHECKLIST

### CSS Files to Update
- [ ] `assets/css/m3-agency.css` - Base button/card hover effects
- [ ] `assets/css/ui-animations.css` - Scroll animations
- [ ] `assets/css/ui-enhancements-2027.css` - Already has most effects
- [ ] `assets/css/responsive-enhancements.css` - Mobile hover states

### JavaScript Files to Update
- [ ] `assets/js/ui-enhancements.js` - IntersectionObserver logic
- [ ] `assets/js/ui-enhancements-controller.js` - Loading state management
- [ ] `assets/js/mobile-navigation.js` - Nav animations

### HTML Updates
- [ ] `index.html` - Add loading states, skeleton loaders
- [ ] `portal/*.html` - Consistent loading patterns

---

## 6. PERFORMANCE GUIDELINES

| Metric | Target |
|--------|--------|
| Animation FPS | 60fps |
| Paint time | < 16ms per frame |
| CSS file size | < 50KB gzipped |
| JS for animations | < 10KB |

**Best Practices:**
- Use `transform` and `opacity` only (GPU accelerated)
- Avoid `box-shadow` animation on mobile
- Respect `prefers-reduced-motion`
- Debounce scroll listeners

---

## 7. ACCESSIBILITY

- All animations respect `prefers-reduced-motion: reduce`
- Focus states clearly visible with 3px outline
- Loading states announced to screen readers via `aria-live`
- No auto-playing animations longer than 5 seconds

---

## ESTIMATED IMPACT

| Metric | Before | After |
|--------|--------|-------|
| Perceived load time | 2.5s | 1.8s |
| User engagement | Baseline | +15% |
| Bounce rate | Baseline | -10% |

---

## NEXT STEPS

1. Implement button micro-animations
2. Add skeleton loaders for async content
3. Enhance scroll-triggered animations with stagger
4. Add success/error toast animations
5. Test on mobile devices for performance
