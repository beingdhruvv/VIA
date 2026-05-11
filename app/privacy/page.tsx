import Link from "next/link";

export const metadata = { title: "Privacy - VIA" };

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-via-white px-5 py-12 text-via-black md:px-12">
      <div className="mx-auto max-w-3xl border-2 border-via-black bg-via-white p-6 shadow-brutalist md:p-10">
        <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-via-grey-mid">VIA Privacy</p>
        <h1 className="mt-2 font-grotesk text-3xl font-black uppercase">Privacy Policy</h1>
        <div className="mt-6 space-y-4 text-sm leading-6 text-via-grey-dark">
          <p>VIA stores only the account, trip, planning, expense, and memory data needed to run the app experience.</p>
          <p>Private pages, uploaded memories, profile data, and admin tools require authentication. We do not sell user data.</p>
          <p>Analytics may be used to understand product usage and improve reliability. Production secrets and credentials are kept outside the public repository.</p>
          <p>For hackathon and demo usage, remove any test data from your account before sharing access publicly.</p>
        </div>
        <Link href="/" className="mt-8 inline-flex border border-via-black bg-via-black px-4 py-2 font-mono text-xs uppercase text-via-white">
          Back to VIA
        </Link>
      </div>
    </main>
  );
}
