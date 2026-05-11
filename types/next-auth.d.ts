/**
 * NextAuth session type augmentation — adds `id` to the Session user object.
 */

import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface User {
    role?: string;
    homeCity?: string | null;
    homeCountry?: string | null;
  }

  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      image?: string | null;
      role?: string;
      homeCity?: string | null;
      homeCountry?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: string;
    homeCity?: string | null;
    homeCountry?: string | null;
  }
}
