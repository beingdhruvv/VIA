import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import os from "os";

export async function GET() {
  const session = await auth();
  
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [userCount, tripCount, cityCount, activityCount, storageAgg] = await Promise.all([
      prisma.user.count(),
      prisma.trip.count(),
      prisma.city.count(),
      prisma.activity.count(),
      prisma.user.aggregate({
        _sum: {
          storageUsed: true
        }
      })
    ]);

    // System metrics
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const memUsage = (usedMem / totalMem) * 100;
    
    const cpus = os.cpus();
    const loadAvg = os.loadavg(); // [1, 5, 15] minute load averages

    return NextResponse.json({
      counts: {
        users: userCount,
        trips: tripCount,
        cities: cityCount,
        activities: activityCount,
        storageTotal: storageAgg._sum.storageUsed ?? 0,
      },
      system: {
        platform: os.platform(),
        uptime: os.uptime(),
        memory: {
          total: totalMem,
          used: usedMem,
          usagePercent: memUsage.toFixed(2),
        },
        cpu: {
          model: cpus[0].model,
          cores: cpus.length,
          load: loadAvg[0].toFixed(2),
        }
      }
    });
  } catch (error) {
    console.error("Admin Stats Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
