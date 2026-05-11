import Link from "next/link";

export const metadata = { title: "Terms - VIA" };

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-via-white px-5 py-12 text-via-black md:px-12">
      <div className="mx-auto max-w-3xl border-2 border-via-black bg-via-white p-6 shadow-brutalist md:p-10">
        <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-via-grey-mid">VIA Terms</p>
        <h1 className="mt-2 font-grotesk text-3xl font-black uppercase">Terms of Use</h1>
        <div className="mt-6 space-y-4 text-sm leading-6 text-via-grey-dark">
          <p>VIA is a student-built travel planning product created by Team StormLabs for hackathon demonstration and continued development.</p>
          <p>Users are responsible for the accuracy of their trip plans, budgets, uploads, and shared links.</p>
          <p>Travel prices, weather, maps, and destination information are planning aids and should be verified before booking.</p>
          <p>Do not upload unlawful, private, or sensitive images unless you have permission to store and share them.</p>
        </div>
        <Link href="/" className="mt-8 inline-flex border border-via-black bg-via-black px-4 py-2 font-mono text-xs uppercase text-via-white">
          Back to VIA
        </Link>
      </div>
    </main>
  );
}
