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
  payerId: z.string().uuid().optional().nullable(),
  splits: z.array(z.object({
    userId: z.string().uuid(),
    amount: z.number().positive()
  })).optional()
});

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  
  // Allow access if owner or collaborator
  const isAuthorized = await prisma.trip.findFirst({
    where: {
      id,
      OR: [
        { userId: session.user.id },
        { collaborators: { some: { userId: session.user.id } } }
      ]
    }
  });
  
  if (!isAuthorized) return NextResponse.json({ error: "Trip not found or unauthorized" }, { status: 404 });

  const expenses = await prisma.expense.findMany({
    where: { tripId: id },
    orderBy: { date: "desc" },
    include: {
      payer: { select: { id: true, name: true, avatarUrl: true } },
      splits: { include: { user: { select: { id: true, name: true } } } }
    }
  });

  return NextResponse.json(expenses);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: tripId } = await params;
  const isAuthorized = await prisma.trip.findFirst({
    where: {
      id: tripId,
      OR: [
        { userId: session.user.id },
        { collaborators: { some: { userId: session.user.id } } }
      ]
    }
  });
  
  if (!isAuthorized) return NextResponse.json({ error: "Trip not found or unauthorized" }, { status: 404 });

  const body = await req.json();
  const parsed = expenseSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const { category, amount, description, date, stopId, payerId, splits } = parsed.data;

  try {
    const expense = await prisma.expense.create({
      data: {
        tripId,
        category,
        amount,
        description,
        date: new Date(date),
        stopId: stopId ?? null,
        payerId: payerId ?? session.user.id,
        splits: splits ? {
          create: splits.map(s => ({
            userId: s.userId,
            amount: s.amount
          }))
        } : undefined
      },
      include: {
        payer: true,
        splits: true
      }
    });

    return NextResponse.json(expense, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to create expense" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const expenseId = searchParams.get("expenseId");
  if (!expenseId) return NextResponse.json({ error: "expenseId required" }, { status: 400 });

  const { id: tripId } = await params;
  const expense = await prisma.expense.findFirst({
    where: { 
      id: expenseId, 
      tripId, 
      trip: {
        OR: [
          { userId: session.user.id },
          { collaborators: { some: { userId: session.user.id, role: "EDITOR" } } }
        ]
      }
    },
  });
  
  if (!expense) return NextResponse.json({ error: "Expense not found or unauthorized" }, { status: 404 });

  await prisma.expense.delete({ where: { id: expenseId } });
  return NextResponse.json({ success: true });
}
