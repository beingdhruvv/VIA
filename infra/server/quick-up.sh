#!/usr/bin/env bash
# Emergency: no rebuild — restart PM2 app after 502 / crash. Run on droplet from /var/www/via.
set -euo pipefail
APP_DIR="${APP_DIR:-/var/www/via}"
APP_NAME="${APP_NAME:-via}"
cd "${APP_DIR}"

if [[ ! -f ".env.production" ]]; then
  echo "Missing ${APP_DIR}/.env.production" >&2
  exit 1
fi

set -a
# shellcheck disable=SC1091
source ".env.production"
set +a

export NODE_ENV=production
export NEXT_TELEMETRY_DISABLED=1

if pm2 describe "${APP_NAME}" >/dev/null 2>&1; then
  pm2 restart "${APP_NAME}" --update-env
else
  pm2 start ecosystem.config.cjs --update-env
fi
pm2 save

sleep 2
code="$(curl -s -o /dev/null -w "%{http_code}" "http://127.0.0.1:3000/api/health" || echo 000)"
if [[ "${code}" == "200" ]]; then
  echo "OK: upstream responding on :3000 (HTTP ${code})"
  exit 0
fi

echo "HTTP ${code} — run full deploy: bash infra/server/deploy.sh" >&2
pm2 logs "${APP_NAME}" --lines 60 --nostream || true
exit 1
