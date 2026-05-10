/**
 * /auth/forgot-password — UI-only password reset request page.
 * Email delivery is handled via support for Round 1.
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1200);
  }

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
            Reset your password
          </p>
        </div>

        <div className="border border-via-black bg-via-white p-8 shadow-brutalist">
          {submitted ? (
            <div className="flex flex-col items-center gap-4 py-4 text-center">
              <div className="w-12 h-12 border-2 border-via-black flex items-center justify-center">
                <span className="text-2xl">✉</span>
              </div>
              <p className="text-sm text-via-black font-mono">
                Check your email for a reset link.
              </p>
              <p className="text-xs text-via-grey-mid font-mono">
                (Forgot password email delivery is handled via support for Round 1)
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="email"
                  className="text-xs font-medium uppercase tracking-widest text-via-grey-dark font-mono"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-via-black bg-via-white px-4 py-3 text-sm font-inter text-via-black placeholder:text-via-grey-mid focus:outline-none focus:ring-2 focus:ring-via-black"
                  placeholder="you@example.com"
                />
              </div>

              <p className="text-xs text-via-grey-mid font-mono">
                (Forgot password email delivery is handled via support for Round 1)
              </p>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 border border-via-black bg-via-black px-6 py-3 text-sm font-medium uppercase tracking-widest text-via-white shadow-brutalist transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Sending…
                  </>
                ) : (
                  "Send Reset Link"
                )}
              </button>
            </form>
          )}
        </div>

        <p className="mt-6 text-center text-sm text-via-grey-mid font-mono">
          <Link
            href="/auth/login"
            className="text-via-black underline underline-offset-2 hover:text-via-navy"
          >
            Back to sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
