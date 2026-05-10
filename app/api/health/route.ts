import { NextResponse } from "next/server";

/** Used by `infra/server/deploy.sh` and load balancers — always 200, no auth. */
export function GET() {
  return NextResponse.json({ ok: true, service: "via" }, { status: 200 });
}
