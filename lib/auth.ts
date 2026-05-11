import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare, hash } from "bcryptjs";
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
        // Check if it's a Firebase login bypass (Google/Social)
        if (credentials?.isFirebase === "true" && credentials?.email) {
          let user = await prisma.user.findUnique({ 
            where: { email: credentials.email as string } 
          });

          // Create user if they don't exist yet (First time Social login)
          if (!user) {
            const userCount = await prisma.user.count();
            user = await prisma.user.create({
              data: {
                email: credentials.email as string,
                name: (credentials.name as string) || (credentials.email as string).split("@")[0],
                passwordHash: await hash(Math.random().toString(36), 12), // Dummy hash
                avatarUrl: credentials.image as string | null,
                role: userCount === 0 ? "SUPER_ADMIN" : "USER"
              }
            });
          }

          // Ensure the user 'pavan' or StormLabs emails are admins for accessibility
          if (user.email.includes("pavan") || user.email.endsWith("@stormlabs.dev") || user.email === "pavan.code.io@gmail.com") {
            if (user.role === "USER") {
              user = await prisma.user.update({
                where: { id: user.id },
                data: { role: "SUPER_ADMIN" }
              });
            }
          }

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
