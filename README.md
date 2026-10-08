# Field Service Frontend

> Modern, robust, and responsive Field Service Management (FSM) web application built with Next.js 15, React 19, TypeScript, Tailwind CSS, and Biome.

[![Next.js](https://img.shields.io/badge/Next.js-15.5-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Biome](https://img.shields.io/badge/Biome-2.2-60A5FA?style=flat-square&logo=biome)](https://biomejs.dev/)
[![License](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](LICENSE)

---

## 📌 Overview

**Field Service** is an enterprise-grade Field Service Management frontend designed to streamline field operations, service scheduling, work order dispatching, technician telemetry, invoice generation, and customer communication.

It connects seamlessly to the backend API ([Field_Service Backend](https://github.com/Fahim7600/Field_Service.git)) via Next.js proxy rewrites, ensuring secure cookie handling and real-time operational workflows.

The complete backend OpenAPI 3.0 schema is archived locally at [`docs/openapi.json`](docs/openapi.json).

---

## 🏗️ Architecture: Auth & Data Fetching

The application employs a secure authentication and dual data-fetching strategy:

```text
[ Incoming Request ]
        │
        ├── 0. Edge Middleware (src/middleware.ts)
        │      └── Reads fs_role cookie: redirects unauthenticated users to /login and
        │          enforces role-segregated routes (/admin, /technician, /customer)
        │
[ Browser / Client Components ]
        │
        ├── 1. Same-Origin Requests (/api/v1/...)
        │      └── Next.js Rewrites Proxy ──► [ Express Backend API ]
        │
        ├── 2. In-Memory Access Token (Zustand - No persistence)
        │      └── Sent via Authorization: Bearer <token>
        │
        ├── 3. httpOnly Refresh Cookie (Backend cookie)
        │      └── Silently exchanged on boot & on 401 via single-flight interceptor
        │
        ├── 4. Routing Cookies (Set by /api/session route handler)
        │      └── fs_role, fs_hint, fs_must_change
        │
        └── 5. Client State: TanStack Query (60s staleTime, 4xx retry suppression, global toast)

[ Next.js Server Components ]
        │
        └── Direct Server Fetch (serverFetch<T> in src/lib/server-api.ts)
               └── Calls backend API directly (ISR, revalidate, tags) for public pages
```

### Key Architectural Pillars

1. **Edge Middleware Route Protection**: `src/middleware.ts` runs on the Edge, intercepting protected dashboard paths (`/admin`, `/technician`, `/customer`) and authentication routes (`/login`, `/register`). It checks the verified `fs_role` cookie, redirects unauthenticated requests to login with encoded redirect params, and smoothly redirects users with mismatched roles to their authorized dashboard with `?role_redirect=1`.
2. **Same-Origin API Proxy**: All client-side HTTP calls route through `/api/v1/*` using Next.js `rewrites()`. Because requests are same-origin, the backend's `httpOnly` refresh token cookie resides on the frontend domain.
3. **Strict In-Memory Access Tokens**: Access tokens are kept exclusively in memory within a Zustand store (`src/stores/auth-store.ts`). Tokens are never persisted to `localStorage` or `sessionStorage`.
4. **Session Routing Cookies**: Next.js route handler (`/api/session`) synchronizes routing metadata (`fs_role`, `fs_hint`, `fs_must_change`) on the frontend origin.
5. **Silent Session Restoration**: On app load, `AuthProvider` checks for the `fs_hint=1` cookie; if present, it silently contacts `/auth/refresh-token` and restores `/users/me`.
6. **Single-Flight 401 Interceptor**: If an authenticated call expires (401), the Axios client locks incoming 401s behind a single in-flight refresh promise, exchanges the cookie for a new access token, and retries all concurrent queued requests.
7. **Server-Side Fetch for Public Pages**: Public marketing pages execute on the server using `serverFetch<T>` (`server-only`), communicating directly with the backend.
8. **TanStack Query for Dashboards**: Authenticated views fetch via TanStack Query with smart caching, background revalidation, and automated error reporting.

---

## 🔐 Authentication Flows

Field Service implements end-to-end authentication patterns aligned strictly with the backend OpenAPI specification:

1. **Email & Password Login**:
   - Submits credentials to `POST /api/v1/auth/login`.
   - Stores `accessToken` in the in-memory Zustand store and syncs `fs_role`, `fs_hint`, and `fs_must_change` via `/api/session`.
   - If `mustChangePassword` is returned as `true`, the user is immediately routed to `/change-password`. Otherwise, redirects to the role home (`/admin`, `/technician`, `/customer`).

2. **Customer Registration with Auto-Login**:
   - Validates full name, email, optional phone/address, and strict password rules via `registerSchema` (React Hook Form + Zod).
   - Shows live interactive password complexity checklist (`PasswordRequirements`).
   - Automatically sanitizes empty strings and posts payload to `POST /api/v1/auth/register`.
   - Automatically initializes session in memory, sets session cookies, and redirects the new customer to `/customer`.

3. **Google OAuth via Proxy**:
   - Triggers sign-in through the frontend proxy endpoint `GET /api/v1/auth/google`.
   - The backend redirects to `/oauth-callback?token=...`.
   - The callback handler scrubs the token from the browser history via `window.history.replaceState`, loads the profile with `GET /api/v1/users/me`, syncs session cookies, and transitions to the user's role dashboard.

4. **Forced Password Change for First-Time Staff**:
   - Server component reads `fs_must_change` cookie and passes the requirement to `<ChangePasswordForm />`.
   - Displays a security alert explaining that a password update is required.
   - Live requirement checklist enforces uppercase, lowercase, number, and 8+ characters.
   - On `PATCH /api/v1/auth/change-password` success, clears all credentials, caches, and routing cookies, then directs to `/login?passwordChanged=1` for clean re-authentication with new privileges.

5. **One-Click Demo Access**:
   - Quick-fill demo authentication for Admin Dispatcher, Customer, and Field Technician accounts directly on the login card.

6. **Edge Role Guarding & Session Routing Cookies**:
   - Uses `fs_role` (verified role), `fs_must_change` (temporary password flag), and `fs_hint` (non-sensitive boolean for silent session restoration) for instant Edge middleware routing and server-side state evaluation.

---

## 🎨 Design System & Theme Tokens

Field Service uses a purpose-built **Industrial Amber** color system engineered for contrast, professional clarity, and tactile focus:

### Color Palette

| Token | Hex Value | Role / Usage |
|---|---|---|
| `brand-500` | `#F97316` | Safety Orange / Primary brand accent |
| `brand-600` | `#EA580C` | Deep Amber / Hover states |
| `brand-700` | `#C2410C` | Dark Terracotta / Gradient stops |
| `terracotta` | `#A8442A` | Industrial Terracotta |
| `charcoal-900` | `#111827` | Deep Charcoal / Primary text & headers |
| `charcoal-800` | `#1F2937` | Base Charcoal / Primary buttons & active elements |
| `charcoal-600` | `#4B5563` | Slate Charcoal / Secondary text & subtitles |
| `ash` | `#9CA3AF` | Ash Grey / Footer text & placeholder tones |
| `background` | `#F3F4F6` | App background |
| `panel` | `#F9FAFB` | Sub-surface panel background |
| `card` | `#FFFFFF` | Card surface |
| `border` | `#E5E7EB` | Subtle dividing border |

### UI Rules & Button Variants

- **Primary Button Rule**: Standard action buttons use `charcoal-800` (`#1F2937`) as the primary fill to maintain an authoritative, high-contrast industrial look.
- **Exclusive CTA Rule**: The `cta` button variant (`bg-gradient-to-r from-brand-500 to-brand-700 text-white shadow-sm`) is the **ONLY** place bold orange gradient styling is applied to buttons, reserved exclusively for primary transactional actions (e.g., *"Book Service"*, *"Pay Invoice"*).
- **Gradient Line**: The utility class `.gradient-line` provides a 3px amber-to-terracotta border used at the base of the navigation bar and hero accents.

---

## 🚀 Planned Features by Role

### 👤 Customer Portal
- **Service Request & Booking**: Interactive multi-step booking with service category selection, address autofill, and preferred time windows.
- **Real-Time Job Tracking**: Live status timeline (Requested → Scheduled → Dispatched → In Progress → Completed) with technician profile.
- **Digital Invoices & Payments**: Instant invoice review, breakdown of labor and parts, digital signature, and secure payment processing.
- **Rating & Feedback**: Post-service rating, photo upload, and feedback submission.

### 🔧 Technician Workspace
- **Daily Job Schedule & Route**: Interactive daily schedule with geolocation mapping, route optimization, and turn-by-turn navigation links.
- **Job Execution & Checklists**: Step-by-step checklist compliance, safety inspection forms, and notes capture.
- **Parts & Inventory Consumption**: Real-time logging of parts utilized from vehicle inventory with barcode scanning support.
- **Digital Sign-off & Work Logs**: Time-tracking (travel, on-site, pause) and customer digital signature capture.

### 🛡️ Admin & Dispatcher Command Center
- **Dynamic Dispatch Board**: Drag-and-drop technician scheduling, calendar/timeline views, and smart auto-dispatch assignment.
- **Work Order Lifecycle Management**: Comprehensive work order CRUD, SLA monitoring, priority tagging, and automated escalation triggers.
- **Inventory & Asset Tracking**: Multi-warehouse and van inventory levels, reorder threshold alerts, and asset service history.
- **Financials & Analytics**: Real-time revenue dashboards, technician utilization metrics, first-time fix rates, and job profitability reports.

---

## 🛠️ Tech Stack

| Category | Technology | Description |
|---|---|---|
| **Framework** | [Next.js 15 (App Router)](https://nextjs.org/) | Hybrid Server & Client rendering, API rewrites proxy |
| **Language** | [TypeScript (Strict)](https://www.typescriptlang.org/) | Strict type safety and robust developer experience |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) | High-performance atomic CSS with industrial amber theme tokens |
| **Component Library** | [shadcn/ui](https://ui.shadcn.com/) (Base UI) | Accessible, customizable primitive UI components |
| **Linter & Formatter** | [Biome](https://biomejs.dev/) | Sub-millisecond formatting, import organization, and strict linting |
| **State Management** | [Zustand](https://github.com/pmndrs/zustand) | Minimalist and fast client state store |
| **Data Fetching** | [@tanstack/react-query](https://tanstack.com/query) | Async server state synchronization, caching, and optimistic updates |
| **Forms & Validation** | [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) | Type-safe form validation and state handling |
| **Notifications** | [Sonner](https://sonner.emilkowal.ski/) | Opinionated and elegant toast notification system |
| **Icons** | [Lucide React](https://lucide.dev/) | Clean, consistent SVG icon set |
| **HTTP Client** | [Axios](https://axios-http.com/) | Configured client for API requests and interceptors |
| **Charts** | [Recharts](https://recharts.org/) | Composable analytics and operational charting |
| **Date Utilities** | [date-fns](https://date-fns.org/) | Modern, modular date manipulation library |

---

## 📁 Project Structure

```text
Field_Service_Forntend/
├── docs/
│   └── openapi.json          # Live backend OpenAPI 3.0 specification
├── .env.example              # Environment variables template
├── .env.local                # Local environment secrets (gitignored)
├── biome.json                # Biome linter and formatter configuration
├── next.config.ts            # Next.js configuration & API proxy rewrites
├── package.json              # Dependencies and npm scripts
├── postcss.config.mjs        # PostCSS configuration
├── tsconfig.json             # Strict TypeScript configuration
├── public/                   # Static assets & icons
└── src/
    ├── middleware.ts         # Edge middleware for role-based route guarding
    ├── app/                  # Next.js App Router pages, layouts, and error boundaries
    │   ├── (auth)/
    │   │   ├── change-password/ # Change password page (server component + client form)
    │   │   ├── layout.tsx    # Dedicated authentication shell
    │   │   ├── login/        # Login page with validated form & demo cards
    │   │   ├── oauth-callback/ # Google OAuth token callback handler
    │   │   └── register/     # Registration page with auto-login
    │   ├── (dashboard)/
    │   │   ├── admin/        # Admin command center workspace
    │   │   ├── customer/     # Customer portal workspace
    │   │   ├── technician/   # Technician operational workspace
    │   │   ├── layout.tsx    # Dashboard shell with fixed sidebar & topbar
    │   │   └── loading.tsx   # Dashboard skeleton loading state
    │   ├── (dev)/
    │   │   └── test-error/   # Dev-only test error page
    │   ├── (marketing)/
    │   │   ├── layout.tsx    # Public marketing shell with Navbar and Footer
    │   │   ├── loading.tsx   # Skeleton loading state
    │   │   └── page.tsx      # Landing page / design system verification
    │   ├── api/
    │   │   └── session/      # Session cookie synchronization route handler
    │   ├── error.tsx         # Global client error boundary with retry
    │   ├── global-error.tsx  # Root fallback error boundary
    │   ├── globals.css       # Industrial amber theme tokens & base styles
    │   ├── layout.tsx        # Root layout with Inter font and Toaster
    │   └── not-found.tsx     # Custom 404 error page
    ├── components/
    │   ├── dashboard/        # DashboardWelcomeHeader
    │   ├── forms/            # LoginForm, RegisterForm, ChangePasswordForm, DemoLogin, PasswordRequirements, PasswordInput, SocialAuth
    │   ├── layout/           # App shell, Navbar, NavLinks, AuthActions, UserMenu, DashboardSidebar, DashboardTopbar, DashboardLayout, Footer, MobileNav
    │   ├── shared/           # Logo, Container, PageHeader, EmptyState, RoleRedirectToast
    │   └── ui/               # shadcn/ui primitive components (Avatar, DropdownMenu, Button, Sheet, etc.)
    ├── constants/            # Site config, demo accounts, dashboard links, navigation links
    ├── hooks/                # useAuth, useLogin, useRegister, useChangePassword, useDebounce
    ├── lib/                  # api-client, session, session-cookies, auth-routes, query-client, server-api, validations
    ├── providers/            # QueryProvider, AuthProvider
    ├── services/             # auth.service.ts
    ├── stores/               # Zustand auth-store
    └── types/                # API and Auth TypeScript definitions
```

---

## ⚙️ Getting Started

### Prerequisites

- **Node.js**: `v20.x` or `v24.x` (LTS recommended)
- **npm**: `v10.x` or higher
- **Backend API**: Running instance of [Field_Service Backend](https://github.com/Fahim7600/Field_Service.git) or deployed cloud service.

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Fahim7600/Field_Service_Forntend.git
   cd Field_Service_Forntend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```

### Environment Variables

| Variable | Default Value | Description |
|---|---|---|
| `BACKEND_URL` | `https://field-service-d24g.onrender.com` | Target Express + Prisma backend API endpoint |
| `NEXT_PUBLIC_API_BASE` | `/api/v1` | Public API base path |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` | Local frontend origin |
| `NEXT_PUBLIC_DEMO_ADMIN_EMAIL` | *(Optional)* | Admin demo account email |
| `NEXT_PUBLIC_DEMO_ADMIN_PASSWORD` | *(Optional)* | Admin demo account password |
| `NEXT_PUBLIC_DEMO_CUSTOMER_EMAIL` | *(Optional)* | Customer demo account email |
| `NEXT_PUBLIC_DEMO_CUSTOMER_PASSWORD` | *(Optional)* | Customer demo account password |
| `NEXT_PUBLIC_DEMO_TECHNICIAN_EMAIL` | *(Optional)* | Technician demo account email |
| `NEXT_PUBLIC_DEMO_TECHNICIAN_PASSWORD` | *(Optional)* | Technician demo account password |

### Running the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

---

## 🔑 Demo Accounts

One-click demo login buttons are integrated into the login page (`/login`) for fast evaluation across roles:

- **Admin Dispatcher**: Full access to dispatching, technician oversight, customer service logs, and analytics.
- **Customer**: Access to service booking, real-time job timeline, and invoice payment workflows.
- **Field Technician**: Access to daily job schedule, checklist execution, parts logging, and sign-offs.

*Demo credentials can be configured via the `NEXT_PUBLIC_DEMO_*` environment variables in `.env.local` or entered manually into the login form.*

---

## 📜 Available NPM Scripts

| Script | Command | Description |
|---|---|---|
| `npm run dev` | `next dev --turbopack` | Starts the Next.js dev server with Turbopack |
| `npm run build` | `next build --turbopack` | Builds the production application bundle |
| `npm run start` | `next start` | Runs the compiled production server |
| `npm run lint` | `biome check .` | Runs Biome linting and import checks |
| `npm run format` | `biome format --write .` | Formats codebase according to style rules |
| `npm run fix` | `biome check --write .` | Automatically fixes linting and formatting issues |
| `npm run typecheck`| `tsc --noEmit` | Validates TypeScript types across the project |

---

## 🗺️ Roadmap

- [x] **Phase 1: Project Scaffolding & Design System**
  - [x] Next.js 15 App Router + TypeScript Strict setup
  - [x] Biome formatting, linting, and import organization
  - [x] Industrial Amber design system & CSS theme tokens
  - [x] Core shadcn/ui components (Button with CTA variant, Input, Card, Badge, Skeleton, Separator, Sonner, Sheet)
  - [x] Next.js API proxy rewrites configuration
- [x] **Phase 2: Shell Layout, Navigation & Error Handling**
  - [x] Responsive public Navbar with active path indicator and accessible skip link
  - [x] Mobile slide-out Sheet navigation drawer with stacked actions
  - [x] Solid charcoal Footer with link matrix and copyright
  - [x] Custom 404 page, client error boundaries (`error.tsx`, `global-error.tsx`), and loading skeleton
  - [x] Reusable shared layout primitives (`Container`, `PageHeader`, `EmptyState`)
- [x] **Phase 3: Core API Client, Auth Store & Architecture**
  - [x] Local archive of OpenAPI 3.0 specification ([`docs/openapi.json`](docs/openapi.json))
  - [x] Strict TypeScript types for API responses, errors, pagination, and Auth models
  - [x] Axios client with single-flight silent 401 token refresh & typed helper methods
  - [x] In-memory Zustand auth store without persistence
  - [x] TanStack Query client with 4xx retry suppression and global toast handlers
  - [x] Server-side `serverFetch<T>` utility and `useAuth` / `useDebounce` hooks
- [x] **Phase 4: Authentication & Role-Aware Routing**
  - [x] Login page with React Hook Form + Zod real-time validation
  - [x] PasswordInput component with eye visibility toggle
  - [x] Session cookie route handler (`/api/session`) for Next.js routing metadata (`fs_role`, `fs_hint`, `fs_must_change`)
  - [x] One-click demo login system for Admin, Customer, and Technician roles
  - [x] Dynamic role redirection (`getSafeRedirect()`) and logout flow
  - [x] Temporary role dashboard landing pages
- [x] **Phase 5: Registration, Password Change & Social OAuth**
  - [x] Customer registration form with live password complexity validation
  - [x] Password requirements live interactive checklist (`PasswordRequirements`)
  - [x] Auto-login and session initialization upon registration
  - [x] Google OAuth sign-in button & `/oauth-callback` handler with token URL scrubbing
  - [x] Forced password change flow (`/change-password`) for first-login technicians
  - [x] Session and routing cookie invalidation on credential change
- [x] **Phase 6: Edge Middleware Guarding & Dashboard Shell**
  - [x] Edge middleware route protection (`src/middleware.ts`)
  - [x] Cross-role redirection with `?role_redirect=1` query and toast notification
  - [x] Authenticated `<UserMenu />` dropdown with initials fallback and profile/dashboard links
  - [x] Dashboard navigation constants for Admin, Technician, and Customer roles
  - [x] Fixed sidebar shell, sticky topbar with notifications and mobile slide-out drawer
- [ ] **Phase 7: Customer Portal & Booking Wizard**
  - [ ] Multi-step service booking wizard
  - [ ] Live work order tracker with timeline visualization
  - [ ] Customer billing history and online checkout
- [ ] **Phase 8: Technician Mobile-Optimized Dashboard**
  - [ ] Real-time job queue and dispatch acceptance
  - [ ] Work logs, parts usage, and digital sign-off
- [ ] **Phase 9: Admin Command Center**
  - [ ] Interactive dispatch calendar & technician map
  - [ ] Comprehensive customer, invoice, and inventory management
  - [ ] Operational metrics and revenue analytics

---

## 🔗 Related Repositories

- Backend API: [https://github.com/Fahim7600/Field_Service.git](https://github.com/Fahim7600/Field_Service.git)

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
