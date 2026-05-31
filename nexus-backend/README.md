# NEXUS Backend

Node.js + Express.js + Prisma + SQLite API server for the NEXUS platform.

---

## Tech Stack

- Node.js + TypeScript
- Express.js (HTTP framework)
- Prisma ORM + SQLite (database)
- Zod (request validation)
- jsonwebtoken (JWT auth)
- bcrypt (password hashing)
- Morgan (request logging)
- UUID (code/shipment ID generation)
- dotenv (environment variables)
- Nodemon (development hot reload)

---

## Folder Structure

```
nexus-backend/
├── prisma/
│   ├── schema.prisma                  # Prisma schema (Dev Lead ONLY)
│   ├── seed.ts                        # Seed script: 4 initial worlds + admin account
│   └── dev.db                         # SQLite database file (auto-generated, gitignored)
│
├── src/
│   │
│   │   # ─── SHARED (Dev Lead: Wunna Moe San) ───────────────
│   │   # Do NOT modify without Dev Lead approval.
│   │
│   ├── middlewares/
│   │   ├── error_handler.ts           # Global error handler
│   │   ├── auth.ts                    # JWT verification middleware
│   │   └── role_guard.ts             # Role-based access middleware
│   │
│   ├── utils/
│   │   ├── jwt.ts                     # JWT sign/verify helpers
│   │   ├── password.ts                # bcrypt hash/compare helpers
│   │   └── code_generator.ts          # Access code string generator
│   │
│   ├── db.ts                          # Prisma client singleton
│   ├── index.ts                       # Express app setup, morgan, routes, error handler
│   ├── routers.ts                     # Top-level route mounting
│   │
│   │   # ─── AUTH MODULE (Dev Lead: Wunna Moe San) ──────────
│   │
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── controllers/
│   │   │   │   └── auth.controller.ts   # signUp, signIn handlers
│   │   │   │
│   │   │   ├── models/
│   │   │   │   └── auth.model.ts        # DB queries: findUserByUsername, createUser, validateCode
│   │   │   │
│   │   │   ├── routers/
│   │   │   │   └── auth.router.ts       # POST /auth/signup, POST /auth/signin
│   │   │   │
│   │   │   ├── schemas/
│   │   │   │   └── auth.schema.ts       # Zod: signUpSchema, signInSchema
│   │   │   │
│   │   │   └── types/
│   │   │       └── auth.types.ts
│   │   │
│   │   │   # ─── ADMIN PORTAL (Min Thuta — 68130500839) ─────
│   │   │   # Your code goes ONLY in this folder.
│   │   │
│   │   ├── admin/
│   │   │   ├── controllers/
│   │   │   │   ├── world.controller.ts
│   │   │   │   ├── code.controller.ts
│   │   │   │   ├── approval.controller.ts
│   │   │   │   ├── user.controller.ts
│   │   │   │   └── overview.controller.ts
│   │   │   │
│   │   │   ├── models/
│   │   │   │   ├── world.model.ts
│   │   │   │   ├── code.model.ts
│   │   │   │   ├── approval.model.ts
│   │   │   │   ├── user.model.ts
│   │   │   │   └── overview.model.ts
│   │   │   │
│   │   │   ├── routers/
│   │   │   │   └── admin.router.ts
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
│   │   │   ├── controllers/
│   │   │   │   ├── resource.controller.ts
│   │   │   │   └── trade.controller.ts
│   │   │   │
│   │   │   ├── models/
│   │   │   │   ├── resource.model.ts
│   │   │   │   └── trade.model.ts
│   │   │   │
│   │   │   ├── routers/
│   │   │   │   └── resource-exchange.router.ts
│   │   │   │
│   │   │   ├── schemas/
│   │   │   │   ├── resource.schema.ts
│   │   │   │   └── trade.schema.ts
│   │   │   │
│   │   │   └── types/
│   │   │       └── resource-exchange.types.ts
│   │   │
│   │   │   # ─── CARGO LOGISTICS (Nan Thiri Htet Su — 68130500853) ──
│   │   │   # Your code goes ONLY in this folder.
│   │   │
│   │   ├── cargo-logistics/
│   │   │   ├── controllers/
│   │   │   │   └── shipment.controller.ts
│   │   │   │
│   │   │   ├── models/
│   │   │   │   └── shipment.model.ts
│   │   │   │
│   │   │   ├── routers/
│   │   │   │   └── cargo-logistics.router.ts
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
│   │       ├── controllers/
│   │       │   ├── listing.controller.ts
│   │       │   └── trade-offer.controller.ts
│   │       │
│   │       ├── models/
│   │       │   ├── listing.model.ts
│   │       │   └── trade-offer.model.ts
│   │       │
│   │       ├── routers/
│   │       │   └── commercial-marketplace.router.ts
│   │       │
│   │       ├── schemas/
│   │       │   ├── listing.schema.ts
│   │       │   └── trade-offer.schema.ts
│   │       │
│   │       └── types/
│   │           └── commercial-marketplace.types.ts
│
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
├── tsconfig.json
└── README.md                          # This file
```

---

## Setup

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Generate Prisma client
npx prisma generate

# Push schema to SQLite database
npx prisma db push

# Seed initial data (4 worlds + admin account)
npm run seed

# Start dev server with hot reload
npm run dev
```

---

## Environment Variables

`.env.example`:
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="nexus-secret-change-in-production"
PORT=3000
```

---

## Package.json Scripts

```json
{
  "scripts": {
    "dev": "nodemon src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "seed": "ts-node prisma/seed.ts",
    "db:push": "prisma db push",
    "db:generate": "prisma generate",
    "db:studio": "prisma studio"
  }
}
```

---

## Seed Data

The seed script (`prisma/seed.ts`) creates:

### 4 Initial Worlds

| World | colorHex | Status |
|-------|----------|--------|
| GloriaVenus | #C47A1A | active |
| NanPtune | #3A8C8C | active |
| MinUranus | #4A6FA5 | active |
| WunnaMars | #A04030 | active |

### 1 Admin Account

| Field | Value |
|-------|-------|
| name | NEXUS Admin |
| username | admin |
| password | admin123 (hashed with bcrypt) |
| role | admin |
| worldId | null (admin has no world — use a dummy world or make worldId nullable for admin) |
| status | active |

### Initial Access Codes (for demo)

12 government codes (1 Resource Manager + 1 Transit Officer + 1 Commercial Citizen per world):

```
GLV-RSM-7742    GloriaVenus    resource_manager
GLV-TRO-3318    GloriaVenus    transit_officer
GLV-CCZ-9901    GloriaVenus    commercial_citizen
NPT-RSM-4401    NanPtune       resource_manager
NPT-TRO-8823    NanPtune       transit_officer
NPT-CCZ-2067    NanPtune       commercial_citizen
MNU-RSM-5567    MinUranus      resource_manager
MNU-TRO-1194    MinUranus      transit_officer
MNU-CCZ-6638    MinUranus      commercial_citizen
WNM-RSM-3352    WunnaMars      resource_manager
WNM-TRO-7719    WunnaMars      transit_officer
WNM-CCZ-4483    WunnaMars      commercial_citizen
```

### Initial Resource Stocks (for Resource Exchange demo)

| World | Fuel | Water | Food | Medicine | Steel |
|-------|------|-------|------|----------|-------|
| GloriaVenus | 12400 MT (surplus) | 3200 KL (stable) | 800 MT (critical) | 5100 MT (stable) | 200 MT (critical) |
| NanPtune | 2100 MT (low) | 14000 KL (surplus) | 9200 MT (surplus) | 3300 MT (stable) | 7600 MT (surplus) |
| MinUranus | 5500 MT (stable) | 4800 KL (stable) | 3100 MT (stable) | 11000 MT (surplus) | 4200 MT (stable) |
| WunnaMars | 15000 MT (surplus) | 1800 KL (low) | 2200 MT (low) | 1200 MT (low) | 3800 MT (stable) |

---

## API Endpoints

### Auth (Dev Lead)

```
POST   /api/auth/signup          # Submit sign-up request with access code
POST   /api/auth/signin          # Sign in, returns JWT
```

### Admin Portal (Min Thuta)

```
# Worlds
GET    /api/admin/worlds                   # List all active worlds
PUT    /api/admin/worlds/:id               # Edit world name/color
POST   /api/admin/worlds/request           # Request new world (goes to pending)
POST   /api/admin/worlds/:id/request-removal   # Request world removal (goes to pending)
PATCH  /api/admin/worlds/requests/:id/approve  # Mark request approved
PATCH  /api/admin/worlds/requests/:id/reject   # Mark request rejected
GET    /api/admin/worlds/requests          # List pending + history

# Codes
POST   /api/admin/codes/generate           # Generate access codes
GET    /api/admin/codes                    # List all codes with filters
PATCH  /api/admin/codes/:id/expire         # Expire unused code

# Approval Queue
GET    /api/admin/approvals                # List pending sign-up requests
PATCH  /api/admin/approvals/:id/approve    # Approve user
PATCH  /api/admin/approvals/:id/reject     # Reject user

# User Directory
GET    /api/admin/users                    # List all users with filters
PATCH  /api/admin/users/:id/revoke         # Revoke user access
PATCH  /api/admin/users/:id/reinstate      # Reinstate user access

# Platform Overview
GET    /api/admin/overview                 # Aggregate platform stats
```

### Resource Exchange (Kyi Phyu Thiri Khaing)

```
# Resources
GET    /api/resources                      # All worlds' resource stocks
GET    /api/resources/:worldId             # Single world's resources
PUT    /api/resources/:worldId             # Update own world's stocks (auth: own world only)

# Trade Requests
GET    /api/trades                         # All trades for your world (incoming + outgoing)
GET    /api/trades/:id                     # Single trade detail with activity log
POST   /api/trades                         # Create new trade request
PATCH  /api/trades/:id/accept              # Accept (with optional comment)
PATCH  /api/trades/:id/decline             # Decline (with optional comment)
PATCH  /api/trades/:id/cancel              # Cancel own pending request
PATCH  /api/trades/:id/fulfill             # Mark trade as fulfilled
```

### Cargo Logistics (Nan Thiri Htet Su)

```
# Shipments
GET    /api/shipments                      # All shipments for your world + filters
GET    /api/shipments/:id                  # Single shipment with manifest, timeline, flags
POST   /api/shipments                      # Create manual shipment
PATCH  /api/shipments/:id/advance          # Advance status to next step
PATCH  /api/shipments/:id/deliver          # Confirm delivery (destination officer)
PATCH  /api/shipments/:id/cancel           # Cancel (only if preparing)
POST   /api/shipments/:id/flags            # Add flag (delay, damage, etc)

# Routes
GET    /api/shipments/routes/overview      # All corridors with traffic counts
```

### Commercial Marketplace (Wunna Moe San)

```
# Listings
GET    /api/listings                       # Browse all listings with filters
GET    /api/listings/:id                   # Single listing detail with images
POST   /api/listings                       # Post new item (multipart: photos + data)
PUT    /api/listings/:id                   # Edit own listing (only if available)
DELETE /api/listings/:id                   # Delete own listing (only if available)
GET    /api/listings/my                    # My posted items

# Trade Offers
GET    /api/offers/incoming                # Offers on my items
GET    /api/offers/outgoing                # My offers on others' items
GET    /api/offers/completed               # Completed trades history
POST   /api/offers                         # Submit trade offer (listingId + offeredListingId)
PATCH  /api/offers/:id/accept              # Accept offer (seller)
PATCH  /api/offers/:id/decline             # Decline offer (seller)
DELETE /api/offers/:id                     # Withdraw own pending offer
```

---

## Middleware Chain

Every protected request goes through:

```
Request → Morgan (log) → auth.ts (verify JWT) → role_guard.ts (check role) → Controller → Response
```

### auth.ts
Extracts JWT from `Authorization: Bearer <token>` header. Verifies signature. Attaches `req.user = { id, role, worldId }` to request object. Returns 401 if missing or invalid.

### role_guard.ts
Factory function that takes allowed roles:
```typescript
// Usage in router:
router.get("/admin/users", roleGuard(["admin"]), userController.list);
router.get("/resources", roleGuard(["resource_manager"]), resourceController.list);
```
Returns 403 if user role is not in the allowed list.

---

## Module Ownership

### Shared files (Dev Lead ONLY — do not modify)
```
prisma/schema.prisma
prisma/seed.ts
src/middlewares/**
src/utils/**
src/modules/auth/**
src/db.ts
src/index.ts
src/routers.ts
```

### Your module (work ONLY inside your folder)

| Member | Folder | Tables Owned |
|--------|--------|-------------|
| Min Thuta | `src/modules/admin/` | World, User, AccessCode, WorldRequest |
| Kyi Phyu Thiri Khaing | `src/modules/resource-exchange/` | Resource, TradeRequest |
| Nan Thiri Htet Su | `src/modules/cargo-logistics/` | Shipment, ShipmentItem, ShipmentTimeline, ShipmentFlag |
| Wunna Moe San | `src/modules/commercial-marketplace/` | Listing, ListingImage, TradeOffer |

---

## Cross-Feature Auto-Shipment

When a trade is accepted in Resource Exchange or Commercial Marketplace, a shipment must be auto-created in the Shipments table. This is handled by a shared utility:

```
src/utils/create_shipment.ts
```

This utility is called by:
- Resource Exchange `trade.controller.ts` when accepting a trade request
- Commercial Marketplace `trade-offer.controller.ts` when accepting a trade offer

The utility creates the Shipment record with the correct `sourceType` and foreign key. It does NOT belong to any single module — it is a shared utility maintained by the Dev Lead.

---

## Conventions

### Controller pattern
```typescript
export const myController = {
  list: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await myModel.findAll();
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },
};
```

### Model pattern
```typescript
import { prisma } from "@/db";

export const myModel = {
  findAll: () => prisma.myTable.findMany(),
  findById: (id: number) => prisma.myTable.findUnique({ where: { id } }),
  create: (data: MyCreateInput) => prisma.myTable.create({ data }),
};
```

### Schema validation pattern
```typescript
import { z } from "zod";

export const createTradeSchema = z.object({
  toWorldId: z.number().int().positive(),
  resourceWanted: z.enum(["fuel", "water", "food", "medicine", "steel"]),
  quantityWanted: z.number().int().positive(),
  resourceOffered: z.enum(["fuel", "water", "food", "medicine", "steel"]),
  quantityOffered: z.number().int().positive(),
  urgency: z.enum(["normal", "urgent", "critical"]).default("normal"),
  requestComment: z.string().optional(),
});

export type CreateTradeInput = z.infer<typeof createTradeSchema>;
```

### Validate in controller
```typescript
const parsed = createTradeSchema.safeParse(req.body);
if (!parsed.success) {
  return res.status(400).json({ success: false, errors: parsed.error.flatten() });
}
```
