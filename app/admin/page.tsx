import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import AdminDashboardClient from "./AdminDashboardClient";
import type { SessionUser } from "@/types";

export const metadata = {
  title: "Admin Control | VIA",
  description: "Monitor and manage the VIA system.",
};

function sessionRole(userRole: string | undefined): SessionUser["role"] {
  if (userRole === "ADMIN" || userRole === "SUPER_ADMIN" || userRole === "USER") return userRole;
  return "USER";
}

export default async function AdminPage() {
  const session = await auth();

  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
    redirect("/dashboard");
  }

  const user: SessionUser = {
    id: session.user.id,
    name: session.user.name ?? "",
    email: session.user.email ?? "",
    image: session.user.image,
    role: sessionRole(session.user.role) as any,
  };

  return (
    <AppShell user={user}>
      <div className="px-4 md:px-8 py-6 flex flex-col gap-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-via-black font-space-grotesk tracking-tight">
            Admin Control
          </h1>
          <p className="text-via-grey-mid font-mono text-[11px] mt-1 uppercase tracking-[0.15em]">
            System Overview & Management
          </p>
        </div>

        <AdminDashboardClient currentUserRole={session.user.role as string} />
      </div>
    </AppShell>
  );
}

