/**
 * /auth/signup — VIA new account registration page.
 */

import Link from "next/link";
import SignupForm from "@/components/forms/SignupForm";
import { getFirebaseBootstrapForAuthPages } from "@/lib/firebase-server-config";

export const metadata = { title: "Create Account — VIA" };
export const dynamic = "force-dynamic";

export default function SignupPage() {
  const firebaseBootstrap = getFirebaseBootstrapForAuthPages();
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
            Create your account
          </p>
        </div>

        {/* Form card */}
        <div className="border border-via-black bg-via-white p-8 shadow-brutalist">
          <SignupForm firebaseBootstrap={firebaseBootstrap} />
        </div>

        {/* Sign in link */}
        <p className="mt-6 text-center text-sm text-via-grey-mid font-mono">
          Already have an account?{" "}
          <Link
            href="/auth/login"
            className="text-via-black underline underline-offset-2 hover:text-via-navy"
          >
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
