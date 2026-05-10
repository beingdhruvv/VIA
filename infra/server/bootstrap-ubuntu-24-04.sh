#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${APP_DIR:-/var/www/via}"
APP_REPO="${APP_REPO:-https://github.com/beingdhruvv/VIA.git}"
APP_BRANCH="${APP_BRANCH:-main}"
APP_USER="${APP_USER:-root}"
DB_NAME="${DB_NAME:-via_db}"
DB_USER="${DB_USER:-via_user}"
NODE_MAJOR="${NODE_MAJOR:-22}"

if [[ "${EUID}" -ne 0 ]]; then
  echo "Run this script as root on the droplet." >&2
  exit 1
fi

if [[ -z "${VIA_DB_PASSWORD:-}" ]]; then
  echo "Set VIA_DB_PASSWORD before running bootstrap." >&2
  echo "Example: VIA_DB_PASSWORD=\$(openssl rand -base64 24) bash infra/server/bootstrap-ubuntu-24-04.sh" >&2
  exit 1
fi

export DEBIAN_FRONTEND=noninteractive

apt-get update
apt-get upgrade -y
apt-get install -y ca-certificates curl git nginx postgresql postgresql-contrib ufw certbot python3-certbot-nginx build-essential

if ! command -v node >/dev/null 2>&1 || ! node -e "process.exit(Number(process.versions.node.split('.')[0]) >= ${NODE_MAJOR} ? 0 : 1)"; then
  curl -fsSL "https://deb.nodesource.com/setup_${NODE_MAJOR}.x" | bash -
  apt-get install -y nodejs
fi

npm install -g pm2

systemctl enable --now postgresql
sudo -u postgres psql <<SQL
DO \$\$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = '${DB_USER}') THEN
    CREATE ROLE ${DB_USER} LOGIN PASSWORD '${VIA_DB_PASSWORD}';
  ELSE
    ALTER ROLE ${DB_USER} WITH LOGIN PASSWORD '${VIA_DB_PASSWORD}';
  END IF;
END
\$\$;
SELECT 'CREATE DATABASE ${DB_NAME} OWNER ${DB_USER}'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '${DB_NAME}')\gexec
SQL

mkdir -p "$(dirname "${APP_DIR}")"
if [[ ! -d "${APP_DIR}/.git" ]]; then
  git clone --branch "${APP_BRANCH}" "${APP_REPO}" "${APP_DIR}"
fi

chown -R "${APP_USER}:${APP_USER}" "${APP_DIR}"

cp "${APP_DIR}/infra/server/nginx-via.conf" /etc/nginx/sites-available/via
ln -sfn /etc/nginx/sites-available/via /etc/nginx/sites-enabled/via
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl enable --now nginx
systemctl reload nginx

ufw allow OpenSSH
ufw allow "Nginx Full"
ufw --force enable

cat <<EOF
Bootstrap complete.

Next:
1. Create ${APP_DIR}/.env.production from .env.production.example.
2. Run: APP_DIR=${APP_DIR} APP_BRANCH=${APP_BRANCH} bash ${APP_DIR}/infra/server/deploy.sh
3. If a domain is ready: certbot --nginx -d your-domain.com
EOF
