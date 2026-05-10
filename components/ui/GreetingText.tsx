"use client";

import { useMemo } from "react";

function getLocalGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 5) return "Dreaming of new horizons";
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  if (hour < 21) return "Good evening";
  return "Ready for tomorrow's journey";
}

export function GreetingText({ name }: { name: string }) {
  const greeting = useMemo(() => getLocalGreeting(), []);
  return (
    <>
      {greeting}, <span className="text-via-navy">{name}</span>.
    </>
  );
}
