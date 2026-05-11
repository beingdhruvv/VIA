"use client";

/**
 * CreateTripForm — multi-step trip creation (Tier 1).
 * Steps: Basics → Dates → Details → Review. POST /api/trips, redirect to builder.
 */

import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { formatCurrency, formatDateRange } from "@/lib/utils";

const schema = z
  .object({
    name: z.string().min(1, "Trip name is required").max(100, "Max 100 characters"),
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().min(1, "End date is required"),
    description: z.string().max(500, "Description must be 500 characters or fewer").optional(),
    totalBudget: z.string().optional(),
    collaborators: z.string().optional(),
    shareMemories: z.boolean().optional(),
  })
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return new Date(data.endDate) > new Date(data.startDate);
      }
      return true;
    },
    { message: "End date must be after start date", path: ["endDate"] }
  );

type FormValues = z.infer<typeof schema>;

const STEPS = [
  { id: 0, label: "Basics", short: "1" },
  { id: 1, label: "Dates", short: "2" },
  { id: 2, label: "Details", short: "3" },
  { id: 3, label: "Review", short: "4" },
] as const;

interface CreateTripFormProps {
  defaultName?: string;
}

export function CreateTripForm({ defaultName }: CreateTripFormProps) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    trigger,
    control,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: defaultName ?? "",
      startDate: "",
      endDate: "",
      description: "",
      totalBudget: "",
      collaborators: "",
      shareMemories: false,
    },
  });

  const values = useWatch({ control });

  useEffect(() => {
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    }
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  async function goNext() {
    if (step === 0) {
      const ok = await trigger(["name"]);
      if (ok) setStep(1);
      return;
    }
    if (step === 1) {
      const ok = await trigger(["startDate", "endDate"]);
      if (ok) setStep(2);
      return;
    }
    if (step === 2) {
      const ok = await trigger(["description", "totalBudget"]);
      if (ok) setStep(3);
    }
  }

  function goBack() {
    setStep((s) => Math.max(0, s - 1));
  }

  async function onSubmit(form: FormValues) {
    setSubmitError(null);
    const budgetNum =
      form.totalBudget && form.totalBudget.trim() !== ""
        ? parseFloat(form.totalBudget)
        : null;

    const emails = form.collaborators
      ? form.collaborators.split(",").map(e => e.trim()).filter(e => e.includes("@"))
      : [];

    const res = await fetch("/api/trips", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        startDate: form.startDate,
        endDate: form.endDate,
        description: form.description || undefined,
        totalBudget: budgetNum && !isNaN(budgetNum) ? budgetNum : null,
        collaborators: emails,
        shareMemories: form.shareMemories,
      }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setSubmitError(data.error ?? "Something went wrong. Please try again.");
      return;
    }

    const trip = await res.json();
    router.push(`/trips/${trip.id}/builder`);
  }

  const budgetNum =
    values.totalBudget && values.totalBudget.trim() !== ""
      ? parseFloat(values.totalBudget)
      : null;
  const budgetDisplay =
    budgetNum != null && !isNaN(budgetNum) ? formatCurrency(budgetNum) : "Not set";

  return (
    <div className="border border-via-black bg-via-white" style={{ boxShadow: "3px 3px 0px #111111" }}>
      {/* Step indicator */}
      <div className="flex border-b border-via-black overflow-x-auto">
        {STEPS.map((s) => {
          const active = step === s.id;
          const done = step > s.id;
          return (
            <div
              key={s.id}
              className={[
                "flex-1 min-w-[72px] flex flex-col items-center justify-center py-3 px-2 border-r border-via-black last:border-r-0",
                active ? "bg-via-black text-via-white" : done ? "bg-via-off-white text-via-black" : "bg-via-white text-via-grey-mid",
              ].join(" ")}
            >
              <span className="font-mono text-[10px] uppercase tracking-widest">{s.label}</span>
              <span className="font-mono text-xs mt-0.5 tabular-nums">{s.short}</span>
            </div>
          );
        })}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="p-5 md:p-8 flex flex-col gap-6">
        {submitError && (
          <p className="font-mono text-sm text-via-red border border-via-red px-3 py-2 bg-via-white">{submitError}</p>
        )}
        {step === 0 && (
          <>
            <p className="font-mono text-[11px] uppercase tracking-wider text-via-grey-mid">Step 1 of 4</p>
            <Input label="Trip name" placeholder="e.g. Gujarat — Rann to Somnath" error={errors.name?.message} {...register("name")} />
          </>
        )}

        {step === 1 && (
          <>
            <p className="font-mono text-[11px] uppercase tracking-wider text-via-grey-mid">Step 2 of 4</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input type="date" label="Start date" error={errors.startDate?.message} {...register("startDate")} />
              <Input type="date" label="End date" error={errors.endDate?.message} {...register("endDate")} />
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <p className="font-mono text-[11px] uppercase tracking-wider text-via-grey-mid">Step 3 of 4</p>
            <Textarea
              label="Description"
              placeholder="What's this trip about?"
              maxLength={500}
              error={errors.description?.message}
              {...register("description")}
            />
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-via-black">
                Total budget <span className="text-via-grey-mid font-normal">(optional)</span>
              </label>
              <div className="flex items-stretch">
                <span
                  className="inline-flex items-center px-3 bg-via-off-white border border-r-0 border-via-grey-light text-via-black text-sm select-none font-mono"
                  aria-hidden
                >
                  ₹
                </span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  placeholder="50000"
                  className={[
                    "flex-1 bg-via-off-white px-3 py-2 text-sm text-via-black font-mono",
                    "border outline-none rounded-none placeholder:text-via-grey-mid",
                    "focus:border-2 focus:border-via-black",
                    errors.totalBudget ? "border-2 border-via-red" : "border border-via-grey-light",
                  ].join(" ")}
                  {...register("totalBudget")}
                />
              </div>
              {errors.totalBudget && <p className="text-xs text-via-red">{errors.totalBudget.message}</p>}
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-via-black">
                  Invite People <span className="text-via-grey-mid font-normal">(comma-separated emails)</span>
                </label>
                <input
                  placeholder="friend@example.com, partner@via.com"
                  className="w-full bg-via-off-white border border-via-grey-light px-3 py-2 text-sm font-mono outline-none focus:border-2 focus:border-via-black placeholder:text-via-grey-mid"
                  {...register("collaborators")}
                />
              </div>

              <div className="flex items-center gap-3 p-3 border border-via-black bg-via-white">
                <input
                  type="checkbox"
                  id="shareMemories"
                  className="w-4 h-4 accent-via-black cursor-pointer"
                  {...register("shareMemories")}
                />
                <label htmlFor="shareMemories" className="text-xs font-mono uppercase font-bold cursor-pointer select-none">
                  Auto-share memories with people in this trip
                </label>
              </div>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <p className="font-mono text-[11px] uppercase tracking-wider text-via-grey-mid">Step 4 of 4 — Review</p>
            <div className="space-y-4 border border-via-grey-light p-4 bg-via-off-white">
              <div>
                <p className="font-mono text-[10px] uppercase text-via-grey-mid mb-0.5">Trip</p>
                <p className="font-grotesk font-bold text-lg text-via-black">{values.name || "—"}</p>
              </div>
              <div>
                <p className="font-mono text-[10px] uppercase text-via-grey-mid mb-0.5">Dates</p>
                <p className="font-mono text-sm text-via-black">
                  {values.startDate && values.endDate
                    ? formatDateRange(values.startDate, values.endDate)
                    : "—"}
                </p>
              </div>
              <div>
                <p className="font-mono text-[10px] uppercase text-via-grey-mid mb-0.5">Budget</p>
                <p className="font-mono text-sm text-via-black">{budgetDisplay}</p>
              </div>
              {values.description && (
                <div>
                  <p className="font-mono text-[10px] uppercase text-via-grey-mid mb-0.5">Notes</p>
                  <p className="text-sm text-via-grey-dark whitespace-pre-wrap">{values.description}</p>
                </div>
              )}
            </div>
            <p className="text-xs text-via-grey-mid">
              After creating, you will open the itinerary builder to add cities and activities.
            </p>
          </>
        )}

        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t border-via-grey-light">
          <div className="flex gap-2">
            {step > 0 && (
              <Button type="button" variant="secondary" size="md" onClick={goBack} disabled={isSubmitting}>
                <ChevronLeft size={16} />
                Back
              </Button>
            )}
            <Button type="button" variant="ghost" size="md" onClick={() => router.push("/trips")} disabled={isSubmitting}>
              Cancel
            </Button>
          </div>
          <div className="flex gap-2">
            {step < 3 ? (
              <Button type="button" variant="primary" size="md" onClick={goNext}>
                Continue
                <ChevronRight size={16} />
              </Button>
            ) : (
              <Button type="submit" variant="primary" size="md" loading={isSubmitting}>
                Create trip
                <Check size={16} />
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
