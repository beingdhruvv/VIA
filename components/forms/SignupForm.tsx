/**
 * SignupForm — new user registration form using React Hook Form + Zod.
 * POSTs to /api/users then calls signIn() to log the user in automatically.
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signIn } from "next-auth/react";
import { Eye, EyeOff, Loader2 } from "lucide-react";

const signupSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters."),
    email: z.string().email("Enter a valid email address."),
    password: z.string().min(8, "Password must be at least 8 characters."),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

type SignupValues = z.infer<typeof signupSchema>;

interface FieldProps {
  label: string;
  id: string;
  type: string;
  placeholder: string;
  error?: string;
  showToggle?: boolean;
  visible?: boolean;
  onToggle?: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  registration: any;
  autoComplete?: string;
}

function Field({
  label,
  id,
  type,
  placeholder,
  error,
  showToggle,
  visible,
  onToggle,
  registration,
  autoComplete,
}: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className="text-xs font-medium uppercase tracking-widest text-via-grey-dark font-mono"
      >
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={showToggle ? (visible ? "text" : "password") : type}
          autoComplete={autoComplete}
          {...registration}
          className="w-full border border-via-black bg-via-white px-4 py-3 pr-12 text-sm font-inter text-via-black placeholder:text-via-grey-mid focus:outline-none focus:ring-2 focus:ring-via-black focus:ring-offset-0"
          placeholder={placeholder}
        />
        {showToggle && (
          <button
            type="button"
            onClick={onToggle}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-via-grey-mid hover:text-via-black"
            aria-label={visible ? "Hide password" : "Show password"}
          >
            {visible ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
      {error && <p className="text-xs text-via-red font-mono">{error}</p>}
    </div>
  );
}

export default function SignupForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
  });

  async function onSubmit(values: SignupValues) {
    setServerError(null);

    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: values.name,
        email: values.email,
        password: values.password,
      }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setServerError(data?.error ?? "Something went wrong. Please try again.");
      return;
    }

    const signInResult = await signIn("credentials", {
      email: values.email,
      password: values.password,
      redirect: false,
    });

    if (signInResult?.error) {
      setServerError("Account created — please sign in.");
      router.push("/auth/login");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
      <Field
        label="Full Name"
        id="name"
        type="text"
        placeholder="Ada Lovelace"
        error={errors.name?.message}
        registration={register("name")}
        autoComplete="name"
      />
      <Field
        label="Email"
        id="email"
        type="email"
        placeholder="you@example.com"
        error={errors.email?.message}
        registration={register("email")}
        autoComplete="email"
      />
      <Field
        label="Password"
        id="password"
        type="password"
        placeholder="••••••••"
        error={errors.password?.message}
        showToggle
        visible={showPassword}
        onToggle={() => setShowPassword((v) => !v)}
        registration={register("password")}
        autoComplete="new-password"
      />
      <Field
        label="Confirm Password"
        id="confirmPassword"
        type="password"
        placeholder="••••••••"
        error={errors.confirmPassword?.message}
        showToggle
        visible={showConfirm}
        onToggle={() => setShowConfirm((v) => !v)}
        registration={register("confirmPassword")}
        autoComplete="new-password"
      />

      {serverError && (
        <p className="border border-via-red bg-via-white px-4 py-2 text-sm text-via-red font-mono">
          {serverError}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="flex w-full items-center justify-center gap-2 border border-via-black bg-via-black px-6 py-3 text-sm font-medium uppercase tracking-widest text-via-white shadow-brutalist transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isSubmitting ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Creating account…
          </>
        ) : (
          "Create Account"
        )}
      </button>
    </form>
  );
}
