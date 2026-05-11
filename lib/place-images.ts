/**
 * Curated Wikimedia Commons thumbnails (~800px wide) keyed by seeded city name + country.
 * Each URL depicts that destination (landmark or representative view).
 */

export const FALLBACK_CITY_IMAGE =
  "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Locator_earth_merge.png/960px-Locator_earth_merge.png";

export function cityImageKey(name: string, country: string): string {
  return `${name}|${country}`;
}

const ACTIVITY_QUERY_HINTS: Record<string, string> = {
  ADVENTURE: "adventure travel outdoor",
  CULTURE: "heritage architecture museum",
  FOOD: "local food restaurant",
  NATURE: "nature landscape",
  NIGHTLIFE: "nightlife city",
  SHOPPING: "market shopping",
  SIGHTSEEING: "landmark travel",
  WELLNESS: "wellness garden spa",
};

function cleanImageQuery(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function getActivityImageUrl(
  activityName: string,
  cityName?: string | null,
  country?: string | null,
  category?: string | null,
): string {
  const hint = category ? ACTIVITY_QUERY_HINTS[category] : undefined;
  const query = [activityName, cityName, country, hint ?? "travel experience"]
    .filter(Boolean)
    .map((part) => cleanImageQuery(String(part)))
    .filter(Boolean)
    .join(",");

  return `https://loremflickr.com/800/600/${encodeURIComponent(query || "travel destination")}`;
}

/** All cities in prisma/seed.ts — keys must match seed `name` + `country` exactly. */
export const CITY_IMAGES: Record<string, string> = {
  "Mumbai|India":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/Gateway_of_India_Mumbai.jpg/960px-Gateway_of_India_Mumbai.jpg",
  "Delhi|India":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/0/06/India_Gate%2C_New_Delhi.jpg/960px-India_Gate%2C_New_Delhi.jpg",
  "Ahmedabad|India":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/1/16/Sabarmati_Ashram_Ahmedabad.jpg/960px-Sabarmati_Ashram_Ahmedabad.jpg",
  "Rann of Kutch|India":
    "https://upload.wikimedia.org/wikipedia/commons/0/0e/White_Rann_of_Kutch.jpg",
  "Somnath|India":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Sujay_Chatterjee_at_Somnath_Temple%2C_2024.jpg/960px-Sujay_Chatterjee_at_Somnath_Temple%2C_2024.jpg",
  "Dwarka|India":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Dwarkadhish_Temple%2C_Dwarka%2C_Gujarat.JPG/960px-Dwarkadhish_Temple%2C_Dwarka%2C_Gujarat.JPG",
  "Gir|India":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Gir_lion.jpg/960px-Gir_lion.jpg",
  "Goa|India":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/0/06/Basilica_of_Bom_Jesus_GOA.jpg/960px-Basilica_of_Bom_Jesus_GOA.jpg",
  "Jaipur|India":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/3/37/Hawa_Mahal_2011.jpg/960px-Hawa_Mahal_2011.jpg",
  "Jodhpur|India":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/5/57/Mehrangarh_Fort_sunset.jpg/960px-Mehrangarh_Fort_sunset.jpg",
  "Udaipur|India":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/City_Palace_Udaipur.jpg/960px-City_Palace_Udaipur.jpg",
  "Pushkar|India":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Pushkar_Lake.jpg/960px-Pushkar_Lake.jpg",
  "Agra|India":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bd/Taj_Mahal%2C_Agra%2C_India_edit3.jpg/960px-Taj_Mahal%2C_Agra%2C_India_edit3.jpg",
  "Varanasi|India":
    "https://upload.wikimedia.org/wikipedia/commons/c/c8/Dashashwamedh_Ghat%2C_Varanasi.jpg",
  "Lucknow|India":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f0/Bara_Imambara_Lucknow.jpg/960px-Bara_Imambara_Lucknow.jpg",
  "Rishikesh|India":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/Lakshman_Jhula_Rishikesh.jpg/960px-Lakshman_Jhula_Rishikesh.jpg",
  "Dehradun|India":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/Forest_Research_Institute%2C_Dehradun.jpg/960px-Forest_Research_Institute%2C_Dehradun.jpg",
  "Mussoorie|India":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/Kempty_Falls_Mussoorie.jpg/960px-Kempty_Falls_Mussoorie.jpg",
  "Manali|India":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/3/39/Solang_Valley.jpg/960px-Solang_Valley.jpg",
  "Kasol|India":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Kasol_-_Parvati_Valley.jpg/960px-Kasol_-_Parvati_Valley.jpg",
  "Rohtang Pass|India":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Rohtang_Pass_01.jpg/960px-Rohtang_Pass_01.jpg",
  "Solang Valley|India":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Solang_Valley_HP.jpg/960px-Solang_Valley_HP.jpg",
  "Naggar|India":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Naggar_Castle_01.jpg/960px-Naggar_Castle_01.jpg",
  "Gulaba|India":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Gulaba_Manali.jpg/960px-Gulaba_Manali.jpg",
  "Shimla|India":
    "https://upload.wikimedia.org/wikipedia/commons/2/2c/The_Ridge_Shimla.jpg",
  "Chandigarh|India":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Rock_Garden_Chandigarh.jpg/960px-Rock_Garden_Chandigarh.jpg",
  "Amritsar|India":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/Golden_Temple_Amritsar.jpg/960px-Golden_Temple_Amritsar.jpg",
  "Srinagar|India":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Dal_Lake_Srinagar.jpg/960px-Dal_Lake_Srinagar.jpg",
  "Leh|India":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Leh_Palace.jpg/960px-Leh_Palace.jpg",
  "Darjeeling|India":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Darjeeling_Himalayan_Railway.jpg/960px-Darjeeling_Himalayan_Railway.jpg",
  "Kolkata|India":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Howrah_Bridge_at_night.jpg/960px-Howrah_Bridge_at_night.jpg",
  "Patna|India":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/2/28/Golghar_Patna.jpg/960px-Golghar_Patna.jpg",
  "Ranchi|India":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/Hundru_Falls%2C_Ranchi.jpg/960px-Hundru_Falls%2C_Ranchi.jpg",
  "Bhubaneswar|India":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d2/Lingaraj_Temple_Bhubaneswar.jpg/960px-Lingaraj_Temple_Bhubaneswar.jpg",
  "Puri|India":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Jagannath_Temple_Puri.jpg/960px-Jagannath_Temple_Puri.jpg",
  "Hyderabad|India":
    "https://upload.wikimedia.org/wikipedia/commons/8/87/Charminar_Hyderabad.jpg",
  "Chennai|India":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d8/Marina_Beach_Chennai.jpg/960px-Marina_Beach_Chennai.jpg",
  "Ooty|India":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fd/Ooty_Botanical_Garden.jpg/960px-Ooty_Botanical_Garden.jpg",
  "Bangalore|India":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d2/Vidhana_Soudha_sunset.jpg/960px-Vidhana_Soudha_sunset.jpg",
  "Mysore|India":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Mysore_Palace_Morning.jpg/960px-Mysore_Palace_Morning.jpg",
  "Hampi|India":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Stone_Chariot_Hampi.jpg/960px-Stone_Chariot_Hampi.jpg",
  "Kochi|India":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/1/16/Kochi_chinese_fishing-net-20080215-01a.jpg/960px-Kochi_chinese_fishing-net-20080215-01a.jpg",
  "Munnar|India":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f0/Munnar_tea_plantation.jpg/960px-Munnar_tea_plantation.jpg",
  "Alleppey|India":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f0/Houseboat_in_the_town_of_Alleppey_Kerala%2C_Dec_2011.jpg/960px-Houseboat_in_the_town_of_Alleppey_Kerala%2C_Dec_2011.jpg",
  "Bhopal|India":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/Taj_Ul_Masajid%2C_Bhopal.JPG/960px-Taj_Ul_Masajid%2C_Bhopal.JPG",
  "Indore|India":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/Rajwada_Indore.jpg/960px-Rajwada_Indore.jpg",
  "Raipur|India":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/Mahant_Ghasidas_Sangrahalaya_Raipur_%281%29.jpg/960px-Mahant_Ghasidas_Sangrahalaya_Raipur_%281%29.jpg",
  "Paris|France":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/Tour_Eiffel_Wikimedia_Commons_%28cropped%29.jpg/960px-Tour_Eiffel_Wikimedia_Commons_%28cropped%29.jpg",
  "London|United Kingdom":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/Tower_Bridge_from_Shad_Thames.jpg/960px-Tower_Bridge_from_Shad_Thames.jpg",
  "Amsterdam|Netherlands":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/Amsterdam_gracht.jpg/960px-Amsterdam_gracht.jpg",
  "Prague|Czech Republic":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/Prague_old_town_square_panorama.jpg/960px-Prague_old_town_square_panorama.jpg",
  "Lisbon|Portugal":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/Torre_Bel%C3%A9m_April_2009-4a.jpg/960px-Torre_Bel%C3%A9m_April_2009-4a.jpg",
  "Rome|Italy":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Colosseum_in_Rome%2C_Italy_-_April_2007.jpg/960px-Colosseum_in_Rome%2C_Italy_-_April_2007.jpg",
  "Barcelona|Spain":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ee/Sagrada_Familia_01.jpg/960px-Sagrada_Familia_01.jpg",
  "Istanbul|Turkey":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/Hagia_Sophia_Mars_2013.jpg/960px-Hagia_Sophia_Mars_2013.jpg",
  "Dubai|UAE":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Burj_dubai_3.11.08.jpg/960px-Burj_dubai_3.11.08.jpg",
  "Singapore|Singapore":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Marina_Bay_Sands_in_the_evening_-_20101120.jpg/960px-Marina_Bay_Sands_in_the_evening_-_20101120.jpg",
  "Bangkok|Thailand":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/8/81/Wat_Arun_Ratchawararam_Ratchawaramahawihan.jpg/960px-Wat_Arun_Ratchawararam_Ratchawaramahawihan.jpg",
  "Tokyo|Japan":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Tokyo_Shibuya_Scramble_Crossing_2018-10-09.jpg/960px-Tokyo_Shibuya_Scramble_Crossing_2018-10-09.jpg",
  "Bali|Indonesia":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/Rice_terraces_on_Bali_-_Tegalalang_Rice_Terrace_-_Indonesia_05.jpg/960px-Rice_terraces_on_Bali_-_Tegalalang_Rice_Terrace_-_Indonesia_05.jpg",
  "Sydney|Australia":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Sydney_Opera_House_-_Dec_2008.jpg/960px-Sydney_Opera_House_-_Dec_2008.jpg",
  "New York|USA":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Statue_of_Liberty_7.jpg/960px-Statue_of_Liberty_7.jpg",
};
