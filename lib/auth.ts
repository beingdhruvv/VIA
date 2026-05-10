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
        };
      },
    }),
  ],
  callbacks: {
    async redirect({ url, baseUrl }) {
      // Brute force fix for IP redirect issue
      if (baseUrl.includes("64.227.163.198") || process.env.NODE_ENV === "production") {
        return "https://via.stromlabs.tech/dashboard";
      }
      return url.startsWith(baseUrl) ? url : baseUrl;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        if ("role" in user && typeof user.role === "string") {
          token.role = toSessionUserRole(user.role);
        }
      }
      return token;
    },
    session({ session, token }) {
      if (token?.id) {
        session.user.id = token.id as string;
        session.user.role = toSessionUserRole(typeof token.role === "string" ? token.role : undefined);
      }
      return session;
    },
  },
});
