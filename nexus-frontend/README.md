# NEXUS Frontend

React + TypeScript + Tailwind CSS frontend for the NEXUS platform.

---

## Tech Stack

- React 18 + TypeScript
- Tailwind CSS (dark theme, apocalypse aesthetic)
- React Router DOM (routing)
- React Hook Form (form handling)
- Zod (form validation)
- Axios (HTTP requests)
- React Toastify (toast notifications)
- Lucide React / React Icons (icons)

---

## Folder Structure

```
nexus-frontend/
├── public/
│
├── src/
│   │
│   │   # ─── SHARED (Dev Lead: Wunna Moe San) ───────────────
│   │   # Do NOT modify without Dev Lead approval.
│   │
│   ├── shared/
│   │   ├── components/
│   │   │   ├── Layout.tsx              # App shell: sidebar + main content area
│   │   │   ├── Sidebar.tsx             # Sidebar nav (adapts per role)
│   │   │   ├── WorldBadge.tsx          # Colored badge showing world name
│   │   │   ├── StatusBadge.tsx         # Status indicator (surplus/stable/low/critical/etc)
│   │   │   ├── RoleBadge.tsx           # Role indicator tag
│   │   │   ├── EmptyState.tsx          # Empty state placeholder
│   │   │   └── LoadingState.tsx        # Loading spinner with message
│   │   │
│   │   ├── hooks/
│   │   │   └── useAuth.ts             # Auth context hook (current user, role, world)
│   │   │
│   │   ├── types/
│   │   │   └── shared.types.ts        # Shared TypeScript types (World, User, enums)
│   │   │
│   │   └── utils/
│   │       └── constants.ts           # World colors, resource types, status mappings
│   │
│   ├── middlewares/
│   │   └── ProtectedRoute.tsx         # Route guard: checks auth + role permission
│   │
│   ├── api.ts                         # Axios instance with base URL and JWT interceptor
│   ├── App.tsx                        # Root component, AuthProvider, ToastContainer
│   ├── routers.tsx                    # Top-level route definitions
│   ├── index.css                      # Tailwind directives + CSS variables
│   ├── main.tsx                       # React entry point
│   │
│   │   # ─── AUTH MODULE (Dev Lead: Wunna Moe San) ──────────
│   │   # Sign in, sign up, role-based redirect.
│   │
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── apis/
│   │   │   │   └── auth.api.ts        # POST /auth/signin, POST /auth/signup
│   │   │   │
│   │   │   ├── components/
│   │   │   │   ├── SignInForm.tsx
│   │   │   │   └── SignUpForm.tsx
│   │   │   │
│   │   │   ├── pages/
│   │   │   │   ├── HomePage.tsx        # Public landing page
│   │   │   │   ├── SignInPage.tsx
│   │   │   │   └── SignUpPage.tsx
│   │   │   │
│   │   │   ├── routers/
│   │   │   │   └── auth.router.tsx
│   │   │   │
│   │   │   ├── schemas/
│   │   │   │   └── auth.schema.ts     # Zod: signInSchema, signUpSchema
│   │   │   │
│   │   │   └── types/
│   │   │       └── auth.types.ts
│   │   │
│   │   │   # ─── ADMIN PORTAL (Min Thuta — 68130500839) ─────
│   │   │   # Your code goes ONLY in this folder.
│   │   │
│   │   ├── admin/
│   │   │   ├── apis/
│   │   │   │   ├── world.api.ts       # Worlds CRUD
│   │   │   │   ├── code.api.ts        # Access codes CRUD
│   │   │   │   ├── approval.api.ts    # Approval queue
│   │   │   │   ├── user.api.ts        # User directory
│   │   │   │   └── overview.api.ts    # Platform stats
│   │   │   │
│   │   │   ├── components/
│   │   │   │   ├── WorldList.tsx
│   │   │   │   ├── WorldRequestForm.tsx
│   │   │   │   ├── PendingRequests.tsx
│   │   │   │   ├── RequestHistory.tsx
│   │   │   │   ├── CodeGenerateForm.tsx
│   │   │   │   ├── CodeTable.tsx
│   │   │   │   ├── ApprovalQueue.tsx
│   │   │   │   ├── UserTable.tsx
│   │   │   │   └── OverviewCards.tsx
│   │   │   │
│   │   │   ├── pages/
│   │   │   │   ├── WorldManagementPage.tsx
│   │   │   │   ├── CodeGenerationPage.tsx
│   │   │   │   ├── ApprovalQueuePage.tsx
│   │   │   │   ├── UserDirectoryPage.tsx
│   │   │   │   └── PlatformOverviewPage.tsx
│   │   │   │
│   │   │   ├── routers/
│   │   │   │   └── admin.router.tsx
│   │   │   │
│   │   │   ├── schemas/
│   │   │   │   ├── world.schema.ts
│   │   │   │   ├── code.schema.ts
│   │   │   │   └── approval.schema.ts
│   │   │   │
│   │   │   └── types/
│   │   │       └── admin.types.ts
│   │   │
│   │   │   # ─── RESOURCE EXCHANGE (Kyi Phyu Thiri Khaing — 68130500851) ──
│   │   │   # Your code goes ONLY in this folder.
│   │   │
│   │   ├── resource-exchange/
│   │   │   ├── apis/
│   │   │   │   ├── resource.api.ts    # GET/PUT resource stocks
│   │   │   │   └── trade.api.ts       # Trade requests CRUD
│   │   │   │
│   │   │   ├── components/
│   │   │   │   ├── WorldResourceColumn.tsx
│   │   │   │   ├── ResourceRow.tsx
│   │   │   │   ├── EditStocksForm.tsx
│   │   │   │   ├── TradeRequestCard.tsx
│   │   │   │   ├── TradeRequestForm.tsx
│   │   │   │   ├── IncomingRequests.tsx
│   │   │   │   ├── OutgoingRequests.tsx
│   │   │   │   ├── ActiveTrades.tsx
│   │   │   │   ├── TradeHistory.tsx
│   │   │   │   └── AcceptDeclineModal.tsx
│   │   │   │
│   │   │   ├── pages/
│   │   │   │   ├── ResourceOverviewPage.tsx
│   │   │   │   ├── TradeDashboardPage.tsx
│   │   │   │   └── RequestTradePage.tsx
│   │   │   │
│   │   │   ├── routers/
│   │   │   │   └── resource-exchange.router.tsx
│   │   │   │
│   │   │   ├── schemas/
│   │   │   │   ├── resource.schema.ts
│   │   │   │   └── trade.schema.ts
│   │   │   │
│   │   │   └── types/
│   │   │       └── resource-exchange.types.ts
│   │   │
│   │   │   # ─── CARGO LOGISTICS (Nang Thiri Htet Hsu — 68130500853) ──
│   │   │   # Your code goes ONLY in this folder.
│   │   │
│   │   ├── cargo-logistics/
│   │   │   ├── apis/
│   │   │   │   └── shipment.api.ts    # Shipments CRUD, timeline, flags
│   │   │   │
│   │   │   ├── components/
│   │   │   │   ├── ShipmentTable.tsx
│   │   │   │   ├── ShipmentRow.tsx
│   │   │   │   ├── ShipmentDetail.tsx
│   │   │   │   ├── ShipmentManifest.tsx
│   │   │   │   ├── ShipmentTimeline.tsx
│   │   │   │   ├── ShipmentFlags.tsx
│   │   │   │   ├── CreateShipmentForm.tsx
│   │   │   │   ├── ManifestItemRow.tsx
│   │   │   │   └── RouteMap.tsx
│   │   │   │
│   │   │   ├── pages/
│   │   │   │   ├── ShipmentBoardPage.tsx
│   │   │   │   ├── ShipmentDetailPage.tsx
│   │   │   │   ├── CreateShipmentPage.tsx
│   │   │   │   └── RouteOverviewPage.tsx
│   │   │   │
│   │   │   ├── routers/
│   │   │   │   └── cargo-logistics.router.tsx
│   │   │   │
│   │   │   ├── schemas/
│   │   │   │   └── shipment.schema.ts
│   │   │   │
│   │   │   └── types/
│   │   │       └── cargo-logistics.types.ts
│   │   │
│   │   │   # ─── COMMERCIAL MARKETPLACE (Wunna Moe San — 681305008535) ──
│   │   │   # Dev Lead's feature module.
│   │   │
│   │   └── commercial-marketplace/
│   │       ├── apis/
│   │       │   ├── listing.api.ts     # Listings CRUD
│   │       │   └── trade-offer.api.ts # Trade offers CRUD
│   │       │
│   │       ├── components/
│   │       │   ├── ListingCard.tsx
│   │       │   ├── ListingGrid.tsx
│   │       │   ├── ListingDetail.tsx
│   │       │   ├── ListingPhotos.tsx
│   │       │   ├── PostItemForm.tsx
│   │       │   ├── PhotoUpload.tsx
│   │       │   ├── TradeOfferPanel.tsx
│   │       │   ├── InventorySelector.tsx
│   │       │   ├── MyItemsList.tsx
│   │       │   ├── IncomingOffers.tsx
│   │       │   ├── OutgoingOffers.tsx
│   │       │   ├── CompletedTrades.tsx
│   │       │   └── TradeOfferCard.tsx
│   │       │
│   │       ├── pages/
│   │       │   ├── BrowseMarketplacePage.tsx
│   │       │   ├── ListingDetailPage.tsx
│   │       │   ├── TradeOfferPage.tsx
│   │       │   ├── PostItemPage.tsx
│   │       │   ├── MyItemsPage.tsx
│   │       │   └── MyTradesPage.tsx
│   │       │
│   │       ├── routers/
│   │       │   └── commercial-marketplace.router.tsx
│   │       │
│   │       ├── schemas/
│   │       │   ├── listing.schema.ts
│   │       │   └── trade-offer.schema.ts
│   │       │
│   │       └── types/
│   │           └── commercial-marketplace.types.ts
│
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── README.md                          # This file
```

---

## Setup

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
```

The frontend runs on `http://localhost:5173` by default (Vite).

---

## Environment

Create a `.env` file if needed:

```env
VITE_API_URL=http://localhost:3000/api
```

---

## Routing Structure

```
/                           → HomePage (public landing)
/signin                     → SignInPage
/signup                     → SignUpPage

/admin/                     → (ProtectedRoute: role=admin)
  /admin/approval-queue     → ApprovalQueuePage
  /admin/code-generation    → CodeGenerationPage
  /admin/world-management   → WorldManagementPage
  /admin/user-directory     → UserDirectoryPage
  /admin/overview           → PlatformOverviewPage

/resource-exchange/         → (ProtectedRoute: role=resource_manager)
  /resource-exchange/overview       → ResourceOverviewPage
  /resource-exchange/trade          → TradeDashboardPage
  /resource-exchange/trade/new      → RequestTradePage

/cargo-logistics/           → (ProtectedRoute: role=transit_officer)
  /cargo-logistics/shipments            → ShipmentBoardPage
  /cargo-logistics/shipments/new        → CreateShipmentPage
  /cargo-logistics/shipments/:id        → ShipmentDetailPage
  /cargo-logistics/routes               → RouteOverviewPage

/commercial-marketplace/    → (ProtectedRoute: role=commercial_citizen)
  /commercial-marketplace/browse            → BrowseMarketplacePage
  /commercial-marketplace/browse/:id        → ListingDetailPage
  /commercial-marketplace/browse/:id/offer  → TradeOfferPage
  /commercial-marketplace/post              → PostItemPage
  /commercial-marketplace/my-items          → MyItemsPage
  /commercial-marketplace/my-trades         → MyTradesPage
```

After sign-in, users are redirected to their feature's root route based on role:
- `admin` → `/admin/approval-queue`
- `resource_manager` → `/resource-exchange/overview`
- `transit_officer` → `/cargo-logistics/shipments`
- `commercial_citizen` → `/commercial-marketplace/browse`

---

## Module Ownership

### Shared files (Dev Lead ONLY — do not modify)
```
src/shared/**
src/middlewares/**
src/modules/auth/**
src/api.ts
src/App.tsx
src/routers.tsx
src/index.css
src/main.tsx
tailwind.config.ts
```

### Your module (work ONLY inside your folder)

| Member | Folder | Pages |
|--------|--------|-------|
| Min Thuta | `src/modules/admin/` | 5 pages |
| Kyi Phyu Thiri Khaing | `src/modules/resource-exchange/` | 3 pages |
| Nang Thiri Htet Hsu | `src/modules/cargo-logistics/` | 4 pages |
| Wunna Moe San | `src/modules/commercial-marketplace/` | 6 pages |

---

## Conventions

### File naming
- Components: `PascalCase.tsx` (e.g., `ShipmentTable.tsx`)
- API files: `kebab-case.api.ts` (e.g., `trade-offer.api.ts`)
- Schema files: `kebab-case.schema.ts` (e.g., `listing.schema.ts`)
- Type files: `kebab-case.types.ts` (e.g., `admin.types.ts`)
- Router files: `kebab-case.router.tsx` (e.g., `admin.router.tsx`)

### API calls
Always use the shared Axios instance from `src/api.ts`:
```typescript
import api from "@/api";

export const getShipments = () => api.get("/shipments");
```

### Forms
Always use React Hook Form + Zod:
```typescript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { mySchema, MyFormData } from "../schemas/my.schema";

const { register, handleSubmit } = useForm<MyFormData>({
  resolver: zodResolver(mySchema),
});
```

### Toast notifications
```typescript
import { toast } from "react-toastify";

toast.success("Trade request sent.");
toast.error("TRANSMISSION FAILED — Unable to process request.");
```

### Status and world badges
Always use the shared components:
```typescript
import { StatusBadge } from "@/shared/components/StatusBadge";
import { WorldBadge } from "@/shared/components/WorldBadge";
```
