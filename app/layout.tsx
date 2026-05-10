import type { Metadata } from "next";
import "./globals.css";

export const viewport = {
  themeColor: "#111111",
};

export const metadata: Metadata = {
  title: "VIA — Travel Planner",
  description: "Plan multi-city trips, build day-wise itineraries, track budgets, and share your journeys.",
  appleWebApp: {
    capable: true,
    title: "VIA",
    statusBarStyle: "black-translucent",
  },
};

import { GoogleAnalytics } from "@/components/seo/GoogleAnalytics";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;

  return (
    <html lang="en" className="h-full">
      <body className="min-h-full bg-via-white text-via-black antialiased overflow-x-clip">
        {gaId && <GoogleAnalytics gaId={gaId} />}
        {children}
      </body>
    </html>
  );
}
