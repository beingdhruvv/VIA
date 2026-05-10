# VIA

Travel planner built for Odoo Hackathon 2026 by Team StormLabs.

Plan multi-city trips, build day-wise itineraries, track budgets, manage packing lists, and share trips publicly.

## Stack

- **Next.js 16** (App Router, TypeScript)
- **Tailwind CSS v4** — custom brutalist design system
- **Prisma 5** + SQLite (dev) / PostgreSQL (production)
- **NextAuth v5** — credentials + JWT
- **Recharts**, **react-leaflet**, **dnd-kit**, **Radix UI**, **Zustand**

## Setup

```bash
npm install
npx prisma migrate dev
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy

Production runs on the DigitalOcean droplet with Nginx, PM2, Node.js, and PostgreSQL.
See [docs/DEPLOYMENT_WORKFLOW.md](docs/DEPLOYMENT_WORKFLOW.md) for bootstrap, push deploy, GitHub Actions, and rollback steps.

## Design

Gujarat-coded brutalism — Rani ki Vav stepwell geometry, Patan Patola grid, Rann of Kutch whitespace.
Colors: `#F5F5F2` / `#111111` / `#1B2A41` / `#C1121F`
Fonts: Space Grotesk · Inter · IBM Plex Mono
