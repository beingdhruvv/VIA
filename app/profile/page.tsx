import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { ProfileClient } from "./_ProfileClient";

export const metadata = { title: "Profile — VIA" };

export default async function ProfilePage() {
  const session = await auth();
  if (!session) redirect("/auth/login");

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, avatarUrl: true, language: true, createdAt: true },
  });
  if (!dbUser) redirect("/auth/login");

  const tripCount = await prisma.trip.count({ where: { userId: session.user.id } });

  const user = { id: session.user.id, name: session.user.name ?? "", email: session.user.email ?? "", image: session.user.image };

  return (
    <AppShell user={user}>
      <div className="px-4 md:px-8 py-6 max-w-xl">
        <PageHeader title="Profile" breadcrumb={[{ label: "Profile" }]} />
        <ProfileClient
          profile={{
            id: dbUser.id,
            name: dbUser.name ?? "",
            email: dbUser.email,
            avatarUrl: dbUser.avatarUrl,
            language: dbUser.language ?? "en",
            createdAt: dbUser.createdAt.toISOString(),
          }}
          tripCount={tripCount}
        />
      </div>
    </AppShell>
  );
}
