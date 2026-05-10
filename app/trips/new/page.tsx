import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { CreateTripForm } from "@/components/forms/CreateTripForm";

export const metadata = { title: "New Trip — VIA" };

interface Props {
  searchParams: Promise<{ city?: string; cityName?: string }>;
}

export default async function NewTripPage({ searchParams }: Props) {
  const session = await auth();
  if (!session) redirect("/auth/login");

  const { cityName } = await searchParams;

  const user = {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    image: session.user.image,
  };

  return (
    <AppShell user={user} showBack>
      <div className="px-4 md:px-8 py-6 max-w-3xl mx-auto">
        <PageHeader
          title="Plan a New Trip"
          subtitle={cityName ? `Starting in ${cityName}` : "Four steps — name, dates, details, then review."}
          breadcrumb={[
            { label: "Trips", href: "/trips" },
            { label: "New Trip" },
          ]}
        />
        <CreateTripForm defaultName={cityName ? `Trip to ${cityName}` : undefined} />
      </div>
    </AppShell>
  );
}
