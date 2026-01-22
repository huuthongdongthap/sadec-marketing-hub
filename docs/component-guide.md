# 🧩 Component & Style Guide

**AgencyOS 2026** uses a hybrid approach: standard HTML/CSS for layout, native Web Components for reusable UI parts, and Google's Material Web components for interactive elements.

---

## 🎨 Design System (`m3-agency.css`)

Our custom CSS framework implementing Material Design 3 Expressive.

### 🌈 Color Tokens
Used via CSS variables: `var(--md-sys-color-token-name)`

-   **Primary**: `#006A60` (Mekong Green)
-   **Secondary**: `#4A635D`
-   **Tertiary**: `#4B607C`
-   **Surface**: `#F4FBFA` (Light), `#191C1C` (Dark)

### 🔠 Typography
-   **Display**: `Google Sans` (Large headers)
-   **Body**: `Google Sans Text` (Content)
-   **Code**: `Fira Code` (Technical data)

### 📐 Layout Utilities
-   **.container**: Centered max-width container.
-   **.grid**: CSS Grid wrapper (supports `.grid-2`, `.grid-3`, `.grid-4`).
-   **.flex-between**: Flexbox with `justify-content: space-between`.
-   **.card**: Standard surface card with elevation.
    -   `.card-elevated`: High shadow.
    -   `.card-outlined`: Bordered, no shadow.

---

## 🧩 Web Components

Custom elements built with Vanilla JS (`HTMLElement`).

### 1. Sidebar Navigation (`<sadec-sidebar>`)
The main navigation drawer for the Admin Portal.

**Usage:**
```html
<script src="assets/js/components/sadec-sidebar.js"></script>
<sadec-sidebar active="dashboard"></sadec-sidebar>
```

**Attributes:**
-   `active`: The ID of the current page to highlight (e.g., `dashboard`, `leads`, `finance`).

### 2. Client Navbar (`<sadec-navbar>`)
Responsive top navigation for the Client Portal.

**Usage:**
```html
<script src="assets/js/components/sadec-navbar.js"></script>
<sadec-navbar></sadec-navbar>
```

### 3. Toast Notifications (`MekongAdmin.Toast`)
Not a DOM element, but a global utility for showing alerts.

**Usage:**
```javascript
MekongAdmin.Toast.success('Operation successful!');
MekongAdmin.Toast.error('Something went wrong.');
```

---

## Ⓜ️ Material Web Components

We import components from `@material/web` via CDN.

### Buttons
```html
<!-- Filled (Primary) -->
<md-filled-button>Save Changes</md-filled-button>

<!-- Outlined (Secondary) -->
<md-outlined-button>Cancel</md-outlined-button>

<!-- Text (Tertiary) -->
<md-text-button>Learn More</md-text-button>
```

### Text Fields
```html
<md-outlined-text-field
    label="Email Address"
    type="email"
    required
></md-outlined-text-field>
```

### Icons
We use **Material Symbols Outlined** font.
```html
<span class="material-symbols-outlined">dashboard</span>
```

---

## 🎭 Animations

CSS-based animations for "delight".

-   **.animate-entry**: Fade-in up effect.
-   **.hover-lift**: Slight elevation on hover.
-   **.glass-card**: Backdrop blur effect for dashboards.

```html
<div class="card glass-card hover-lift animate-entry">
    Content
</div>
```
