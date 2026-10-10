# Field Service Engineering Notes

Comprehensive technical documentation covering architecture, session lifecycles, user experience patterns, design tokens, operational workflows, and security standards for the Field Service web platform.

---

## 1. Architecture & Session Management

### Dual Layer Data Fetching Strategy
- **Client Components (TanStack Query)**: Authenticated views, dashboard widgets, and user interactions route through same-origin `/api/v1/*` proxy rewrites. Queries utilize 60-second `staleTime`, background window focus revalidation, 4xx retry suppression, and centralized toast error handling.
- **Server Components (Direct Server Fetch)**: Public marketing views, sitemaps, and initial layouts communicate directly with the upstream backend using `serverFetch<T>` (`src/lib/server-api.ts`), enabling Incremental Static Regeneration (ISR) and tags-based cache control.

### Token & Cookie Architecture
- **In-Memory Access Tokens**: Access tokens are held exclusively in memory within a client Zustand store (`src/stores/auth-store.ts`). Tokens are never persisted to `localStorage`, `sessionStorage`, or readable cookies.
- **httpOnly Refresh Cookie**: Issued by the Express backend API during login or token refresh. Because the client communicates via Next.js same-origin rewrites (`/api/v1/*`), the `refreshToken` cookie resides on the frontend domain and is forwarded transparently.
- **Frontend Routing Cookies**: Synchronized via the Next.js `/api/session` route handler:
  - `fs_role`: Verified role (`ADMIN`, `TECHNICIAN`, `CUSTOMER`), set as httpOnly. Read by Next.js Edge Middleware for routing authorization.
  - `fs_hint`: Non-sensitive indicator (`"1"`), accessible to client-side scripts. Prevents unnecessary refresh requests on anonymous visits.
  - `fs_must_change`: httpOnly flag set to `"1"` when a staff user must update their initial password.
  - All routing cookies use `sameSite: "lax"`, `path: "/"`, and `secure: process.env.NODE_ENV === "production"`.

### Edge Middleware Route Protection
- Path matching: `/admin/:path*`, `/technician/:path*`, `/customer/:path*`, `/change-password`, `/login`, `/register`.
- Forced Password Change: Users with `fs_must_change === "1"` attempting to access dashboards or auth routes are immediately redirected to `/change-password`.
- Role Segregation: Mismatched dashboard navigation (e.g. customer navigating to `/admin`) redirects to the user's assigned role home with `?role_redirect=1`.
- Unauthenticated Requests: Protected paths redirect to `/login?redirect={encodedPath}&reason=login_required`.

### Cold Server Resilience & Waking Backend Handling
- **Non-Destructive Timeouts**: API requests support up to a 60-second timeout. Timeouts and network disconnects transition the authentication state to `unreachable` rather than logging the user out. The session is preserved until an explicit 401/403 is received.
- **Early Warm-up Ping**: `BackendWarmup` runs in the root layout, issuing a non-blocking `GET /api/v1/health` once every 10 minutes per browser session to pre-warm sleeping instances.
- **Slow Request Notifications**: Client requests exceeding 6 seconds trigger a single deduplicated "Waking up the server" toast that automatically dismisses once in-flight requests complete.
- **Instant Logout**: `performLogout()` resets Zustand state, query cache, and session storage immediately, clears routing cookies, and fires `POST /api/v1/auth/logout` in the background with `keepalive: true`.

---

## 2. Component Boundaries & Code Organization

### Client Component Export Rule
- Any module marked with `"use client"` must export **components only**.
- Pure utility functions, JSON-LD builders, data normalizers, runtime constants, and Zod schemas imported by Server Components must reside in separate modules that do not contain `"use client"`. Server Components cannot call non-component runtime functions exported from client modules.

### Server-Only Isolation
- Server utilities that access environment secrets or perform direct network calls (e.g. `src/lib/server-api.ts`, `src/lib/server-env.ts`, `src/lib/public-data.ts`) enforce `import "server-only";` at line 1.

---

## 3. Design Tokens & Contrast Standards

### Color System & Palette
| Token | Hex Value | Usage |
|---|---|---|
| `brand-500` | `#F97316` | Accent Orange / Highlights |
| `brand-600` | `#EA580C` | Deep Amber / Hover state |
| `brand-700` | `#C2410C` | Terracotta / Eyebrows, Links, Gradient start |
| `brand-800` | `#9A3412` | Dark Terracotta / CTA Gradient end |
| `charcoal-900` | `#111827` | Deep Charcoal / Headings & primary text |
| `charcoal-800` | `#1F2937` | Base Charcoal / Primary button background |
| `charcoal-600` | `#4B5563` | Slate Charcoal / Secondary subtitles |
| `ash` | `#9CA3AF` | Ash Grey / Footers & muted icons |
| `background` | `#F3F4F6` | Page background |
| `panel` | `#F9FAFB` | Sub-surface panel background |
| `card` | `#FFFFFF` | Card surface |
| `border` | `#E5E7EB` | Dividers & container borders |

### Contrast Rules & Accessibility
- **Primary Buttons**: Built with `charcoal-800` (`#1F2937`) fill and `#FFFFFF` text (17.74:1 contrast).
- **CTA Buttons**: Deep terracotta gradient (`from-[#C2410C] to-[#9A3412]`) with white text and a 2px focus ring, ensuring a minimum 5.18:1 contrast across the entire gradient.
- **Text Links & Eyebrows**: Built with `#C2410C` (5.18:1 contrast on white). Lighter `#F97316` is never used for text on light backgrounds.
- **Dark Bands & Navbars**: `#111827` background with `#FFFFFF` headings, `#E2E8F0` body text (14.39:1), and `#CBD5E1` secondary text (11.95:1). Active navigation links use `#FBBF24` (10.63:1).
- **WCAG Verification**: `scripts/check-contrast.mjs` verifies relative luminance across 16 token pairs against WCAG AA 4.5:1 standards.

---

## 4. User Experience & Interaction Conventions

### Toast Notification Rules
- **User-Initiated Actions Only**: Mutations (create, update, cancel, schedule, pay, refund) trigger exactly one success toast via `notify.success(title, description)`.
- **Silent Background Operations**: Background polling, silent token refreshes, and automatic background refetches never trigger toasts.
- **Centralized Mutation Errors**: Mutation failures trigger exactly one error toast handled globally by `MutationCache.onError`, avoiding duplicate alerts.
- **Concise Copy**: Titles must be factual statements under 40 characters without exclamation marks (e.g. `"Request submitted"`). Descriptions state the immediate consequence under 100 characters (e.g. `"Our dispatch team will review it shortly."`).

### Centralized Message Catalog (`src/lib/messages.ts`)
All notification strings are strongly typed and organized by domain: `requests`, `dispatch`, `tasks`, `invoices`, `payments`, `premium`, `feedback`, `profile`, `admin`, `notifications`, and `generic`.

### State Primitives
- `<QueryError />`: Inline error display featuring retry button, loading spinner, and cold-server waking guidance. Never uses an intrusive toast for full-page load failures.
- `<EmptyState />`: Rendered when query results contain 0 records. Includes domain icon, title, description, and primary call-to-action.
- `<DetailNotFound />`: Standardized 404 display for missing entities (`/requests/[id]`, `/work-orders/[id]`, `/invoices/[id]`) with return navigation.

### Confirm Dialogs (`<ConfirmDialog />`)
- Standard browser dialogs (`window.alert`, `window.confirm`) are strictly prohibited.
- Destructive and irreversible operations require `<ConfirmDialog />` (shadcn/ui `AlertDialog` primitive):
  - Cancelling or rescheduling service appointments (with fee calculation estimates)
  - Admin voiding an invoice
  - Admin issuing a draft invoice
  - Admin refunding a customer payment with mandatory audit reason
  - Admin altering user account status or roles
  - Customer cancelling VIP subscription renewal
  - Technician declining an assigned task with reason
- Confirm dialog buttons display an active loading spinner and prevent modal dismissal while the mutation executes.

### Double-Submit Prevention
- All mutation triggers automatically disable during submission (`disabled={isPending}`).
- Submit buttons display `<Loader2 className="animate-spin" />` with an active verb (`"Saving..."`, `"Submitting..."`, `"Processing..."`).
- Stripe Checkout redirect triggers lock from the moment the session URL is received until the browser unloads.

---

## 5. Public Marketing Pages & SEO

### Safe Images (`<SafeImage />`)
- Wraps Next.js `next/image` with fail-safe error handling.
- If an image fails to load or the network disconnects, it renders a styled industrial charcoal/amber gradient container with a centered `Wrench` icon and matching accessible `aria-label`.
- All `fill` images define responsive `sizes` to eliminate browser layout shifts and Next.js warnings.

### Structured Data & Meta
- **Organization Schema**: Rendered on the home page via `<JsonLd>` with dynamic contact details.
- **FAQPage Schema**: Filtered FAQ accordion questions on `/pricing` rendered as Schema.org `FAQPage` JSON-LD.
- **Dynamic XML Sitemap (`src/app/sitemap.ts`)**: Indexes public routes (`/`, `/services`, `/pricing`, `/about`, `/contact`).
- **Robots Policy (`src/app/robots.ts`)**: Allows public page indexing while blocking private dashboards and API endpoints (`/admin`, `/customer`, `/technician`, `/api`, `/payment`).

### Dynamic Contact Information
Optional business details are read from `NEXT_PUBLIC_CONTACT_EMAIL`, `NEXT_PUBLIC_CONTACT_PHONE`, `NEXT_PUBLIC_CONTACT_ADDRESS`, and `NEXT_PUBLIC_CONTACT_HOURS`. Unset values are cleanly omitted from public displays.

---

## 6. Operational Workflows & Business Rules

### Customer Request & Modification Flow
1. **Submission**: Customer submits service category, title, description, address, preferred datetime, and optional photos (two-step upload).
2. **Review SLA**: Standard requests target review within 24 hours. Premium requests target review within 2 hours.
3. **Cancellation & Rescheduling**:
   - Cancellations prior to technician arrival are permitted.
   - If cancelled or rescheduled within 24 hours of the scheduled visit, a $5.00 (`LATE_FEE_CENTS = 500`) late fee applies to standard customers.
   - Premium subscribers enjoy free cancellation and rescheduling up until technician arrival.

### Admin Dispatch & Work Order Lifecycle
1. **Needs Review Queue (`/admin/dispatch?type=REQUEST_REVIEW`)**: Incoming service requests are reviewed by dispatchers.
2. **Approval**: Creates a linked `WorkOrder` in `APPROVED` status and transitions the request to `APPROVED`.
3. **Assignment**: Dispatcher selects a qualified technician possessing the skill required by the service category. Status moves to `ASSIGNED`.
4. **Technician Response**: Technician reviews task details and accepts or declines. Declining returns the job to `APPROVED` for reassignment.
5. **Visit Scheduling**: Dispatcher schedules the visit time window (`visitStart` and `visitEnd`). Status transitions to `SCHEDULED`.
6. **Execution Stepper**: Technician updates progress sequentially: `SCHEDULED` -> `ARRIVED` -> `IN_PROGRESS` -> `COMPLETED`.
7. **Service Report**: Technician logs hours spent, parts consumed, and uploads completion photos. Filing the report automatically triggers draft invoice generation.

### Billing, Invoicing & Payments
- **Integer Cents Representation**: All monetary values (`amountCents`, `basePriceCents`, `totalCents`) are handled strictly as integer cents to avoid floating-point rounding errors.
- **Draft Invoice Generation**: Created automatically upon service report filing, aggregating labor, diagnostic, and parts line items.
- **Invoice States**: `DRAFT` -> `ISSUED` -> `PAID` or `VOID`.
- **Stripe Checkout Interception**: Unpaid issued invoices initiate Stripe Checkout. Return endpoints (`/api/v1/payments/success`, `/api/v1/payments/cancel`) are intercepted by Next.js route handlers to redirect customers to `/payment/success` and `/payment/cancel`.
- **Payment Verification Polling**: `/payment/success` polls `/api/payment-status?session_id=...` every 2 seconds until `SUCCEEDED` status is verified by the backend.

### Premium Membership Lifecycle
- Plans: Monthly and Yearly subscriptions.
- Activation: Stripe webhook sets status to `ACTIVE`. The frontend polls `GET /api/v1/subscriptions/me` for up to 45 seconds upon return from checkout.
- Cancellation: Auto-renewal is cancelled via `POST /api/v1/subscriptions/cancel`, leaving benefits active until `currentPeriodEnd`.

### Notification Deep Linking
The topbar notification bell polls `GET /api/v1/notifications` every 30 seconds only while the tab is active (`document.visibilityState === "visible"`). Notifications route dynamically to:
- Customer: `/customer/requests/{id}`, `/customer/invoices/{id}`, `/customer/payments`, or `/customer/premium`
- Technician: `/technician/tasks/{workOrderId}` or `/technician/schedule`
- Admin: `/admin/work-orders/{workOrderId}`, `/admin/dispatch/{requestId}`, `/admin/invoices/{invoiceId}`, or `/admin/payments`

---

## 7. Security Standards & Data Hygiene

- **Content Security Policy**: `frame-ancestors 'none'; base-uri 'self'; object-src 'none'`.
- **Strict Headers**: `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `X-Frame-Options: DENY`, `Permissions-Policy: camera=(), microphone=(), geolocation=()`.
- **Safe Redirects (`src/lib/safe-redirect.ts`)**: Rejects protocol-relative URLs (`//`), backslashes (`\`), scheme prefixes (`://`), control characters, and inputs >= 500 characters.
- **Client Storage Limits**:
  - `localStorage`: Only non-sensitive cache keys (`fs_skills_{userId}`, `fs_feedback_{workOrderId}`).
  - `sessionStorage`: Temporary form draft (`fs_report_draft_{workOrderId}`) and warmup timestamp flag (`fs_backend_warmup_ts`).
  - No access tokens, refresh tokens, passwords, or PII are ever stored in browser storage.
