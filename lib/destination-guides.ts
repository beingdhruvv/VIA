export interface DestinationPackage {
  title: string;
  provider: string;
  duration: string;
  priceRange: string;
  url: string;
}

export interface DestinationGuide {
  places: Array<{ name: string; area: string; notes: string; mapQuery: string }>;
  activities: Array<{ name: string; season: string; estimate: string; notes: string }>;
  hostels: Array<{ name: string; area: string; url: string }>;
  packages: DestinationPackage[];
  routeNotes: string[];
}

export const DESTINATION_GUIDES: Record<string, DestinationGuide> = {
  "manali|india": {
    places: [
      { name: "Hadimba Devi Temple", area: "Dhungri forest", notes: "Classic cedar-forest temple stop; best early morning before crowds.", mapQuery: "Hadimba Devi Temple Manali" },
      { name: "Old Manali", area: "Old Manali", notes: "Cafe lanes, guesthouses, live music, craft shops, and slower evening walks.", mapQuery: "Old Manali Himachal Pradesh" },
      { name: "Manu Temple", area: "Old Manali", notes: "Small uphill cultural stop usually paired with Old Manali cafes.", mapQuery: "Manu Temple Manali" },
      { name: "Vashisht Hot Springs", area: "Vashisht", notes: "Temple village and hot-water baths with a good cafe trail nearby.", mapQuery: "Vashisht Temple Manali" },
      { name: "Jogini Falls", area: "Vashisht", notes: "Short waterfall hike; carry grip shoes and avoid slippery monsoon edges.", mapQuery: "Jogini Falls Manali" },
      { name: "Solang Valley", area: "Solang", notes: "Adventure hub for paragliding, ATV, ropeway, skiing season, zorbing, and snow play.", mapQuery: "Solang Valley Manali" },
      { name: "Atal Tunnel and Sissu", area: "Lahaul side", notes: "High-altitude day drive with strong weather dependency.", mapQuery: "Atal Tunnel Sissu" },
      { name: "Rohtang Pass", area: "Rohtang", notes: "Permit-based snow viewpoint; build a buffer day for closures and traffic.", mapQuery: "Rohtang Pass" },
      { name: "Naggar Castle", area: "Naggar", notes: "Heritage castle, art gallery, apple-valley views, and quieter cafes.", mapQuery: "Naggar Castle" },
      { name: "Mall Road", area: "Central Manali", notes: "Practical shopping, food, transport counters, and winter wear rentals.", mapQuery: "Mall Road Manali" },
      { name: "Sethan and Hampta", area: "Above Prini", notes: "Offbeat snow village and starting side for Hampta-style treks.", mapQuery: "Sethan Himachal Pradesh" },
    ],
    activities: [
      { name: "Paragliding", season: "Apr-Jun, Sep-Dec", estimate: "Rs 1,500-4,000", notes: "Most common around Solang or Dobhi, weather and wind dependent." },
      { name: "Beas river rafting", season: "Mar-Jun, Sep-Oct", estimate: "Rs 800-2,000", notes: "Often run on Kullu-Manali stretches with guide and gear included." },
      { name: "Skiing and snow scooter", season: "Dec-Feb", estimate: "Rs 600-2,500", notes: "Best when Solang/Rohtang snow conditions are active." },
      { name: "Jogini Falls hike", season: "Mar-Jun, Sep-Nov", estimate: "Rs 0-800", notes: "Self-guided or local guide; combine with Vashisht." },
      { name: "Hampta/Bhrigu day trek planning", season: "May-Oct", estimate: "Rs 1,500-4,500", notes: "Use local operators for guide, permits, weather calls, and transport." },
      { name: "Cafe and old-town trail", season: "All year", estimate: "Rs 500-1,500", notes: "Old Manali and Vashisht work well as low-effort recovery days." },
      { name: "Atal Tunnel/Sissu drive", season: "Most months", estimate: "Rs 3,000-7,000 cab", notes: "Leave early; road rules and snow closures change quickly." },
    ],
    hostels: [
      { name: "Zostel Manali / Old Manali / Vashisht", area: "Old Manali and Vashisht", url: "https://www.zostel.com/zostel/manali/" },
      { name: "The Hosteller Manali", area: "Old Manali", url: "https://www.thehosteller.com/hostels/the-hosteller-manali" },
      { name: "goSTOPS Manali", area: "Old Manali", url: "https://gostops.com/stay/Manali/manali-hostel" },
    ],
    packages: [
      { title: "Manali package collection", provider: "Thrillophilia", duration: "1-13 days", priceRange: "From about Rs 10,625", url: "https://www.thrillophilia.com/cities/manali/tours" },
      { title: "7-day Manali itineraries", provider: "Thrillophilia", duration: "6 nights / 7 days", priceRange: "Varies by itinerary", url: "https://www.thrillophilia.com/packages/7-days_manali-area_tour-packages" },
      { title: "Paragliding and rafting combo", provider: "Fun Trip Manali", duration: "3-6 hours", priceRange: "About Rs 2,500", url: "https://www.funtripmanali.com/paragliding-amp-river-rafting-combo-package-in-manali.html" },
      { title: "Local adventure activities", provider: "Vyas Adventures", duration: "Day activities", priceRange: "About Rs 200-2,500", url: "https://www.vyasadventures.com/" },
    ],
    routeNotes: [
      "Manali has no direct railhead; most train routes connect via Chandigarh/Kalka/Pathankot and continue by road.",
      "Nearest airport is Kullu-Manali/Bhuntar, but Delhi or Chandigarh plus Volvo/cab is often more reliable.",
      "Rohtang and Atal Tunnel plans should stay flexible because permits, weather, and traffic can change same-day.",
    ],
  },
};

export function getDestinationGuide(name: string, country: string) {
  return DESTINATION_GUIDES[`${name}|${country}`.toLowerCase()] ?? null;
}
