# VIA — COMPLETE MASTER BUILD PLAN
## Team StormLabs | Odoo Hackathon

---

# SECTION 0 — CONTEXT FOR AI

You are helping Team StormLabs build **VIA**, a personalized travel planning web application for the Odoo Hackathon. The app is named VIA — minimal, premium, meaningful.

VIA allows users to plan multi-city trips, build day-wise itineraries, track budgets, manage packing lists, write trip notes, and share itineraries publicly.

This document is your complete source of truth. Follow it strictly. Do not deviate from the design system, stack, or architecture unless explicitly told to. You are free to make implementation decisions within each section if a specific approach is not mentioned or if a suggested library is not suitable — use your best judgment aligned with the spirit of this document.

## SERVER ACCESS — FULL CONTROL GRANTED TO LLM

Team StormLabs will provide you (the LLM / AI assistant) with full credentials and SSH access to the Digital Ocean Droplet. This means:

You are responsible for:
- All server setup, configuration, and maintenance
- Installing and configuring Node.js, PostgreSQL, Nginx, PM2, Certbot
- Running database migrations via Prisma on the server
- Building and deploying the Next.js application
- Restarting services after deploys
- Debugging any server-side errors via SSH
- Setting up environment variables in `.env.production` on the server
- Configuring Nginx virtual host and SSL certificate

When given server credentials (IP address, SSH private key or password, and root/sudo user), you will:
1. SSH into the server
2. Execute all necessary setup and deploy commands
3. Verify the app is running and accessible at the public IP / domain
4. Report back the live URL and any issues

You handle the entire infrastructure layer. The team focuses on building features. You deploy when told to deploy.

---

# SECTION 1 — WHAT ODOO JUDGES LOOK FOR

## MUST SATISFY (Non-Negotiable)
- Real-time or dynamic data sources. No static hardcoded JSON arrays in final code.
- Responsive, clean UI. Consistent color scheme. Consistent spacing. Consistent layout.
- Robust input validation on every form field. Never let bad data through.
- Intuitive navigation. Clear menu placement. Proper spacing between elements.
- Git used actively by ALL team members. Multiple contributors in commit history.

## NICE TO HAVE (Build these — most teams won't)
- Backend APIs with proper data modeling and a real local database (not just cloud).
- Understand every snippet of AI-generated code. Adapt it. Do not blindly paste.
- Offline or local functionality. App runs without relying entirely on cloud.
- Trendy tech only if it adds genuine value.

## WHAT ODOO ACTUALLY REWARDS
- "This feels like a real product" — this beats technically stronger but uglier apps.
- Polished execution over complex architecture.
- Complete user flows. No broken links or dead ends.
- Relational database design with proper foreign keys and relationships.
- UI/UX quality — Odoo is actively hiring designers specifically.
- Business usability — can someone actually use this to plan a trip?

## WHAT KILLS TEAMS
- Broken flows. If login works but create trip crashes, that's a fail.
- Inconsistent styling. Random colors, mixed fonts, uneven spacing.
- Static data everywhere. Hardcoded city arrays = instant red flag.
- Only one person's commits in Git.
- Overengineered backend with no working frontend.
- Feature count over polish. A working 8-feature app beats a broken 14-feature app.

---

# SECTION 2 — DATABASE DECISION (IMPORTANT)

## Why This Matters
Odoo itself runs on PostgreSQL. Using PostgreSQL signals direct technical alignment.
The "local preferred" guideline means: the app must run locally without depending entirely on cloud services.

## Recommended Approach
**PostgreSQL (local) + Prisma ORM + NextAuth.js**

- Run PostgreSQL locally during development (satisfies offline/local requirement)
- Deploy with Neon (managed PostgreSQL, free tier, serverless) for the live demo URL
- This means: works offline, works online, same codebase, no changes needed
- Prisma handles schema, migrations, and type-safe queries

## Auth
- NextAuth.js with Credentials provider (email + password)
- JWT session strategy — no cloud dependency for auth
- bcryptjs for password hashing
- Fully local, fully functional

## File Storage (Cover Photos)
- Cloudinary free tier for image uploads (optional)
- OR: skip cover photos in Round 1, use placeholder gradients based on city name

## Why Not Supabase
Supabase is excellent but entirely cloud-dependent. If their service is down or network is poor during demo, your app breaks. Local PostgreSQL + Neon gives you control.

## Why Not MongoDB
Odoo judges value relational databases. MongoDB is document-based. PostgreSQL with proper foreign keys and Prisma relations visually demonstrates relational DB understanding in schema diagrams.

## Database Schema — Full Relational Model

```
users
  id (uuid, PK)
  name (string)
  email (string, unique)
  password_hash (string)
  avatar_url (string, nullable)
  language (string, default 'en')
  created_at (timestamp)

trips
  id (uuid, PK)
  user_id (uuid, FK → users.id)
  name (string)
  description (text, nullable)
  cover_url (string, nullable)
  start_date (date)
  end_date (date)
  total_budget (decimal, nullable)
  is_public (boolean, default false)
  public_slug (string, unique, nullable)
  status (enum: PLANNING, ACTIVE, COMPLETED)
  created_at (timestamp)
  updated_at (timestamp)

cities
  id (uuid, PK)
  name (string)
  country (string)
  region (string)
  cost_index (decimal)
  popularity_score (integer)
  image_url (string, nullable)
  latitude (decimal)
  longitude (decimal)

trip_stops
  id (uuid, PK)
  trip_id (uuid, FK → trips.id)
  city_id (uuid, FK → cities.id)
  order_index (integer)
  start_date (date)
  end_date (date)
  notes (text, nullable)

activities
  id (uuid, PK)
  city_id (uuid, FK → cities.id)
  name (string)
  description (text)
  category (enum: SIGHTSEEING, FOOD, ADVENTURE, CULTURE, SHOPPING, WELLNESS)
  estimated_cost (decimal)
  duration_hours (decimal)
  image_url (string, nullable)
  rating (decimal)

stop_activities
  id (uuid, PK)
  stop_id (uuid, FK → trip_stops.id)
  activity_id (uuid, FK → activities.id)
  scheduled_date (date, nullable)
  scheduled_time (time, nullable)
  actual_cost (decimal, nullable)

expenses
  id (uuid, PK)
  trip_id (uuid, FK → trips.id)
  stop_id (uuid, FK → trip_stops.id, nullable)
  category (enum: TRANSPORT, STAY, FOOD, ACTIVITIES, MISC)
  amount (decimal)
  description (string)
  date (date)

packing_items
  id (uuid, PK)
  trip_id (uuid, FK → trips.id)
  name (string)
  category (enum: CLOTHING, DOCUMENTS, ELECTRONICS, TOILETRIES, MISC)
  is_packed (boolean, default false)
  created_at (timestamp)

trip_notes
  id (uuid, PK)
  trip_id (uuid, FK → trips.id)
  stop_id (uuid, FK → trip_stops.id, nullable)
  content (text)
  created_at (timestamp)
  updated_at (timestamp)

shared_links
  id (uuid, PK)
  trip_id (uuid, FK → trips.id)
  slug (string, unique)
  views (integer, default 0)
  created_at (timestamp)
```

Seed the `cities` and `activities` tables with realistic data at startup. These are reference tables — seeding them is NOT static JSON in the application, it's standard database seeding practice.

---

# SECTION 3 — TECH STACK

All suggestions below are recommendations. If a specific library is causing issues, is unavailable, or is not suitable for the implementation, use the best alternative you know. The spirit matters more than the specific package.

## Core Framework
**Next.js 14+ with App Router + TypeScript**
- Industry standard, AI-friendly, handles routing + API routes + SSR in one
- Use `/app` directory structure throughout
- Server components for data fetching where possible
- Client components only when interactivity is needed

## Styling
**Tailwind CSS**
- All styling via Tailwind utility classes
- Custom design tokens defined in `tailwind.config.ts`
- No inline style tags unless absolutely unavoidable
- NO Bootstrap, NO Material UI, NO Chakra UI

## UI Components
**Preference: Build custom components from scratch using Tailwind.**

The brutalist industrial + Gujarati aesthetic requires full visual control. Pre-built component libraries impose their own visual language (rounded corners, soft shadows, opinionated spacing) which fights against this design system.

**Recommended approach:**
- Build all primary UI components (Button, Card, Input, Badge, Tabs) from scratch in Tailwind
- Use Radix UI headless primitives for complex interactive components (Dialog, Popover, Select, Tooltip) — these have zero visual opinion and can be styled 100% with Tailwind

**On shadcn/ui specifically:**
shadcn/ui is acceptable as a starting scaffold ONLY if time pressure demands it. If you use it, you MUST override its default styles aggressively — remove all rounded corners, replace soft shadows with the 3px offset brutalist shadow, replace its default color tokens with VIA's palette. Do not let shadcn/ui's defaults bleed into the final UI. A judge who recognizes stock shadcn/ui components will mark it down. If used, adapt it completely — don't use it out of the box.

**Never use:** Bootstrap, Material UI (MUI), Chakra UI, Ant Design. These are visually incompatible and immediately recognizable as generic.

## Animations
**Framer Motion — used sparingly**
- Page transitions only
- Card entry animations (fade + slide up, 200ms, no bouncing)
- Hover state transitions
- NO scroll-triggered animations that delay content
- NO loading spinners that spin forever

## Icons
**Lucide React exclusively**
- Stroke icons only (no filled variants)
- Consistent size: 16px for inline, 20px for buttons, 24px for section headers
- Never manually draw SVG shapes for icons. Always use Lucide.
- If a Lucide icon doesn't exist for something, use the closest metaphor

## Database + ORM
**PostgreSQL + Prisma**
- Schema defined in `prisma/schema.prisma`
- Run `npx prisma generate` and `npx prisma migrate dev` locally
- Prisma Client for all DB queries — no raw SQL unless needed for complex aggregates
- Seed file at `prisma/seed.ts` for cities and activities data

## Auth
**NextAuth.js v5 (Auth.js)**
- Credentials provider with email + password
- JWT session strategy
- Session available via `auth()` in server components
- Password hashing with bcryptjs

## Forms + Validation
**React Hook Form + Zod**
- Every form uses React Hook Form
- Every form has a Zod schema for validation
- Error messages shown inline below each field
- No browser default validation popups

## Charts
**Recharts**
- For budget breakdown: Pie chart + Bar chart
- Keep charts minimal — white background, black/navy/red colors only
- No gradient fills. Flat colors only.

## Maps
**Leaflet.js with react-leaflet**
- For route visualization on trip view
- OpenStreetMap tiles (free, no API key)
- Custom markers using Lucide MapPin icon
- Show route lines between stops

## Real Data APIs (Dynamic Data — Required by Odoo)
- **GeoDB Cities API** (rapidapi.com/wirefreethought/api/geodb-cities): Live city search
- **Open-Meteo API** (open-meteo.com): Free weather, no API key required
- **Unsplash Source API** (source.unsplash.com/800x600/?{cityname}): Dynamic city images, no key needed
- **ExchangeRate API** (open.er-api.com): Free currency conversion, no key needed
- These replace static data and satisfy the "dynamic data sources" requirement completely

## State Management
**Zustand**
- Global store for: current user, active trip, UI state (modals, sidebars)
- Keep store minimal — prefer server state from database

## Hosting + Deployment
**Digital Ocean Droplet (Team StormLabs — GitHub Education)**

### Chosen Droplet Specs
- Plan: Basic Shared CPU — Regular Intel/AMD
- RAM: 2GB (critical — 1GB will OOM-kill during Next.js build)
- vCPU: 1
- Storage: 50GB SSD
- Region: Bangalore (BLQ1) — lowest latency for Indian demo
- OS: Ubuntu 22.04 LTS x64
- Cost: ~$12/month, covered by GitHub Education credits

DO NOT use App Platform. DO NOT use Managed Databases. DO NOT use Vercel. Just the raw Droplet.

### LLM Has Full Server Access
Team StormLabs will provide SSH credentials (IP, user, key/password) to the AI assistant. The AI handles all server setup, deployment, migrations, restarts, and debugging via SSH. Team focuses on building features only.

### Full Server Setup (LLM runs these commands)
```bash
# System update
apt update && apt upgrade -y

# Node.js 20 via nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc && nvm install 20 && nvm use 20

# PostgreSQL 15
apt install -y postgresql postgresql-contrib
systemctl enable postgresql && systemctl start postgresql
sudo -u postgres psql -c "CREATE USER via_user WITH PASSWORD 'strong_password_here';"
sudo -u postgres psql -c "CREATE DATABASE via_db OWNER via_user;"

# PM2 + Nginx + Certbot
npm install -g pm2
apt install -y nginx certbot python3-certbot-nginx
systemctl enable nginx

# Clone and install
cd /var/www && git clone https://github.com/storm-labs/via.git && cd via
npm install

# Environment setup
cp .env.example .env.production
# LLM edits .env.production with correct values

# Prisma migrate + seed + build
npx prisma migrate deploy
npx prisma db seed
npm run build

# Start app
pm2 start npm --name "via" -- start
pm2 save && pm2 startup
```

### Nginx Config
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;
    }
}
```
After writing config: `nginx -t && systemctl reload nginx`
Then SSL: `certbot --nginx -d yourdomain.com`

### Redeploy Command (after every git push)
```bash
cd /var/www/via && git pull origin main && npm install && npx prisma migrate deploy && npm run build && pm2 restart via
```

### Required .env.production Variables
```
DATABASE_URL="postgresql://via_user:password@localhost:5432/via_db"
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="run: openssl rand -base64 32"
GEODB_API_KEY="your_rapidapi_key"
```

## Version Control
- GitHub repository under Team StormLabs
- Every team member must have commits
- Branch per feature: `feature/auth`, `feature/dashboard`, `feature/itinerary-builder` etc.
- Main branch always deployable

---

# SECTION 4 — DESIGN SYSTEM

This is the most important competitive advantage. Follow every rule here precisely.

## Design Identity
**VIA: Gujarat-coded Brutalism**

The visual identity is inspired by Gujarat — specifically the raw geometry of the Rann of Kutch, the step-well precision of Rani ki Vav, and the structured textile grid patterns of Patan Patola weaving. Gujarat is India's most travel-forward state — Rann Utsav, the White Desert, the Gir forests, Somnath, Dwarka — it is deeply coded in travel and movement. This gives VIA a specific, non-generic cultural anchor that judges will not have seen before.

The Rani ki Vav (stepwell) is the primary visual metaphor: a perfectly structured descent — level by level — which maps directly to a trip itinerary. Each stop in your journey is a level down into the experience. The stepped geometry becomes the visual language for timelines, stop connectors, and progress indicators.

Patan Patola textile grids inspire the layout precision — tight, geometric, repeating — which maps to the Teenage Engineering grid aesthetic perfectly.

Combined with: CRED's luxury whitespace and card feel, Teenage Engineering's grid-based precision and monospace data labels, Nothing's hardware-like minimal UI elements.

The result: an app that looks like a premium travel product built by engineers who know Indian design history and care about craft.

## Color Palette (EXACT VALUES — Do not deviate)
```
--color-white:       #F5F5F2   /* Primary background, 80% of every screen */
--color-black:       #111111   /* All body text, borders, primary CTAs */
--color-navy:        #1B2A41   /* Trip cards bg, map UI, date chips, headers */
--color-red:         #C1121F   /* ONLY: delete actions, alerts, logo mark, one accent per screen */
--color-grey-light:  #D6D6D6   /* Dividers, borders, skeleton states */
--color-grey-mid:    #8A8A8A   /* Secondary text, placeholders, metadata */
--color-grey-dark:   #3D3D3D   /* Subheadings, less important labels */
--color-off-white:   #EBEBEB   /* Input backgrounds, subtle surface differentiation */
```

Never use gradients. Never use opacity for color variation. Use the palette as-is.

## Typography

**Headings — Space Grotesk** (Google Font)
- H1: 48px / font-weight 700 / tracking -0.02em
- H2: 32px / font-weight 600 / tracking -0.01em
- H3: 24px / font-weight 600
- H4: 18px / font-weight 600

**Body — Inter** (Google Font)
- Body: 15px / font-weight 400 / line-height 1.6
- Small: 13px / font-weight 400
- Caption: 11px / font-weight 500 / tracking 0.05em / UPPERCASE

**Data / Monospace — IBM Plex Mono** (Google Font)
- Use for: prices (₹2,400), dates (12 MAR — 18 MAR), distances (340 km), durations (3h 20m), all numerical data
- 14px / font-weight 400
- This is the Teenage Engineering signature move. All data in mono.

## Borders and Shape
- Border radius: 0px everywhere except profile photos (50% circle) and small badges (4px max)
- All cards: 1px solid #111111 border
- Card depth effect: box-shadow: 3px 3px 0px #111111 (the brutalist offset shadow)
- Input fields: 1px solid #D6D6D6 border, 2px solid #111111 on focus
- Buttons: 1px solid #111111, box-shadow: 2px 2px 0px #111111 on hover

## Spacing System (8px grid, strictly)
- 4px, 8px, 12px, 16px, 24px, 32px, 48px, 64px, 96px
- Never use arbitrary values like 13px, 22px, 37px

## Layout
- Max content width: 1280px, centered
- Sidebar (desktop): 260px fixed
- Main content: fluid
- Mobile: single column, bottom navigation
- Tablet: collapsible sidebar

## Navigation Structure (Desktop)
- Left sidebar with: VIA logo at top, nav links, user avatar at bottom
- Top bar on mobile: logo center, hamburger right, back arrow left

## Gujarati Design Motifs (use sparingly, max 1-2 per screen)
- Rani ki Vav stepwell geometry: the primary motif. Use horizontal stepped lines as timeline connectors between stops — each stop is one level deeper into the journey. This is the signature visual of VIA.
- Patola grid: the card layout grid is tight and geometric, inspired by Patan Patola textile repeat patterns. Even spacing, mathematical precision, nothing arbitrary.
- Rann white expanse: generous white space is not just minimal — it references the White Desert of Kutch. Emptiness is intentional and powerful.
- Stamp aesthetic: trip status badges look like rubber stamps (PLANNING / ACTIVE / COMPLETED) — referencing old Gujarat trade port documentation.
- Boarding pass structure: trip cards have a left colored stripe (like a ticket stub) in navy or red — referencing Gujarat's historic maritime and railway trade routes.

## What NOT to Do
- No emojis in the UI. Never.
- No gradient backgrounds.
- No card hover animations that scale the card up (too Material Design).
- No rounded buttons.
- No loading spinners — use skeleton screens instead.
- No shadows that are blurry/soft — only the sharp 2-3px offset shadow.
- No random decorative SVG shapes or blobs.
- No Heroicons, FontAwesome, or Material Icons — Lucide only.
- No handcrafted SVG illustrations — if you need an illustration, use a structured geometric composition or skip it.

---

# SECTION 5 — COMPLETE FEATURE LIST (BUILD IN THIS ORDER)

## TIER 1 — Build first. These must work perfectly.

### 1. Authentication System
- Signup page: name, email, password, confirm password fields
- Login page: email, password fields
- Forgot password: email input, success message (can be UI-only for Round 1)
- All fields validated with Zod (required, email format, password min 8 chars, passwords match)
- Inline error messages below each field (not toast, not alert — inline)
- Session persists across page refreshes
- Redirect to dashboard after login
- Redirect to login if accessing protected route while unauthenticated
- Loading state on submit buttons (disabled + spinner icon, not text change)
- Password show/hide toggle

### 2. Dashboard / Home Screen
- Welcome message: "Good morning, [name]." (time-based: morning/afternoon/evening)
- Recent trips section: last 3 trips as cards
- "Plan a New Trip" button — prominent, primary action
- Quick stats row: Total Trips, Countries Visited, Total Days Traveled, Total Budget Spent (calculated from DB)
- Recommended destinations: fetch 6 cities from GeoDB API or seed data, display as horizontal scroll cards
- Each destination card: city image (Unsplash Source API), city name, country, cost index badge
- Current weather chip for user's last trip destination (Open-Meteo API)
- Empty state: if no trips, show a clean "Start your first journey" card with CTA

### 3. Create Trip Flow
- Trip name (required)
- Start date + End date date pickers (start must be before end, end required if start set)
- Trip description (optional, textarea, max 500 chars with live counter)
- Total budget input (optional, numeric, currency prefix ₹)
- Cover photo upload OR auto-assign based on first destination added
- Save button: validates all required fields before submitting
- After save: redirect to itinerary builder for this trip
- Unsaved changes warning if user tries to navigate away

### 4. My Trips (Trip List)
- Grid of trip cards (2 columns desktop, 1 column mobile)
- Each card shows: cover image, trip name, date range (IBM Plex Mono), destination count, status badge (PLANNING/ACTIVE/COMPLETED), total budget
- Sort options: Newest, Upcoming, Past
- Filter by status
- Edit, View, Delete actions per card (delete requires confirmation modal)
- Empty state with CTA
- Search/filter bar to find trips by name

### 5. Itinerary Builder
- Trip header: trip name, date range, edit button
- "Add Stop" button: opens city search modal
- Each stop is a card showing: city name + country flag, date range, number of activities
- Reorder stops with drag-and-drop (dnd-kit) OR up/down arrow buttons
- Remove stop button (with confirmation)
- Per stop: "Add Activities" button opens activity search sheet
- Date auto-validation: stop dates must fall within trip dates
- Visual route connector between stops (dotted vertical line, Varanasi boat path motif)
- Auto-calculate number of nights per stop based on dates

### 6. Itinerary View Screen
- Day-by-day timeline layout
- City section headers in navy background
- Activity blocks per day: activity name, category badge, time (IBM Plex Mono), cost (IBM Plex Mono)
- Toggle between Timeline view and List view
- Print/Export button (basic browser print)
- Total cost calculated and shown in header
- Share button: generates public link

### 7. Budget & Cost Breakdown
- Total budget vs estimated spend: horizontal progress bar (red if over)
- Breakdown table: Transport / Stay / Activities / Food / Misc rows with amounts
- Pie chart (Recharts): cost by category
- Bar chart (Recharts): cost per day across trip
- Average cost per day (IBM Plex Mono, prominent)
- Over-budget warning: red banner if estimated cost exceeds budget
- Manual expense entry: add expense with category, amount, description, date
- All expense data from `expenses` table (dynamic, not calculated from static values)

## TIER 2 — Build after Tier 1 is complete and polished.

### 8. City Search
- Search input with debounce (300ms)
- Results from GeoDB Cities API (live search)
- Each result: city name, country, region, cost index, popularity
- City image from Unsplash Source API dynamically
- "Add to Trip" button: opens stop date assignment modal
- Filter by country/region
- Recent searches stored in localStorage

### 9. Activity Search
- Browse activities for selected city
- Filter by category (SIGHTSEEING / FOOD / ADVENTURE / CULTURE / SHOPPING / WELLNESS)
- Filter by max cost range (slider)
- Filter by max duration
- Each card: activity name, category badge, cost (IBM Plex Mono), duration, rating stars, description
- Image from Unsplash Source API based on activity name
- Add/Remove button per activity (toggles)
- Activity data from seeded `activities` table (realistic data for top Indian and global cities)

### 10. Packing Checklist
- Per-trip checklist
- Add item: name + category selection
- Category tabs: ALL / CLOTHING / DOCUMENTS / ELECTRONICS / TOILETRIES / MISC
- Check off items (strikethrough + grey text when packed)
- Progress bar: X of Y items packed
- Delete individual items
- "Use Template" button: pre-fills with smart defaults per trip type (Beach / Mountain / City / Business)
- Reset checklist button (unpacks everything, keeps items)
- Item count per category shown on tab badges

### 11. Trip Notes / Journal
- Notes list per trip, newest first
- Notes can be linked to a specific stop or to the whole trip
- Add note: textarea (markdown not required, plain text), optional stop link
- Edit and delete notes
- Timestamp shown in IBM Plex Mono
- Timestamps shown as relative (2 hours ago) and absolute on hover
- Empty state per trip

### 12. Shared / Public Itinerary View
- Generate unique public URL: `/trip/[public_slug]`
- Readable by anyone, no login required
- Shows: trip name, cover, destinations, day-wise itinerary, total duration, estimated cost
- "Copy Trip" button (only for logged-in viewers): duplicates trip to their account
- Social share: copy link button, WhatsApp share, Twitter/X share
- View counter: increments on each visit, shown to trip owner
- No edit controls visible in public view

### 13. User Profile / Settings
- Edit name, email (requires password confirmation)
- Change password form
- Profile photo upload (Cloudinary or placeholder)
- Language preference selector (UI only for Round 1)
- Saved/favourite destinations list (cities user has bookmarked)
- Account stats: total trips, countries, days
- Delete account (with "type DELETE to confirm" pattern)
- Sign out button

## TIER 3 — Only if time permits in final hours.

### 14. Route Map View
- Full-width Leaflet map on trip view
- Markers for each stop city
- Polyline connecting stops in order
- Click marker to see city card popup with stop dates

### 15. Collaborative Trip Editing
- Invite via email: generates invite link
- Invited user can view and edit the trip
- Show collaborator avatars on trip card

### 16. Admin Analytics Dashboard
- Protected route: admin only (single env-var flag for admin email)
- Total users, trips, cities, activities counts
- Most popular cities bar chart
- Most popular activities list
- Recent signups table
- Recent trips table

---

# SECTION 6 — COMPLETE PAGE + ROUTE STRUCTURE

```
/                          → Landing page (unauthenticated)
/auth/login                → Login
/auth/signup               → Signup
/auth/forgot-password      → Forgot password

/dashboard                 → Home (authenticated)
/trips                     → My Trips list
/trips/new                 → Create Trip
/trips/[id]                → Trip detail / Itinerary View
/trips/[id]/edit           → Edit Trip settings
/trips/[id]/builder        → Itinerary Builder
/trips/[id]/budget         → Budget & Cost Breakdown
/trips/[id]/packing        → Packing Checklist
/trips/[id]/notes          → Trip Notes / Journal

/cities                    → City Search
/cities/[id]               → City detail with activities

/trip/[slug]               → Public shared itinerary (unauthenticated)

/profile                   → User Profile / Settings
/admin                     → Admin dashboard (protected)

API Routes:
/api/auth/[...nextauth]    → NextAuth handler
/api/trips                 → GET all trips, POST create trip
/api/trips/[id]            → GET, PATCH, DELETE trip
/api/trips/[id]/stops      → GET, POST stops
/api/stops/[id]            → PATCH, DELETE stop
/api/stops/[id]/activities → GET, POST stop activities
/api/trips/[id]/expenses   → GET, POST expenses
/api/trips/[id]/packing    → GET, POST packing items
/api/packing/[id]          → PATCH, DELETE packing item
/api/trips/[id]/notes      → GET, POST notes
/api/notes/[id]            → PATCH, DELETE note
/api/trips/[id]/share      → POST generate public link
/api/cities/search         → GET search cities (proxies GeoDB API)
/api/cities/[id]/activities → GET activities for city
/api/weather               → GET weather for coordinates
```

---

# SECTION 7 — COMPONENT ARCHITECTURE

Build these shared components first. Everything else uses them.

```
components/
  ui/
    Button.tsx            → variants: primary, secondary, destructive, ghost
    Input.tsx             → with label, error state, helper text
    Textarea.tsx
    Select.tsx            → built on Radix UI Select primitive
    Badge.tsx             → status chips, category labels
    Card.tsx              → base card with optional header/footer
    Modal.tsx             → built on Radix UI Dialog
    Sheet.tsx             → slide-in panel (for activity search etc)
    Skeleton.tsx          → loading placeholder blocks
    Avatar.tsx            → user/city avatar with fallback
    ProgressBar.tsx       → horizontal fill bar
    Tabs.tsx              → tab navigation
    Tooltip.tsx           → built on Radix UI Tooltip

  layout/
    Sidebar.tsx           → desktop left navigation
    Navbar.tsx            → mobile top bar
    BottomNav.tsx         → mobile bottom navigation
    PageHeader.tsx        → page title + breadcrumb + action buttons
    AuthGuard.tsx         → wraps protected pages

  trip/
    TripCard.tsx          → trip list card with boarding pass style
    StopCard.tsx          → itinerary stop card
    ActivityCard.tsx      → activity browse card
    BudgetChart.tsx       → recharts wrapper
    PackingItem.tsx       → single checklist item
    NoteCard.tsx          → single note entry
    RouteConnector.tsx    → dotted line between stops

  forms/
    CreateTripForm.tsx
    AddStopForm.tsx
    AddExpenseForm.tsx
    AddPackingItemForm.tsx
    AddNoteForm.tsx
    LoginForm.tsx
    SignupForm.tsx
```

---

# SECTION 8 — CURSOR / AI PROMPT STRATEGY

## Master Context Block
Paste this at the top of every new Cursor chat session:

```
PROJECT: VIA — Travel planning web app for Odoo Hackathon
TEAM: StormLabs
STACK: Next.js 14 App Router, TypeScript, Tailwind CSS, Prisma + PostgreSQL, NextAuth.js, React Hook Form + Zod, Recharts, Leaflet.js (react-leaflet), Lucide React, Framer Motion, Zustand, Radix UI headless primitives, dnd-kit
DESIGN: Brutalist industrial, Gujarat-coded (Rani ki Vav stepwell geometry + Patan Patola grid + Rann of Kutch whitespace), CRED + Teenage Engineering + Nothing aesthetic
COLORS: White #F5F5F2 (bg), Black #111111 (text/borders), Navy #1B2A41 (cards/accents), Red #C1121F (alerts/destructive only), Grey #D6D6D6 (dividers), Mid Grey #8A8A8A (secondary text)
FONTS: Space Grotesk (headings), Inter (body), IBM Plex Mono (all data/numbers/prices/dates)
BORDER RADIUS: 0px everywhere except profile photos (50%) and tiny badges (4px max)
CARDS: 1px solid #111111 border, box-shadow: 3px 3px 0px #111111
ICONS: Lucide React only. Stroke style, never filled. Never draw custom SVGs for icons.
COMPONENTS: Build custom from scratch with Tailwind. Use Radix UI for headless primitives (Dialog, Select, Popover, Tooltip). shadcn/ui is a last resort only if time-critical — if used, override ALL its defaults to match VIA design system completely. Never use MUI, Bootstrap, Chakra.
ANIMATIONS: Framer Motion only for page transitions and card entry (fade + slide up, 200ms). No bouncing. No scroll-triggered delays.
VALIDATION: React Hook Form + Zod on every form. Inline errors below each field.
DRAG AND DROP: dnd-kit for itinerary stop reordering.
CHARTS: Recharts, flat colors only (no gradients), VIA palette.
MAPS: react-leaflet with OpenStreetMap tiles.
DEPLOYMENT: Digital Ocean Droplet with Nginx + PM2 + PostgreSQL on same server.
NO: gradients, soft blurry shadows, border-radius > 4px, emojis in UI, static hardcoded JSON data arrays, random decorative SVG blobs or shapes, MUI/Bootstrap/Chakra
```

## Per-Feature Prompt Template
```
Build [COMPONENT/PAGE NAME].
Requirements: [list exact requirements from Section 5]
Uses these existing components: [list from Section 7]
Data from: [Prisma model / API route / Zustand store]
Follow VIA design system exactly. No deviations.
```

## Token Efficiency Rules
- One feature per chat session. Never ask for multiple pages at once.
- Always reference existing components rather than rewriting them.
- Keep context files (DESIGN.md, DATABASE.md, FEATURES.md) in project root and reference them in prompts.
- If Cursor drifts from design, say: "Follow the VIA design system. Cards must have 1px solid black border and 3px 3px 0px black box-shadow. 0 border radius. No gradients."
- For Prisma queries: "Use Prisma Client. Follow the schema in prisma/schema.prisma."

---

# SECTION 9 — REFERENCE PROJECTS (Explore these for inspiration)

Your AI should explore these for feature reference and competitive benchmarking:

**Open Source / Inspectable**
- Wanderlog: https://wanderlog.com — closest to VIA. Study their itinerary builder UX.
- 1trip: https://1trip.app/planner — open multi-city planner. Study their stop management.
- TripIt: https://www.tripit.com — study their trip card layouts.
- Tripomatic: https://tripomatic.com — day-wise itinerary view reference.
- Stippl: https://apps.apple.com/us/app/stippl-travel-planner/id6443617088 — budget tool reference.

**Past Odoo Hackathon Projects on GitHub**
- https://github.com/RitikRikhi/odoo-hackathon-2025 — Node.js/Express, offline-first
- https://github.com/Sharsona27/Odoo-hackathon-2025-round1- — skill swap platform, clean structure
- https://github.com/harshit-jain-2109/Odoo_hackathon — Next.js/Node.js, JWT auth

**Design References**
- CRED app (India) — whitespace, card aesthetic, premium feel
- Nothing OS / Nothing design language — hardware-like minimal UI
- Teenage Engineering product site — grid precision, monospace data
- Rani ki Vav (Patan, Gujarat) photography — stepped geometry, ancient precision
- Rann of Kutch / Rann Utsav — stark white expanse, open space aesthetic
- Patan Patola textiles — geometric grid repeat patterns, mathematical layout

---

# SECTION 10 — GIT WORKFLOW (Odoo Judges Check This)

Repository name: `storm-labs/via`

## Branch Strategy
```
main              → always deployable, protected
dev               → integration branch
feature/auth      → authentication pages
feature/dashboard → dashboard
feature/trips     → trip CRUD
feature/builder   → itinerary builder
feature/budget    → budget breakdown
feature/packing   → packing checklist
feature/notes     → trip notes
feature/maps      → route map
feature/profile   → user settings
```

## Commit Message Format
```
feat: add trip card with boarding pass design
fix: resolve date validation on stop creation
style: apply brutalist border to activity cards
chore: add cities seed data for Indian destinations
```

Every team member must commit to their own feature branch and have their commits merged via pull requests. This is what judges look at in the Git history.

---

# SECTION 11 — DEMO SCRIPT (2 MINUTES)

When presenting to judges, follow this exact flow:

1. Open landing page. "This is VIA — a travel planner for the modern traveler. Built by Team StormLabs."
2. Sign up with a new email. Show validation (try submitting empty, show inline errors).
3. Dashboard appears. Show quick stats, recommended destinations from live API.
4. Create a new trip: "Ahmedabad to Rann of Kutch to Somnath, 8 days."
5. Itinerary Builder: add 3 stops, add 2 activities per stop, reorder one stop.
6. Budget page: show pie chart, bar chart, budget alert.
7. Packing checklist: add 3 items, check one off, show progress bar.
8. Generate public share link. Open in incognito. Show read-only view.
9. Show the GitHub repository with commits from multiple team members.

Keep it under 2 minutes. Let the product speak.

---

# SECTION 12 — NON-FUNCTIONAL REQUIREMENTS

- Mobile responsive: every page works at 375px width (iPhone SE)
- Tablet responsive: every page works at 768px width
- No horizontal scroll on any viewport
- All images have alt text (accessibility)
- All form inputs have labels (not just placeholder)
- Color contrast: all text must meet WCAG AA minimum (4.5:1)
- No console errors in production build
- `npm run build` must succeed with 0 errors
- Page load under 3 seconds on average connection
- API routes return proper HTTP status codes (200, 201, 400, 401, 404, 500)

---

# APPENDIX — QUICK REFERENCE

## Free APIs Used (No Key Required)
- Open-Meteo weather: https://api.open-meteo.com/v1/forecast
- Unsplash Source images: https://source.unsplash.com/800x600/?{query}
- ExchangeRate: https://open.er-api.com/v6/latest/INR

## APIs Requiring Free Keys
- GeoDB Cities: https://rapidapi.com/wirefreethought/api/geodb-cities (free tier: 10 req/sec)

## Useful Docs
- Prisma: https://www.prisma.io/docs
- NextAuth v5: https://authjs.dev
- Tailwind: https://tailwindcss.com/docs
- Framer Motion: https://www.framer.com/motion
- dnd-kit: https://dndkit.com
- Recharts: https://recharts.org
- React Leaflet: https://react-leaflet.js.org
- Radix UI: https://www.radix-ui.com
- Lucide React: https://lucide.dev
- Zod: https://zod.dev
- React Hook Form: https://react-hook-form.com
## Digital Ocean Setup Docs
- Droplet creation: https://docs.digitalocean.com/products/droplets/how-to/create
- Node.js + Nginx + PM2 on Ubuntu: https://www.digitalocean.com/community/tutorials/how-to-set-up-a-node-js-application-for-production-on-ubuntu-22-04
- PostgreSQL on Ubuntu: https://www.digitalocean.com/community/tutorials/how-to-install-postgresql-on-ubuntu-22-04-quickstart
- Certbot SSL with Nginx: https://www.digitalocean.com/community/tutorials/how-to-secure-nginx-with-let-s-encrypt-on-ubuntu-22-04
- PM2 docs: https://pm2.keymetrics.io/docs/usage/quick-start

---

*VIA — Team StormLabs — Built for Odoo Hackathon*
*This document is the single source of truth for the entire project.*
