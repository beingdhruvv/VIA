/**
 * Route protection middleware — redirects unauthenticated users to /auth/login
 * for all routes except public pages and static assets.
 */

import { auth } from "@/lib/auth";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { pathname } = req.nextUrl;

  const isPublic =
    pathname === "/" ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/trip/") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/config/") || // Firebase public web config for login/signup
    pathname === "/api/users"; // signup endpoint — no auth needed

  if (!isPublic && !isLoggedIn) {
    return Response.redirect(new URL("/auth/login", req.nextUrl));
  }
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
