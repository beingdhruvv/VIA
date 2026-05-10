import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const expenseSchema = z.object({
  category: z.enum(["TRANSPORT", "STAY", "FOOD", "ACTIVITIES", "MISC"]),
  amount: z.number().positive(),
  description: z.string().min(1),
  date: z.string(),
  stopId: z.string().uuid().optional().nullable(),
});

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const trip = await prisma.trip.findFirst({ where: { id, userId: session.user.id } });
  if (!trip) return NextResponse.json({ error: "Trip not found" }, { status: 404 });

  const expenses = await prisma.expense.findMany({
    where: { tripId: id },
    orderBy: { date: "desc" },
  });

  return NextResponse.json(expenses);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: tripId } = await params;
  const trip = await prisma.trip.findFirst({ where: { id: tripId, userId: session.user.id } });
  if (!trip) return NextResponse.json({ error: "Trip not found" }, { status: 404 });

  const body = await req.json();
  const parsed = expenseSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const expense = await prisma.expense.create({
    data: {
      tripId,
      category: parsed.data.category,
      amount: parsed.data.amount,
      description: parsed.data.description,
      date: new Date(parsed.data.date),
      stopId: parsed.data.stopId ?? null,
    },
  });

  return NextResponse.json(expense, { status: 201 });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const expenseId = searchParams.get("expenseId");
  if (!expenseId) return NextResponse.json({ error: "expenseId required" }, { status: 400 });

  const { id: tripId } = await params;
  const expense = await prisma.expense.findFirst({
    where: { id: expenseId, tripId, trip: { userId: session.user.id } },
  });
  if (!expense) return NextResponse.json({ error: "Expense not found" }, { status: 404 });

  await prisma.expense.delete({ where: { id: expenseId } });
  return NextResponse.json({ success: true });
}
