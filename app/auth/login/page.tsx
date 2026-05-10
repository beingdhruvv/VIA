/**
 * /auth/login — VIA sign-in page.
 */

import Link from "next/link";
import LoginForm from "@/components/forms/LoginForm";

export const metadata = { title: "Sign In — VIA" };

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-via-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <h1
            className="text-5xl font-bold tracking-tighter text-via-black"
            style={{ fontFamily: "var(--font-space-grotesk)" }}
          >
            VIA
          </h1>
          <p
            className="mt-2 text-sm text-via-grey-mid"
            style={{ fontFamily: "var(--font-ibm-plex-mono)" }}
          >
            Sign in to your account
          </p>
        </div>

        {/* Form card */}
        <div className="border border-via-black bg-via-white p-8 shadow-brutalist">
          <LoginForm />
        </div>

        {/* Sign up link */}
        <p className="mt-6 text-center text-sm text-via-grey-mid font-mono">
          Don&apos;t have an account?{" "}
          <Link
            href="/auth/signup"
            className="text-via-black underline underline-offset-2 hover:text-via-navy"
          >
            Create one
          </Link>
        </p>
      </div>
    </main>
  );
}
