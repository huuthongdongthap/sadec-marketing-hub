# Hướng Dẫn Sử Dụng Micro-Animations & Loading States

**Sa Đéc Marketing Hub** — Version 2.0

---

## MỤC LỤC

1. [Loading States](#1-loading-states)
2. [Micro-Animations](#2-micro-animations)
3. [Components](#3-components)
4. [CSS Animation Classes](#4-css-animation-classes)
5. [Accessibility](#5-accessibility)
6. [Performance Tips](#6-performance-tips)

---

## 1. LOADING STATES

### Loading Manager

Import script:
```html
<script src="/assets/js/loading-states.js"></script>
```

### Show/Hide Loading Spinner

```javascript
// Show loading in container
Loading.show('#my-container');

// Show with custom options
Loading.show('#my-container', {
  size: 'lg',      // sm, md, lg
  color: 'primary', // primary, secondary
  message: 'Đang tải dữ liệu...'
});

// Hide loading
Loading.hide('#my-container');
```

### Skeleton Loaders

```javascript
// Card skeleton
Loading.skeleton('#container', 'card');

// List skeleton
Loading.skeleton('#container', 'list');

// Text skeleton
Loading.skeleton('#container', 'text');

// Table skeleton
Loading.skeleton('#container', 'table');

// Stat card skeleton
Loading.skeleton('#container', 'stat');

// Image skeleton
Loading.skeleton('#container', 'image');
```

### Fullscreen Loading

```javascript
// Show fullscreen overlay
Loading.fullscreen.show('Đang xử lý...');

// Hide fullscreen
Loading.fullscreen.hide();
```

### Button Loading State

```javascript
const btn = document.querySelector('#submit-btn');

// Set loading
Loading.button(btn, 'Đang gửi...');

// Remove loading
Loading.buttonDone(btn);
```

### Fetch with Auto Loading

```javascript
async function loadData() {
  const response = await Loading.fetch('/api/data', {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  }, '#data-container');

  const data = await response.json();
  // Loading tự động hide sau khi fetch complete
}
```

---

## 2. MICRO-ANIMATIONS

### Import Script

```html
<script src="/assets/js/micro-animations.js"></script>
```

### Shake Animation (Errors)

```javascript
// Shake input on validation error
const input = document.querySelector('#email');
MicroAnimations.shake(input);

// Or use play() with class
MicroAnimations.play(input, 'error-shake');
```

### Pop Animation (Success)

```javascript
// Pop success element
MicroAnimations.pop(successBadge);
```

### Pulse Animation (Attention)

```javascript
// Single pulse
MicroAnimations.pulse(element);

// Multiple pulses
MicroAnimations.pulse(element, 3);
```

### Bounce Animation

```javascript
MicroAnimations.bounce(element);
```

### Fade In/Out

```javascript
// Fade in
MicroAnimations.fadeIn(element, {
  fromOpacity: 0,
  duration: 300
});

// Fade out with callback
MicroAnimations.fadeOut(element, () => {
  element.remove();
});
```

### Count Up Animation

```javascript
// Animate number from 0 to 100
MicroAnimations.countUp(counterElement, 0, 100, {
  duration: 2000,
  prefix: '$',
  suffix: ' USD',
  decimals: 2
});

// Animate percentage
MicroAnimations.countUp(progressElement, 0, 100, {
  duration: 1500,
  suffix: '%'
});
```

### Typewriter Effect

```javascript
MicroAnimations.typeWriter(headingElement, 'Xin chào thế giới!', 50);
// 50 = characters per second
```

### Stagger Animation (Lists)

```javascript
// Animate list items with delay
const items = document.querySelectorAll('.list-item');
MicroAnimations.stagger(items, 'stagger-item', 50);
// 50ms delay between each item
```

### Scroll-Triggered Animations

```javascript
// Auto-initialized, or manually:
ScrollAnimations.init({
  threshold: 0.1,        // Trigger when 10% visible
  rootMargin: '0px 0px -50px 0px',
  once: true             // Only animate once
});

// Observe new elements
ScrollAnimations.observe(newElement);

// Re-trigger
ScrollAnimations.refresh('.animate-entry');
```

### Ripple Effect

```javascript
// Auto-bound to .ripple-container elements

// Manual trigger
element.addEventListener('click', (e) => {
  RippleEffect.create(e, element);
});

// Auto-bind all
RippleEffect.autoBind();
```

### Magnetic Pull Effect

```javascript
// Element follows cursor slightly
MicroAnimations.magneticPull(button, 0.3);
// 0.3 = 30% of cursor distance
```

### Text Reveal Animation

```javascript
MicroAnimations.revealText(headingElement);
// Animates each character individually
```

---

## 3. COMPONENTS

### SadecToast (Enhanced)

```javascript
// Success with pop animation
SadecToast.success('Hoàn thành!');

// Error with shake animation
SadecToast.error('Có lỗi xảy ra');

// Warning with pulse
SadecToast.warning('Cảnh báo');

// Info with slide-in
SadecToast.info('Thông tin');

// Loading toast (no auto-dismiss)
SadecToast.loading('Đang xử lý...', 0);

// Custom options
SadecToast.show('Message', 'info', 3000, {
  icon: 'custom_icon',
  position: 'bottom-left'
});

// Disable animations
SadecToast.enableAnimations(false);
```

### LoadingButton

```html
<!-- Basic -->
<loading-button onclick="this.loading = true">Submit</loading-button>

<!-- With icon -->
<loading-button icon="save">Save</loading-button>

<!-- Variant -->
<loading-button variant="primary">Primary</loading-button>
<loading-button variant="secondary">Secondary</loading-button>
<loading-button variant="outline">Outline</loading-button>
<loading-button variant="ghost">Ghost</loading-button>
<loading-button variant="danger">Danger</loading-button>

<!-- Size -->
<loading-button size="sm">Small</loading-button>
<loading-button size="md">Medium</loading-button>
<loading-button size="lg">Large</loading-button>

<!-- Loading text -->
<loading-button loading-text="Đang xử lý...">Submit</loading-button>
```

**Programmatic control:**
```javascript
const btn = document.querySelector('loading-button');

// Start loading
btn.startLoading();
btn.loading = true;

// Stop loading
btn.stopLoading();
btn.loading = false;

// Reset
btn.reset();
```

### PaymentStatusChip

```html
<payment-status-chip status="paid"></payment-status-chip>
<payment-status-chip status="pending"></payment-status-chip>
<payment-status-chip status="processing"></payment-status-chip>
<payment-status-chip status="overdue"></payment-status-chip>
<payment-status-chip status="failed"></payment-status-chip>
<payment-status-chip status="refunded"></payment-status-chip>

<!-- Sizes -->
<payment-status-chip status="paid" size="small"></payment-status-chip>
<payment-status-chip status="paid" size="large"></payment-status-chip>

<!-- Disable animations -->
<payment-status-chip status="paid" animated="false"></payment-status-chip>
```

**Programmatic control:**
```javascript
const chip = document.querySelector('payment-status-chip');

// Change status (auto-animates)
chip.status = 'paid';

// Manual animations
chip.pulse();    // Scale pulse
chip.flash(3);   // Flash 3 times
```

---

## 4. CSS ANIMATION CLASSES

### Hover Effects

```html
<!-- Buttons -->
<button class="btn-hover-scale">Scale on Hover</button>
<button class="btn-ripple">Ripple Effect</button>
<button class="btn-gradient-shift">Gradient Shift</button>
<button class="btn-border-glow">Border Glow</button>

<!-- Cards -->
<div class="card-hover-lift">Lift Up</div>
<div class="card-hover-border">Border Highlight</div>
<div class="card-hover-shine">Shine Effect</div>

<!-- Links -->
<a class="link-underline-slide">Underline Slide</a>
<a class="link-fade-in">Fade In</a>

<!-- Navigation -->
<div class="nav-item-hover">Sidebar Item Hover</div>

<!-- Tables -->
<tr class="table-row-hover">Hover Row</tr>
<td class="table-cell-focus">Focus Cell</td>

<!-- Forms -->
<input class="input-focus-expand" />
<div class="input-floating-label">
  <input placeholder=" " />
  <label>Floating Label</label>
</div>
```

### Loading States

```html
<!-- Spinners -->
<div class="spinner-primary spinner-sm"></div>
<div class="spinner-primary spinner-md"></div>
<div class="spinner-primary spinner-lg"></div>
<div class="spinner-pulse"></div>

<!-- Skeletons -->
<div class="skeleton skeleton-text"></div>
<div class="skeleton skeleton-title"></div>
<div class="skeleton skeleton-avatar"></div>
<div class="skeleton skeleton-image"></div>
<div class="skeleton skeleton-card">
  <div class="skeleton-avatar"></div>
  <div class="skeleton-title"></div>
  <div class="skeleton-text"></div>
</div>

<!-- Progress Bars -->
<div class="progress-bar">
  <div class="progress-bar-fill" style="width: 50%"></div>
</div>

<div class="progress-bar progress-indeterminate"></div>

<div class="progress-circular"></div>
```

### Page/Element Transitions

```html
<div class="fade-in">Fade In</div>
<div class="slide-up">Slide Up</div>
<div class="slide-down">Slide Down</div>
<div class="zoom-in">Zoom In</div>

<!-- Staggered List -->
<ul>
  <li class="stagger-item">Item 1</li>
  <li class="stagger-item">Item 2</li>
  <li class="stagger-item">Item 3</li>
</ul>
```

### Scroll-Triggered Entry

```html
<!-- Basic entry animation -->
<div class="animate-entry">Fades in on scroll</div>

<!-- From sides -->
<div class="animate-from-left">Slides from left</div>
<div class="animate-from-right">Slides from right</div>

<!-- Scale entry -->
<div class="animate-scale">Scales in</div>

<!-- Premium (slower) -->
<div class="animate-entry-premium">Slow elegant entrance</div>

<!-- With delays -->
<div class="animate-entry delay-1">Delay 0ms</div>
<div class="animate-entry delay-2">Delay 100ms</div>
<div class="animate-entry delay-3">Delay 200ms</div>
```

---

## 5. ACCESSIBILITY

### Reduced Motion

Tất cả animations tự động disable cho users với setting "Reduce Motion":

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Manual Toggle

```javascript
// Disable all animations
SadecToast.enableAnimations(false);
MicroAnimations.disabled = true;

// Check user preference
const prefersReducedMotion = window.matchMedia(
  '(prefers-reduced-motion: reduce)'
).matches;
```

### ARIA Attributes

```javascript
// Loading states automatically set aria-busy
Loading.show('#container');
// Container gets: aria-busy="true"

// LoadingButton sets aria-busy when loading
<loading-button loading aria-busy="true">...</loading-button>
```

---

## 6. PERFORMANCE TIPS

### Best Practices

1. **Use CSS transforms** — GPU accelerated
   ```css
   /* Good */
   transform: translateX(10px);
   transform: scale(1.1);

   /* Avoid */
   margin-left: 10px;
   width: 110%;
   ```

2. **Use will-change sparingly**
   ```css
   /* Only for heavy animations */
   .heavy-animation {
     will-change: transform, opacity;
   }
   ```

3. **Clean up animations**
   ```javascript
   // Remove animation class after complete
   element.addEventListener('animationend', () => {
     element.classList.remove('animating');
   });
   ```

4. **Use requestAnimationFrame for JS animations**
   ```javascript
   requestAnimationFrame(() => {
     element.style.transform = 'translateX(100px)';
   });
   ```

### Debugging

```javascript
// Check animation performance
Performance panel → FPS counter
// Should maintain 60fps

// Check for layout thrashing
Chrome DevTools → Rendering → Layout Shift Regions
```

---

## 7. TROUBLESHOOTING

### Animation Not Working?

1. Check CSS file is loaded
   ```html
   <link rel="stylesheet" href="/assets/css/animations/micro-animations.css">
   ```

2. Check JS file is loaded
   ```html
   <script src="/assets/js/micro-animations.js"></script>
   ```

3. Check element exists
   ```javascript
   const el = document.querySelector('.my-element');
   if (!el) {
     console.error('Element not found');
   }
   ```

4. Check reduced motion setting
   ```javascript
   console.log(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
   ```

### Loading State Not Hiding?

```javascript
// Check for nested loading calls
// Loading.show() called multiple times without Loading.hide()

// Manual reset
Loading._counters.set('#container', 0);
Loading.hide('#container');
```

---

*Tài liệu này được auto-generated từ UI Build pipeline.*
*Last updated: 2026-03-13*
