/**
 * NextAuth session type augmentation — adds `id` to the Session user object.
 */

import "next-auth";

declare module "next-auth" {
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
