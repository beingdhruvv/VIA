# VIA Deployment Workflow

This is the production workflow for the VIA DigitalOcean droplet.

## Target Server

Concrete hostnames, IPs, and keys belong in a **local-only** file (see `LOCAL_OPERATIONS.md.template` → copy to `LOCAL_OPERATIONS.md`, gitignored).

- Provider: (e.g. DigitalOcean)
- Region: (your region slug)
- Droplet name: (your name)
- Public IPv4: `<YOUR_PUBLIC_IPV4>`
- Private IP / IPv6: (optional; document locally if needed)
- OS: Ubuntu 24.04 LTS x64
- App directory: `/var/www/via`
- Runtime: Node.js 22, Next.js `next start`, PM2, Nginx, PostgreSQL

Do not commit SSH passphrases, private keys, API keys, database passwords, or `.env.production`.

## Recommended Flow

1. Developers work on feature branches.
2. Pull requests run CI: install, Prisma prepare, lint, build.
3. Merge to `main` only when CI is green.
4. A push to `main` triggers `.github/workflows/deploy.yml`.
5. GitHub Actions SSHes into the droplet and runs `infra/server/deploy.sh`.
6. The server pulls the latest `main`, installs exact dependencies with `npm ci`, pushes the PostgreSQL schema, builds Next.js, restarts PM2, and checks local health.

## One-Time Server Bootstrap

SSH into the droplet as root, clone the repo if needed, then run:

```bash
export VIA_DB_PASSWORD="$(openssl rand -base64 24)"
export APP_REPO="https://github.com/storm-labs/via.git"
export APP_BRANCH="main"
bash /var/www/via/infra/server/bootstrap-ubuntu-24-04.sh
```

If `/var/www/via` does not exist yet, clone first:

```bash
git clone --branch main https://github.com/storm-labs/via.git /var/www/via
```

Create the production env file:

```bash
cd /var/www/via
cp .env.production.example .env.production
nano .env.production
```

Generate auth secrets on the server:

```bash
openssl rand -base64 32
```

Use the same generated value for `NEXTAUTH_SECRET` and `AUTH_SECRET`.

## Manual Deploy

From the droplet:

```bash
cd /var/www/via
APP_DIR=/var/www/via APP_BRANCH=main bash infra/server/deploy.sh
```

## GitHub Secrets

Set these repository secrets before enabling push deploy:

```text
DROPLET_HOST=<YOUR_DROPLET_HOST_OR_IPV4>
DROPLET_PORT=22
DROPLET_USER=root
DROPLET_SSH_KEY=<private deploy key>
```

Use a dedicated deploy key for automation. Prefer a server-only deploy key without a passphrase for GitHub Actions, then restrict it by server access and GitHub secret permissions. Keep your personal passphrase-protected key for local SSH.

## Production Database

Local development uses SQLite through `prisma/schema.prisma`.

Production uses PostgreSQL through `prisma/schema.production.prisma`. The deploy script runs:

```bash
npx prisma generate --schema prisma/schema.production.prisma
npx prisma db push --schema prisma/schema.production.prisma
```

This avoids breaking local development while still running the droplet on PostgreSQL. Before real users or judging data matters, switch to proper PostgreSQL migrations and replace `db push` with `migrate deploy`.

## Nginx and SSL

Nginx acts as a reverse proxy, handling traffic on port 80 and forwarding it to the PM2/Next.js instance on port 3000. 

The configuration file is located at `/etc/nginx/sites-available/via` and is symlinked to `/etc/nginx/sites-enabled/via`. By default, it uses `listen 80 default_server;` and `server_name _;` so the app is accessible by the droplet IP:

```text
http://<YOUR_PUBLIC_IPV4>
```

After a domain is pointed to the droplet, edit `/etc/nginx/sites-available/via`:

```nginx
server_name your-domain.com www.your-domain.com;
```

Then run:

```bash
nginx -t
systemctl reload nginx
certbot --nginx -d your-domain.com -d www.your-domain.com
```

Update `.env.production`:

```text
NEXTAUTH_URL=https://your-domain.com
AUTH_URL=https://your-domain.com
```

Deploy again after changing auth URLs.

## Build version (`NEXT_PUBLIC_APP_VERSION`)

Every production build must carry a unique, user-visible build label (sidebar + profile).

1. **GitHub Actions** (`.github/workflows/deploy.yml`) sets `DEPLOY_VERSION` to `${{ github.run_number }}-${{ github.sha }}` and passes it over SSH.
2. **`infra/server/deploy.sh`** exports `NEXT_PUBLIC_APP_VERSION` from `DEPLOY_VERSION`, or falls back to `YYYYMMDD-<short git sha>` on manual deploys.
3. **`next.config.ts`** exposes `NEXT_PUBLIC_APP_VERSION` to the client; if unset (local `next dev`), it falls back to `package.json` `version`.

**Semver:** bump `package.json` `version` in the repo when you cut a meaningful release (optional script: `npm version patch --no-git-tag-version`). Production UI still shows the deploy-specific `NEXT_PUBLIC_APP_VERSION` from CI when deployed via Actions.

## Site shows 502 Bad Gateway (nginx up, app “offline”)

A **502** from nginx means the reverse proxy cannot reach the Next.js process on **`127.0.0.1:3000`** (see `infra/server/nginx-via.conf`). Nginx and TLS are fine; the **Node / PM2 app is missing, crashed, or still starting**.

**On the droplet, run in order:**

```bash
cd /var/www/via
pm2 status
curl -sI http://127.0.0.1:3000/api/health
pm2 logs via --lines 120 --nostream
```

- If **`via` is `stopped` / `errored` / missing** → read the **first error** in logs (failed `next start`, bad `.env.production`, DB unreachable, OOM, missing `/.next` after a bad build).
- If **curl to :3000 fails** but PM2 says `online` → app may be crashing immediately; logs will show the stack trace.

**Typical recovery (after fixing any env/DB issue shown in logs):**

```bash
cd /var/www/via
set -a && source .env.production && set +a
npm ci
npx prisma generate --schema prisma/schema.production.prisma
npx prisma db push --schema prisma/schema.production.prisma
npm run build
pm2 restart via --update-env
pm2 save
curl -sI http://127.0.0.1:3000/api/health
```

Or run the full scripted deploy (pull + build + PM2): `APP_DIR=/var/www/via APP_BRANCH=main bash infra/server/deploy.sh`

**Fast restart only (no `git pull` / no rebuild)** — if code is already good but PM2 died:

```bash
cd /var/www/via && bash infra/server/quick-up.sh
```

Until `curl -I http://127.0.0.1:3000/api/health` returns **200**, the public URL (the HTTPS host in your `NEXTAUTH_URL` / Nginx `server_name`) will keep returning **502**. Fix must be applied **on the server** (SSH); the Git repo alone cannot resurrect a dead process.

## Verification

On the droplet:

```bash
pm2 status
pm2 logs via --lines 100
curl -I http://127.0.0.1:3000/api/health
curl -I http://<YOUR_PUBLIC_IPV4>
```

From local:

```bash
npm run lint
npm run build
```

## NextAuth and IP Redirects

If the application redirects to the raw droplet IP after authentication:

1. Set `NEXTAUTH_URL` and `AUTH_URL` in `.env.production` to the **canonical HTTPS origin** users should use (same host as in Nginx / DNS).
2. Ensure `AUTH_TRUST_HOST=true` is set where your process manager loads env (often the same `.env.production`).
3. Ensure Nginx passes `proxy_set_header Host $host;` and `proxy_set_header X-Forwarded-Proto $scheme;`.
4. `lib/auth.ts` uses `AUTH_URL` / `NEXTAUTH_URL`: when `NODE_ENV=production` and the request `baseUrl` origin differs from that canonical origin, redirects go to `{canonical}/dashboard`.
5. Add your production hostname to Firebase **Authentication → Settings → Authorized domains**.
