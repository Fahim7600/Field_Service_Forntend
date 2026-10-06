# FieldServe Frontend

> Modern, robust, and responsive Field Service Management (FSM) web application built with Next.js 15, React 19, TypeScript, Tailwind CSS, and Biome.

[![Next.js](https://img.shields.io/badge/Next.js-15.5-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Biome](https://img.shields.io/badge/Biome-2.2-60A5FA?style=flat-square&logo=biome)](https://biomejs.dev/)
[![License](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](LICENSE)

---

## 📌 Overview

**FieldServe** is an enterprise-grade Field Service Management frontend designed to streamline field operations, service scheduling, work order dispatching, technician telemetry, invoice generation, and customer communication.

It connects seamlessly to the backend API ([Field_Service Backend](https://github.com/Fahim7600/Field_Service.git)) via Next.js proxy rewrites, ensuring secure cookie handling and real-time operational workflows.

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
├── .env.example              # Environment variables template
├── .env.local                # Local environment secrets (gitignored)
├── biome.json                # Biome linter and formatter configuration
├── next.config.ts            # Next.js configuration & API proxy rewrites
├── package.json              # Dependencies and npm scripts
├── postcss.config.mjs        # PostCSS configuration
├── tsconfig.json             # Strict TypeScript configuration
├── public/                   # Static assets & icons
└── src/
    ├── app/                  # Next.js App Router pages and layouts
    │   ├── favicon.ico
    │   ├── globals.css       # Industrial amber theme tokens & base styles
    │   ├── layout.tsx        # Root layout with Inter font and Toaster
    │   └── page.tsx          # Design system verification test page
    ├── components/
    │   ├── ui/               # shadcn/ui primitive components
    │   ├── layout/           # App shell, navbars, sidebars, headers
    │   ├── shared/           # Reusable widgets, data tables, modals
    │   └── forms/            # Domain-specific forms and inputs
    ├── constants/            # Application constants, navigation items, enums
    ├── hooks/                # Custom React hooks
    ├── lib/                  # Utilities (cn helper), api client configuration
    ├── providers/            # React Query, Auth, and Context providers
    ├── stores/               # Zustand global state stores
    └── types/                # TypeScript shared interfaces and type schemas
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

### Running the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

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

## 🌐 Live Demo & Demo Credentials

- **Live URL**: *Coming soon*
- **Demo Credentials**: *Coming soon*

---

## 🗺️ Roadmap

- [x] **Phase 1: Project Scaffolding & Design System**
  - [x] Next.js 15 App Router + TypeScript Strict setup
  - [x] Biome formatting, linting, and import organization
  - [x] Industrial Amber design system & CSS theme tokens
  - [x] Core shadcn/ui components (Button with CTA variant, Input, Card, Badge, Skeleton, Separator, Sonner)
  - [x] Next.js API proxy rewrites configuration
- [ ] **Phase 2: Authentication & Role-Based Access Control**
  - [ ] JWT authentication with secure httpOnly cookie session management
  - [ ] Customer, Technician, and Admin route guards via `middleware.ts`
  - [ ] User profile and password recovery workflows
- [ ] **Phase 3: Customer Portal**
  - [ ] Multi-step service booking wizard
  - [ ] Live work order tracker with timeline visualization
  - [ ] Customer billing history and online checkout
- [ ] **Phase 4: Technician Mobile-Optimized Dashboard**
  - [ ] Real-time job queue and dispatch acceptance
  - [ ] Work logs, parts usage, and digital sign-off
- [ ] **Phase 5: Admin Command Center**
  - [ ] Interactive dispatch calendar & technician map
  - [ ] Comprehensive customer, invoice, and inventory management
  - [ ] Operational metrics and revenue analytics

---

## 🔗 Related Repositories

- Backend API: [https://github.com/Fahim7600/Field_Service.git](https://github.com/Fahim7600/Field_Service.git)

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
