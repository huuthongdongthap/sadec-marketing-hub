# 📡 API Reference

This document details the core JavaScript modules and Supabase Edge Functions available in **AgencyOS 2026**.

---

## 🔐 Auth API (`auth.js`)

Centralized authentication and permission management. Accessible via `window.Auth`.

### State
-   **`Auth.State.user`**: Current Supabase user object.
-   **`Auth.State.profile`**: Extended user profile (including role).
-   **`Auth.State.isAuthenticated`**: Boolean status.

### Actions
#### `signIn(email, password)`
Authenticates user via Supabase (or Demo Mode fallback).
```javascript
const result = await Auth.Actions.signIn('admin@mekongmarketing.com', 'password');
if (result.success) {
    // Redirect or update UI
}
```

#### `signOut()`
Clears session and redirects to login page.

#### `signUp(email, password, metadata)`
Registers a new user. Metadata includes `fullName`, `phone`, and `role`.

### Guards
#### `requireAuth()`
Checks if user is logged in. Redirects to login if false.

#### `requireRole(role)`
Checks if user has required role permission.
```javascript
// Check if user is at least a 'manager'
await Auth.Guards.requireRole('manager');
```

---

## 🛠️ Mekong Utils (`utils.js`)

Shared utility functions for formatting and data manipulation. Accessible via `MekongUtils`.

### Formatting
-   **`formatCurrency(amount)`**: 15000000 -> "15.000.000 ₫"
-   **`formatDate(date, style)`**: "2026-01-01" -> "01/01/2026"
-   **`formatRelativeTime(date)`**: "2 hours ago"
-   **`slugify(text)`**: "Mekong Agency 2026" -> "mekong-agency-2026"

### Helpers
-   **`debounce(fn, delay)`**: Limits function execution rate.
-   **`generateId(prefix)`**: Creates unique IDs (e.g., "lead-12345").
-   **`escapeHTML(str)`**: Prevents XSS when rendering user content.

---

## ⚡ Edge Functions

Serverless functions running on Supabase Edge Network (Deno).

### 1. `calculate-commission`
Calculates affiliate commissions based on closed deals.
-   **Trigger**: Database Webhook (UPDATE on `deals` table).
-   **Logic**: 10% for tiered partners, 5% standard.

### 2. `verify-user-role`
Securely verifies user role on server-side before sensitive operations.
-   **Input**: JWT Token.
-   **Output**: Role string (`super_admin`, `client`, etc.).

### 3. `generate-content` (Gemini AI)
Generates marketing content using Google Gemini Pro.
-   **Endpoint**: `/functions/v1/generate-content`
-   **Body**: `{ prompt: "Blog post about SEO...", type: "blog" }`

### 4. `analyze-asset` (Multimodal)
Analyzes uploaded images/videos for insights.
-   **Endpoint**: `/functions/v1/analyze-asset`
-   **Body**: FormData with file.

---

## 🗄️ Database Schema (Key Tables)

### `leads`
-   `id`: UUID
-   `name`: Text
-   `status`: Enum (new, contacted, qualified, won)
-   `score`: Integer (0-100)

### `campaigns`
-   `id`: UUID
-   `platform`: Enum (facebook, google, zalo, tiktok)
-   `budget`: Numeric
-   `roi`: Numeric

### `user_profiles`
-   `id`: UUID (References `auth.users`)
-   `role`: Enum (super_admin, manager, content_creator, client, affiliate)
-   `full_name`: Text
