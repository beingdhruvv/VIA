# VIA 
## VISIT: via.stromlabs.tech

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
```

### Environment Variables
Create a `.env.local` file in the root directory and add the following:
```env
DATABASE_URL="file:./prisma/dev.db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your_secure_random_string"
AUTH_SECRET="your_secure_random_string"
# Optional: GEODB_API_KEY="your_geodb_api_key"
```

### Database Setup
Run the following commands to initialize the database and seed it with starter data (cities and activities):
```bash
npx prisma migrate dev
npm run db:seed
```

### Start Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deploy

Production runs on the DigitalOcean droplet with Nginx, PM2, Node.js, and PostgreSQL.
See [docs/DEPLOYMENT_WORKFLOW.md](docs/DEPLOYMENT_WORKFLOW.md) for bootstrap, push deploy, GitHub Actions, and rollback steps.

## Design

Gujarat-coded brutalism — Rani ki Vav stepwell geometry, Patan Patola grid, Rann of Kutch whitespace.
Colors: `#F5F5F2` / `#111111` / `#1B2A41` / `#C1121F`
Fonts: Space Grotesk · Inter · IBM Plex Mono
