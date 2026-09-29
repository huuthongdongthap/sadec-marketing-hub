# Component Design Specification - Premium UI Animations

**Date:** 2026-03-14
**Project:** Sa Đéc Marketing Hub
**Goal:** Nâng cấp UI animations & hover effects

## Design Tokens

### Animation Durations
- `--premium-duration-instant: 80ms`
- `--premium-duration-fast: 120ms`
- `--premium-duration-normal: 240ms`
- `--premium-duration-slow: 400ms`
- `--premium-duration-slower: 600ms`
- `--premium-duration-cinematic: 800ms`

### Easing Curves
- `--premium-ease-default: cubic-bezier(0.2, 0, 0, 1)`
- `--premium-ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55)`
- `--premium-ease-elastic: cubic-bezier(0.34, 1.56, 0.64, 1)`
- `--premium-ease-out-expo: cubic-bezier(0.19, 1, 0.22, 1)`

### Glow Effects
- `--premium-glow-primary: 0 0 24px rgba(25, 118, 210, 0.4)`
- `--premium-glow-success: 0 0 24px rgba(76, 175, 80, 0.4)`
- `--premium-glow-error: 0 0 24px rgba(244, 67, 54, 0.4)`
- `--premium-glow-accent: 0 0 32px rgba(124, 77, 255, 0.5)`

## Components

### Button Effects (7 types)
1. Shine - Gradient sweep
2. Fill - Background fill
3. Border Expand - Border growth
4. Icon Slide - Icon animation
5. 3D - Lift effect
6. Ripple - Material ripple
7. Glow - Border glow

### Card Effects (7 types)
1. Lift - Shadow elevation
2. Glow - Border glow
3. Image Zoom - Inner image scale
4. Content Slide - Content animation
5. Corner Accent - Corner reveal
6. Scale Glow - Combined effect
7. Reveal - Overlay reveal

### Input Effects (4 types)
1. Glow - Focus glow
2. Floating - Label float
3. Underline - Expand underline
4. Icon - Icon bounce

## Implementation Plan

Phase 1: CSS Library (premium-animations.css, premium-hover-effects.css)
Phase 2: JavaScript Library (premium-interactions.js)
Phase 3: HTML Integration (index.html, admin/dashboard.html)
Phase 4: E2E Testing (premium-ui-animations.spec.ts)
