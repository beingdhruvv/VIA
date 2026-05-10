import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "VIA — Travel Planner",
    short_name: "VIA",
    description: "Plan multi-city trips, build itineraries, track budgets, and share your journeys.",
    start_url: "/",
    display: "standalone",
    background_color: "#F5F5F2",
    theme_color: "#111111",
    icons: [
      {
        src: "/web-app-manifest-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/web-app-manifest-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
