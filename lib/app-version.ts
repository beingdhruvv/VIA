/**
 * Build-time label shown in the shell (Sidebar). Source:
 * - Production: `NEXT_PUBLIC_APP_VERSION` set in `infra/server/deploy.sh` (from `DEPLOY_VERSION` in CI or git sha on server).
 * - Local: `package.json` `version` via `next.config.ts` `env` fallback.
 */
export const APP_PUBLIC_VERSION = process.env.NEXT_PUBLIC_APP_VERSION ?? "dev";
