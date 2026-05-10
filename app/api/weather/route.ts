import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");

  if (!lat || !lon) {
    return NextResponse.json({ error: "lat and lon are required" }, { status: 400 });
  }

  const parsed = { lat: parseFloat(lat), lon: parseFloat(lon) };
  if (isNaN(parsed.lat) || isNaN(parsed.lon)) {
    return NextResponse.json({ error: "Invalid coordinates" }, { status: 400 });
  }

  try {
    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${parsed.lat}&longitude=${parsed.lon}&current_weather=true&timezone=auto`,
      { next: { revalidate: 1800 } }
    );

    if (!res.ok) {
      return NextResponse.json({ error: "Weather service unavailable" }, { status: 502 });
    }

    const data = await res.json();
    const cw = data.current_weather;

    return NextResponse.json({
      temperature: cw.temperature,
      weathercode: cw.weathercode,
      windspeed: cw.windspeed,
      time: cw.time,
    });
  } catch {
    return NextResponse.json({ error: "Weather fetch failed" }, { status: 502 });
  }
}
