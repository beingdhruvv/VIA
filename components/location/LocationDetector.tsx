"use client";

import { useEffect } from "react";

export function LocationDetector() {
  useEffect(() => {
    const detectLocation = async () => {
      // Check if we already have it in localStorage to avoid redundant calls
      if (localStorage.getItem("via_location_detected")) return;

      try {
        const res = await fetch("https://ipapi.co/json/");
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
          console.log(`Detected location: ${data.city}, ${data.country_name}`);
        }
      } catch (error) {
        console.error("Location detection failed:", error);
      }
    };

    detectLocation();
  }, []);

  return null; // Invisible component
}
