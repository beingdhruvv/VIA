/**
 * Database seed — populates cities and activities for VIA travel planner.
 * Run via: npx prisma db seed (or npm run db:seed)
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type ActivityCategory = "SIGHTSEEING" | "FOOD" | "ADVENTURE" | "CULTURE" | "NATURE" | "SHOPPING" | "NIGHTLIFE" | "WELLNESS";

type CityData = {
  name: string;
  country: string;
  region: string;
  costIndex: number;
  popularityScore: number;
  latitude: number;
  longitude: number;
};

type ActivityData = {
  name: string;
  description: string;
  category: ActivityCategory;
  estimatedCost: number;
  durationHours: number;
  rating: number;
};

const cities: CityData[] = [
  // ─── India ───────────────────────────────────────────────────────────────────
  { name: "Mumbai", country: "India", region: "Maharashtra", costIndex: 4.5, popularityScore: 95, latitude: 19.0760, longitude: 72.8777 },
  { name: "Delhi", country: "India", region: "Delhi", costIndex: 3.8, popularityScore: 92, latitude: 28.6139, longitude: 77.2090 },
  { name: "Ahmedabad", country: "India", region: "Gujarat", costIndex: 3.2, popularityScore: 78, latitude: 23.0225, longitude: 72.5714 },
  { name: "Rann of Kutch", country: "India", region: "Gujarat", costIndex: 3.0, popularityScore: 82, latitude: 23.7337, longitude: 69.8597 },
  { name: "Somnath", country: "India", region: "Gujarat", costIndex: 2.5, popularityScore: 70, latitude: 20.9026, longitude: 70.3742 },
  { name: "Dwarka", country: "India", region: "Gujarat", costIndex: 2.4, popularityScore: 68, latitude: 22.2442, longitude: 68.9685 },
  { name: "Gir", country: "India", region: "Gujarat", costIndex: 3.5, popularityScore: 74, latitude: 21.1253, longitude: 70.8062 },
  { name: "Goa", country: "India", region: "Goa", costIndex: 5.0, popularityScore: 95, latitude: 15.2993, longitude: 74.1240 },
  { name: "Jaipur", country: "India", region: "Rajasthan", costIndex: 3.6, popularityScore: 90, latitude: 26.9124, longitude: 75.7873 },
  { name: "Jodhpur", country: "India", region: "Rajasthan", costIndex: 3.3, popularityScore: 82, latitude: 26.2389, longitude: 73.0243 },
  { name: "Udaipur", country: "India", region: "Rajasthan", costIndex: 4.0, popularityScore: 88, latitude: 24.5854, longitude: 73.7125 },
  { name: "Pushkar", country: "India", region: "Rajasthan", costIndex: 2.8, popularityScore: 72, latitude: 26.4899, longitude: 74.5511 },
  { name: "Agra", country: "India", region: "Uttar Pradesh", costIndex: 3.4, popularityScore: 91, latitude: 27.1767, longitude: 78.0081 },
  { name: "Varanasi", country: "India", region: "Uttar Pradesh", costIndex: 2.8, popularityScore: 85, latitude: 25.3176, longitude: 82.9739 },
  { name: "Lucknow", country: "India", region: "Uttar Pradesh", costIndex: 2.9, popularityScore: 72, latitude: 26.8467, longitude: 80.9462 },
  { name: "Rishikesh", country: "India", region: "Uttarakhand", costIndex: 3.2, popularityScore: 79, latitude: 30.0869, longitude: 78.2676 },
  { name: "Dehradun", country: "India", region: "Uttarakhand", costIndex: 3.0, popularityScore: 65, latitude: 30.3165, longitude: 78.0322 },
  { name: "Mussoorie", country: "India", region: "Uttarakhand", costIndex: 3.8, popularityScore: 71, latitude: 30.4598, longitude: 78.0664 },
  { name: "Manali", country: "India", region: "Himachal Pradesh", costIndex: 4.2, popularityScore: 88, latitude: 32.2432, longitude: 77.1892 },
  { name: "Shimla", country: "India", region: "Himachal Pradesh", costIndex: 3.7, popularityScore: 80, latitude: 31.1048, longitude: 77.1734 },
  { name: "Chandigarh", country: "India", region: "Punjab", costIndex: 3.5, popularityScore: 66, latitude: 30.7333, longitude: 76.7794 },
  { name: "Amritsar", country: "India", region: "Punjab", costIndex: 2.9, popularityScore: 83, latitude: 31.6340, longitude: 74.8723 },
  { name: "Srinagar", country: "India", region: "Jammu & Kashmir", costIndex: 3.8, popularityScore: 80, latitude: 34.0837, longitude: 74.7973 },
  { name: "Leh", country: "India", region: "Ladakh", costIndex: 5.0, popularityScore: 84, latitude: 34.1526, longitude: 77.5771 },
  { name: "Darjeeling", country: "India", region: "West Bengal", costIndex: 3.6, popularityScore: 77, latitude: 27.0416, longitude: 88.2627 },
  { name: "Kolkata", country: "India", region: "West Bengal", costIndex: 3.5, popularityScore: 83, latitude: 22.5726, longitude: 88.3639 },
  { name: "Patna", country: "India", region: "Bihar", costIndex: 2.2, popularityScore: 52, latitude: 25.5941, longitude: 85.1376 },
  { name: "Ranchi", country: "India", region: "Jharkhand", costIndex: 2.3, popularityScore: 48, latitude: 23.3441, longitude: 85.3096 },
  { name: "Bhubaneswar", country: "India", region: "Odisha", costIndex: 2.5, popularityScore: 63, latitude: 20.2961, longitude: 85.8245 },
  { name: "Puri", country: "India", region: "Odisha", costIndex: 2.6, popularityScore: 71, latitude: 19.8135, longitude: 85.8312 },
  { name: "Hyderabad", country: "India", region: "Telangana", costIndex: 4.0, popularityScore: 82, latitude: 17.3850, longitude: 78.4867 },
  { name: "Chennai", country: "India", region: "Tamil Nadu", costIndex: 4.2, popularityScore: 80, latitude: 13.0827, longitude: 80.2707 },
  { name: "Ooty", country: "India", region: "Tamil Nadu", costIndex: 3.8, popularityScore: 72, latitude: 11.4102, longitude: 76.6950 },
  { name: "Bangalore", country: "India", region: "Karnataka", costIndex: 5.5, popularityScore: 87, latitude: 12.9716, longitude: 77.5946 },
  { name: "Mysore", country: "India", region: "Karnataka", costIndex: 3.0, popularityScore: 76, latitude: 12.2958, longitude: 76.6394 },
  { name: "Hampi", country: "India", region: "Karnataka", costIndex: 2.8, popularityScore: 73, latitude: 15.3350, longitude: 76.4601 },
  { name: "Kochi", country: "India", region: "Kerala", costIndex: 4.0, popularityScore: 79, latitude: 9.9312, longitude: 76.2673 },
  { name: "Munnar", country: "India", region: "Kerala", costIndex: 3.9, popularityScore: 75, latitude: 10.0892, longitude: 77.0595 },
  { name: "Alleppey", country: "India", region: "Kerala", costIndex: 4.1, popularityScore: 78, latitude: 9.4981, longitude: 76.3388 },
  { name: "Bhopal", country: "India", region: "Madhya Pradesh", costIndex: 2.7, popularityScore: 58, latitude: 23.2599, longitude: 77.4126 },
  { name: "Indore", country: "India", region: "Madhya Pradesh", costIndex: 2.8, popularityScore: 62, latitude: 22.7196, longitude: 75.8577 },
  { name: "Raipur", country: "India", region: "Chhattisgarh", costIndex: 2.3, popularityScore: 44, latitude: 21.2514, longitude: 81.6296 },

  // ─── International ────────────────────────────────────────────────────────────
  { name: "Paris", country: "France", region: "Île-de-France", costIndex: 12.0, popularityScore: 99, latitude: 48.8566, longitude: 2.3522 },
  { name: "London", country: "United Kingdom", region: "England", costIndex: 14.0, popularityScore: 98, latitude: 51.5074, longitude: -0.1278 },
  { name: "Amsterdam", country: "Netherlands", region: "North Holland", costIndex: 11.0, popularityScore: 91, latitude: 52.3676, longitude: 4.9041 },
  { name: "Prague", country: "Czech Republic", region: "Bohemia", costIndex: 7.5, popularityScore: 88, latitude: 50.0755, longitude: 14.4378 },
  { name: "Lisbon", country: "Portugal", region: "Lisbon", costIndex: 8.0, popularityScore: 87, latitude: 38.7223, longitude: -9.1393 },
  { name: "Rome", country: "Italy", region: "Lazio", costIndex: 9.5, popularityScore: 95, latitude: 41.9028, longitude: 12.4964 },
  { name: "Barcelona", country: "Spain", region: "Catalonia", costIndex: 8.5, popularityScore: 93, latitude: 41.3851, longitude: 2.1734 },
  { name: "Istanbul", country: "Turkey", region: "Marmara", costIndex: 7.0, popularityScore: 90, latitude: 41.0082, longitude: 28.9784 },
  { name: "Dubai", country: "UAE", region: "Dubai", costIndex: 13.0, popularityScore: 92, latitude: 25.2048, longitude: 55.2708 },
  { name: "Singapore", country: "Singapore", region: "Central", costIndex: 12.5, popularityScore: 91, latitude: 1.3521, longitude: 103.8198 },
  { name: "Bangkok", country: "Thailand", region: "Central", costIndex: 5.0, popularityScore: 93, latitude: 13.7563, longitude: 100.5018 },
  { name: "Tokyo", country: "Japan", region: "Kanto", costIndex: 10.0, popularityScore: 97, latitude: 35.6762, longitude: 139.6503 },
  { name: "Bali", country: "Indonesia", region: "Bali", costIndex: 5.5, popularityScore: 94, latitude: -8.3405, longitude: 115.0920 },
  { name: "Sydney", country: "Australia", region: "New South Wales", costIndex: 13.5, popularityScore: 94, latitude: -33.8688, longitude: 151.2093 },
  { name: "New York", country: "USA", region: "New York", costIndex: 15.0, popularityScore: 99, latitude: 40.7128, longitude: -74.0060 },
];

const activitiesData: Record<string, ActivityData[]> = {
  // ─── Mumbai ──────────────────────────────────────────────────────────────────
  Mumbai: [
    { name: "Gateway of India", description: "Iconic arch monument overlooking the Arabian Sea, built in 1924.", category: "SIGHTSEEING", estimatedCost: 0, durationHours: 1.5, rating: 4.5 },
    { name: "Elephanta Caves", description: "UNESCO World Heritage cave temples on Elephanta Island.", category: "CULTURE", estimatedCost: 600, durationHours: 4, rating: 4.3 },
    { name: "Street Food Walk — Mohammed Ali Road", description: "Experience Mumbai's legendary street food scene.", category: "FOOD", estimatedCost: 500, durationHours: 3, rating: 4.7 },
    { name: "Bollywood Studio Tour", description: "Behind-the-scenes tour of Film City studios.", category: "CULTURE", estimatedCost: 1200, durationHours: 3, rating: 4.2 },
    { name: "Marine Drive Sunset Walk", description: "Walk along the iconic Queen's Necklace promenade at sunset.", category: "SIGHTSEEING", estimatedCost: 0, durationHours: 1.5, rating: 4.6 },
    { name: "Dharavi Slum Walk", description: "Guided educational walk through Asia's largest urban settlement.", category: "CULTURE", estimatedCost: 800, durationHours: 2.5, rating: 4.1 },
    { name: "Colaba Causeway Shopping", description: "Browse antiques, clothes, and souvenirs at Mumbai's famous market street.", category: "SHOPPING", estimatedCost: 1500, durationHours: 2, rating: 4.0 },
  ],

  // ─── Delhi ───────────────────────────────────────────────────────────────────
  Delhi: [
    { name: "Red Fort", description: "Magnificent 17th-century Mughal fort and UNESCO World Heritage Site.", category: "SIGHTSEEING", estimatedCost: 600, durationHours: 2.5, rating: 4.4 },
    { name: "Qutub Minar", description: "UNESCO World Heritage minaret — the world's tallest brick minaret.", category: "CULTURE", estimatedCost: 600, durationHours: 2, rating: 4.5 },
    { name: "Chandni Chowk Food Walk", description: "Explore Old Delhi's legendary street food alleys.", category: "FOOD", estimatedCost: 600, durationHours: 3, rating: 4.8 },
    { name: "Humayun's Tomb", description: "Precursor to the Taj Mahal — a stunning Mughal garden tomb.", category: "CULTURE", estimatedCost: 600, durationHours: 2, rating: 4.5 },
    { name: "Lodhi Garden Walk", description: "Peaceful urban park with 15th-century tombs and monuments.", category: "WELLNESS", estimatedCost: 0, durationHours: 1.5, rating: 4.4 },
    { name: "Sarojini Nagar Market", description: "Delhi's most popular budget shopping destination.", category: "SHOPPING", estimatedCost: 1000, durationHours: 2, rating: 4.0 },
    { name: "India Gate Evening", description: "Visit India's war memorial lit up at dusk — a great evening stroll.", category: "SIGHTSEEING", estimatedCost: 0, durationHours: 1.5, rating: 4.4 },
  ],

  // ─── Ahmedabad ───────────────────────────────────────────────────────────────
  Ahmedabad: [
    { name: "Rani ki Vav (Patan)", description: "UNESCO World Heritage stepwell — the finest example of stepwell architecture in India.", category: "CULTURE", estimatedCost: 40, durationHours: 2.5, rating: 4.8 },
    { name: "Sabarmati Ashram", description: "Gandhi's ashram on the banks of the Sabarmati river.", category: "CULTURE", estimatedCost: 0, durationHours: 2, rating: 4.6 },
    { name: "Sidi Saiyyed Mosque", description: "15th-century mosque famous for its intricate stone lattice windows.", category: "SIGHTSEEING", estimatedCost: 0, durationHours: 1, rating: 4.5 },
    { name: "Law Garden Night Market", description: "Browse traditional Gujarati textiles, jewelry, and handicrafts.", category: "SHOPPING", estimatedCost: 800, durationHours: 2, rating: 4.3 },
    { name: "Gujarati Thali at Vishalla", description: "Experience the legendary unlimited Gujarati thali.", category: "FOOD", estimatedCost: 600, durationHours: 1.5, rating: 4.9 },
    { name: "Adalaj Stepwell", description: "5-storey octagonal stepwell with intricate carvings, built in 1498.", category: "CULTURE", estimatedCost: 0, durationHours: 1.5, rating: 4.6 },
    { name: "Kite Museum", description: "Unique museum celebrating Gujarat's kite-flying heritage.", category: "CULTURE", estimatedCost: 25, durationHours: 1, rating: 4.1 },
  ],

  // ─── Rann of Kutch ───────────────────────────────────────────────────────────
  "Rann of Kutch": [
    { name: "White Rann Sunrise Walk", description: "Walk across the salt flats at dawn — India's most surreal landscape.", category: "ADVENTURE", estimatedCost: 0, durationHours: 3, rating: 4.9 },
    { name: "Rann Utsav Festival", description: "Gujarat's premier cultural festival held annually in the White Desert.", category: "CULTURE", estimatedCost: 500, durationHours: 6, rating: 4.8 },
    { name: "Kutchi Handicraft Village Visit", description: "Visit local artisans specialising in embroidery and mirror work.", category: "CULTURE", estimatedCost: 200, durationHours: 2.5, rating: 4.5 },
    { name: "Flamingo Sanctuary", description: "Watch thousands of flamingos at the seasonal sanctuary.", category: "ADVENTURE", estimatedCost: 300, durationHours: 3, rating: 4.7 },
    { name: "Camel Safari at Sunset", description: "Ride through the salt desert on camelback at golden hour.", category: "ADVENTURE", estimatedCost: 800, durationHours: 2, rating: 4.6 },
  ],

  // ─── Somnath ─────────────────────────────────────────────────────────────────
  Somnath: [
    { name: "Somnath Temple", description: "One of the 12 Jyotirlingas — magnificent temple on the Arabian Sea coast.", category: "CULTURE", estimatedCost: 0, durationHours: 2, rating: 4.7 },
    { name: "Bhalka Tirth", description: "Sacred site believed to be where Lord Krishna was struck by an arrow.", category: "CULTURE", estimatedCost: 0, durationHours: 1, rating: 4.3 },
    { name: "Somnath Beach Walk", description: "Stroll along the scenic beach adjacent to the Somnath temple complex.", category: "WELLNESS", estimatedCost: 0, durationHours: 1.5, rating: 4.4 },
    { name: "Sound & Light Show", description: "Nightly show narrating the temple's 2000-year history.", category: "CULTURE", estimatedCost: 100, durationHours: 1, rating: 4.5 },
  ],

  // ─── Dwarka ──────────────────────────────────────────────────────────────────
  Dwarka: [
    { name: "Dwarkadhish Temple", description: "Ancient 5-storey temple dedicated to Lord Krishna — one of the Char Dham pilgrimage sites.", category: "CULTURE", estimatedCost: 0, durationHours: 2, rating: 4.8 },
    { name: "Bet Dwarka Island", description: "Boat ride to the island believed to be Krishna's original dwelling place.", category: "ADVENTURE", estimatedCost: 200, durationHours: 3, rating: 4.5 },
    { name: "Rukmini Devi Temple", description: "An ornate 13th-century temple dedicated to Rukmini, 2 km from Dwarka.", category: "CULTURE", estimatedCost: 0, durationHours: 1, rating: 4.4 },
    { name: "Gomti Ghat Sunrise", description: "Watch sunrise from the sacred Gomti river ghat.", category: "WELLNESS", estimatedCost: 0, durationHours: 1.5, rating: 4.6 },
  ],

  // ─── Gir ─────────────────────────────────────────────────────────────────────
  Gir: [
    { name: "Gir Lion Safari", description: "Jeep safari in the only habitat of Asiatic lions in the world.", category: "ADVENTURE", estimatedCost: 1500, durationHours: 4, rating: 4.8 },
    { name: "Devalia Safari Park", description: "Open-top vehicle safari through an enclosed section of Gir forest.", category: "ADVENTURE", estimatedCost: 800, durationHours: 2, rating: 4.5 },
    { name: "Crocodile Breeding Centre", description: "See marsh crocodiles up close at the dedicated breeding centre.", category: "SIGHTSEEING", estimatedCost: 50, durationHours: 1, rating: 4.2 },
    { name: "Kankai Mata Temple Trek", description: "Scenic forest trail to an ancient hill-top temple.", category: "ADVENTURE", estimatedCost: 0, durationHours: 2, rating: 4.4 },
  ],

  // ─── Goa ─────────────────────────────────────────────────────────────────────
  Goa: [
    { name: "Basilica of Bom Jesus", description: "UNESCO World Heritage Baroque church housing St. Francis Xavier's remains.", category: "CULTURE", estimatedCost: 0, durationHours: 1.5, rating: 4.5 },
    { name: "Dudhsagar Falls Trek", description: "Trek to India's second-tallest waterfall through the Western Ghats.", category: "ADVENTURE", estimatedCost: 1500, durationHours: 8, rating: 4.7 },
    { name: "Palolem Beach Day", description: "Relax on Goa's most picturesque crescent beach.", category: "WELLNESS", estimatedCost: 500, durationHours: 6, rating: 4.6 },
    { name: "Anjuna Flea Market", description: "Goa's iconic Wednesday market — hippie trinkets to designer goods.", category: "SHOPPING", estimatedCost: 1000, durationHours: 3, rating: 4.2 },
    { name: "Spice Plantation Tour", description: "Guided tour of an organic spice farm with traditional Goan lunch.", category: "CULTURE", estimatedCost: 900, durationHours: 4, rating: 4.5 },
    { name: "Sunset Cruise — Mandovi River", description: "Cruise with Goan folk music, dance, and food.", category: "CULTURE", estimatedCost: 700, durationHours: 2, rating: 4.3 },
    { name: "Old Goa Heritage Walk", description: "Walk past Baroque churches and colonial-era mansions in Velha Goa.", category: "SIGHTSEEING", estimatedCost: 0, durationHours: 2.5, rating: 4.4 },
  ],

  // ─── Jaipur ──────────────────────────────────────────────────────────────────
  Jaipur: [
    { name: "Amber Fort", description: "Majestic hilltop fort with stunning Rajput-Mughal architecture.", category: "SIGHTSEEING", estimatedCost: 700, durationHours: 3, rating: 4.7 },
    { name: "City Palace", description: "Royal palace complex housing museums and royal apartments.", category: "CULTURE", estimatedCost: 700, durationHours: 2.5, rating: 4.5 },
    { name: "Hawa Mahal", description: "Palace of Winds — iconic five-story pink sandstone facade.", category: "SIGHTSEEING", estimatedCost: 200, durationHours: 1, rating: 4.4 },
    { name: "Bapu Bazaar Shopping", description: "Shop for Rajasthani textiles, bangles, and blue pottery.", category: "SHOPPING", estimatedCost: 1500, durationHours: 2, rating: 4.3 },
    { name: "Johri Bazaar Gems", description: "Browse Jaipur's famous gemstone and jewelry market.", category: "SHOPPING", estimatedCost: 2000, durationHours: 2, rating: 4.4 },
    { name: "Traditional Rajasthani Thali", description: "Unlimited thali featuring dal baati churma and traditional sweets.", category: "FOOD", estimatedCost: 500, durationHours: 1.5, rating: 4.7 },
    { name: "Nahargarh Fort Sunset", description: "Watch the sunset over Pink City from this hilltop fort.", category: "SIGHTSEEING", estimatedCost: 200, durationHours: 2, rating: 4.6 },
  ],

  // ─── Jodhpur ─────────────────────────────────────────────────────────────────
  Jodhpur: [
    { name: "Mehrangarh Fort", description: "Massive 15th-century fort rising 400 ft above the Blue City.", category: "SIGHTSEEING", estimatedCost: 700, durationHours: 3, rating: 4.8 },
    { name: "Blue City Walk", description: "Wander through the indigo-painted old city lanes with a local guide.", category: "CULTURE", estimatedCost: 400, durationHours: 2.5, rating: 4.6 },
    { name: "Umaid Bhawan Palace Tour", description: "One of the world's largest private residences — palace museum and hotel.", category: "CULTURE", estimatedCost: 300, durationHours: 1.5, rating: 4.5 },
    { name: "Toorji ka Jhalra Stepwell", description: "Beautifully restored 18th-century stepwell in the old city.", category: "SIGHTSEEING", estimatedCost: 0, durationHours: 1, rating: 4.5 },
    { name: "Mirchi Bada & Mawa Kachori", description: "Try Jodhpur's most famous street snacks near the clock tower market.", category: "FOOD", estimatedCost: 200, durationHours: 1, rating: 4.7 },
  ],

  // ─── Udaipur ─────────────────────────────────────────────────────────────────
  Udaipur: [
    { name: "City Palace", description: "The largest palace complex in Rajasthan overlooking Lake Pichola.", category: "CULTURE", estimatedCost: 700, durationHours: 3, rating: 4.7 },
    { name: "Lake Pichola Boat Ride", description: "Cruise past the Lake Palace hotel and Jag Mandir island.", category: "SIGHTSEEING", estimatedCost: 700, durationHours: 1.5, rating: 4.8 },
    { name: "Saheliyon Ki Bari", description: "18th-century garden of maids with lotus pools and marble pavilions.", category: "SIGHTSEEING", estimatedCost: 100, durationHours: 1, rating: 4.3 },
    { name: "Bagore ki Haveli Cultural Show", description: "Traditional Rajasthani folk dance and puppet show in a heritage haveli.", category: "CULTURE", estimatedCost: 300, durationHours: 2, rating: 4.5 },
    { name: "Dhabas of Gangaur Ghat", description: "Eat dal baati churma at rooftop restaurants overlooking the ghats.", category: "FOOD", estimatedCost: 400, durationHours: 1.5, rating: 4.6 },
    { name: "Fateh Sagar Lake Cycling", description: "Cycle along the promenade of this scenic artificial lake.", category: "WELLNESS", estimatedCost: 100, durationHours: 1.5, rating: 4.4 },
  ],

  // ─── Pushkar ─────────────────────────────────────────────────────────────────
  Pushkar: [
    { name: "Brahma Temple", description: "One of the very few temples in the world dedicated to Lord Brahma.", category: "CULTURE", estimatedCost: 0, durationHours: 1, rating: 4.6 },
    { name: "Pushkar Lake Ghats", description: "Take a sacred dip or watch the evening aarti at the holy lake.", category: "CULTURE", estimatedCost: 0, durationHours: 1.5, rating: 4.7 },
    { name: "Pushkar Camel Fair", description: "Asia's largest camel fair — held annually in November.", category: "CULTURE", estimatedCost: 0, durationHours: 6, rating: 4.9 },
    { name: "Sunset from Savitri Temple", description: "Hike 300 steps to the hilltop temple for panoramic desert views.", category: "ADVENTURE", estimatedCost: 0, durationHours: 2, rating: 4.7 },
    { name: "Israeli Café Hopping", description: "Explore Pushkar's famous traveller cafes serving Israeli and fusion food.", category: "FOOD", estimatedCost: 350, durationHours: 2, rating: 4.3 },
  ],

  // ─── Agra ────────────────────────────────────────────────────────────────────
  Agra: [
    { name: "Taj Mahal at Sunrise", description: "The world's greatest monument to love at its most magical hour.", category: "SIGHTSEEING", estimatedCost: 1300, durationHours: 3, rating: 5.0 },
    { name: "Agra Fort", description: "Massive Mughal fort that served as the main residence of the Mughal emperors.", category: "CULTURE", estimatedCost: 650, durationHours: 2.5, rating: 4.6 },
    { name: "Fatehpur Sikri", description: "Abandoned Mughal capital — UNESCO World Heritage ghost city.", category: "CULTURE", estimatedCost: 610, durationHours: 3, rating: 4.5 },
    { name: "Petha Sweet Workshop", description: "Learn to make Agra's famous crystallised ash gourd sweet.", category: "FOOD", estimatedCost: 300, durationHours: 1.5, rating: 4.3 },
    { name: "Mehtab Bagh Sunset View", description: "View the Taj Mahal from across the Yamuna at sunset — no crowds.", category: "SIGHTSEEING", estimatedCost: 300, durationHours: 1.5, rating: 4.7 },
  ],

  // ─── Varanasi ────────────────────────────────────────────────────────────────
  Varanasi: [
    { name: "Ganga Aarti Ceremony", description: "Witness the spectacular nightly fire ritual on the banks of the Ganges.", category: "CULTURE", estimatedCost: 0, durationHours: 2, rating: 4.9 },
    { name: "Boat Ride at Sunrise", description: "Row across the Ganges at dawn past the ancient ghats.", category: "SIGHTSEEING", estimatedCost: 600, durationHours: 2, rating: 4.8 },
    { name: "Sarnath Archaeological Site", description: "Where Buddha first taught — visit the Dhamek Stupa and museum.", category: "CULTURE", estimatedCost: 300, durationHours: 3, rating: 4.5 },
    { name: "Banarasi Silk Workshop", description: "See master weavers create the world-famous Banarasi silk sarees.", category: "CULTURE", estimatedCost: 200, durationHours: 1.5, rating: 4.4 },
    { name: "Old City Walk — Gali Lanes", description: "Navigate the ancient narrow lanes with a local guide.", category: "ADVENTURE", estimatedCost: 500, durationHours: 3, rating: 4.6 },
    { name: "Manikarnika Ghat Visit", description: "Witness the sacred cremation ghats — a profound and humbling experience.", category: "CULTURE", estimatedCost: 0, durationHours: 1, rating: 4.5 },
  ],

  // ─── Lucknow ─────────────────────────────────────────────────────────────────
  Lucknow: [
    { name: "Bara Imambara", description: "18th-century Shia shrine with the famous Bhul-bhulaiya labyrinth.", category: "CULTURE", estimatedCost: 50, durationHours: 2, rating: 4.5 },
    { name: "Rumi Darwaza", description: "Ottoman-inspired gateway — symbol of Nawabi Lucknow.", category: "SIGHTSEEING", estimatedCost: 0, durationHours: 0.5, rating: 4.3 },
    { name: "Tunday Kababi Meal", description: "Try the legendary 150-year-old recipe of galouti kebabs.", category: "FOOD", estimatedCost: 400, durationHours: 1.5, rating: 4.9 },
    { name: "Hazratganj Shopping Stroll", description: "Walk Lucknow's upscale shopping promenade for chikankari embroidery.", category: "SHOPPING", estimatedCost: 1200, durationHours: 2, rating: 4.2 },
    { name: "Residency Ruins", description: "Atmospheric ruins of the British Residency from the 1857 Siege of Lucknow.", category: "CULTURE", estimatedCost: 25, durationHours: 1.5, rating: 4.4 },
  ],

  // ─── Rishikesh ───────────────────────────────────────────────────────────────
  Rishikesh: [
    { name: "White Water Rafting — Ganges", description: "Raft through grade 3-4 rapids on the sacred Ganges.", category: "ADVENTURE", estimatedCost: 1200, durationHours: 4, rating: 4.8 },
    { name: "Laxman Jhula Sunrise Walk", description: "Cross the iconic iron suspension bridge at dawn over the Ganges.", category: "SIGHTSEEING", estimatedCost: 0, durationHours: 1.5, rating: 4.6 },
    { name: "Yoga & Meditation Retreat", description: "Morning yoga class at one of Rishikesh's world-famous ashrams.", category: "WELLNESS", estimatedCost: 500, durationHours: 3, rating: 4.7 },
    { name: "Beatles Ashram Visit", description: "Explore the abandoned meditation centre where the Beatles composed songs.", category: "CULTURE", estimatedCost: 600, durationHours: 2, rating: 4.5 },
    { name: "Neelkanth Mahadev Temple Trek", description: "14km forest trek to an ancient Shiva temple at 1330m altitude.", category: "ADVENTURE", estimatedCost: 100, durationHours: 6, rating: 4.6 },
  ],

  // ─── Dehradun ────────────────────────────────────────────────────────────────
  Dehradun: [
    { name: "Robber's Cave (Guchhupani)", description: "Walk through a river gorge that disappears underground — a natural wonder.", category: "ADVENTURE", estimatedCost: 50, durationHours: 2, rating: 4.4 },
    { name: "Forest Research Institute", description: "Colonial-era institution in a stunning Greek Renaissance campus.", category: "CULTURE", estimatedCost: 25, durationHours: 2, rating: 4.3 },
    { name: "Mindrolling Monastery", description: "One of the largest Buddhist centres in India with a stunning stupa.", category: "CULTURE", estimatedCost: 0, durationHours: 1.5, rating: 4.5 },
    { name: "Sahastradhara Hot Springs", description: "Sulphur springs and limestone caves on the banks of Baldi river.", category: "WELLNESS", estimatedCost: 50, durationHours: 2, rating: 4.2 },
  ],

  // ─── Mussoorie ───────────────────────────────────────────────────────────────
  Mussoorie: [
    { name: "Kempty Falls", description: "Beautiful multi-tiered waterfall in the hills above Mussoorie.", category: "SIGHTSEEING", estimatedCost: 100, durationHours: 3, rating: 4.3 },
    { name: "Gun Hill Ropeway", description: "Cable car to Mussoorie's second-highest peak for Himalayan views.", category: "SIGHTSEEING", estimatedCost: 200, durationHours: 1.5, rating: 4.5 },
    { name: "Mall Road Evening Walk", description: "Stroll the main promenade lined with shops, cafes, and viewpoints.", category: "WELLNESS", estimatedCost: 0, durationHours: 2, rating: 4.4 },
    { name: "Lal Tibba Viewpoint", description: "Highest point in Mussoorie with telescopic views of Himalayan peaks.", category: "SIGHTSEEING", estimatedCost: 50, durationHours: 1, rating: 4.6 },
  ],

  // ─── Manali ──────────────────────────────────────────────────────────────────
  Manali: [
    { name: "Rohtang Pass", description: "High-altitude pass at 13,050 ft with spectacular Himalayan views.", category: "ADVENTURE", estimatedCost: 2000, durationHours: 8, rating: 4.7 },
    { name: "Solang Valley Snow Activities", description: "Snow sports including skiing, zorbing, and snowmobile rides.", category: "ADVENTURE", estimatedCost: 2500, durationHours: 6, rating: 4.6 },
    { name: "Hadimba Temple", description: "Ancient temple dedicated to Goddess Hadimba set in dense cedar forest.", category: "CULTURE", estimatedCost: 0, durationHours: 1, rating: 4.4 },
    { name: "Old Manali Village Walk", description: "Explore the hippie haven with cafes, art galleries, and mountain views.", category: "SIGHTSEEING", estimatedCost: 0, durationHours: 2, rating: 4.5 },
    { name: "River Rafting — Beas River", description: "White water rafting through grade 3-4 rapids.", category: "ADVENTURE", estimatedCost: 800, durationHours: 2, rating: 4.7 },
    { name: "Vashisht Hot Springs", description: "Natural sulphur hot springs with open-air and private bathing pools.", category: "WELLNESS", estimatedCost: 50, durationHours: 1.5, rating: 4.3 },
  ],

  // ─── Shimla ──────────────────────────────────────────────────────────────────
  Shimla: [
    { name: "The Ridge & Mall Road Walk", description: "Stroll along Shimla's colonial-era ridge with views of snowy peaks.", category: "SIGHTSEEING", estimatedCost: 0, durationHours: 2, rating: 4.5 },
    { name: "Kalka-Shimla Toy Train", description: "UNESCO-listed heritage narrow-gauge railway through 102 tunnels.", category: "CULTURE", estimatedCost: 400, durationHours: 5, rating: 4.8 },
    { name: "Jakhu Temple Hike", description: "Trek to the 8000-year-old temple at Shimla's highest peak (8048 ft).", category: "ADVENTURE", estimatedCost: 0, durationHours: 2.5, rating: 4.5 },
    { name: "Kufri Day Trip", description: "Visit the ski resort town for snow sports and yak rides.", category: "ADVENTURE", estimatedCost: 800, durationHours: 4, rating: 4.4 },
    { name: "Christ Church Visit", description: "Second oldest church in North India — neo-Gothic landmark.", category: "CULTURE", estimatedCost: 0, durationHours: 1, rating: 4.3 },
  ],

  // ─── Chandigarh ──────────────────────────────────────────────────────────────
  Chandigarh: [
    { name: "Rock Garden of Chandigarh", description: "Whimsical 40-acre sculpture garden built from industrial waste by Nek Chand.", category: "CULTURE", estimatedCost: 50, durationHours: 2, rating: 4.6 },
    { name: "Sukhna Lake Morning Walk", description: "Scenic walk along the artificial lake at the foothills of the Himalayas.", category: "WELLNESS", estimatedCost: 0, durationHours: 1.5, rating: 4.4 },
    { name: "Capitol Complex", description: "Le Corbusier's UNESCO-listed civic complex — a modernist masterpiece.", category: "CULTURE", estimatedCost: 200, durationHours: 2, rating: 4.5 },
    { name: "Sector 17 Shopping Plaza", description: "Chandigarh's bustling commercial hub for fashion and street food.", category: "SHOPPING", estimatedCost: 800, durationHours: 2, rating: 4.0 },
  ],

  // ─── Amritsar ────────────────────────────────────────────────────────────────
  Amritsar: [
    { name: "Golden Temple (Harmandir Sahib)", description: "The holiest shrine in Sikhism — breathtaking at any hour.", category: "CULTURE", estimatedCost: 0, durationHours: 3, rating: 5.0 },
    { name: "Wagah Border Ceremony", description: "Dramatic daily flag-lowering ceremony at the India-Pakistan border.", category: "CULTURE", estimatedCost: 0, durationHours: 3, rating: 4.7 },
    { name: "Amritsari Kulcha & Lassi", description: "Eat the city's famous stuffed flatbread with unlimited dal and butter.", category: "FOOD", estimatedCost: 300, durationHours: 1.5, rating: 4.9 },
    { name: "Jallianwala Bagh Memorial", description: "Site of the 1919 massacre — a solemn and important historical landmark.", category: "CULTURE", estimatedCost: 0, durationHours: 1.5, rating: 4.5 },
    { name: "Partition Museum", description: "Moving museum documenting the 1947 Partition of India.", category: "CULTURE", estimatedCost: 100, durationHours: 2, rating: 4.6 },
  ],

  // ─── Srinagar ────────────────────────────────────────────────────────────────
  Srinagar: [
    { name: "Dal Lake Shikara Ride", description: "Glide across the iconic lake past floating gardens and houseboats at dawn.", category: "SIGHTSEEING", estimatedCost: 600, durationHours: 2, rating: 4.8 },
    { name: "Mughal Gardens (Shalimar & Nishat)", description: "Terraced gardens built by Mughal emperors on the shores of Dal Lake.", category: "CULTURE", estimatedCost: 100, durationHours: 3, rating: 4.6 },
    { name: "Houseboat Stay & Dinner", description: "Stay on a traditional cedar houseboat with a Wazwan feast.", category: "FOOD", estimatedCost: 3000, durationHours: 6, rating: 4.9 },
    { name: "Shankaracharya Temple", description: "Ancient Shiva temple on a 1,000 ft hill with panoramic valley views.", category: "CULTURE", estimatedCost: 0, durationHours: 2, rating: 4.5 },
    { name: "Pashmina Weaving Workshop", description: "Watch master artisans weave world-famous Kashmiri shawls.", category: "CULTURE", estimatedCost: 0, durationHours: 1.5, rating: 4.4 },
  ],

  // ─── Leh ─────────────────────────────────────────────────────────────────────
  Leh: [
    { name: "Pangong Lake Day Trip", description: "Drive to the stunning high-altitude lake at 14,270 ft — electric blue waters.", category: "ADVENTURE", estimatedCost: 2500, durationHours: 12, rating: 4.9 },
    { name: "Nubra Valley & Bactrian Camels", description: "Cross the world's highest motorable pass and ride double-humped camels.", category: "ADVENTURE", estimatedCost: 3000, durationHours: 12, rating: 4.8 },
    { name: "Leh Palace", description: "17th-century 9-storey royal palace modelled after the Potala Palace in Lhasa.", category: "CULTURE", estimatedCost: 100, durationHours: 2, rating: 4.5 },
    { name: "Thiksey Monastery", description: "12-storey Buddhist monastery resembling the Potala Palace — stunning at sunrise.", category: "CULTURE", estimatedCost: 100, durationHours: 2, rating: 4.7 },
    { name: "Magnetic Hill Drive", description: "Experience the optical illusion where cars appear to roll uphill.", category: "SIGHTSEEING", estimatedCost: 0, durationHours: 1, rating: 4.3 },
  ],

  // ─── Darjeeling ──────────────────────────────────────────────────────────────
  Darjeeling: [
    { name: "Tiger Hill Sunrise", description: "Watch the sunrise over Kanchenjunga from Tiger Hill at 8,000 ft.", category: "SIGHTSEEING", estimatedCost: 200, durationHours: 4, rating: 4.8 },
    { name: "Darjeeling Himalayan Railway", description: "Ride the UNESCO-listed Toy Train through mist-covered tea country.", category: "CULTURE", estimatedCost: 500, durationHours: 2.5, rating: 4.7 },
    { name: "Tea Estate Tour & Tasting", description: "Walk through the famous Happy Valley tea estate and taste fresh-picked Darjeeling.", category: "FOOD", estimatedCost: 300, durationHours: 2, rating: 4.6 },
    { name: "Batasia Loop & War Memorial", description: "Scenic railway loop with a Gurkha war memorial and mountain views.", category: "SIGHTSEEING", estimatedCost: 50, durationHours: 1, rating: 4.4 },
    { name: "Tibetan Self-Help Refugee Centre", description: "Visit the centre where Tibetan refugees produce traditional crafts.", category: "CULTURE", estimatedCost: 0, durationHours: 1, rating: 4.3 },
  ],

  // ─── Kolkata ─────────────────────────────────────────────────────────────────
  Kolkata: [
    { name: "Victoria Memorial", description: "Magnificent white marble monument built in memory of Queen Victoria.", category: "CULTURE", estimatedCost: 200, durationHours: 2, rating: 4.6 },
    { name: "Howrah Bridge at Dusk", description: "One of the world's busiest cantilever bridges — spectacular when lit up.", category: "SIGHTSEEING", estimatedCost: 0, durationHours: 1, rating: 4.5 },
    { name: "Park Street Food Trail", description: "Explore the city's legendary restaurant street from Flurys to Peter Cat.", category: "FOOD", estimatedCost: 800, durationHours: 3, rating: 4.7 },
    { name: "Kumartuli Potter's Quarter", description: "Watch clay idols of Durga and other deities being sculpted by hand.", category: "CULTURE", estimatedCost: 0, durationHours: 2, rating: 4.5 },
    { name: "Indian Museum", description: "Oldest and largest museum in India — over 100,000 relics and artefacts.", category: "CULTURE", estimatedCost: 100, durationHours: 2.5, rating: 4.4 },
  ],

  // ─── Patna ───────────────────────────────────────────────────────────────────
  Patna: [
    { name: "Patna Museum", description: "Colonial-era museum housing the world's longest fossilized tree and Mauryan artefacts.", category: "CULTURE", estimatedCost: 15, durationHours: 2, rating: 4.1 },
    { name: "Golghar Granary", description: "Beehive-shaped British grain storehouse with a spiral staircase to the top.", category: "SIGHTSEEING", estimatedCost: 5, durationHours: 1, rating: 4.2 },
    { name: "Sanjay Gandhi Biological Park", description: "One of India's finest zoological parks.", category: "SIGHTSEEING", estimatedCost: 50, durationHours: 3, rating: 4.0 },
    { name: "Patna Sahib Gurudwara", description: "Birthplace of Guru Gobind Singh — one of Sikhism's most sacred sites.", category: "CULTURE", estimatedCost: 0, durationHours: 1.5, rating: 4.6 },
  ],

  // ─── Ranchi ──────────────────────────────────────────────────────────────────
  Ranchi: [
    { name: "Hundru Falls", description: "45-metre waterfall on the Subarnarekha river — spectacular during monsoon.", category: "ADVENTURE", estimatedCost: 50, durationHours: 4, rating: 4.4 },
    { name: "Jagannath Temple Ranchi", description: "Replica of the Puri Jagannath Temple on a hilltop.", category: "CULTURE", estimatedCost: 0, durationHours: 1.5, rating: 4.3 },
    { name: "Pahari Mandir", description: "Shiva temple atop a rocky hill with panoramic views of the city.", category: "CULTURE", estimatedCost: 0, durationHours: 1.5, rating: 4.4 },
    { name: "Rock Garden & Kanke Dam", description: "Scenic garden complex by the reservoir — popular weekend escape.", category: "WELLNESS", estimatedCost: 20, durationHours: 2, rating: 4.0 },
  ],

  // ─── Bhubaneswar ─────────────────────────────────────────────────────────────
  Bhubaneswar: [
    { name: "Lingaraj Temple", description: "11th-century Kalinga-style temple — one of the finest examples of Odishan architecture.", category: "CULTURE", estimatedCost: 0, durationHours: 1.5, rating: 4.6 },
    { name: "Odisha State Museum", description: "Showcases Odisha's archaeological and natural history.", category: "CULTURE", estimatedCost: 20, durationHours: 2, rating: 4.1 },
    { name: "Udayagiri & Khandagiri Caves", description: "2nd-century BCE Jain rock-cut caves with elaborate carvings.", category: "CULTURE", estimatedCost: 25, durationHours: 2.5, rating: 4.3 },
    { name: "Nandankanan Zoological Park", description: "White tiger sanctuary and India's first open-air zoo.", category: "SIGHTSEEING", estimatedCost: 100, durationHours: 4, rating: 4.2 },
    { name: "Dhauli Peace Pagoda", description: "White Buddhist stupa at the site of the Kalinga War where Ashoka's transformation began.", category: "CULTURE", estimatedCost: 0, durationHours: 1.5, rating: 4.4 },
  ],

  // ─── Puri ────────────────────────────────────────────────────────────────────
  Puri: [
    { name: "Jagannath Temple", description: "One of the Char Dhams — the 12th-century temple of Lord Jagannath (non-Hindus may visit perimeter).", category: "CULTURE", estimatedCost: 0, durationHours: 2, rating: 4.7 },
    { name: "Puri Beach Sunrise", description: "Watch the sun rise over the Bay of Bengal on Puri's golden beach.", category: "WELLNESS", estimatedCost: 0, durationHours: 2, rating: 4.6 },
    { name: "Chilika Lake Day Trip", description: "Asia's largest brackish water lagoon — spot Irrawaddy dolphins and migratory birds.", category: "ADVENTURE", estimatedCost: 800, durationHours: 6, rating: 4.7 },
    { name: "Konark Sun Temple", description: "13th-century UNESCO chariot-shaped temple — one of India's most spectacular.", category: "CULTURE", estimatedCost: 600, durationHours: 3, rating: 4.8 },
    { name: "Raghurajpur Craft Village", description: "Home of Pattachitra painters — watch traditional palm-leaf art being made.", category: "CULTURE", estimatedCost: 0, durationHours: 2, rating: 4.5 },
  ],

  // ─── Hyderabad ───────────────────────────────────────────────────────────────
  Hyderabad: [
    { name: "Charminar", description: "Iconic 16th-century mosque and monument — symbol of Hyderabad.", category: "CULTURE", estimatedCost: 25, durationHours: 1.5, rating: 4.5 },
    { name: "Golconda Fort", description: "Magnificent 16th-century fort with an acoustic system and light & sound show.", category: "SIGHTSEEING", estimatedCost: 200, durationHours: 3, rating: 4.6 },
    { name: "Charminar Bangle Bazaar", description: "Laad Bazaar — Hyderabad's famous bangle market dating to 1593.", category: "SHOPPING", estimatedCost: 800, durationHours: 2, rating: 4.3 },
    { name: "Hyderabadi Biryani Feast", description: "Eat the original dum biryani at Paradise or Bawarchi restaurant.", category: "FOOD", estimatedCost: 500, durationHours: 1.5, rating: 4.9 },
    { name: "Qutb Shahi Tombs", description: "UNESCO-nominated complex of 7 domed tombs of the Qutb Shahi rulers.", category: "CULTURE", estimatedCost: 200, durationHours: 2, rating: 4.4 },
    { name: "Ramoji Film City", description: "World's largest film studio complex with guided tours and live shows.", category: "CULTURE", estimatedCost: 1500, durationHours: 8, rating: 4.5 },
  ],

  // ─── Chennai ─────────────────────────────────────────────────────────────────
  Chennai: [
    { name: "Marina Beach Sunrise", description: "Walk the world's second-longest urban beach at dawn.", category: "WELLNESS", estimatedCost: 0, durationHours: 2, rating: 4.4 },
    { name: "Kapaleeshwarar Temple", description: "7th-century Dravidian-style Shiva temple with vibrant gopuram.", category: "CULTURE", estimatedCost: 0, durationHours: 1.5, rating: 4.5 },
    { name: "Government Museum Chennai", description: "Largest museum in India outside Kolkata — exceptional bronze collection.", category: "CULTURE", estimatedCost: 30, durationHours: 2.5, rating: 4.3 },
    { name: "Filter Coffee & Idli Trail", description: "Start the day with authentic Brahmin-style breakfast and filter coffee.", category: "FOOD", estimatedCost: 200, durationHours: 1.5, rating: 4.8 },
    { name: "Mahabalipuram Day Trip", description: "UNESCO coastal temples, shore temple, and rock carvings (60km from Chennai).", category: "CULTURE", estimatedCost: 800, durationHours: 6, rating: 4.7 },
  ],

  // ─── Ooty ────────────────────────────────────────────────────────────────────
  Ooty: [
    { name: "Nilgiri Mountain Railway", description: "UNESCO-listed rack railway through tea gardens and eucalyptus forests.", category: "CULTURE", estimatedCost: 300, durationHours: 4, rating: 4.7 },
    { name: "Botanical Gardens", description: "155-year-old gardens with a fossilised tree trunk and rare botanical specimens.", category: "WELLNESS", estimatedCost: 30, durationHours: 2, rating: 4.3 },
    { name: "Doddabetta Peak", description: "Highest point in the Nilgiris (2633m) with a telescope house.", category: "SIGHTSEEING", estimatedCost: 50, durationHours: 2, rating: 4.4 },
    { name: "Ooty Lake Boating", description: "Pedal and row boats on the scenic artificial lake.", category: "WELLNESS", estimatedCost: 150, durationHours: 1.5, rating: 4.1 },
    { name: "Tea Factory Visit", description: "See how the famous Nilgiri tea is processed and packed — with tasting.", category: "CULTURE", estimatedCost: 100, durationHours: 1.5, rating: 4.4 },
  ],

  // ─── Bangalore ───────────────────────────────────────────────────────────────
  Bangalore: [
    { name: "Lalbagh Botanical Garden", description: "240-acre garden with a glass house and 1800+ plant species.", category: "WELLNESS", estimatedCost: 30, durationHours: 2.5, rating: 4.5 },
    { name: "Cubbon Park Morning Run", description: "Scenic 300-acre urban park — perfect for morning walks and jogging.", category: "WELLNESS", estimatedCost: 0, durationHours: 1.5, rating: 4.4 },
    { name: "Tipu Sultan's Summer Palace", description: "18th-century Indo-Islamic summer retreat in the heart of the city.", category: "CULTURE", estimatedCost: 15, durationHours: 1.5, rating: 4.3 },
    { name: "Craft Beer Trail — Indiranagar", description: "Visit Bangalore's famous microbreweries in the vibrant Indiranagar district.", category: "FOOD", estimatedCost: 1500, durationHours: 4, rating: 4.6 },
    { name: "Commercial Street Shopping", description: "Busy market street for clothes, shoes, and accessories at bargain prices.", category: "SHOPPING", estimatedCost: 1000, durationHours: 2, rating: 4.1 },
    { name: "ISKCON Temple", description: "One of the world's largest ISKCON temples — intricate marble work.", category: "CULTURE", estimatedCost: 0, durationHours: 1.5, rating: 4.5 },
  ],

  // ─── Mysore ──────────────────────────────────────────────────────────────────
  Mysore: [
    { name: "Mysore Palace (Illuminated)", description: "Amba Vilas Palace — lit with 97,000 bulbs every Sunday evening.", category: "CULTURE", estimatedCost: 200, durationHours: 2.5, rating: 4.8 },
    { name: "Chamundi Hill Temple", description: "Ancient hilltop temple with 1,000-step climb and views of Mysore.", category: "CULTURE", estimatedCost: 0, durationHours: 2, rating: 4.6 },
    { name: "Devaraja Market", description: "Vibrant 100-year-old market famous for flowers, spices, and silk.", category: "SHOPPING", estimatedCost: 500, durationHours: 1.5, rating: 4.4 },
    { name: "Mysore Silk Weaving", description: "Watch government silk-weaving factory create world-famous Mysore silk sarees.", category: "CULTURE", estimatedCost: 0, durationHours: 1, rating: 4.3 },
    { name: "Brindavan Gardens Evening", description: "Musical fountain show at the ornamental gardens by the KRS Dam.", category: "SIGHTSEEING", estimatedCost: 100, durationHours: 2.5, rating: 4.5 },
  ],

  // ─── Hampi ───────────────────────────────────────────────────────────────────
  Hampi: [
    { name: "Virupaksha Temple", description: "Living 7th-century temple dedicated to Shiva — heart of Hampi.", category: "CULTURE", estimatedCost: 0, durationHours: 1.5, rating: 4.7 },
    { name: "Vittala Temple & Stone Chariot", description: "UNESCO-listed temple with the iconic stone chariot and musical pillars.", category: "CULTURE", estimatedCost: 600, durationHours: 2.5, rating: 4.8 },
    { name: "Hampi Bouldering", description: "World-class granite bouldering among ancient ruins.", category: "ADVENTURE", estimatedCost: 500, durationHours: 4, rating: 4.7 },
    { name: "Coracle Ride on Tungabhadra", description: "Circular basket-boat ride across the sacred river.", category: "ADVENTURE", estimatedCost: 200, durationHours: 1, rating: 4.5 },
    { name: "Sunset from Matanga Hill", description: "Watch the sun set over the boulder-strewn Hampi landscape.", category: "SIGHTSEEING", estimatedCost: 0, durationHours: 2, rating: 4.9 },
  ],

  // ─── Kochi ───────────────────────────────────────────────────────────────────
  Kochi: [
    { name: "Fort Kochi Heritage Walk", description: "Walk past Chinese fishing nets, colonial churches, and Dutch cemeteries.", category: "CULTURE", estimatedCost: 0, durationHours: 3, rating: 4.6 },
    { name: "Kathakali Dance Performance", description: "Ancient classical dance form with elaborate makeup and storytelling.", category: "CULTURE", estimatedCost: 400, durationHours: 2, rating: 4.6 },
    { name: "Kerala Backwater Cruise", description: "Day cruise through shaded canals past paddy fields and coconut groves.", category: "SIGHTSEEING", estimatedCost: 1200, durationHours: 8, rating: 4.8 },
    { name: "Seafood Dinner — Fort Kochi", description: "Pick fresh catch at a market stall, have it cooked to order.", category: "FOOD", estimatedCost: 800, durationHours: 2, rating: 4.8 },
    { name: "Jew Town Antiques", description: "Browse antiques and spices in the historic Jewish quarter of Mattancherry.", category: "SHOPPING", estimatedCost: 500, durationHours: 2, rating: 4.3 },
  ],

  // ─── Munnar ──────────────────────────────────────────────────────────────────
  Munnar: [
    { name: "Eravikulam National Park", description: "Home to the endangered Nilgiri Tahr — best views of Anamudi peak.", category: "ADVENTURE", estimatedCost: 400, durationHours: 3, rating: 4.7 },
    { name: "Tea Museum Visit", description: "Learn about tea processing at the Tata Tea Museum.", category: "CULTURE", estimatedCost: 250, durationHours: 1.5, rating: 4.3 },
    { name: "Mattupetty Dam Boating", description: "Boat on the reservoir surrounded by shola forests and tea estates.", category: "WELLNESS", estimatedCost: 200, durationHours: 2, rating: 4.4 },
    { name: "Top Station Trek", description: "Hike to the highest point in Munnar for panoramic views of Tamil Nadu.", category: "ADVENTURE", estimatedCost: 100, durationHours: 3, rating: 4.6 },
    { name: "Neelakurinji Bloom Walk", description: "Walk through the rare purple wildflower fields (blooms once every 12 years).", category: "SIGHTSEEING", estimatedCost: 0, durationHours: 2, rating: 4.8 },
  ],

  // ─── Alleppey ────────────────────────────────────────────────────────────────
  Alleppey: [
    { name: "Houseboat Cruise — Vembanad Lake", description: "Overnight houseboat through Kerala's famous backwater network.", category: "WELLNESS", estimatedCost: 5000, durationHours: 24, rating: 4.9 },
    { name: "Nehru Trophy Boat Race", description: "Watch the world's most famous snake boat race on Punnamada Lake in August.", category: "CULTURE", estimatedCost: 0, durationHours: 4, rating: 4.8 },
    { name: "Alappuzha Beach Sunrise", description: "Quiet sunrise on the beach next to the old British pier.", category: "WELLNESS", estimatedCost: 0, durationHours: 1.5, rating: 4.5 },
    { name: "Kuttanad Below Sea Level Tour", description: "Boat through Kuttanad — the rice bowl of Kerala, farmed below sea level.", category: "ADVENTURE", estimatedCost: 600, durationHours: 4, rating: 4.6 },
  ],

  // ─── Bhopal ──────────────────────────────────────────────────────────────────
  Bhopal: [
    { name: "Sanchi Stupa Day Trip", description: "UNESCO-listed Buddhist stupa complex — one of the oldest in the world (46km away).", category: "CULTURE", estimatedCost: 600, durationHours: 5, rating: 4.7 },
    { name: "Upper Lake (Bada Talaab) Boating", description: "One of Asia's oldest man-made lakes — great for evening boating.", category: "WELLNESS", estimatedCost: 200, durationHours: 2, rating: 4.3 },
    { name: "Tribal Museum", description: "One of India's finest tribal art museums — a must for handicraft lovers.", category: "CULTURE", estimatedCost: 0, durationHours: 2, rating: 4.5 },
    { name: "Bhimbetka Rock Shelters", description: "UNESCO World Heritage prehistoric cave paintings — 30,000+ years old (45km away).", category: "CULTURE", estimatedCost: 300, durationHours: 4, rating: 4.6 },
  ],

  // ─── Indore ──────────────────────────────────────────────────────────────────
  Indore: [
    { name: "Sarafa Bazaar Night Food Market", description: "India's most famous overnight street food market — 50+ stalls from 10pm.", category: "FOOD", estimatedCost: 400, durationHours: 2, rating: 4.9 },
    { name: "Rajwada Palace", description: "7-storey 18th-century palace of the Holkar dynasty.", category: "CULTURE", estimatedCost: 10, durationHours: 1.5, rating: 4.3 },
    { name: "Lal Bagh Palace", description: "19th-century Italian Renaissance palace with Buckingham Palace-inspired gates.", category: "CULTURE", estimatedCost: 50, durationHours: 1.5, rating: 4.4 },
    { name: "Khajrana Ganesh Temple", description: "One of Madhya Pradesh's most visited temples.", category: "CULTURE", estimatedCost: 0, durationHours: 1, rating: 4.5 },
  ],

  // ─── Raipur ──────────────────────────────────────────────────────────────────
  Raipur: [
    { name: "Chitrakote Falls Day Trip", description: "India's widest waterfall — called the Niagara of India (100km away).", category: "ADVENTURE", estimatedCost: 800, durationHours: 8, rating: 4.7 },
    { name: "Purkhouti Muktangan", description: "Open-air museum recreating tribal architecture and culture of Chhattisgarh.", category: "CULTURE", estimatedCost: 50, durationHours: 2, rating: 4.3 },
    { name: "Marine Drive Raipur", description: "Evening walk along the decorated lakeside promenade.", category: "WELLNESS", estimatedCost: 0, durationHours: 1.5, rating: 4.1 },
    { name: "Mahamaya Temple", description: "Ancient temple dedicated to Goddess Mahamaya — important local pilgrimage.", category: "CULTURE", estimatedCost: 0, durationHours: 1, rating: 4.2 },
  ],

  // ─── Paris ───────────────────────────────────────────────────────────────────
  Paris: [
    { name: "Eiffel Tower", description: "Iconic iron lattice tower on the Champ de Mars.", category: "SIGHTSEEING", estimatedCost: 2800, durationHours: 2, rating: 4.7 },
    { name: "Louvre Museum", description: "World's largest art museum with over 35,000 works including the Mona Lisa.", category: "CULTURE", estimatedCost: 1500, durationHours: 4, rating: 4.8 },
    { name: "Montmartre Walk", description: "Explore the bohemian hilltop district with the Sacré-Cœur basilica.", category: "SIGHTSEEING", estimatedCost: 0, durationHours: 3, rating: 4.6 },
    { name: "Seine River Cruise", description: "Boat tour past Notre-Dame, Eiffel Tower, and historic bridges.", category: "SIGHTSEEING", estimatedCost: 1800, durationHours: 1.5, rating: 4.5 },
    { name: "Versailles Day Trip", description: "Opulent royal palace with the Hall of Mirrors and formal gardens.", category: "CULTURE", estimatedCost: 2500, durationHours: 6, rating: 4.7 },
    { name: "French Patisserie Tour", description: "Sample croissants, macarons, and éclairs at top Parisian bakeries.", category: "FOOD", estimatedCost: 1200, durationHours: 3, rating: 4.8 },
  ],

  // ─── London ──────────────────────────────────────────────────────────────────
  London: [
    { name: "British Museum", description: "8 million artefacts spanning 2 million years of human history — free entry.", category: "CULTURE", estimatedCost: 0, durationHours: 4, rating: 4.8 },
    { name: "Tower of London & Crown Jewels", description: "900-year-old fortress housing the Crown Jewels — guided beefeater tour.", category: "CULTURE", estimatedCost: 3000, durationHours: 3, rating: 4.7 },
    { name: "Borough Market Food Tour", description: "London's famous foodie market with artisan producers from across the UK.", category: "FOOD", estimatedCost: 1500, durationHours: 3, rating: 4.7 },
    { name: "Thames Walk — Westminster to Greenwich", description: "Walk along the South Bank past the Tate Modern, Shakespeare's Globe, and Tower Bridge.", category: "SIGHTSEEING", estimatedCost: 0, durationHours: 4, rating: 4.6 },
    { name: "Notting Hill Portobello Market", description: "Iconic antiques market in the colourful Notting Hill neighbourhood.", category: "SHOPPING", estimatedCost: 2000, durationHours: 3, rating: 4.5 },
    { name: "West End Theatre Show", description: "Catch a world-class musical or play in the heart of London's theatre district. (£100 avg ≈ ₹10,600)", category: "CULTURE", estimatedCost: 10600, durationHours: 3, rating: 4.9 },
  ],

  // ─── Amsterdam ───────────────────────────────────────────────────────────────
  Amsterdam: [
    { name: "Anne Frank House", description: "The secret annex where Anne Frank hid during WWII — deeply moving museum.", category: "CULTURE", estimatedCost: 1500, durationHours: 2, rating: 4.8 },
    { name: "Rijksmuseum", description: "Dutch national museum with Rembrandt, Vermeer, and the Night Watch.", category: "CULTURE", estimatedCost: 1700, durationHours: 3, rating: 4.8 },
    { name: "Canal Cruise", description: "See Amsterdam from the water — past 17th-century merchant houses.", category: "SIGHTSEEING", estimatedCost: 1400, durationHours: 1.5, rating: 4.6 },
    { name: "Keukenhof Tulip Gardens", description: "7 million tulips and other spring flowers across 32 hectares (seasonal).", category: "SIGHTSEEING", estimatedCost: 1600, durationHours: 4, rating: 4.8 },
    { name: "Jordaan Neighbourhood Walk", description: "Explore Amsterdam's most charming district with indie boutiques and cafes.", category: "WELLNESS", estimatedCost: 0, durationHours: 2, rating: 4.5 },
  ],

  // ─── Prague ──────────────────────────────────────────────────────────────────
  Prague: [
    { name: "Prague Castle Complex", description: "The largest ancient castle in the world — includes St. Vitus Cathedral.", category: "CULTURE", estimatedCost: 1000, durationHours: 3, rating: 4.7 },
    { name: "Charles Bridge at Dawn", description: "Cross the 14th-century Gothic bridge before the crowds arrive.", category: "SIGHTSEEING", estimatedCost: 0, durationHours: 1, rating: 4.8 },
    { name: "Old Town Square & Astronomical Clock", description: "Watch the medieval Orloj perform its hourly show in the stunning square.", category: "SIGHTSEEING", estimatedCost: 0, durationHours: 1.5, rating: 4.6 },
    { name: "Czech Beer & Svíčková Dinner", description: "Traditional Bohemian braised beef with cream sauce and Czech pilsner.", category: "FOOD", estimatedCost: 900, durationHours: 2, rating: 4.7 },
    { name: "Josefov Jewish Quarter", description: "Explore six surviving synagogues and the historic Jewish cemetery.", category: "CULTURE", estimatedCost: 1200, durationHours: 2.5, rating: 4.6 },
  ],

  // ─── Lisbon ──────────────────────────────────────────────────────────────────
  Lisbon: [
    { name: "Belém Tower & Jerónimos Monastery", description: "Two UNESCO World Heritage Manueline masterpieces by the Tagus river.", category: "CULTURE", estimatedCost: 1200, durationHours: 3, rating: 4.7 },
    { name: "Tram 28 Ride through Alfama", description: "Rattle through the oldest neighbourhood on Lisbon's iconic yellow tram.", category: "SIGHTSEEING", estimatedCost: 300, durationHours: 1.5, rating: 4.5 },
    { name: "Fado Night in Alfama", description: "Experience Portugal's melancholic folk music in a traditional taberna.", category: "CULTURE", estimatedCost: 2000, durationHours: 3, rating: 4.8 },
    { name: "LX Factory Sunday Market", description: "Hipster market in a converted industrial space — food, art, and design.", category: "SHOPPING", estimatedCost: 1000, durationHours: 3, rating: 4.5 },
    { name: "Pastéis de Belém", description: "Eat the original custard tarts from the shop that has been baking them since 1837.", category: "FOOD", estimatedCost: 200, durationHours: 1, rating: 4.9 },
  ],

  // ─── Rome ────────────────────────────────────────────────────────────────────
  Rome: [
    { name: "Colosseum & Roman Forum", description: "Walk through the world's greatest amphitheatre and the ancient city centre.", category: "CULTURE", estimatedCost: 2500, durationHours: 4, rating: 4.8 },
    { name: "Vatican Museums & Sistine Chapel", description: "Michelangelo's masterpiece ceiling in the world's most visited museum complex. (€17 ≈ ₹1,530)", category: "CULTURE", estimatedCost: 1530, durationHours: 4, rating: 4.9 },
    { name: "Trastevere Evening Walk", description: "Wander Rome's most romantic neighbourhood after dark.", category: "SIGHTSEEING", estimatedCost: 0, durationHours: 2, rating: 4.7 },
    { name: "Gelato Tour — Centro Storico", description: "Try artisanal gelato from 5 of Rome's best gelaterie.", category: "FOOD", estimatedCost: 1000, durationHours: 2, rating: 4.8 },
    { name: "Trevi Fountain & Spanish Steps", description: "Toss a coin at the Baroque fountain and climb the famous 135 steps.", category: "SIGHTSEEING", estimatedCost: 0, durationHours: 2, rating: 4.6 },
  ],

  // ─── Barcelona ───────────────────────────────────────────────────────────────
  Barcelona: [
    { name: "Sagrada Família", description: "Gaudí's unfinished basilica — the world's most extraordinary church under construction.", category: "CULTURE", estimatedCost: 2800, durationHours: 2.5, rating: 4.9 },
    { name: "Park Güell", description: "Colourful mosaic park designed by Gaudí with stunning city views.", category: "SIGHTSEEING", estimatedCost: 1000, durationHours: 2, rating: 4.7 },
    { name: "La Boqueria Market", description: "Barcelona's famous market on Las Ramblas — tapas, seafood, and jamón.", category: "FOOD", estimatedCost: 1200, durationHours: 2, rating: 4.5 },
    { name: "Barceloneta Beach Day", description: "Sun, sea, and sangria on Barcelona's urban beach.", category: "WELLNESS", estimatedCost: 500, durationHours: 5, rating: 4.5 },
    { name: "Gothic Quarter Walk", description: "Explore narrow medieval streets, Roman ruins, and hidden squares.", category: "SIGHTSEEING", estimatedCost: 0, durationHours: 3, rating: 4.6 },
  ],

  // ─── Istanbul ────────────────────────────────────────────────────────────────
  Istanbul: [
    { name: "Hagia Sophia", description: "6th-century Byzantine cathedral turned mosque — one of the world's greatest buildings. Free entry.", category: "CULTURE", estimatedCost: 0, durationHours: 2, rating: 4.8 },
    { name: "Grand Bazaar", description: "One of the world's oldest and largest covered markets — 4,000 shops.", category: "SHOPPING", estimatedCost: 1500, durationHours: 3, rating: 4.6 },
    { name: "Bosphorus Cruise", description: "Boat past the skyline, palaces, and two continents.", category: "SIGHTSEEING", estimatedCost: 800, durationHours: 2.5, rating: 4.7 },
    { name: "Turkish Breakfast Spread", description: "Feast on cheese, olives, tomatoes, eggs, and simit at a local café.", category: "FOOD", estimatedCost: 600, durationHours: 1.5, rating: 4.8 },
    { name: "Topkapi Palace", description: "Opulent palace of the Ottoman sultans with the jewel-encrusted Topkapi dagger.", category: "CULTURE", estimatedCost: 1000, durationHours: 3, rating: 4.7 },
  ],

  // ─── Dubai ───────────────────────────────────────────────────────────────────
  Dubai: [
    { name: "Burj Khalifa At The Top", description: "Ascend to the 124th floor observation deck of the world's tallest building.", category: "SIGHTSEEING", estimatedCost: 4000, durationHours: 2, rating: 4.7 },
    { name: "Desert Safari with BBQ Dinner", description: "Dune bashing, camel ride, sandboarding, and traditional Emirati dinner.", category: "ADVENTURE", estimatedCost: 5000, durationHours: 6, rating: 4.8 },
    { name: "Dubai Mall & Aquarium", description: "World's largest mall — visit the 10 million litre aquarium and ice rink.", category: "SHOPPING", estimatedCost: 2000, durationHours: 4, rating: 4.5 },
    { name: "Dubai Creek Dhow Cruise", description: "Traditional wooden dhow dinner cruise on the historic Creek.", category: "CULTURE", estimatedCost: 3000, durationHours: 3, rating: 4.6 },
    { name: "Dubai Frame", description: "Walk across a glass bridge 150m high framing old and new Dubai. (AED 50 ≈ ₹1,130)", category: "SIGHTSEEING", estimatedCost: 1130, durationHours: 1.5, rating: 4.5 },
  ],

  // ─── Singapore ───────────────────────────────────────────────────────────────
  Singapore: [
    { name: "Gardens by the Bay — Supertree Grove", description: "Futuristic vertical gardens with nightly light show.", category: "SIGHTSEEING", estimatedCost: 1500, durationHours: 3, rating: 4.8 },
    { name: "Marina Bay Sands Observation Deck", description: "Iconic infinity pool view from the 57th floor SkyPark.", category: "SIGHTSEEING", estimatedCost: 2500, durationHours: 2, rating: 4.7 },
    { name: "Hawker Centre Feast", description: "Eat at Maxwell Food Centre or Lau Pa Sat — Singapore's famous outdoor food courts.", category: "FOOD", estimatedCost: 800, durationHours: 2, rating: 4.9 },
    { name: "Sentosa Island Day", description: "Universal Studios, beach clubs, and cable car at the resort island.", category: "ADVENTURE", estimatedCost: 4000, durationHours: 8, rating: 4.6 },
    { name: "Chinatown & Little India Walk", description: "Explore the vibrant heritage neighbourhoods with temples and street food.", category: "CULTURE", estimatedCost: 300, durationHours: 3, rating: 4.5 },
  ],

  // ─── Bangkok ─────────────────────────────────────────────────────────────────
  Bangkok: [
    { name: "Wat Phra Kaew & Grand Palace", description: "Thailand's most sacred temple housing the Emerald Buddha.", category: "CULTURE", estimatedCost: 800, durationHours: 3, rating: 4.8 },
    { name: "Floating Market — Damnoen Saduak", description: "Colourful morning market on narrow canals 100km from Bangkok.", category: "CULTURE", estimatedCost: 1200, durationHours: 5, rating: 4.5 },
    { name: "Chatuchak Weekend Market", description: "World's largest weekend market — 15,000 stalls across 27 acres.", category: "SHOPPING", estimatedCost: 1500, durationHours: 4, rating: 4.6 },
    { name: "Street Food Walk — Yaowarat Chinatown", description: "Eat your way through Bangkok's famous Chinatown after dark.", category: "FOOD", estimatedCost: 700, durationHours: 3, rating: 4.8 },
    { name: "Chao Phraya River Boat Tour", description: "Take the express boat past temples, palaces, and riverside villages.", category: "SIGHTSEEING", estimatedCost: 500, durationHours: 2, rating: 4.5 },
    { name: "Thai Cooking Class", description: "Morning market visit then cook 4 dishes in a professional kitchen.", category: "FOOD", estimatedCost: 2000, durationHours: 4, rating: 4.7 },
  ],

  // ─── Tokyo ───────────────────────────────────────────────────────────────────
  Tokyo: [
    { name: "Senso-ji Temple", description: "Tokyo's oldest and most significant Buddhist temple in Asakusa.", category: "CULTURE", estimatedCost: 0, durationHours: 2, rating: 4.7 },
    { name: "Shibuya Crossing & Walk", description: "Experience the world's busiest pedestrian crossing and Shibuya district.", category: "SIGHTSEEING", estimatedCost: 0, durationHours: 3, rating: 4.6 },
    { name: "Tsukiji Outer Market", description: "Fresh sushi breakfast and street food at Tokyo's famous fish market. (¥3,000 ≈ ₹1,700)", category: "FOOD", estimatedCost: 1700, durationHours: 2, rating: 4.8 },
    { name: "teamLab Planets", description: "Immersive digital art museum — walk through infinite light and water. (¥3,200 ≈ ₹1,800)", category: "CULTURE", estimatedCost: 1800, durationHours: 2.5, rating: 4.8 },
    { name: "Akihabara Electronics Walk", description: "Explore Tokyo's anime, manga, and electronics district. Budget ¥5,000 ≈ ₹2,800.", category: "SHOPPING", estimatedCost: 2800, durationHours: 3, rating: 4.4 },
    { name: "Shinjuku Gyoen Garden", description: "Spacious national garden blending Japanese, French, and English styles. (¥500 ≈ ₹280)", category: "WELLNESS", estimatedCost: 280, durationHours: 2, rating: 4.6 },
  ],

  // ─── Bali ────────────────────────────────────────────────────────────────────
  Bali: [
    { name: "Tanah Lot Temple", description: "Ancient sea temple on a rock outcropping — best at sunset.", category: "CULTURE", estimatedCost: 600, durationHours: 2, rating: 4.6 },
    { name: "Ubud Monkey Forest", description: "Sacred forest sanctuary with 700+ Balinese long-tailed macaques.", category: "ADVENTURE", estimatedCost: 500, durationHours: 2, rating: 4.4 },
    { name: "Rice Terrace Trek — Tegallalang", description: "Walk through the iconic UNESCO-listed Tegallalang rice terraces.", category: "ADVENTURE", estimatedCost: 200, durationHours: 2.5, rating: 4.7 },
    { name: "Balinese Cooking Class", description: "Learn to cook traditional Balinese dishes with market visit.", category: "FOOD", estimatedCost: 1500, durationHours: 4, rating: 4.8 },
    { name: "Mount Batur Sunrise Trek", description: "Pre-dawn hike to the crater rim of an active volcano.", category: "ADVENTURE", estimatedCost: 2000, durationHours: 7, rating: 4.8 },
    { name: "Seminyak Beach Club", description: "Sunset drinks and dinner at Bali's premium beach clubs.", category: "WELLNESS", estimatedCost: 3000, durationHours: 4, rating: 4.5 },
  ],

  // ─── Sydney ──────────────────────────────────────────────────────────────────
  Sydney: [
    { name: "Sydney Opera House Tour", description: "Guided tour of one of the world's most iconic architectural masterpieces.", category: "CULTURE", estimatedCost: 2800, durationHours: 2, rating: 4.7 },
    { name: "Bondi to Coogee Coastal Walk", description: "6km cliffside walk with stunning Pacific Ocean views and ocean pools.", category: "WELLNESS", estimatedCost: 0, durationHours: 3, rating: 4.8 },
    { name: "Sydney Harbour Bridge Climb", description: "Climb to the summit of the Coathanger for 360° harbour views. (AUD 388 ≈ ₹21,000)", category: "ADVENTURE", estimatedCost: 21000, durationHours: 3.5, rating: 4.8 },
    { name: "Manly Ferry & Beach", description: "30-minute iconic ferry ride from Circular Quay to Manly beach.", category: "SIGHTSEEING", estimatedCost: 800, durationHours: 4, rating: 4.6 },
    { name: "Darling Harbour Seafood Dinner", description: "Fresh Sydney rock oysters and barramundi at a waterfront restaurant.", category: "FOOD", estimatedCost: 4000, durationHours: 2, rating: 4.7 },
    { name: "Blue Mountains Day Trip", description: "Three Sisters rock formation, Scenic Railway, and eucalyptus forests.", category: "ADVENTURE", estimatedCost: 2000, durationHours: 8, rating: 4.7 },
  ],

  // ─── New York ────────────────────────────────────────────────────────────────
  "New York": [
    { name: "Statue of Liberty & Ellis Island", description: "Ferry to the iconic statue and the historic immigration museum. (USD 24 ≈ ₹2,000)", category: "CULTURE", estimatedCost: 2000, durationHours: 5, rating: 4.7 },
    { name: "Metropolitan Museum of Art", description: "2 million objects across 5,000 years of art — one of the world's greatest museums.", category: "CULTURE", estimatedCost: 2500, durationHours: 4, rating: 4.8 },
    { name: "Central Park Walk & Picnic", description: "840 acres of green space in the middle of Manhattan.", category: "WELLNESS", estimatedCost: 500, durationHours: 3, rating: 4.7 },
    { name: "Brooklyn Bridge Walk", description: "Cross the 140-year-old suspension bridge on foot for skyline views.", category: "SIGHTSEEING", estimatedCost: 0, durationHours: 1.5, rating: 4.7 },
    { name: "Times Square & Broadway Show", description: "Neon-lit crossroads of the world + a world-class Broadway musical. (USD 150 avg ≈ ₹12,500)", category: "CULTURE", estimatedCost: 12500, durationHours: 5, rating: 4.8 },
    { name: "High Line Park Walk", description: "Elevated linear park on a former railway line through West Chelsea.", category: "SIGHTSEEING", estimatedCost: 0, durationHours: 2, rating: 4.6 },
  ],
};

async function main() {
  console.log("Seeding database...");

  await prisma.stopActivity.deleteMany();
  await prisma.activity.deleteMany();
  await prisma.city.deleteMany();

  const cityMap: Record<string, string> = {};

  for (const city of cities) {
    const created = await prisma.city.create({
      data: {
        name: city.name,
        country: city.country,
        region: city.region,
        costIndex: city.costIndex,
        popularityScore: city.popularityScore,
        latitude: city.latitude,
        longitude: city.longitude,
      },
    });
    cityMap[city.name] = created.id;
  }

  console.log(`✓ Seeded ${cities.length} cities`);

  let activityCount = 0;
  for (const [cityName, activities] of Object.entries(activitiesData)) {
    const cityId = cityMap[cityName];
    if (!cityId) {
      console.warn(`  ⚠ No city found for "${cityName}" — skipping`);
      continue;
    }
    for (const act of activities) {
      await prisma.activity.create({
        data: {
          cityId,
          name: act.name,
          description: act.description,
          category: act.category,
          estimatedCost: act.estimatedCost,
          durationHours: act.durationHours,
          rating: act.rating,
        },
      });
      activityCount++;
    }
  }

  console.log(`✓ Seeded ${activityCount} activities`);
  console.log("Database seeding complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
