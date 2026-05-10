/**
 * NextAuth session type augmentation — adds `id` to the Session user object.
 */

/* eslint-disable @typescript-eslint/no-unused-vars */
import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      image?: string | null;
    };
  }
}
