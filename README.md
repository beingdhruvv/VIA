# VIA — Your Ultimate Travel Architect
## [visit: via.stromlabs.tech](https://via.stromlabs.tech)

**VIA** is a high-fidelity travel planning platform engineered for the modern explorer. Built by **Team StormLabs** for the Odoo Hackathon 2026, VIA combines architectural precision with a "Gujarat-coded" brutalist aesthetic to redefine how we plan, track, and share our journeys.

![Dashboard Preview](https://via.stromlabs.tech/api/og?title=VIA%20Dashboard)

---

## ⚡ Core Features (Tier 1 & 2 Compliant)

### 🗺️ Intelligent Itinerary Builder
- **Multi-City Flow**: Seamlessly transition between destinations with our "Boarding Pass" styled itinerary cards.
- **Drag-and-Drop Sequencing**: Built with `dnd-kit` for intuitive reordering of stops and activities.
- **Global City Search**: Integrated with **GeoDB API** for real-time access to global destinations.
- **Automated Routing**: Visual route connectors that adapt based on travel distance and transit modes.

### 💰 Financial Governance
- **Real-time Budgeting**: Track expenses across categories (Stay, Food, Transport, etc.) with automated cost aggregation.
- **Activity Estimations**: Preview expected costs before you spend.

### 🎒 Logistics & Preparation
- **Dynamic Packing Lists**: Smart templates (Beach, Backpacking, Business) to get you ready in seconds.
- **Integrated Notes**: Markdown-supported rich notes for every stop of your journey.

### 🔓 Public Sharing & Admin
- **Public Itineraries**: Generate read-only, shareable links to inspire others (no login required for viewers).
- **Admin Command Center**: Real-time server telemetry, user governance, and system-wide analytics for super-admins.

---

## 🎨 Design Philosophy: "The Stepwell Grid"
VIA's design is a tribute to the geometric brilliance of **Rani ki Vav** and the intricate grids of **Patan Patola**.
- **Whitespace**: Inspired by the vast expanses of the **Rann of Kutch**.
- **Aesthetic**: Brutalist geometry meets premium typography.
- **Stack**: Next.js 15, Tailwind CSS v4, Prisma (PostgreSQL), NextAuth v5.

---

## 🛠️ Infrastructure & CI/CD
- **Production**: Deployed on **DigitalOcean Droplets** using **Nginx** reverse proxy and **Let's Encrypt** SSL.
- **Automation**: Fully automated CI/CD pipeline via **GitHub Actions** for zero-downtime deployments.
- **Database**: Hybrid architecture using **SQLite** for development and **PostgreSQL** for production scale.

---

## 🚀 Quick Start

1. **Install Dependencies**: `npm install`
2. **Environment**: Setup `.env.local` with `DATABASE_URL`, `AUTH_SECRET`, and `GEODB_API_KEY`.
3. **Database**: `npx prisma migrate dev && npm run db:seed`
4. **Launch**: `npm run dev`

---

*Designed and Developed by **pxvn** @ StormLabs.*
*v0.1.0-beta | Odoo Hackathon 2026*
