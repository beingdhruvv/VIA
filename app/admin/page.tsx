import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { formatDate } from "@/lib/utils";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "admin@via.app";

export const metadata = { title: "Admin — VIA" };

export default async function AdminPage() {
  const session = await auth();
  if (!session || session.user.email !== ADMIN_EMAIL) redirect("/dashboard");

  const [userCount, tripCount, cityCount, activityCount, recentUsers, recentTrips] = await Promise.all([
    prisma.user.count(),
    prisma.trip.count(),
    prisma.city.count(),
    prisma.activity.count(),
    prisma.user.findMany({ orderBy: { createdAt: "desc" }, take: 10, select: { id: true, name: true, email: true, createdAt: true } }),
    prisma.trip.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      select: { id: true, name: true, status: true, createdAt: true, user: { select: { email: true } } },
    }),
  ]);

  const user = { id: session.user.id, name: session.user.name ?? "", email: session.user.email ?? "", image: session.user.image };

  const stats = [
    { label: "Users", value: userCount },
    { label: "Trips", value: tripCount },
    { label: "Cities", value: cityCount },
    { label: "Activities", value: activityCount },
  ];

  return (
    <AppShell user={user}>
      <div className="px-4 md:px-8 py-6">
        <PageHeader title="Admin Dashboard" breadcrumb={[{ label: "Admin" }]} />

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
          {stats.map((s) => (
            <div key={s.label} className="bg-via-white border border-via-black p-4" style={{ boxShadow: "3px 3px 0px #111111" }}>
              <p className="font-mono text-[36px] font-bold text-via-black leading-none">{s.value}</p>
              <p className="font-mono text-xs text-via-grey-mid uppercase tracking-widest mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent users */}
          <section>
            <p className="font-mono text-xs uppercase tracking-widest text-via-grey-mid mb-3">Recent Users</p>
            <div className="bg-via-white border border-via-black divide-y divide-via-grey-light" style={{ boxShadow: "3px 3px 0px #111111" }}>
              {recentUsers.map((u) => (
                <div key={u.id} className="px-4 py-2.5 flex justify-between items-center">
                  <div>
                    <p className="font-mono text-sm text-via-black">{u.name}</p>
                    <p className="font-mono text-[11px] text-via-grey-mid">{u.email}</p>
                  </div>
                  <span className="font-mono text-[11px] text-via-grey-mid">{formatDate(u.createdAt.toISOString())}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Recent trips */}
          <section>
            <p className="font-mono text-xs uppercase tracking-widest text-via-grey-mid mb-3">Recent Trips</p>
            <div className="bg-via-white border border-via-black divide-y divide-via-grey-light" style={{ boxShadow: "3px 3px 0px #111111" }}>
              {recentTrips.map((t) => (
                <div key={t.id} className="px-4 py-2.5 flex justify-between items-center">
                  <div>
                    <p className="font-mono text-sm text-via-black">{t.name}</p>
                    <p className="font-mono text-[11px] text-via-grey-mid">{t.user.email}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-[10px] uppercase border px-1.5 py-0.5 border-via-grey-light text-via-grey-mid">{t.status}</span>
                    <p className="font-mono text-[11px] text-via-grey-mid mt-1">{formatDate(t.createdAt.toISOString())}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
