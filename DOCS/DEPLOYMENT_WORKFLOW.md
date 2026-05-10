# VIA Deployment Workflow

This is the production workflow for the VIA DigitalOcean droplet.

## Target Server

- Provider: DigitalOcean
- Region: blr1
- Droplet name: `snow`
- Public IPv4: `64.227.163.198`
- Private IP: `10.122.0.3`
- Public IPv6: `2400:6180:100:d0:0:1:415a:2001`
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
DROPLET_HOST=64.227.163.198
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
http://64.227.163.198
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

## Verification

On the droplet:

```bash
pm2 status
pm2 logs via --lines 100
curl -I http://127.0.0.1:3000
curl -I http://64.227.163.198
```

From local:

```bash
npm run lint
npm run build
```

## Rollback

Find the previous good commit:

```bash
cd /var/www/via
git log --oneline -10
git checkout <commit_sha>
npm ci
npx prisma generate --schema prisma/schema.production.prisma
npm run build
pm2 startOrReload ecosystem.config.cjs --update-env
pm2 save
```

For database rollbacks, restore from a PostgreSQL backup. Do not use `db push` as a rollback tool.
