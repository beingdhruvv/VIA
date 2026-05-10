import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/layout/AppShell";
import { TripSubNav } from "@/components/trip/TripSubNav";
import { StatusBadge } from "@/components/ui/Badge";
import { BudgetClient } from "./_BudgetClient";
import { formatDateRange } from "@/lib/utils";
import type { ExpenseData } from "@/types";

interface BudgetPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: BudgetPageProps) {
  const { id } = await params;
  const trip = await prisma.trip.findFirst({
    where: { id },
    select: { name: true },
  });
  return { title: `${trip?.name ?? "Trip"} — Budget · VIA` };
}

export default async function BudgetPage({ params }: BudgetPageProps) {
  const session = await auth();
  if (!session) redirect("/auth/login");

  const { id } = await params;

  const trip = await prisma.trip.findFirst({
    where: { 
      id, 
      OR: [
        { userId: session.user.id },
        { collaborators: { some: { userId: session.user.id } } }
      ]
    },
    include: {
      expenses: { 
        orderBy: { date: "desc" },
        include: { payer: true, splits: { include: { user: true } } }
      },
      collaborators: {
        include: { user: { select: { id: true, name: true, email: true, avatarUrl: true } } }
      },
      stops: { select: { startDate: true, endDate: true } },
    },
  });

  if (!trip) redirect("/trips");

  const user = {
    id: session.user.id,
    name: session.user.name ?? "",
    email: session.user.email ?? "",
    image: session.user.image,
    role: session.user.role,
  };

  const expenses: ExpenseData[] = trip.expenses.map((e) => ({
    id: e.id,
    tripId: e.tripId,
    stopId: e.stopId,
    payerId: e.payerId,
    category: e.category as ExpenseData["category"],
    amount: e.amount,
    description: e.description,
    date: e.date.toISOString(),
    payer: e.payer ? {
      id: e.payer.id,
      name: e.payer.name,
      avatarUrl: e.payer.avatarUrl
    } : undefined,
    splits: e.splits.map(s => ({
      userId: s.userId,
      amount: s.amount,
      user: { name: s.user.name }
    }))
  }));

  const collaborators = trip.collaborators.map(c => ({
    id: c.id,
    userId: c.userId,
    role: c.role,
    user: c.user
  }));


  const dateRange = formatDateRange(trip.startDate, trip.endDate);

  return (
    <AppShell user={user} showBack>
      {/* Sticky trip header */}
      <header className="sticky top-14 md:top-0 z-20 bg-via-white border-b border-via-black no-print">
        <div className="px-4 md:px-8 py-4 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h1
              className="text-[22px] md:text-[28px] font-bold text-via-black leading-tight truncate"
              style={{ fontFamily: "var(--font-space-grotesk, sans-serif)" }}
            >
              {trip.name}
            </h1>
            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
              <p className="font-mono text-xs text-via-grey-mid">{dateRange}</p>
              <span className="text-via-grey-light">·</span>
              <StatusBadge status={trip.status as "PLANNING" | "ACTIVE" | "COMPLETED"} />
              {trip.totalBudget != null && (
                <span className="font-mono text-xs text-via-black border border-via-grey-light px-2 py-0.5">
                  ₹{trip.totalBudget.toLocaleString("en-IN")} BUDGET
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="px-4 md:px-8">
          <TripSubNav tripId={id} />
        </div>
      </header>

      {/* Budget content */}
      <div className="px-4 md:px-8 py-6">
        <BudgetClient
          tripId={id}
          totalBudget={trip.totalBudget}
          startDate={trip.startDate.toISOString()}
          endDate={trip.endDate.toISOString()}
          initialExpenses={expenses}
          collaborators={collaborators}
          currentUserId={user.id}
        />

      </div>
    </AppShell>
  );
}
