# 🌾 Sa Đéc Marketing Hub - Material Design 3 Expressive

> **Version 2.0 (2026 Edition)**
> Built with pure HTML/CSS/JS, powered by Google's Material Design 3 Expressive.

## 🚀 Overview

This repository contains the source code for the Sa Đéc Marketing Hub, a platform connecting local SMEs in the Mekong Delta with digital marketing services. The entire codebase has been upgraded to M3 Expressive, focusing on a "10X" UI/UX improvement with fluid spring animations, glassmorphism, and vibrant "Aurora" themes.

**Live URL**: `[Insert Vercel URL Here]`

## 🏗️ Architecture

The project follows a clean, vanilla architecture without heavy frameworks, ensuring maximum performance and ease of deployment.

### 1. Key Stylesheets (The "Holy Trinity")
Every page must include these files in this exact order:
1.  **`layout-safe.css`**: Defines core tokens (colors, typography, spacing) and resets.
2.  **`material-components.css`**: Base styles for standard components (buttons, inputs).
3.  **`m3-expressive.css`**: The magic layer. Adds motion, glassmorphism, and "WOW" factors.

### 2. Core JavaScript
-   **`auth.js`**: Centralized authentication logic (Supabase integration + Demo Mode fallback).
-   **`material-interactions.js`**: Global interaction handler (Ripple effects, Scroll Reveals, Toasts).
-   **`supabase-config.js`**: Supabase client configuration.

### 3. File Structure
```
/
├── index.html              # Homepage (M3 Expressive)
├── login.html              # Login Page
├── register.html           # Registration Page
├── admin-dashboard.html    # Super Admin Dashboard
├── agency-platform.html    # Agency Workflow Platform
├── client-portal.html      # Client Reporting Portal
├── affiliate.html          # Affiliate Landing Page
├── affiliate-dashboard.html# Affiliate Partner Dashboard
└── assets/                 # Images and Icons
```

## 🛠️ Deployment

This project is optimized for Vercel but can be hosted on any static file server.

1.  **Install Vercel CLI**: `npm i -g vercel`
2.  **Deploy**: `vercel --prod`

## 🎨 Design System

**Colors:**
-   Primary: Pink (`#E91E63`) - Passion & Energy
-   Secondary: Gold (`#FFC107`) - Wealth & Prosperity
-   Background: Aurora Gradients

**Typography:**
-   `Inter` (Google Fonts) for clean, modern readability.

## 🤝 Contributing

This is a closed-source project for **Mekong Marketing**. Contact the admin for access.
