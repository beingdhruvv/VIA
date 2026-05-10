/**
 * Resolve Commons File: titles to 800px thumb URLs via Wikimedia API (batched).
 * Run: node scripts/build-city-wikimedia-urls.mjs
 */

const pairs = [
  ["Mumbai|India", "Gateway_of_India_Mumbai.jpg"],
  ["Delhi|India", "India_Gate_in_New_Delhi_03-2014.jpg"],
  ["Ahmedabad|India", "Sabarmati_Ashram_1.jpg"],
  ["Rann of Kutch|India", "White_Rann_of_Kutch.jpg"],
  ["Somnath|India", "Somnath_temple.jpg"],
  ["Dwarka|India", "Dwarkadhish_Temple_Dwarka.jpg"],
  ["Gir|India", "Asiatic_lion_in_Gir_Forest.jpg"],
  ["Goa|India", "Basilica_of_Bom_Jesus_GOA.jpg"],
  ["Jaipur|India", "Hawa_Mahal_2011.jpg"],
  ["Jodhpur|India", "Mehrangarh_Fort_sunset.jpg"],
  ["Udaipur|India", "City_Palace_Udaipur.jpg"],
  ["Pushkar|India", "Pushkar_lake_ghat.jpg"],
  ["Agra|India", "Taj_Mahal,_Agra,_India_edit3.jpg"],
  ["Varanasi|India", "Dashashwamedh_Ghat,_Varanasi.jpg"],
  ["Lucknow|India", "Bara_Imambara_Lucknow.jpg"],
  ["Rishikesh|India", "Lakshman_Jhula_Rishikesh.jpg"],
  ["Dehradun|India", "Forest_Research_Institute_Dehradun.jpg"],
  ["Mussoorie|India", "Kempty_Falls_Mussoorie.jpg"],
  ["Manali|India", "Solang_Valley_Manali.jpg"],
  ["Shimla|India", "The_Ridge_Shimla.jpg"],
  ["Chandigarh|India", "Rock_Garden_Chandigarh.jpg"],
  ["Amritsar|India", "Golden_Temple_Amritsar.jpg"],
  ["Srinagar|India", "Dal_Lake_Srinagar.jpg"],
  ["Leh|India", "Leh_Palace.jpg"],
  ["Darjeeling|India", "Darjeeling_Himalayan_Railway.jpg"],
  ["Kolkata|India", "Howrah_bridge_birds_eye_view.jpg"],
  ["Patna|India", "Golghar_Patna.jpg"],
  ["Ranchi|India", "Hundru_Falls.jpg"],
  ["Bhubaneswar|India", "Lingaraj_Temple_Bhubaneswar.jpg"],
  ["Puri|India", "Jagannath_Temple_Puri.jpg"],
  ["Hyderabad|India", "Charminar_Hyderabad.jpg"],
  ["Chennai|India", "Marina_Beach_Chennai.jpg"],
  ["Ooty|India", "Ooty_Botanical_Garden.jpg"],
  ["Bangalore|India", "Vidhana_Soudha_sunset.jpg"],
  ["Mysore|India", "Mysore_Palace_Morning.jpg"],
  ["Hampi|India", "Stone_Chariot_Hampi.jpg"],
  ["Kochi|India", "Chinese_fishing_nets_Kochi.jpg"],
  ["Munnar|India", "Tea_plantations_Munnar.jpg"],
  ["Alleppey|India", "Kerala_backwaters_Alleppey.jpg"],
  ["Bhopal|India", "Taj-ul-Masajid_Bhopal.jpg"],
  ["Indore|India", "Rajwada_Indore.jpg"],
  ["Raipur|India", "Mahant_Ghasidas_Memorial_Museum_Raipur.jpg"],
  ["Paris|France", "Tour_Eiffel_Wikimedia_Commons_(cropped).jpg"],
  ["London|United Kingdom", "Tower_Bridge_from_Shad_Thames.jpg"],
  ["Amsterdam|Netherlands", "Amsterdam_Canal_2014.jpg"],
  ["Prague|Czech Republic", "Prague_old_town_square_panorama.jpg"],
  ["Lisbon|Portugal", "Lisbon_(36826722380)_(cropped).jpg"],
  ["Rome|Italy", "Colosseum_in_Rome,_Italy_-_April_2007.jpg"],
  ["Barcelona|Spain", "Sagrada_Familia_01.jpg"],
  ["Istanbul|Turkey", "Hagia_Sophia_Mars_2013.jpg"],
  ["Dubai|UAE", "Burj_Khalifa.jpg"],
  ["Singapore|Singapore", "Marina_Bay_Sands_in_the_evening_-_20101120.jpg"],
  ["Bangkok|Thailand", "Wat_Arun_Ratchawararam_Ratchawaramahawihan.jpg"],
  ["Tokyo|Japan", "Tokyo_Shibuya_Scramble_Crossing_2018-10-09.jpg"],
  ["Bali|Indonesia", "Tegalalang_Rice_Terrace,_Ubud,_Bali,_Indonesia.jpg"],
  ["Sydney|Australia", "Sydney_Opera_House_-_Dec_2008.jpg"],
  ["New York|USA", "Statue_of_Liberty_7.jpg"],
];

function stripQuery(u) {
  if (!u) return u;
  const i = u.indexOf("?");
  return i === -1 ? u : u.slice(0, i);
}

function normFileTitle(s) {
  return s
    .replace(/^File:/i, "")
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function fetchBatch(files) {
  const titles = files.map((f) => `File:${f}`).join("|");
  const params = new URLSearchParams({
    action: "query",
    titles,
    prop: "imageinfo",
    iiprop: "url",
    iiurlwidth: "800",
    format: "json",
    formatversion: "2",
  });
  const url = `https://commons.wikimedia.org/w/api.php?${params}`;
  const res = await fetch(url, { headers: { "User-Agent": "VIA-place-images/1.0 (https://github.com/) node" } });
  if (!res.ok) throw new Error(String(res.status));
  return res.json();
}

function matchPage(pages, requestedFile) {
  const want = normFileTitle(requestedFile);
  for (const p of pages) {
    const t = (p.title || "").replace(/^File:/i, "");
    if (normFileTitle(t) === want) return p;
  }
  for (const p of pages) {
    const t = normFileTitle(p.title || "");
    if (t.includes(want) || want.includes(t)) return p;
  }
  return null;
}

async function main() {
  const chunkSize = 8;
  const out = [];
  const missing = [];
  for (let i = 0; i < pairs.length; i += chunkSize) {
    const slice = pairs.slice(i, i + chunkSize);
    const files = slice.map(([, f]) => f);
    const data = await fetchBatch(files);
    const pages = data.query?.pages ?? [];
    for (const [key, file] of slice) {
      const p = matchPage(pages, file);
      const thumb = p?.imageinfo?.[0]?.thumburl;
      if (!thumb || p?.missing) {
        missing.push({ key, file, gotTitle: p?.title });
        continue;
      }
      out.push({ key, file, url: stripQuery(thumb) });
    }
    await new Promise((r) => setTimeout(r, 400));
  }
  console.log(JSON.stringify({ ok: out, missing }, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
