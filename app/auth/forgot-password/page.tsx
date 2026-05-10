"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, Mail } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    // POST to reset endpoint — gracefully handles missing email config
    await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    }).catch(() => null);
    setLoading(false);
    setSubmitted(true);
  }

  return (
    <main className="min-h-screen bg-via-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1
            className="text-5xl font-bold tracking-tighter text-via-black"
            style={{ fontFamily: "var(--font-space-grotesk)" }}
          >
            VIA
          </h1>
          <p className="mt-2 text-sm text-via-grey-mid font-mono">
            Reset your password
          </p>
        </div>

        <div className="border border-via-black bg-via-white p-8 shadow-brutalist">
          {submitted ? (
            <div className="flex flex-col items-center gap-4 py-4 text-center">
              <div className="w-14 h-14 border-2 border-via-black flex items-center justify-center">
                <Mail size={28} strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-sm font-medium text-via-black font-grotesk">
                  Check your inbox
                </p>
                <p className="text-xs text-via-grey-mid font-mono mt-1">
                  If an account exists for <strong>{email}</strong>, you&apos;ll receive a reset link shortly.
                </p>
              </div>
              <Link
                href="/auth/login"
                className="text-xs text-via-black underline underline-offset-2 font-mono hover:text-via-navy"
              >
                Back to sign in
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="email"
                  className="text-xs font-medium uppercase tracking-widest text-via-grey-dark font-mono"
                >
                  Email Address
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
                Enter the email you signed up with and we&apos;ll send you a link to reset your password.
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

        {!submitted && (
          <p className="mt-6 text-center text-sm text-via-grey-mid font-mono">
            <Link
              href="/auth/login"
              className="text-via-black underline underline-offset-2 hover:text-via-navy"
            >
              Back to sign in
            </Link>
          </p>
        )}
      </div>
    </main>
  );
}
