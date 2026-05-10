/**
 * LoginForm — credentials login form using React Hook Form + Zod.
 * Calls NextAuth signIn() on submit, then redirects to /dashboard.
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signIn } from "next-auth/react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { isFirebaseConfigured } from "@/lib/firebase";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

type LoginValues = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(values: LoginValues) {
    setServerError(null);
    const result = await signIn("credentials", {
      email: values.email,
      password: values.password,
      redirect: false,
    });

    if (result?.error) {
      setServerError("Invalid email or password.");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  async function handleGoogleSignIn() {
    setServerError(null);
    try {
      const { signInWithPopup } = await import("firebase/auth");
      const { getFirebaseAuth, getGoogleProvider } = await import("@/lib/firebase");
      const auth = getFirebaseAuth();
      const googleProvider = getGoogleProvider();

      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // 1. Sync with backend (Upsert user + DP)
      await fetch("/api/auth/firebase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          name: user.displayName,
          image: user.photoURL,
        }),
      });

      // 2. Create NextAuth session
      const signInResult = await signIn("credentials", {
        email: user.email,
        isFirebase: "true",
        redirect: false,
      });

      if (signInResult?.error) {
        throw new Error("NextAuth session creation failed.");
      }
      
      router.push("/dashboard");
      router.refresh();
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Google sign-in failed.";
      setServerError(msg);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
      {/* Email */}
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
          autoComplete="email"
          {...register("email")}
          className="w-full border border-via-black bg-via-white px-4 py-3 text-sm font-inter text-via-black placeholder:text-via-grey-mid focus:outline-none focus:ring-2 focus:ring-via-black focus:ring-offset-0"
          placeholder="you@example.com"
        />
        {errors.email && (
          <p className="text-xs text-via-red font-mono">{errors.email.message}</p>
        )}
      </div>

      {/* Password */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="password"
          className="text-xs font-medium uppercase tracking-widest text-via-grey-dark font-mono"
        >
          Password
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            {...register("password")}
            className="w-full border border-via-black bg-via-white px-4 py-3 pr-12 text-sm font-inter text-via-black placeholder:text-via-grey-mid focus:outline-none focus:ring-2 focus:ring-via-black focus:ring-offset-0"
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-via-grey-mid hover:text-via-black"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {errors.password && (
          <p className="text-xs text-via-red font-mono">{errors.password.message}</p>
        )}
      </div>

      {/* Server error */}
      {serverError && (
        <p className="border border-via-red bg-via-white px-4 py-2 text-sm text-via-red font-mono">
          {serverError}
        </p>
      )}

      {/* Forgot password */}
      <div className="text-right">
        <a
          href="/auth/forgot-password"
          className="text-xs text-via-grey-mid hover:text-via-black underline underline-offset-2 font-mono"
        >
          Forgot password?
        </a>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="flex w-full items-center justify-center gap-2 border border-via-black bg-via-black px-6 py-3 text-sm font-medium uppercase tracking-widest text-via-white shadow-brutalist transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isSubmitting ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Signing in…
          </>
        ) : (
          "Sign In"
        )}
      </button>
      {isFirebaseConfigured && (
        <>
      {/* Separator */}
      <div className="relative flex items-center py-2">
        <div className="flex-grow border-t border-via-grey-light"></div>
        <span className="shrink-0 px-4 text-xs font-mono text-via-grey-mid uppercase tracking-widest">Or</span>
        <div className="flex-grow border-t border-via-grey-light"></div>
      </div>

      {/* Google Sign In */}
      <button
        type="button"
        onClick={handleGoogleSignIn}
        className="flex w-full items-center justify-center gap-3 border border-via-black bg-via-white px-6 py-3 text-sm font-medium tracking-wide text-via-black transition-all hover:bg-via-grey-light"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5">
          <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20c11.045 0 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
          <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z" />
          <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.222 0-9.649-3.342-11.127-7.989l-6.716 5.143C9.431 39.55 16.143 44 24 44z" />
          <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
        </svg>
        Continue with Google
      </button>
        </>
      )}
    </form>
  );
}
