# 🌾 Mekong Agency - AgencyOS 2026

> **The Ultimate Digital Marketing Platform for Mekong Delta SMEs**
> Built with Material Design 3 (Expressive), Vanilla JS, and Supabase.

![AgencyOS Banner](assets/images/case-study-growth.png)

## 🚀 Overview

**Mekong Agency** (formerly Sa Đéc Marketing Hub) is a comprehensive platform designed to connect local businesses in the Mekong Delta (ĐBSCL) with advanced digital marketing services.

**AgencyOS 2026** is the codename for our v2.0 architecture, featuring:
-   **Unified Admin Portal**: Manage leads, campaigns, finance, and content in one place.
-   **Client Portal**: Transparent reporting and project tracking for clients.
-   **AI-Powered Tools**: Gemini-integrated multimodal analysis for marketing assets.
-   **Performance First**: Zero-framework architecture (Vanilla JS + Web Components) for maximum speed.

**Live URL**: `https://sadec-marketing-hub.pages.dev`

---

## ✨ Key Features

### 🏢 Agency Management
-   **Lead Pipeline (CRM)**: Kanban-style lead tracking with "Hot/Warm/Cold" scoring.
-   **Campaign Manager**: Track Facebook, Google, Zalo, and TikTok campaigns with ROI analysis.
-   **Finance Dashboard**: Real-time P&L, cash flow forecasting, and invoicing.
-   **Content Calendar**: Drag-and-drop scheduler for multi-channel content.

### 🤖 AI Capabilities
-   **Multimodal Analysis**: Analyze screenshots, videos, and documents using Gemini AI.
-   **Content Generation**: AI-assisted blog posts, social captions, and ad copy.
-   **Lead Scoring**: Automated lead qualification based on interaction data.

### 👥 Client & Partner Portals
-   **Client Dashboard**: Real-time view of campaign performance and project status.
-   **Affiliate System**: Referral tracking and commission management for partners.

---

## 🛠️ Tech Stack

The project follows a **"No-Build"** philosophy for simplicity and longevity.

-   **Frontend**: HTML5, CSS3 (Variables), Vanilla JavaScript (ES Modules).
-   **Design System**: Google Material Design 3 (Expressive) with custom "Mekong Aurora" themes.
-   **Backend / DB**: Supabase (PostgreSQL, Auth, Edge Functions, Realtime).
-   **AI**: Google Gemini API (via Edge Functions).
-   **Hosting**: Cloudflare Pages

---

## 📂 Project Structure

```
/
├── admin/                  # Admin Dashboard Pages (Leads, Finance, etc.)
├── portal/                 # Client Portal Pages (Dashboard, Projects)
├── assets/
│   ├── css/                # M3 Design System & Theme Styles
│   │   ├── m3-agency.css   # Core Design Tokens & Components
│   │   └── admin-unified.css # Unified Admin Layout Styles
│   └── js/                 # Core Logic Modules
│       ├── auth.js         # Centralized Auth & RBAC
│       ├── utils.js        # MekongUtils (Formatting, Helpers)
│       └── components/     # Web Components (sadec-sidebar, etc.)
├── database/               # SQL Migrations & Seeds
├── docs/                   # Documentation
├── supabase/               # Edge Functions & Config
├── index.html              # Landing Page
└── login.html              # Unified Login Page
```

---

## ⚡ Quick Start

### Prerequisites
-   Node.js (for local dev server)
-   Supabase Account

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/your-org/mekong-agency.git
    cd mekong-agency
    ```

2.  **Install dependencies** (Only for dev tools, no build step required)
    ```bash
    npm install
    ```

3.  **Setup Environment**
    Copy `mekong-env.js.example` to `mekong-env.js` and add your Supabase credentials.
    ```javascript
    window.MekongEnv = {
        SUPABASE_URL: "your-project-url",
        SUPABASE_ANON_KEY: "your-anon-key"
    };
    ```

4.  **Run Local Server**
    ```bash
    npx serve .
    ```
    Open `http://localhost:3000` in your browser.

---

## 🔐 Authentication & Roles

The system uses a Role-Based Access Control (RBAC) model:

-   **Super Admin**: Full access to all modules.
-   **Manager**: Access to Campaigns, Leads, and Reports.
-   **Content Creator**: Access to Content Calendar and AI Tools.
-   **Client**: Read-only access to their specific projects and invoices.
-   **Affiliate**: Access to referral dashboard.

**Demo Credentials:**
-   Admin: `admin@mekongmarketing.com` / `admin123`
-   Client: `client@mekongmarketing.com` / `client123`

---

## 📚 Documentation

-   [**API Reference**](docs/api-reference.md): Auth, Utils, and Edge Functions.
-   [**Component Guide**](docs/component-guide.md): UI Components and CSS classes.
-   [**Deployment Guide**](docs/deployment-guide.md): Supabase setup and production checklist.

---

## 🤝 Contributing

This is a closed-source project for **Mekong Marketing**.
Contact the admin for access.

© 2026 Mekong Agency. All rights reserved.
