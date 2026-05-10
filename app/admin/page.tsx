import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminDashboardClient from "./AdminDashboardClient";

export const metadata = {
  title: "Admin Control | VIA",
  description: "Monitor and manage the VIA system.",
};

export default async function AdminPage() {
  const session = await auth();

  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
    redirect("/dashboard");
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-4xl font-bold text-via-black font-space-grotesk tracking-tight">
          Admin Control
        </h1>
        <p className="text-via-grey-mid font-mono text-sm mt-2 uppercase tracking-widest">
          System Overview & Management
        </p>
      </div>

      <AdminDashboardClient currentUserRole={session.user.role as string} />
    </div>
  );
}
