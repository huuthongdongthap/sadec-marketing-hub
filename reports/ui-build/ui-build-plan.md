# UI BUILD PLAN - SA ĐÉC MARKETING HUB

**Date:** 2026-03-14 | **Phase:** Micro-animations, Loading States, Hover Effects

---

## 1. KHẢO SÁT HIỆN TRẠNG

### 1.1 CSS Files đã có

| File | Kích thước | Nội dung chính |
|------|-----------|----------------|
| `assets/css/micro-animations.css` | ~25KB | 40+ animation classes (fade, slide, zoom, shake, pulse, bounce, wiggle, heartbeat, flip, tilt, ripple, wave) |
| `assets/css/loading-states.css` | ~15KB | Spinners, skeleton loaders, button loading, progress bars, shimmer effects |
| `assets/css/hover-effects.css` | ~17KB | Button hover (glow, scale, slide, shine, ripple, border, arrow), Card hover (lift, glow, scale, reveal, tilt, slide, zoom), Link hover, Icon hover |
| `assets/css/ui-enhancements-2027.css` | ~21KB | Premium effects |
| `assets/css/ui-animations.css` | ~17KB | Scroll-triggered animations |

### 1.2 JavaScript đã có

| File | Chức năng |
|------|-----------|
| `material-interactions.js` | Ripple effects, Scroll reveal (IntersectionObserver), Toast notifications, Loading dialogs, Spotlight tracking |
| `assets/js/components/*.js` | Component scripts |

### 1.3 Class đã được sử dụng trong HTML

**index.html:**
- ✅ `animate-fade-in` - Fade-in animation
- ✅ `card-hover-lift` - Card lift on hover
- ✅ `hover-lift` - Lift effect
- ✅ `reveal-on-scroll` - Scroll reveal
- ✅ `delay-1` to `delay-4` - Stagger delays
- ✅ `card-hover-glow` - Card glow on hover
- ✅ `payment-loading-overlay` - Loading state

### 1.4 gaps - Cơ hội cải thiện

| Area | Hiện trạng | Đề xuất |
|------|-----------|---------|
| **Micro-interactions** | Cơ bản | Thêm: button shine sweep, icon bounce, text underline reveal |
| **Loading States** | Có skeleton, spinners | Áp dụng vào: dashboard widgets, table rows, image galleries |
| **Hover Effects** | Có lift, glow | Thêm: border-glow, shimmer, gradient-border-flow, spotlight-card |
| **Scroll Animations** | Có reveal-on-scroll | Thêm: blur-reveal, scale-blur-reveal, rotor-reveal |
| **Form Feedback** | Basic | Thêm: input glow, success checkmark, error shake |
| **Navigation** | Basic | Thêm: nav link underline slide, logo drop |

---

## 2. KẾ HOẠCH NÂNG CẤP

### Phase 1: Micro-animations Enhancement

**Mục tiêu:** Thêm 10+ micro-interactions cao cấp

```css
/* 1. Button Shine Sweep */
.btn-shine::before {
  content: '';
  position: absolute;
  top: 0; left: -100%;
  width: 50%; height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
  transition: left 0.5s ease;
}
.btn-shine:hover::before { left: 150%; }

/* 2. Icon Bounce */
.icon-bounce-hover:hover {
  transform: scale(1.2) rotate(10deg);
}

/* 3. Text Underline Reveal */
.underline-reveal::after {
  content: '';
  position: absolute;
  bottom: -2px; left: 0;
  width: 0; height: 2px;
  background: var(--brand-primary-500);
  transition: width 0.3s;
}
.underline-reveal:hover::after { width: 100%; }

/* 4. Particle Float */
.particle-float:hover::before {
  content: '✦';
  opacity: 1;
  animation: particleFloat 2s infinite;
}

/* 5. Fill-up Background */
.fill-up:hover::before {
  height: 100%;
}
```

### Phase 2: Loading States Implementation

**Mục tiêu:** Áp dụng loading states vào 10+ components

| Component | Loading State |
|-----------|---------------|
| Dashboard Stats | Skeleton cards |
| Data Tables | Skeleton rows |
| Image Galleries | Skeleton placeholders |
| Forms | Button loading states |
| Modals | Loading overlay |
| Infinite Scroll | Loading bars at bottom |

### Phase 3: Advanced Hover Effects

**Mục tiêu:** Thêm 8+ premium hover effects

```css
/* 1. Spotlight Card (mouse tracking) */
.spotlight-card:hover::before {
  opacity: 1;
  background: radial-gradient(600px circle at var(--mouse-x) var(--mouse-y), rgba(0,106,96,0.1), transparent 40%);
}

/* 2. Border Glow Flow */
.border-glow-flow:hover::before {
  opacity: 1;
  animation: gradientFlow 3s linear infinite;
}

/* 3. Morphing Border */
.morph-border:hover {
  border-radius: 16px;
}

/* 4. Lift + Scale Combined */
.lift-scale:hover {
  transform: translateY(-6px) scale(1.01);
  box-shadow: 0 20px 40px rgba(0,106,96,0.2);
}
```

### Phase 4: Scroll-triggered Animations

**Mục tiêu:** Thêm blur-reveal, scale-blur-reveal, rotor-reveal

---

## 3. IMPLEMENTATION CHECKLIST

### Files to Update

- [ ] `index.html` - Add loading states, enhance hover effects
- [ ] `admin/index.html` - Dashboard loading skeletons
- [ ] `assets/css/ui-enhancements-bundle.css` - New premium effects
- [ ] `assets/js/ui-interactions.js` - Mouse tracking for spotlight cards
- [ ] `admin/dashboard.html` - Widget loading states

### HTML Updates

```html
<!-- Example: Enhanced Button -->
<button class="btn btn-filled btn-shine press-effect">
  <span class="btn-text">Khám phá ngay</span>
</button>

<!-- Example: Skeleton Card -->
<div class="card skeleton-card" aria-busy="true" aria-label="Đang tải...">
  <div class="skeleton title"></div>
  <div class="skeleton lines-3"></div>
</div>

<!-- Example: Spotlight Card -->
<div class="card spotlight-card" data-mouse-tracker>
  <!-- content -->
</div>
```

---

## 4. SUCCESS CRITERIA

| Metric | Target |
|--------|--------|
| Animation FPS | 60fps |
| Paint time | < 16ms |
| Lighthouse Performance | 90+ |
| Lighthouse Best Practices | 95+ |
| User Engagement | +15% (estimated) |
| Bounce Rate | -10% (estimated) |

---

## 5. ESTIMATED TIME & CREDITS

- **Time:** ~12 minutes
- **Credits:** 8 MCU
- **Commands:** 3 (component → cook --frontend → e2e-test)

---

## 6. NEXT STEPS

1. ✅ Component analysis (DONE)
2. ⏳ `/cook --frontend` - Implement enhancements
3. ⏳ `/e2e-test` - Verify animations
4. ⏳ Manual browser check
5. ⏳ Report completion

