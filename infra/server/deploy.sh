#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${APP_DIR:-/var/www/via}"
APP_BRANCH="${APP_BRANCH:-main}"
APP_NAME="${APP_NAME:-via}"
HEALTH_URL="${HEALTH_URL:-http://127.0.0.1:3000/api/health}"

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

git fetch origin "${APP_BRANCH}"
git checkout -B "${APP_BRANCH}" "origin/${APP_BRANCH}"
# .env.production is gitignored in this repo, so preserve it while cleaning deploy leftovers.
echo "Resetting tracked files to origin/${APP_BRANCH} while preserving .env.production"
git reset --hard "origin/${APP_BRANCH}"
git clean -fd -e .env.production

# Unique build label for UI + support (override with DEPLOY_VERSION from CI)
export NEXT_PUBLIC_APP_VERSION="${DEPLOY_VERSION:-$(date -u +%Y%m%d)-$(git rev-parse --short HEAD)}"
echo "NEXT_PUBLIC_APP_VERSION=${NEXT_PUBLIC_APP_VERSION}"

npm ci
npx prisma generate --schema prisma/schema.production.prisma
npx prisma db push --schema prisma/schema.production.prisma

if [[ "${RUN_SEED_ON_DEPLOY:-0}" == "1" ]]; then
  npx prisma db seed --schema prisma/schema.production.prisma
fi

npm run build

# PM2: start fresh if missing; reload if running (clears stuck / stale workers)
if pm2 describe "${APP_NAME}" >/dev/null 2>&1; then
  pm2 reload "${APP_NAME}" --update-env
else
  pm2 start ecosystem.config.cjs --update-env
fi
pm2 save

for attempt in {1..25}; do
  if curl -fsS "${HEALTH_URL}" >/dev/null 2>&1; then
    echo "Deploy complete: ${APP_NAME} is healthy at ${HEALTH_URL}"
    exit 0
  fi
  if [[ "${attempt}" -eq 3 ]] || [[ "${attempt}" -eq 8 ]]; then
    echo "Health check pending (attempt ${attempt}), forcing pm2 restart ${APP_NAME}..." >&2
    pm2 restart "${APP_NAME}" --update-env || pm2 start ecosystem.config.cjs --update-env
  fi
  sleep 2
done

echo "Deploy finished, but health check failed: ${HEALTH_URL}" >&2
pm2 describe "${APP_NAME}" || true
pm2 logs "${APP_NAME}" --lines 80 --nostream || true
exit 1
