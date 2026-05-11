"use client";

import { useEffect } from "react";

export function LocationDetector() {
  useEffect(() => {
    const detectLocation = async () => {
      // Check if we already have it in localStorage to avoid redundant calls
      if (localStorage.getItem("via_location_detected")) return;
      if (sessionStorage.getItem("via_location_attempted")) return;
      sessionStorage.setItem("via_location_attempted", "true");

      try {
        const controller = new AbortController();
        const timeout = window.setTimeout(() => controller.abort(), 2500);
        const res = await fetch("https://ipapi.co/json/", { signal: controller.signal });
        window.clearTimeout(timeout);
        if (!res.ok) return;

        const data = await res.json();
        
        if (data.city && data.country_name) {
          // Save to user profile via API
          await fetch("/api/users", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
              homeCity: data.city,
              homeCountry: data.country_name
            }),
          });
          
          localStorage.setItem("via_location_detected", "true");
        }
      } catch {
        // Location enrichment is optional and must not interrupt app flows.
      }
    };

    detectLocation();
  }, []);

  return null; // Invisible component
}
