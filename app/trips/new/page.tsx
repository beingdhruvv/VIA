import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { CreateTripForm } from "@/components/forms/CreateTripForm";

export const metadata = { title: "New Trip — VIA" };

export default async function NewTripPage() {
  const session = await auth();
  if (!session) redirect("/auth/login");

  const user = {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    image: session.user.image,
  };

  return (
    <AppShell user={user} showBack>
      <div className="px-4 md:px-8 py-6 max-w-2xl">
        <PageHeader
          title="Plan a New Trip"
          subtitle="Fill in the details — you can always edit later."
          breadcrumb={[
            { label: "Trips", href: "/trips" },
            { label: "New Trip" },
          ]}
        />
        <CreateTripForm />
      </div>
    </AppShell>
  );
}
