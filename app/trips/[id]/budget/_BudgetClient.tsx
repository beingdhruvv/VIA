"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Trash2, Plus, TrendingUp, TrendingDown } from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { ExpenseBadge } from "@/components/ui/Badge";
import { Select } from "@/components/ui/Select";
import { formatCurrency, diffInDays } from "@/lib/utils";
import type { ExpenseData, ExpenseCategory } from "@/types";

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES: ExpenseCategory[] = [
  "TRANSPORT",
  "STAY",
  "FOOD",
  "ACTIVITIES",
  "MISC",
];

const CHART_COLORS: Record<ExpenseCategory, string> = {
  TRANSPORT: "#1B2A41",
  STAY: "#111111",
  FOOD: "#C1121F",
  ACTIVITIES: "#3D3D3D",
  MISC: "#D6D6D6",
};

const CATEGORY_OPTIONS = CATEGORIES.map((c) => ({ value: c, label: c }));

// ─── Form schema ──────────────────────────────────────────────────────────────

const expenseSchema = z.object({
  category: z.enum(["TRANSPORT", "STAY", "FOOD", "ACTIVITIES", "MISC"]),
  amount: z.number().positive("Amount must be positive"),
  description: z.string().min(1, "Description is required"),
  date: z.string().min(1, "Date is required"),
});

type ExpenseFormValues = z.infer<typeof expenseSchema>;

// ─── Props ────────────────────────────────────────────────────────────────────

interface BudgetClientProps {
  tripId: string;
  totalBudget: number | null;
  startDate: string;
  endDate: string;
  initialExpenses: ExpenseData[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function today() {
  return new Date().toISOString().slice(0, 10);
}

function formatShortDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" }).toUpperCase();
}

// ─── Component ────────────────────────────────────────────────────────────────

export function BudgetClient({
  tripId,
  totalBudget,
  startDate,
  endDate,
  initialExpenses,
}: BudgetClientProps) {
  const [expenses, setExpenses] = useState<ExpenseData[]>(initialExpenses);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseSchema),
    defaultValues: { date: today(), category: "MISC" },
  });

  const watchCategory = watch("category");

  // ── Derived values ──────────────────────────────────────────────────────────

  const totalSpend = expenses.reduce((s, e) => s + e.amount, 0);
  const tripDays = Math.max(diffInDays(startDate, endDate), 1);
  const avgPerDay = totalSpend / tripDays;
  const budgetPct = totalBudget ? Math.min((totalSpend / totalBudget) * 100, 100) : 0;
  const overBudget = totalBudget != null && totalSpend > totalBudget;

  // Category totals
  const categoryTotals = CATEGORIES.map((cat) => ({
    category: cat,
    amount: expenses.filter((e) => e.category === cat).reduce((s, e) => s + e.amount, 0),
  }));
  const maxCategoryAmount = Math.max(...categoryTotals.map((c) => c.amount), 1);

  // Pie chart data
  const pieData = categoryTotals.filter((c) => c.amount > 0);

  // Bar chart data — group by date
  const barDataMap: Record<string, number> = {};
  expenses.forEach((e) => {
    const d = e.date.slice(0, 10);
    barDataMap[d] = (barDataMap[d] ?? 0) + e.amount;
  });
  const barData = Object.entries(barDataMap)
    .map(([date, amount]) => ({ date, amount }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // ── Actions ─────────────────────────────────────────────────────────────────

  async function onAddExpense(values: ExpenseFormValues) {
    setServerError(null);
    const res = await fetch(`/api/trips/${tripId}/expenses`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const data = await res.json();
    if (!res.ok) {
      setServerError(data.error ?? "Failed to add expense");
      return;
    }
    const newExpense: ExpenseData = {
      id: data.id,
      tripId: data.tripId,
      stopId: data.stopId ?? null,
      category: data.category,
      amount: data.amount,
      description: data.description,
      date: new Date(data.date).toISOString(),
    };
    setExpenses((prev) => [newExpense, ...prev]);
    reset({ date: today(), category: "MISC" });
  }

  async function handleDelete(expenseId: string) {
    setDeletingId(expenseId);
    try {
      const res = await fetch(
        `/api/trips/${tripId}/expenses?expenseId=${expenseId}`,
        { method: "DELETE" }
      );
      if (res.ok) {
        setExpenses((prev) => prev.filter((e) => e.id !== expenseId));
      }
    } finally {
      setDeletingId(null);
    }
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-8 max-w-4xl">

      {/* ── Budget Overview ── */}
      <section
        className="bg-via-white border border-via-black p-6"
        style={{ boxShadow: "3px 3px 0px #111111" }}
      >
        <p className="font-mono text-xs uppercase tracking-widest text-via-grey-mid mb-4">
          Budget Overview
        </p>

        <div className="flex flex-col sm:flex-row sm:items-end gap-4 mb-6">
          {/* Total budget */}
          <div>
            <p className="font-mono text-xs text-via-grey-mid uppercase mb-1">Total Budget</p>
            {totalBudget != null ? (
              <p
                className="font-mono text-[36px] font-bold text-via-black leading-none"
                style={{ fontFamily: "var(--font-space-grotesk, sans-serif)" }}
              >
                {formatCurrency(totalBudget)}
              </p>
            ) : (
              <p className="font-mono text-[20px] text-via-grey-mid">—</p>
            )}
          </div>

          <div className="w-px h-10 bg-via-grey-light hidden sm:block" />

          {/* Estimated spend */}
          <div>
            <p className="font-mono text-xs text-via-grey-mid uppercase mb-1">Logged Spend</p>
            <p
              className="font-mono text-[24px] font-semibold leading-none"
              style={{
                fontFamily: "var(--font-space-grotesk, sans-serif)",
                color: overBudget ? "#C1121F" : "#111111",
              }}
            >
              {formatCurrency(totalSpend)}
            </p>
          </div>

          <div className="w-px h-10 bg-via-grey-light hidden sm:block" />

          {/* Avg per day */}
          <div>
            <p className="font-mono text-xs text-via-grey-mid uppercase mb-1">Avg / Day</p>
            <p className="font-mono text-[18px] text-via-black leading-none">
              {formatCurrency(Math.round(avgPerDay))}
            </p>
          </div>
        </div>

        {/* Progress bar — only if budget is set */}
        {totalBudget != null && (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <p className="font-mono text-xs text-via-grey-mid">
                {budgetPct.toFixed(0)}% of budget used
              </p>
              {overBudget && (
                <p className="font-mono text-xs text-via-red font-medium flex items-center gap-1">
                  <TrendingUp size={12} />
                  Over by {formatCurrency(totalSpend - totalBudget)}
                </p>
              )}
              {!overBudget && totalBudget != null && (
                <p className="font-mono text-xs text-via-grey-mid flex items-center gap-1">
                  <TrendingDown size={12} />
                  {formatCurrency(totalBudget - totalSpend)} remaining
                </p>
              )}
            </div>
            <ProgressBar
              value={budgetPct}
              color={overBudget ? "red" : "default"}
            />
          </div>
        )}

        {/* Over-budget banner */}
        {overBudget && totalBudget != null && (
          <div className="mt-4 bg-via-red text-via-white px-4 py-2 font-mono text-xs font-medium flex items-center gap-2">
            <TrendingUp size={14} />
            OVER BUDGET BY {formatCurrency(totalSpend - totalBudget)}
          </div>
        )}
      </section>

      {/* ── Charts Row ── */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div
          className="bg-via-white border border-via-black p-4"
          style={{ boxShadow: "3px 3px 0px #111111" }}
        >
          <p className="font-mono text-xs uppercase tracking-widest text-via-grey-mid mb-4">
            By Category
          </p>
          {pieData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    dataKey="amount"
                    nameKey="category"
                    paddingAngle={2}
                  >
                    {pieData.map((entry) => (
                      <Cell
                        key={entry.category}
                        fill={CHART_COLORS[entry.category as ExpenseCategory]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [formatCurrency(Number(value ?? 0)), ""]}
                    contentStyle={{
                      border: "1px solid #111111",
                      borderRadius: 0,
                      fontFamily: "var(--font-ibm-plex-mono, monospace)",
                      fontSize: 12,
                      background: "#F5F5F2",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-3">
                {pieData.map((entry) => (
                  <div key={entry.category} className="flex items-center gap-2">
                    <div
                      className="w-2.5 h-2.5 shrink-0"
                      style={{ background: CHART_COLORS[entry.category as ExpenseCategory] }}
                    />
                    <span className="font-mono text-[10px] uppercase text-via-grey-dark truncate">
                      {entry.category}
                    </span>
                    <span className="font-mono text-[10px] text-via-grey-mid ml-auto">
                      {formatCurrency(entry.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-[200px] flex flex-col items-center justify-center border border-dashed border-via-grey-light bg-via-off-white px-4 text-center">
              <p className="font-mono text-xs text-via-grey-mid uppercase tracking-wider mb-1">No spend data</p>
              <p className="text-sm text-via-grey-dark">Add expenses below to populate the pie chart.</p>
            </div>
          )}
        </div>

        <div
          className="bg-via-white border border-via-black p-4"
          style={{ boxShadow: "3px 3px 0px #111111" }}
        >
          <p className="font-mono text-xs uppercase tracking-widest text-via-grey-mid mb-4">
            Daily Spend
          </p>
          {barData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={barData} barSize={14}>
                <XAxis
                  dataKey="date"
                  tickFormatter={formatShortDate}
                  tick={{ fontSize: 10, fontFamily: "var(--font-ibm-plex-mono, monospace)" }}
                  tickLine={false}
                  axisLine={{ stroke: "#D6D6D6" }}
                />
                <YAxis
                  tickFormatter={(v: number) => `₹${(v / 1000).toFixed(0)}k`}
                  tick={{ fontSize: 10, fontFamily: "var(--font-ibm-plex-mono, monospace)" }}
                  tickLine={false}
                  axisLine={false}
                  width={42}
                />
                <Tooltip
                  formatter={(value) => [formatCurrency(Number(value ?? 0)), "Spend"]}
                  contentStyle={{
                    border: "1px solid #111111",
                    borderRadius: 0,
                    fontFamily: "var(--font-ibm-plex-mono, monospace)",
                    fontSize: 12,
                    background: "#F5F5F2",
                  }}
                />
                <Bar dataKey="amount" fill="#111111" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[240px] flex flex-col items-center justify-center border border-dashed border-via-grey-light bg-via-off-white px-4 text-center">
              <p className="font-mono text-xs text-via-grey-mid uppercase tracking-wider mb-1">No timeline yet</p>
              <p className="text-sm text-via-grey-dark">Daily bars appear once expenses have dates logged.</p>
            </div>
          )}
        </div>
      </section>

      {/* ── Category Breakdown Table ── */}
      <section
        className="bg-via-white border border-via-black"
        style={{ boxShadow: "3px 3px 0px #111111" }}
      >
        <div className="px-5 py-3 border-b border-via-grey-light">
          <p className="font-mono text-xs uppercase tracking-widest text-via-grey-mid">
            Category Breakdown
          </p>
        </div>
        <div className="divide-y divide-via-grey-light">
          {categoryTotals.map((row) => (
            <div key={row.category} className="px-5 py-3 flex items-center gap-4">
              <div className="w-24 shrink-0">
                <ExpenseBadge category={row.category} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="h-2 bg-via-off-white border border-via-grey-light">
                  <div
                    className="h-full bg-via-black transition-all duration-300"
                    style={{
                      width: `${(row.amount / maxCategoryAmount) * 100}%`,
                      background: CHART_COLORS[row.category],
                    }}
                  />
                </div>
              </div>
              <p className="font-mono text-[13px] text-via-black w-24 text-right shrink-0">
                {row.amount > 0 ? formatCurrency(row.amount) : "—"}
              </p>
            </div>
          ))}
          {/* Total row */}
          <div className="px-5 py-3 flex items-center gap-4 bg-via-off-white">
            <div className="w-24 shrink-0">
              <span className="font-mono text-[11px] font-medium uppercase tracking-wider text-via-black">
                TOTAL
              </span>
            </div>
            <div className="flex-1" />
            <p className="font-mono text-[14px] font-bold text-via-black w-24 text-right shrink-0">
              {formatCurrency(totalSpend)}
            </p>
          </div>
        </div>
      </section>

      {/* ── Add Expense Form ── */}
      <section
        className="bg-via-white border border-via-black p-5"
        style={{ boxShadow: "3px 3px 0px #111111" }}
      >
        <p className="font-mono text-xs uppercase tracking-widest text-via-grey-mid mb-4 flex items-center gap-2">
          <Plus size={13} />
          Add Expense
        </p>

        <form onSubmit={handleSubmit(onAddExpense)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {/* Category */}
            <div className="flex flex-col gap-1">
              <label className="font-mono text-[11px] uppercase tracking-wider text-via-grey-mid">
                Category
              </label>
              <Select
                options={CATEGORY_OPTIONS}
                value={watchCategory}
                onValueChange={(v) => setValue("category", v as ExpenseCategory)}
                placeholder="Category"
              />
              {errors.category && (
                <p className="font-mono text-[11px] text-via-red">{errors.category.message}</p>
              )}
            </div>

            {/* Amount */}
            <div className="flex flex-col gap-1">
              <label
                htmlFor="expense-amount"
                className="font-mono text-[11px] uppercase tracking-wider text-via-grey-mid"
              >
                Amount (₹)
              </label>
              <input
                id="expense-amount"
                type="number"
                step="1"
                min="1"
                placeholder="0"
                className="w-full bg-via-off-white border border-via-grey-light px-3 py-2 text-sm font-mono text-via-black rounded-none outline-none focus:border-2 focus:border-via-black placeholder:text-via-grey-mid"
                {...register("amount", { valueAsNumber: true })}
              />
              {errors.amount && (
                <p className="font-mono text-[11px] text-via-red">{errors.amount.message}</p>
              )}
            </div>

            {/* Description */}
            <div className="flex flex-col gap-1">
              <label
                htmlFor="expense-desc"
                className="font-mono text-[11px] uppercase tracking-wider text-via-grey-mid"
              >
                Description
              </label>
              <input
                id="expense-desc"
                type="text"
                placeholder="e.g. Hotel Ahmedabad"
                className="w-full bg-via-off-white border border-via-grey-light px-3 py-2 text-sm text-via-black rounded-none outline-none focus:border-2 focus:border-via-black placeholder:text-via-grey-mid"
                {...register("description")}
              />
              {errors.description && (
                <p className="font-mono text-[11px] text-via-red">{errors.description.message}</p>
              )}
            </div>

            {/* Date */}
            <div className="flex flex-col gap-1">
              <label
                htmlFor="expense-date"
                className="font-mono text-[11px] uppercase tracking-wider text-via-grey-mid"
              >
                Date
              </label>
              <input
                id="expense-date"
                type="date"
                className="w-full bg-via-off-white border border-via-grey-light px-3 py-2 text-sm font-mono text-via-black rounded-none outline-none focus:border-2 focus:border-via-black"
                {...register("date")}
              />
              {errors.date && (
                <p className="font-mono text-[11px] text-via-red">{errors.date.message}</p>
              )}
            </div>
          </div>

          {serverError && (
            <p className="font-mono text-xs text-via-red border border-via-red px-3 py-2">
              {serverError}
            </p>
          )}

          <Button type="submit" loading={isSubmitting} size="sm">
            <Plus size={13} />
            Add Expense
          </Button>
        </form>
      </section>

      {/* ── Expense List ── */}
      <section
        className="bg-via-white border border-via-black"
        style={{ boxShadow: "3px 3px 0px #111111" }}
      >
        <div className="px-5 py-3 border-b border-via-grey-light flex items-center justify-between">
          <p className="font-mono text-xs uppercase tracking-widest text-via-grey-mid">
            All Expenses
          </p>
          <p className="font-mono text-xs text-via-grey-mid">
            {expenses.length} {expenses.length === 1 ? "entry" : "entries"}
          </p>
        </div>

        {expenses.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <p className="font-mono text-xs text-via-grey-mid">
              No expenses logged yet. Add your first expense above.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-via-grey-light">
            {expenses.map((expense) => (
              <li
                key={expense.id}
                className="px-5 py-3 flex items-center gap-4 hover:bg-via-off-white transition-colors"
              >
                {/* Date */}
                <p className="font-mono text-[11px] text-via-grey-mid w-16 shrink-0">
                  {formatShortDate(expense.date)}
                </p>

                {/* Category badge */}
                <div className="shrink-0">
                  <ExpenseBadge category={expense.category} />
                </div>

                {/* Description */}
                <p className="flex-1 text-sm text-via-black truncate min-w-0">
                  {expense.description}
                </p>

                {/* Amount */}
                <p className="font-mono text-[13px] font-medium text-via-black shrink-0">
                  {formatCurrency(expense.amount)}
                </p>

                {/* Delete */}
                <button
                  onClick={() => handleDelete(expense.id)}
                  disabled={deletingId === expense.id}
                  className="text-via-grey-mid hover:text-via-red transition-colors shrink-0 disabled:opacity-40"
                  aria-label="Delete expense"
                >
                  <Trash2 size={14} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
