"use client";

import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Trash2, Plus, Split } from "lucide-react";
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
import { ExpenseBadge } from "@/components/ui/Badge";
import { Select } from "@/components/ui/Select";
import { SplitExpenseModal } from "@/components/trip/SplitExpenseModal";
import { formatCurrency, diffInDays } from "@/lib/utils";
import { Avatar } from "@/components/ui/Avatar";
import type { ExpenseData, ExpenseCategory, TripCollaboratorData } from "@/types";

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
  collaborators: TripCollaboratorData[];
  currentUserId: string;
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
  collaborators,
  currentUserId,
}: BudgetClientProps) {
  const [expenses, setExpenses] = useState<ExpenseData[]>(initialExpenses);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  
  const [isSplitModalOpen, setIsSplitModalOpen] = useState(false);
  const [pendingSplits, setPendingSplits] = useState<{ userId: string, amount: number }[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseSchema),
    defaultValues: { date: today(), category: "MISC" },
  });

  const watchCategory = useWatch({ control, name: "category" });
  const watchAmount = useWatch({ control, name: "amount" });

  // ── Derived values ──────────────────────────────────────────────────────────

  const totalSpend = expenses.reduce((s, e) => s + e.amount, 0);
  const tripDays = Math.max(diffInDays(startDate, endDate), 1);
  const avgPerDay = totalSpend / tripDays;
  const budgetPct = totalBudget ? Math.min((totalSpend / totalBudget) * 100, 100) : 0;
  const overBudget = totalBudget != null && totalSpend > totalBudget;

  // ── Settlements Logic ──────────────────────────────────────────────────────
  
  const calculateDetailedBalances = () => {
    // balance[userId] = how much that user is "net" in the group
    // positive = they are owed money overall
    // negative = they owe money overall
    const balances: Record<string, number> = {};
    collaborators.forEach(c => balances[c.user.id] = 0);
    balances[currentUserId] = balances[currentUserId] || 0;

    expenses.forEach(exp => {
      const payerId = exp.payerId || currentUserId;
      if (!exp.splits || exp.splits.length === 0) return;

      // Payer gets credit for the portion others owe
      const othersPortion = exp.splits
        .filter(s => s.userId !== payerId)
        .reduce((sum, s) => sum + s.amount, 0);
      
      balances[payerId] += othersPortion;

      // Others get debt
      exp.splits.forEach(s => {
        if (s.userId !== payerId) {
          balances[s.userId] -= s.amount;
        }
      });
    });

    return balances;
  };

  const detailedBalances = calculateDetailedBalances();
  const myBalance = detailedBalances[currentUserId] || 0;
  const participantNames = Object.fromEntries([
    [currentUserId, "You"],
    ...collaborators.map((c) => [c.user.id, c.user.name]),
  ]);
  const settlements = (() => {
    const debtors = Object.entries(detailedBalances)
      .filter(([, amount]) => amount < -0.01)
      .map(([userId, amount]) => ({ userId, amount: Math.abs(amount) }))
      .sort((a, b) => b.amount - a.amount);
    const creditors = Object.entries(detailedBalances)
      .filter(([, amount]) => amount > 0.01)
      .map(([userId, amount]) => ({ userId, amount }))
      .sort((a, b) => b.amount - a.amount);
    const rows: { from: string; to: string; amount: number }[] = [];
    let i = 0;
    let j = 0;
    while (i < debtors.length && j < creditors.length) {
      const amount = Math.min(debtors[i].amount, creditors[j].amount);
      rows.push({ from: debtors[i].userId, to: creditors[j].userId, amount });
      debtors[i].amount -= amount;
      creditors[j].amount -= amount;
      if (debtors[i].amount <= 0.01) i++;
      if (creditors[j].amount <= 0.01) j++;
    }
    return rows;
  })();
  

  const categoryTotals = CATEGORIES.map((cat) => ({
    category: cat,
    amount: expenses.filter((e) => e.category === cat).reduce((s, e) => s + e.amount, 0),
  }));

  const maxCategoryAmount = Math.max(...categoryTotals.map((c) => c.amount), 1);

  const pieData = categoryTotals.filter((c) => c.amount > 0);

  const barData = Object.entries(
    expenses.reduce((acc, exp) => {
      acc[exp.date] = (acc[exp.date] || 0) + exp.amount;
      return acc;
    }, {} as Record<string, number>)
  )
    .map(([date, amount]) => ({ date, amount }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // ── Actions ─────────────────────────────────────────────────────────────────

  async function onAddExpense(values: ExpenseFormValues) {
    setServerError(null);
    const res = await fetch(`/api/trips/${tripId}/expenses`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...values,
        splits: pendingSplits.length > 0 ? pendingSplits : undefined
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setServerError(data.error ?? "Failed to add expense");
      return;
    }
    setExpenses((prev) => [data, ...prev]);
    reset({ date: today(), category: "MISC" });
    setPendingSplits([]);
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
    <div className="space-y-8 max-w-4xl pb-20">
      <SplitExpenseModal
        isOpen={isSplitModalOpen}
        onClose={() => setIsSplitModalOpen(false)}
        totalAmount={watchAmount || 0}
        collaborators={collaborators}
        onSave={(s) => {
          setPendingSplits(s);
          setIsSplitModalOpen(false);
        }}
        initialSplits={pendingSplits}
      />
      {/* ── Dashboard Grid ── */}
      {/* ── Dashboard Grid ── */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Row 1: Core Stats (12 cols) */}
        <div className="lg:col-span-12 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
          <div className="bg-via-white border border-via-black p-3 shadow-[2px_2px_0px_#111]">
            <p className="font-mono text-[9px] text-via-grey-mid uppercase">Total Budget</p>
            <p className="text-lg font-bold text-via-black truncate">{totalBudget != null ? formatCurrency(totalBudget) : "—"}</p>
          </div>
          <div className="bg-via-white border border-via-black p-3 shadow-[2px_2px_0px_#111]">
            <p className="font-mono text-[9px] text-via-grey-mid uppercase">Logged Spend</p>
            <p className={`text-lg font-bold ${overBudget ? 'text-via-red' : 'text-via-black'} truncate`}>{formatCurrency(totalSpend)}</p>
          </div>
          <div className="bg-via-white border border-via-black p-3 shadow-[2px_2px_0px_#111]">
            <p className="font-mono text-[9px] text-via-grey-mid uppercase">Avg/Day</p>
            <p className="text-lg font-bold text-via-black truncate">{formatCurrency(Math.round(avgPerDay))}</p>
          </div>
          <div className="bg-via-white border border-via-black p-3 shadow-[2px_2px_0px_#111]">
            <p className="font-mono text-[9px] text-via-grey-mid uppercase">Net Balance</p>
            <p className={`text-lg font-bold ${myBalance >= 0 ? 'text-emerald-600' : 'text-red-600'} truncate`}>{myBalance >= 0 ? '+' : ''}{formatCurrency(Math.round(myBalance))}</p>
          </div>
          <div className="hidden lg:block bg-via-black text-via-white border border-via-black p-3 shadow-[2px_2px_0px_#111]">
            <p className="font-mono text-[9px] opacity-60 uppercase">Budget Status</p>
            <div className="mt-1">
              <div className="h-1 bg-via-white/20 w-full">
                <div className="h-full bg-via-white" style={{ width: `${budgetPct}%` }} />
              </div>
              <p className="font-mono text-[8px] mt-1 uppercase">{budgetPct.toFixed(0)}% Utilized</p>
            </div>
          </div>
        </div>

        {/* Row 2: Visuals & Breakdown (12 cols) */}
        <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Pie + Key */}
          <div className="bg-via-white border border-via-black p-3 shadow-[2px_2px_0px_#111]">
            <p className="font-mono text-[9px] uppercase tracking-widest text-via-grey-mid mb-2">Category Mix</p>
            <div className="flex items-center gap-2 h-32">
              {pieData.length > 0 ? (
                <>
                  <div className="w-1/2 h-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={pieData} cx="50%" cy="50%" innerRadius={25} outerRadius={40} dataKey="amount" nameKey="category">
                          {pieData.map((entry) => <Cell key={entry.category} fill={CHART_COLORS[entry.category as ExpenseCategory]} />)}
                        </Pie>
                        <Tooltip formatter={(v) => formatCurrency(Number(v))} contentStyle={{ border: "1px solid #111", background: "#fff", fontFamily: "monospace", fontSize: "9px" }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="w-1/2 space-y-1">
                    {pieData.slice(0, 3).map((entry) => (
                      <div key={entry.category} className="flex items-center gap-1 min-w-0">
                        <div className="w-1.5 h-1.5 shrink-0" style={{ background: CHART_COLORS[entry.category as ExpenseCategory] }} />
                        <span className="font-mono text-[8px] uppercase truncate opacity-70">{entry.category}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : <div className="w-full flex items-center justify-center font-mono text-[9px] uppercase italic text-via-grey-mid">No Data</div>}
            </div>
          </div>

          {/* Daily Trend */}
          <div className="bg-via-white border border-via-black p-3 shadow-[2px_2px_0px_#111]">
            <p className="font-mono text-[9px] uppercase tracking-widest text-via-grey-mid mb-2">Daily Trend</p>
            <div className="h-32">
              {barData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} barSize={8}>
                    <XAxis dataKey="date" tickFormatter={formatShortDate} tick={{ fontSize: 7, fontFamily: "monospace" }} axisLine={false} tickLine={false} />
                    <YAxis hide />
                    <Tooltip formatter={(v) => formatCurrency(Number(v))} contentStyle={{ border: "1px solid #111", background: "#fff", fontFamily: "monospace", fontSize: "9px" }} />
                    <Bar dataKey="amount" fill="#111" />
                  </BarChart>
                </ResponsiveContainer>
              ) : <div className="h-full flex items-center justify-center font-mono text-[9px] uppercase italic text-via-grey-mid">Waiting for data</div>}
            </div>
          </div>

          {/* Breakdown List */}
          <div className="bg-via-white border border-via-black p-3 shadow-[2px_2px_0px_#111] overflow-hidden">
            <p className="font-mono text-[9px] uppercase tracking-widest text-via-grey-mid mb-2">Category Breakdown</p>
            <div className="space-y-2 max-h-32 overflow-y-auto pr-1 scrollbar-thin">
              {categoryTotals.filter(c => c.amount > 0).length > 0 ? categoryTotals.filter(c => c.amount > 0).map((row) => (
                <div key={row.category} className="space-y-0.5">
                  <div className="flex justify-between items-center text-[9px] font-mono">
                    <span className="uppercase opacity-70">{row.category}</span>
                    <span className="font-bold">{formatCurrency(row.amount)}</span>
                  </div>
                  <div className="h-1 bg-via-off-white">
                    <div className="h-full" style={{ width: `${(row.amount / maxCategoryAmount) * 100}%`, background: CHART_COLORS[row.category] }} />
                  </div>
                </div>
              )) : <div className="h-full flex items-center justify-center font-mono text-[9px] uppercase italic text-via-grey-mid py-8">Log expense to view</div>}
            </div>
          </div>
        </div>
      </section>

      <section className="border border-via-black bg-via-white p-4 shadow-[3px_3px_0px_#111]">
        <div className="mb-3 flex items-center justify-between gap-3 border-b border-via-grey-light pb-2">
          <p className="font-mono text-xs uppercase tracking-widest text-via-grey-mid">Settlement Plan</p>
          <p className="font-mono text-[10px] uppercase text-via-grey-mid">{settlements.length || "No"} payments</p>
        </div>
        {settlements.length > 0 ? (
          <div className="grid gap-2 md:grid-cols-2">
            {settlements.map((row) => (
              <div key={`${row.from}-${row.to}-${row.amount}`} className="flex items-center justify-between gap-3 border border-via-grey-light bg-via-off-white px-3 py-2">
                <p className="min-w-0 text-xs text-via-black">
                  <span className="font-bold">{participantNames[row.from] ?? "Member"}</span>
                  <span className="mx-2 font-mono text-[10px] uppercase text-via-grey-mid">pays</span>
                  <span className="font-bold">{participantNames[row.to] ?? "Member"}</span>
                </p>
                <p className="shrink-0 font-mono text-xs font-bold text-via-black">{formatCurrency(Math.round(row.amount))}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="font-mono text-[10px] uppercase text-via-grey-mid">Add split expenses to see who should pay whom.</p>
        )}
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

          <div className="flex items-center gap-3 pt-2">
            <Button type="submit" loading={isSubmitting} size="sm">
              <Plus size={13} />
              Add Expense
            </Button>
            
            {collaborators.length > 0 && (
              <Button 
                type="button" 
                variant="secondary" 
                size="sm" 
                onClick={() => setIsSplitModalOpen(true)}
                className={`gap-2 ${pendingSplits.length > 0 ? 'border-emerald-500 text-emerald-600' : ''}`}
              >
                <Split size={14} />
                {pendingSplits.length > 0 ? "Split Applied" : "Split with Friends"}
              </Button>
            )}
          </div>
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

                {/* Payer info */}
                <div className="hidden sm:flex items-center gap-2 shrink-0">
                  <Avatar src={expense.payer?.avatarUrl} name={expense.payer?.name} size="sm" />
                  <span className="font-mono text-[10px] text-via-grey-mid uppercase">{expense.payer?.name?.split(' ')[0]} paid</span>
                </div>

                {/* Amount */}
                <div className="text-right shrink-0 min-w-[80px]">
                  <p className="font-mono text-[13px] font-medium text-via-black">
                    {formatCurrency(expense.amount)}
                  </p>
                  {expense.splits && expense.splits.length > 0 && (
                    <p className="font-mono text-[9px] text-via-grey-mid uppercase">Shared ({expense.splits.length})</p>
                  )}
                </div>

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
