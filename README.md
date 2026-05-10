# VIA — Travel intelligence

**Live:** [via.stromlabs.tech](https://via.stromlabs.tech) 

**Local:** `npm run dev` → [http://localhost:3000](http://localhost:3000)

**Team:** StormLabs · 

---

## Elevator pitch

VIA is a **full-stack travel OS**: plan multi-city trips, attach activities to stops, track money, pack lists, notes, and **publish a read-only itinerary** — with **dual authentication**, a **real Prisma data model**, and **production ops** (CI/CD, self-hosted infra, SEO and analytics). Built to read as a **shipping product**, not a UI mock.

---

## Why this stands out 

| Angle | What we actually did |
|--------|----------------------|
| **Data** | **Prisma** schema for users, trips, stops, cities, activities, expenses, packing, notes, sharing — not JSON in localStorage. |
| **Scale story** | **57+ seeded destinations** with costs and metadata; search wired to APIs where it matters. |
| **Auth** | **Email/password** (NextAuth) **+ Firebase Google**; one session story. |
| **Money** | **Expense tracker** and trip budget tied to the same graph as the itinerary. |
| **People** | **Collaboration** on trips (shared access model). |
| **Discoverability** | **SEO** (metadata, structure), **Google Search Console**–friendly setup, **GA** when `NEXT_PUBLIC_GA_ID` is set. |
| **Ops** | **GitHub Actions** → **`infra/server/deploy.sh`**; **DigitalOcean** droplet; **nginx + PM2**; deploy-time **build id** for traceability. |
| **Polish** | Brutalist **Tailwind v4** design system, responsive shell, favicon / manifest / apple touch assets. |

---

## Feature bullets 
- **Multi-city trips** — stops, dates, ordering, map-style timeline where implemented  
- **Itinerary builder + view** — activities per stop, structured flow  
- **57+ destinations** — seeded cities + activities; Wikimedia-accurate hero imagery (see `lib/place-images.ts`)  
- **Multi-auth** — credentials + Firebase Google  
- **Collaboration** — trip collaborators model  
- **Expenses + budget** — track spend against the trip  
- **Packing & notes** — trip-scoped lists and journal-style notes  
- **Public share** — slug-based shared itinerary (`/trip/[slug]`)  
- **Admin** — role-gated surface for operators (when enabled)  
- **CI/CD** — push to `main` → deploy workflow (see `.github/workflows/deploy.yml`)

---

## Tech stack (short)

- **Framework:** Next.js 16 (App Router), TypeScript, React 19  
- **UI:** Tailwind CSS v4 (`@theme`), Radix primitives, Lucide, Framer Motion where used  
- **Data:** Prisma 5 — SQLite dev / **PostgreSQL** production (`schema.production.prisma`)  
- **Auth:** NextAuth v5 + Firebase client for Google  
- **Maps:** Leaflet / react-leaflet  
- **Charts:** Recharts (where used)  
- **Hosting:** **Own DigitalOcean server** — Node, nginx, PM2  

---

## Quickstart (local)

```bash
cp .env.example .env   # if present; else see DOCS/CONTEXT.txt
npm ci
npx prisma generate
npx prisma db push
npm run db:seed        # optional: cities + activities
npm run dev
```

Open **http://localhost:3000**. If port is busy, Next may choose **3001** — watch the terminal line `Local: http://localhost:…`.

---

## Deploy & production health

- **Full workflow:** [`docs/DEPLOYMENT_WORKFLOW.md`](docs/DEPLOYMENT_WORKFLOW.md)  
- **502 on live URL:** almost always **PM2 / `next start` not listening on 3000** — fix on the droplet with `pm2 logs via` then rebuild/restart (documented in that file).

---


---

## Repo map

| Path | Role |
|------|------|
| `app/` | Routes, API, `manifest.ts`, icons |
| `prisma/` | Schemas, seed, migrations |
| `lib/` | Auth, Prisma client, utils, `place-images`, `app-version` |
| `infra/server/` | `deploy.sh`, nginx sample |
| `.github/workflows/` | CI + deploy |

---

**VIA** — plan together, ship like a product. **StormLabs.**
