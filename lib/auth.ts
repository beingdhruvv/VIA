import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { toSessionUserRole } from "@/lib/roles";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/auth/login",
    error: "/auth/login",
  },
  providers: [
    Credentials({
      async authorize(credentials) {
        console.log("Authorize attempt:", credentials?.email, "isFirebase:", credentials?.isFirebase);
        // Check if it's a Firebase login bypass
        if (credentials?.isFirebase === "true" && credentials?.email) {
          const user = await prisma.user.findUnique({ 
            where: { email: credentials.email as string } 
          });
          if (!user) return null;
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.avatarUrl,
            role: user.role,
            homeCity: user.homeCity,
            homeCountry: user.homeCountry,
          };
        }

        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return null;

        const valid = await compare(password, user.passwordHash);
        if (!valid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.avatarUrl,
          role: user.role,
          homeCity: user.homeCity,
          homeCountry: user.homeCountry,
        };
      },
    }),
  ],
  callbacks: {
    async redirect({ url, baseUrl }) {
      const canonical =
        (process.env.AUTH_URL ?? process.env.NEXTAUTH_URL ?? "").replace(/\/$/, "") || null;
      if (process.env.NODE_ENV === "production" && canonical) {
        try {
          const canonicalOrigin = new URL(canonical).origin;
          if (new URL(baseUrl).origin !== canonicalOrigin) {
            return `${canonicalOrigin}/dashboard`;
          }
        } catch {
          /* misconfigured AUTH_URL / NEXTAUTH_URL */
        }
      }
      return url.startsWith(baseUrl) ? url : baseUrl;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        if ("role" in user && typeof user.role === "string") {
          token.role = toSessionUserRole(user.role);
        }
        if ("homeCity" in user) token.homeCity = user.homeCity;
        if ("homeCountry" in user) token.homeCountry = user.homeCountry;
      }
      return token;
    },
    session({ session, token }) {
      if (token?.id) {
        session.user.id = token.id as string;
        session.user.role = toSessionUserRole(typeof token.role === "string" ? token.role : undefined);
        session.user.homeCity = token.homeCity as string | undefined;
        session.user.homeCountry = token.homeCountry as string | undefined;
      }
      return session;
    },
  },
});
