"use client";

/**
 * EditTripForm — pre-populated trip edit form.
 * Same validation as CreateTripForm with an added status selector.
 * PATCHes /api/trips/[id] on submit, unsaved-changes guard via beforeunload.
 */

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import type { TripCard, TripStatus } from "@/types";

// ─── Zod Schema ────────────────────────────────────────────────────────────────

const schema = z
  .object({
    name: z.string().min(1, "Trip name is required").max(100, "Max 100 characters"),
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().min(1, "End date is required"),
    description: z
      .string()
      .max(500, "Description must be 500 characters or fewer")
      .optional(),
    totalBudget: z.string().optional(),
    status: z.enum(["PLANNING", "ACTIVE", "COMPLETED"]),
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

const STATUS_OPTIONS: { value: TripStatus; label: string }[] = [
  { value: "PLANNING", label: "Planning" },
  { value: "ACTIVE", label: "Active" },
  { value: "COMPLETED", label: "Completed" },
];

// ─── Helpers ───────────────────────────────────────────────────────────────────

/** Convert ISO string to HTML date input value (YYYY-MM-DD) */
function isoToDateInput(iso: string): string {
  return iso.split("T")[0] ?? "";
}

// ─── Component ─────────────────────────────────────────────────────────────────

interface EditTripFormProps {
  trip: TripCard;
}

export function EditTripForm({ trip }: EditTripFormProps) {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: trip.name,
      startDate: isoToDateInput(trip.startDate),
      endDate: isoToDateInput(trip.endDate),
      description: trip.description ?? "",
      totalBudget: trip.totalBudget != null ? String(trip.totalBudget) : "",
      status: trip.status,
    },
  });

  // Warn on unsaved changes
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

  async function onSubmit(values: FormValues) {
    const budgetNum =
      values.totalBudget && values.totalBudget.trim() !== ""
        ? parseFloat(values.totalBudget)
        : null;

    const res = await fetch(`/api/trips/${trip.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: values.name,
        startDate: values.startDate,
        endDate: values.endDate,
        description: values.description || null,
        totalBudget: budgetNum && !isNaN(budgetNum) ? budgetNum : null,
        status: values.status,
      }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error ?? "Something went wrong. Please try again.");
    }

    router.push(`/trips/${trip.id}`);
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="flex flex-col gap-5"
    >
      {/* Trip Name */}
      <Input
        label="Trip Name"
        placeholder="e.g. Rajasthan Road Trip"
        error={errors.name?.message}
        {...register("name")}
      />

      {/* Date range row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          type="date"
          label="Start Date"
          error={errors.startDate?.message}
          {...register("startDate")}
        />
        <Input
          type="date"
          label="End Date"
          error={errors.endDate?.message}
          {...register("endDate")}
        />
      </div>

      {/* Status */}
      <Controller
        name="status"
        control={control}
        render={({ field }) => (
          <Select
            label="Status"
            options={STATUS_OPTIONS}
            value={field.value}
            onValueChange={(v) => field.onChange(v as TripStatus)}
            error={errors.status?.message}
          />
        )}
      />

      {/* Description */}
      <Textarea
        label="Description"
        placeholder="What's this trip about?"
        maxLength={500}
        error={errors.description?.message}
        {...register("description")}
      />

      {/* Budget with ₹ prefix */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-via-black">
          Total Budget{" "}
          <span className="text-via-grey-mid font-normal">(optional)</span>
        </label>
        <div className="flex items-stretch">
          <span
            className="inline-flex items-center px-3 bg-via-off-white border border-r-0 border-via-grey-light text-via-black text-sm select-none"
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
              "border rounded-none outline-none",
              "placeholder:text-via-grey-mid",
              "transition-colors duration-100",
              "focus:border-2 focus:border-via-black",
              errors.totalBudget
                ? "border-2 border-via-red"
                : "border border-via-grey-light",
            ]
              .filter(Boolean)
              .join(" ")}
            {...register("totalBudget")}
          />
        </div>
        {errors.totalBudget && (
          <p className="text-xs text-via-red">{errors.totalBudget.message}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2 border-t border-via-grey-light mt-2">
        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={isSubmitting}
          className="flex-1 sm:flex-none"
        >
          Save Changes
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="lg"
          onClick={() => router.push(`/trips/${trip.id}`)}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
