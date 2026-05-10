import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const fromId = searchParams.get("fromId");
  const toId = searchParams.get("toId");

  if (!fromId || !toId) {
    return NextResponse.json({ error: "fromId and toId are required" }, { status: 400 });
  }

  const apiKey = process.env.GEODB_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "GeoDB API key not configured" }, { status: 500 });
  }

  try {
    const url = `https://wft-geo-db.p.rapidapi.com/v1/geo/places/${fromId}/distance?toPlaceId=${toId}`;
    const response = await fetch(url, {
      headers: {
        'x-rapidapi-key': apiKey,
        'x-rapidapi-host': 'wft-geo-db.p.rapidapi.com',
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json({ error: error.message || "Failed to fetch distance" }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error("Distance API Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
