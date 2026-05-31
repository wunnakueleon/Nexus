# NEXUS — Inter-Galactic Post-Apocalypse Cooperation Platform

A neutral post-apocalypse coordination platform where four surviving worlds share resources, ship cargo, and trade goods to prevent extinction. Built for the Apocalypse Hackathon.

---

## Team

| Name | Student ID | Role | Feature | Branch |
|------|-----------|------|---------|--------|
| Wunna Moe San | 681305008535 | Dev Lead | Commercial Marketplace + Shared (schema, auth, seed, UI) | `feat/commercial-marketplace` |
| Min Thuta | 68130500839 | Developer | Admin Portal | `feat/admin-portal` |
| Kyi Phyu Thiri Khaing | 68130500851 | Developer | Resource Exchange | `feat/resource-exchange` |
| Nan Thiri Htet Su | 68130500853 | Developer | Cargo Logistics | `feat/cargo-logistics` |

---

## Tech Stack

### Frontend
- React 18 + TypeScript
- Tailwind CSS
- React Router DOM
- React Hook Form
- Zod (validation)
- Axios (HTTP client)
- React Toastify (notifications)
- Lucide React / React Icons

### Backend
- Node.js + Express.js + TypeScript
- Prisma ORM + SQLite
- Zod (validation)
- JWT (jsonwebtoken) + bcrypt (auth)
- Morgan (logging)
- UUID (ID generation)
- dotenv (environment config)
- Nodemon (dev server)

---

## Monorepo Structure

```
nexus/
├── nexus-frontend/        # React app
├── nexus-backend/         # Express API + Prisma
└── README.md              # This file
```

See `nexus-frontend/README.md` and `nexus-backend/README.md` for detailed folder structures.

---

## Modules Overview

### Shared (Dev Lead — Wunna Moe San)
- Prisma schema and migrations
- Seed data (4 initial worlds)
- Auth module (sign up, sign in, JWT, role-based routing)
- Shared UI components (layout, sidebar, world badges, status badges)
- Protected route middleware
- Axios instance and API base config
- Tailwind theme config

### Module: Admin Portal (Min Thuta)
- World Management (create/remove requests, approve/reject)
- Code Generation (generate, view, expire access codes)
- Approval Queue (approve/reject sign-up requests)
- User Directory (view, revoke, reinstate users)
- Platform Overview (aggregate stats)

### Module: Resource Exchange (Kyi Phyu Thiri Khaing)
- Resource Overview (view all worlds' stocks, edit own)
- Trade Dashboard (incoming/outgoing/active/history)
- Request Trade (create trade requests with optional comments)

### Module: Cargo Logistics (Nan Thiri Htet Su)
- Shipment Board (filter by status, view all shipments)
- Shipment Detail (manifest, timeline, flags)
- Create Shipment (manual shipment creation)
- Route Overview (corridor traffic visualization)

### Module: Commercial Marketplace (Wunna Moe San)
- Browse Marketplace (listing feed with filters)
- Listing Detail (photos, description, offer action)
- Trade Offer Screen (select from own inventory)
- Post Item (upload photos, description, category)
- My Items (manage own listings)
- My Trades (incoming/outgoing/completed offers)

---

## Feature Boundaries

**STRICT RULES — read before coding:**

1. **Work only in your module folders.** Your code lives in `src/modules/<your-module>/`. Do not create or edit files in another member's module folder.

2. **Do not modify the Prisma schema.** If you need a schema change, request it through the Dev Lead. The Dev Lead is the only person who runs `prisma migrate`.

3. **Do not modify shared files without Dev Lead approval.** This includes: `schema.prisma`, `seed.ts`, `routers.ts`, `App.tsx`, `api.ts`, `index.css`, and anything in `src/shared/`.

4. **Use the shared UI components.** Layout, sidebar, badges, buttons — use what exists in `src/shared/`. Do not create duplicate components in your module.

5. **Reference core models read-only.** All modules can READ from `World` and `User` tables. Only the Admin Portal module WRITES to `World`, `User`, `AccessCode`, and `WorldRequest`. Only Resource Exchange WRITES to `Resource` and `TradeRequest`. Only Cargo Logistics WRITES to `Shipment` and related tables. Only Commercial Marketplace WRITES to `Listing`, `ListingImage`, and `TradeOffer`.

### Write Permission Map

| Table | Admin Portal | Resource Exchange | Cargo Logistics | Commercial Marketplace |
|-------|:-----------:|:-----------------:|:---------------:|:---------------------:|
| World | ✅ | — | — | — |
| User | ✅ | — | — | — |
| AccessCode | ✅ | — | — | — |
| WorldRequest | ✅ | — | — | — |
| Resource | — | ✅ | — | — |
| TradeRequest | — | ✅ | — | — |
| Shipment | — | — | ✅ | — |
| ShipmentItem | — | — | ✅ | — |
| ShipmentTimeline | — | — | ✅ | — |
| ShipmentFlag | — | — | ✅ | — |
| Listing | — | — | — | ✅ |
| ListingImage | — | — | — | ✅ |
| TradeOffer | — | — | — | ✅ |

---

## Git Workflow

### Branches

```
main                          # Production-ready code. Never commit directly.
├── develop                   # Integration branch. All features merge here.
│   ├── feat/shared           # Dev Lead: schema, auth, seed, shared UI
│   ├── feat/admin-portal     # Min Thuta
│   ├── feat/resource-exchange    # Kyi Phyu Thiri Khaing
│   ├── feat/cargo-logistics      # Nan Thiri Htet Su
│   └── feat/commercial-marketplace   # Wunna Moe San
```

### Initial Setup (Dev Lead does this first)

```bash
# Dev Lead creates the repo and pushes the base
git init
git add .
git commit -m "init: project scaffold, schema, seed, auth, shared UI"
git branch -M main
git remote add origin <repo-url>
git push -u origin main

# Create develop branch
git checkout -b develop
git push -u origin develop

# Create shared branch
git checkout -b feat/shared
git push -u origin feat/shared
```

### Teammates Clone and Create Their Branch

```bash
# Clone the repo
git clone <repo-url>
cd nexus

# Start from develop
git checkout develop
git pull origin develop

# Create your feature branch FROM develop
git checkout -b feat/admin-portal        # Min Thuta
git checkout -b feat/resource-exchange   # Kyi Phyu Thiri Khaing
git checkout -b feat/cargo-logistics     # Nan Thiri Htet Su
git checkout -b feat/commercial-marketplace  # Wunna Moe San

# Push your branch
git push -u origin feat/<your-branch>
```

### Daily Workflow

```bash
# 1. Make sure you are on YOUR branch
git checkout feat/<your-branch>

# 2. Pull latest develop into your branch (do this every morning)
git pull origin develop

# 3. Code your feature
# ... edit files only in your module ...

# 4. Stage and commit
git add .
git commit -m "feat(admin): add approval queue UI"

# 5. Push to your branch
git push origin feat/<your-branch>
```

### Commit Message Format

```
feat(module): short description     # New feature
fix(module): short description      # Bug fix
style(module): short description    # UI/styling change
refactor(module): short description # Code restructure
```

Module names: `shared`, `admin`, `resource`, `logistics`, `marketplace`

Examples:
```
feat(shared): add auth middleware and JWT validation
feat(admin): add code generation form and table
feat(resource): add trade dashboard with four tabs
feat(logistics): add shipment detail timeline view
feat(marketplace): add post item form with photo upload
fix(admin): fix approval queue not refreshing after approve
style(marketplace): adjust listing card grid spacing
```

### Merging to Develop

**Only merge through Pull Requests.** Do not merge directly.

```bash
# 1. Push your latest changes
git push origin feat/<your-branch>

# 2. Go to GitHub/GitLab
# 3. Create a Pull Request: feat/<your-branch> → develop
# 4. Tag the Dev Lead for review
# 5. Dev Lead reviews and merges
```

### If You Get Merge Conflicts

```bash
# 1. Pull latest develop
git checkout develop
git pull origin develop

# 2. Switch back to your branch
git checkout feat/<your-branch>

# 3. Merge develop into your branch
git merge develop

# 4. Fix conflicts in your editor
# 5. Stage resolved files
git add .
git commit -m "merge: resolve conflicts with develop"
git push origin feat/<your-branch>
```

### Rules

- **NEVER push directly to `main` or `develop`.**
- **NEVER work on someone else's branch.**
- **ALWAYS pull develop before starting new work.**
- **ALWAYS use Pull Requests to merge into develop.**
- Dev Lead merges `develop` into `main` for demo releases only.

---

## Quick Start

```bash
# Clone
git clone <repo-url>
cd nexus

# Backend setup
cd nexus-backend
npm install
cp .env.example .env
npx prisma generate
npx prisma db push
npm run seed
npm run dev

# Frontend setup (new terminal)
cd nexus-frontend
npm install
npm run dev
```

---

## Initial Worlds (Seed Data)

| World | Color | Identity |
|-------|-------|----------|
| GloriaVenus | #C47A1A (burnt amber) | Industrial powerhouse |
| NanPtune | #3A8C8C (steel teal) | Agricultural stronghold |
| MinUranus | #4A6FA5 (gunmetal blue) | Scientific frontier |
| WunnaMars | #A04030 (rust red) | Energy hub |

---

## Resources Tracked

| Resource | What it is | Unit |
|----------|-----------|------|
| Fuel | Reactor fuel, fuel cells, combustibles | MT |
| Water | Clean drinkable water | KL |
| Food | Grain, preserved rations, protein packs | MT |
| Medicine | Antibiotics, vaccines, surgical kits | MT |
| Steel | Processed construction metal | MT |
