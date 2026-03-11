const DEFAULT_API_BASE_URL =
  window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://localhost:4000"
    : "https://akbernamazi.github.io/alFarajService";

const STORAGE_KEYS = {
  settings: "aza.settings.v1",
  favorites: "aza.favorites.v1",
  bookmark: "aza.bookmark.v1",
  tracker: "aza.tracker.v1",
  amaalDate: "aza.amaal.date.v1",
  apiCachePrefix: "aza.api.cache.",
  locationPrompted: "aza.location.prompted.v1",
  livePrayerCache: "aza.live.prayer.cache.v1"
};

const I18N = {
  en: {
    nothing: "No records available.",
    loadFailed: "Load failed",
    trackerTip: "Tap days to mark completed prayers.",
    bookmarkEmpty: "No bookmark saved yet.",
    bookmarkSaved: "Saved",
    favoritesEmpty: "No favorites yet."
  },
  ur: {
    nothing: "ریکارڈ دستیاب نہیں",
    loadFailed: "لوڈ نہیں ہوا",
    trackerTip: "نماز مکمل دن پر نشان لگائیں",
    bookmarkEmpty: "ابھی بک مارک محفوظ نہیں",
    bookmarkSaved: "محفوظ ہوگیا",
    favoritesEmpty: "ابھی کوئی فیورٹ نہیں"
  },
  hi: {
    nothing: "कोई रिकॉर्ड उपलब्ध नहीं",
    loadFailed: "लोड विफल",
    trackerTip: "नमाज़ पूरी होने वाले दिन मार्क करें",
    bookmarkEmpty: "अभी कोई बुकमार्क नहीं",
    bookmarkSaved: "सेव हो गया",
    favoritesEmpty: "अभी कोई पसंदीदा नहीं"
  }
};

const LIBRARY_SECTIONS = [
  {
    title: "Quran",
    meta: "Surahs and guided reading path.",
    entries: [
      { title: "Daily Reading", text: "Read at least 10 ayahs with meaning and reflection." },
      { title: "Quick Start", text: "Continue from your bookmark or start from Surah Yaseen." },
      { title: "Revision", text: "Repeat memorized surahs and track recitation consistency." }
    ]
  },
  {
    title: "Salaat",
    meta: "Prayer guidance and daily discipline.",
    entries: [
      { title: "Fard Checklist", text: "Track Fajr, Dhuhr, Asr, Maghrib, and Isha completion." },
      { title: "Preparation", text: "Ensure wudu, qiblah direction, and prayer time awareness." },
      { title: "Taqibaat", text: "Keep short post-prayer adhkar and tasbeeh routine." }
    ]
  },
  {
    title: "Duas",
    meta: "Daily supplications by purpose.",
    entries: [
      { title: "Morning", text: "Start with short duas for protection and guidance." },
      { title: "Evening", text: "Read Dua-e-Faraj and selected nightly munajat." },
      { title: "Need-based", text: "Use filtered duas for health, rizq, and forgiveness." }
    ]
  },
  {
    title: "Salam",
    meta: "Salutations and ziyarat greetings.",
    entries: [
      { title: "Ahlul Bayt Salam", text: "Recite daily salam to the Prophet and Ahlul Bayt." },
      { title: "Juma Routine", text: "Add special salams for Friday ziyarat moments." },
      { title: "Travel", text: "Keep short salutations available for quick recitation." }
    ]
  },
  {
    title: "Noha",
    meta: "Poetic lament recitation resources.",
    entries: [
      { title: "Majlis Prep", text: "Select nohas by occasion and audience format." },
      { title: "Practice", text: "Use recorded clips for rhythm and pronunciation." },
      { title: "Archive", text: "Keep favorite nohas starred for revisit." }
    ]
  },
  {
    title: "Marsiya",
    meta: "Browse sections and poem titles from Marsiya index.",
    entries: [
      { title: "Select a Marsiya", text: "Pick a Marsiya title from the left panel list to open it here." }
    ]
  },
  {
    title: "Qaside",
    meta: "Praise poetry and devotional qaside.",
    entries: [
      { title: "Recommended", text: "Keep short qaside list for daily or event recitation." },
      { title: "Learning Mode", text: "Read line-by-line transliteration and translation." },
      { title: "Performance", text: "Bookmark and organize qaside for gatherings." }
    ]
  }
];
const COMING_SOON_LIBRARY_INDEXES = new Set([1, 2, 3, 4, 6]);
const MARSIYA_CATALOG_URL = "./content/marsiya/catalog.json";
const DEFAULT_MARSIYA_SECTIONS = [
  {
    id: "section-wafath-e-rasoole-qhuda",
    title: "WAFATH E RASOOLE QHUDA",
    poems: [
      {
        id: "aye-momino-yasrab-me-ajab-nowha-gari-hai",
        title: "AYE MOMINO YASRAB ME AJAB NOWHA GARI HAI",
        file: "./content/marsiya/aye-momino-yasrab-me-ajab-nowha-gari-hai.txt"
      }
    ]
  },
  {
    id: "section-shahadath-hzt-fatima-zehra-a-s",
    title: "SHAHADATH HZT FATIMA ZEHRA A.S",
    poems: [
      {
        id: "bilqees-paasban-hai-ye-kiski-janaab-hai",
        title: "BILQEES PAASBAN HAI YE KISKI JANAAB HAI",
        file: "./content/marsiya/bilqees-paasban-hai-ye-kiski-janaab-hai.txt"
      },
      {
        id: "jab-utt-gaye-mehboobe-khuda-daare-fannah-se",
        title: "JAB UTT GAYE MEHBOOBE KHUDA DAARE FANNAH SE",
        file: "./content/marsiya/jab-utt-gaye-mehboobe-khuda-daare-fannah-se.txt"
      },
      {
        id: "kahti-thi-roke-zainab-e-nalaan-jawab-do",
        title: "KAHTI THI ROKE ZAINAB -E- NALAAN JAWAB DO",
        file: "./content/marsiya/kahti-thi-roke-zainab-e-nalaan-jawab-do.txt"
      },
      {
        id: "roke-kehti-thi-fatema-zehra",
        title: "ROKE KEHTI THI FATEMA ZEHRA",
        file: "./content/marsiya/roke-kehti-thi-fatema-zehra.txt"
      }
    ]
  }
];

const QURAN_SURAHS = [
  "Al-Fatihah", "Al-Baqarah", "Aal-Imran", "An-Nisa", "Al-Ma'idah", "Al-An'am", "Al-A'raf", "Al-Anfal", "At-Tawbah", "Yunus",
  "Hud", "Yusuf", "Ar-Ra'd", "Ibrahim", "Al-Hijr", "An-Nahl", "Al-Isra", "Al-Kahf", "Maryam", "Ta-Ha",
  "Al-Anbiya", "Al-Hajj", "Al-Mu'minun", "An-Nur", "Al-Furqan", "Ash-Shu'ara", "An-Naml", "Al-Qasas", "Al-Ankabut", "Ar-Rum",
  "Luqman", "As-Sajdah", "Al-Ahzab", "Saba", "Fatir", "Ya-Sin", "As-Saffat", "Sad", "Az-Zumar", "Ghafir",
  "Fussilat", "Ash-Shura", "Az-Zukhruf", "Ad-Dukhan", "Al-Jathiyah", "Al-Ahqaf", "Muhammad", "Al-Fath", "Al-Hujurat", "Qaf",
  "Adh-Dhariyat", "At-Tur", "An-Najm", "Al-Qamar", "Ar-Rahman", "Al-Waqi'ah", "Al-Hadid", "Al-Mujadila", "Al-Hashr", "Al-Mumtahanah",
  "As-Saff", "Al-Jumu'ah", "Al-Munafiqun", "At-Taghabun", "At-Talaq", "At-Tahrim", "Al-Mulk", "Al-Qalam", "Al-Haqqah", "Al-Ma'arij",
  "Nuh", "Al-Jinn", "Al-Muzzammil", "Al-Muddaththir", "Al-Qiyamah", "Al-Insan", "Al-Mursalat", "An-Naba", "An-Nazi'at", "'Abasa",
  "At-Takwir", "Al-Infitar", "Al-Mutaffifin", "Al-Inshiqaq", "Al-Buruj", "At-Tariq", "Al-A'la", "Al-Ghashiyah", "Al-Fajr", "Al-Balad",
  "Ash-Shams", "Al-Layl", "Ad-Duhaa", "Ash-Sharh", "At-Tin", "Al-'Alaq", "Al-Qadr", "Al-Bayyinah", "Az-Zalzalah", "Al-'Adiyat",
  "Al-Qari'ah", "At-Takathur", "Al-'Asr", "Al-Humazah", "Al-Fil", "Quraysh", "Al-Ma'un", "Al-Kawthar", "Al-Kafirun", "An-Nasr",
  "Al-Masad", "Al-Ikhlas", "Al-Falaq", "An-Nas"
];

const state = {
  settings: loadJSON(STORAGE_KEYS.settings, { language: "en", fontSize: 16, apiBaseUrl: "" }),
  favorites: loadJSON(STORAGE_KEYS.favorites, []),
  bookmark: loadJSON(STORAGE_KEYS.bookmark, null),
  prayerTracker: loadJSON(STORAGE_KEYS.tracker, {}),
  amaalDate: loadJSON(STORAGE_KEYS.amaalDate, new Date().toISOString().slice(0, 10)),
  lastData: { pub: [], priv: [], places: [], prayerTimes: null },
  locationSuggestions: {},
  libraryIndex: 0,
  libraryOpen: false,
  selectedSurah: null,
  surahCache: {},
  surahLangs: { english: false, urdu: false },
  selectedMarsiya: null,
  selectedMarsiyaSection: null,
  marsiyaCache: {},
  marsiyaSections: DEFAULT_MARSIYA_SECTIONS
};
let leafletMap = null;
let surahRequestId = 0;
let marsiyaRequestId = 0;
let deferredInstallPrompt = null;
const mobilePrayerPanelQuery = window.matchMedia("(max-width: 640px)");

function t(key) {
  const lang = state.settings.language in I18N ? state.settings.language : "en";
  return I18N[lang][key] ?? I18N.en[key] ?? key;
}

function getApiBaseUrl() {
  const configured = (window.AZA_API_BASE_URL || state.settings.apiBaseUrl || DEFAULT_API_BASE_URL || "").trim();
  return configured.replace(/\/+$/, "");
}

function resolveApiUrl(path) {
  const apiBaseUrl = getApiBaseUrl();
  const requestPath = path.startsWith("/") ? path : `/${path}`;
  const normalizedPath =
    apiBaseUrl.endsWith("/api/v1") && requestPath.startsWith("/api/v1/")
      ? requestPath.slice("/api/v1".length)
      : requestPath;
  const raw = `${apiBaseUrl}${normalizedPath}`;
  if (!apiBaseUrl.includes("github.io")) return raw;

  const url = new URL(raw);
  let cleanPath = url.pathname;
  if (/(\/api\/v1)?\/events\/private$/.test(cleanPath)) cleanPath = `${cleanPath}.json`;
  if (/(\/api\/v1)?\/prayer-times$/.test(cleanPath)) cleanPath = `${cleanPath}.json`;
  if (/(\/api\/v1)?\/events\/public$/.test(cleanPath)) cleanPath = `${cleanPath}.json`;
  if (/(\/api\/v1)?\/prayer-places$/.test(cleanPath)) cleanPath = `${cleanPath}.json`;
  if (/(\/api\/v1)?\/health$/.test(cleanPath)) cleanPath = `${cleanPath}.json`;
  url.pathname = cleanPath;
  url.search = "";
  return url.toString();
}

function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function parseIsoDate(value) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function toDdMmYyyy(dateStr) {
  const [year, month, day] = dateStr.split("-");
  return `${day}-${month}-${year}`;
}

function onlyTime(value) {
  return String(value || "").split(" ")[0];
}

function shapePrayerTimes(dateStr, source, times, location = null) {
  return {
    date: dateStr,
    source,
    location,
    times: {
      fajr: onlyTime(times.Fajr || times.fajr),
      dhuhr: onlyTime(times.Dhuhr || times.dhuhr),
      asr: onlyTime(times.Asr || times.asr),
      maghrib: onlyTime(times.Maghrib || times.maghrib),
      isha: onlyTime(times.Isha || times.isha)
    }
  };
}

function hasPrayerTimes(times) {
  const keys = ["fajr", "dhuhr", "asr", "maghrib", "isha"];
  return keys.some((key) => String(times?.times?.[key] || "").trim().length > 0);
}

function setPrayerLocationHelpVisible(visible, message) {
  const box = document.getElementById("prayer-location-help");
  const text = document.getElementById("prayer-location-help-text");
  if (!box) return;
  box.classList.toggle("hidden", !visible);
  if (text && message) text.textContent = message;
}

function getCurrentPositionOnce() {
  if (!("geolocation" in navigator)) return Promise.resolve(null);
  if (localStorage.getItem(STORAGE_KEYS.locationPrompted) === "1") return Promise.resolve(null);

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        localStorage.setItem(STORAGE_KEYS.locationPrompted, "1");
        resolve(position.coords);
      },
      () => {
        localStorage.setItem(STORAGE_KEYS.locationPrompted, "1");
        resolve(null);
      },
      { enableHighAccuracy: false, timeout: 7000, maximumAge: 10 * 60 * 1000 }
    );
  });
}

async function getLivePrayerTimes(dateStr) {
  const coords = await getCurrentPositionOnce();
  if (!coords) {
    return loadJSON(STORAGE_KEYS.livePrayerCache, null);
  }

  return getLivePrayerTimesByCoords(dateStr, coords.latitude, coords.longitude);
}

async function getLivePrayerTimesByCoords(dateStr, latitude, longitude) {
  const dateParam = toDdMmYyyy(dateStr);
  const url = `https://api.aladhan.com/v1/timings/${dateParam}?latitude=${latitude}&longitude=${longitude}&method=0`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Live prayer API failed (${res.status})`);
  const payload = await res.json();
  const timings = payload?.data?.timings;
  if (!timings) throw new Error("Live prayer API returned invalid payload");

  const shaped = shapePrayerTimes(
    dateStr,
    "Shia Jafari (method 0)",
    timings,
    { lat: Number(Number(latitude).toFixed(4)), lng: Number(Number(longitude).toFixed(4)) }
  );
  saveJSON(STORAGE_KEYS.livePrayerCache, shaped);
  return shaped;
}

async function getPrayerTimesByCity(dateStr, city, country) {
  const dateParam = toDdMmYyyy(dateStr);
  const cityQuery = encodeURIComponent(city.trim());
  const countryQuery = encodeURIComponent(country.trim());
  const url = `https://api.aladhan.com/v1/timingsByCity/${dateParam}?city=${cityQuery}&country=${countryQuery}&method=0`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Manual location lookup failed (${res.status})`);
  const payload = await res.json();
  const timings = payload?.data?.timings;
  if (!timings) throw new Error("Manual location lookup returned invalid payload");
  const shaped = shapePrayerTimes(dateStr, "Shia Jafari (method 0)", timings, { city, country });
  saveJSON(STORAGE_KEYS.livePrayerCache, shaped);
  return shaped;
}

async function searchLocationSuggestions(query) {
  const q = query.trim();
  if (q.length < 2) return [];
  const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=6&q=${encodeURIComponent(q)}`;
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`Location search failed (${res.status})`);
  const rows = await res.json();
  if (!Array.isArray(rows)) return [];
  return rows
    .map((row) => {
      const city = row?.address?.city || row?.address?.town || row?.address?.village || row?.address?.state || row?.name;
      const country = row?.address?.country || "";
      if (!city || !country) return null;
      return {
        key: `${city}, ${country}`,
        city,
        country
      };
    })
    .filter(Boolean);
}

function applyLocationSuggestionFromInput() {
  const cityInput = document.getElementById("manual-city");
  const countryInput = document.getElementById("manual-country");
  if (!cityInput || !countryInput) return;
  const key = cityInput.value.trim();
  const hit = state.locationSuggestions[key];
  if (!hit) return;
  cityInput.value = hit.city;
  countryInput.value = hit.country;
}

function renderLocationSuggestions(items) {
  const list = document.getElementById("location-suggestions");
  if (!list) return;
  list.innerHTML = "";
  state.locationSuggestions = {};
  items.forEach((item) => {
    state.locationSuggestions[item.key] = item;
    const option = document.createElement("option");
    option.value = item.key;
    list.appendChild(option);
  });
}

function wirePrayerLocationControls() {
  const requestBtn = document.getElementById("request-location-btn");
  const manualBtn = document.getElementById("manual-location-btn");
  const cityInput = document.getElementById("manual-city");
  const countryInput = document.getElementById("manual-country");
  let suggestionTimer = null;

  cityInput?.addEventListener("input", () => {
    const query = cityInput.value.trim();
    if (suggestionTimer) window.clearTimeout(suggestionTimer);
    if (query.length < 2) {
      renderLocationSuggestions([]);
      return;
    }
    suggestionTimer = window.setTimeout(async () => {
      try {
        const items = await searchLocationSuggestions(query);
        renderLocationSuggestions(items);
      } catch {
        renderLocationSuggestions([]);
      }
    }, 260);
  });

  cityInput?.addEventListener("change", applyLocationSuggestionFromInput);
  cityInput?.addEventListener("blur", applyLocationSuggestionFromInput);

  requestBtn?.addEventListener("click", () => {
    if (!("geolocation" in navigator)) {
      setPrayerLocationHelpVisible(true, "Location is not available in this browser. Please enter city manually.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const today = new Date().toISOString().slice(0, 10);
          const times = await getLivePrayerTimesByCoords(today, position.coords.latitude, position.coords.longitude);
          renderData(state.lastData.pub, state.lastData.priv, times, state.lastData.places);
          setPrayerLocationHelpVisible(false);
        } catch {
          setPrayerLocationHelpVisible(true, "Could not load prayer times from live location. Please try manual location.");
        }
      },
      () => {
        setPrayerLocationHelpVisible(true, "Location permission denied. Enter your city and country manually.");
      },
      { enableHighAccuracy: false, timeout: 7000, maximumAge: 5 * 60 * 1000 }
    );
  });

  manualBtn?.addEventListener("click", async () => {
    applyLocationSuggestionFromInput();
    const city = cityInput?.value?.trim() || "";
    const country = countryInput?.value?.trim() || "";
    if (!city || !country) {
      setPrayerLocationHelpVisible(true, "Please enter both city and country.");
      return;
    }
    try {
      const today = new Date().toISOString().slice(0, 10);
      const times = await getPrayerTimesByCity(today, city, country);
      renderData(state.lastData.pub, state.lastData.priv, times, state.lastData.places);
      setPrayerLocationHelpVisible(false);
    } catch {
      setPrayerLocationHelpVisible(true, "Manual location lookup failed. Please check city/country and try again.");
    }
  });
}

function closeSidebarDrawer() {
  document.body.classList.remove("sidebar-open");
  const toggleBtn = document.getElementById("sidebar-toggle");
  toggleBtn?.setAttribute("aria-expanded", "false");
}

function wireMobileSidebar() {
  const toggleBtn = document.getElementById("sidebar-toggle");
  const closeBtn = document.getElementById("sidebar-close");
  const backdrop = document.getElementById("sidebar-backdrop");
  const nav = document.getElementById("side-nav");
  if (!toggleBtn || !closeBtn || !backdrop || !nav) return;

  const mobileQuery = window.matchMedia("(max-width: 640px)");

  const openSidebar = () => {
    if (!mobileQuery.matches) return;
    document.body.classList.add("sidebar-open");
    toggleBtn.setAttribute("aria-expanded", "true");
  };

  const closeSidebar = () => {
    closeSidebarDrawer();
  };

  toggleBtn.addEventListener("click", () => {
    if (document.body.classList.contains("sidebar-open")) closeSidebar();
    else openSidebar();
  });
  closeBtn.addEventListener("click", closeSidebar);
  backdrop.addEventListener("click", closeSidebar);
  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeSidebar();
  });
  nav.addEventListener("click", (event) => {
    if (!mobileQuery.matches) return;
    const target = event.target;
    if (target && target.closest("summary")) return;
    if (target && target.closest("button, a")) closeSidebar();
  });
  mobileQuery.addEventListener("change", (e) => {
    if (!e.matches) closeSidebar();
  });
}

function syncPrayerPanelPlacement() {
  const prayerPanel = document.getElementById("prayer-panel");
  const mobileSlot = document.getElementById("mobile-prayer-slot");
  const sideNav = document.getElementById("side-nav");
  const sideNavHead = sideNav?.querySelector(".side-nav-head");
  if (!prayerPanel || !mobileSlot || !sideNav) return;

  if (mobilePrayerPanelQuery.matches) {
    if (prayerPanel.parentElement !== mobileSlot) {
      mobileSlot.prepend(prayerPanel);
    }
    return;
  }

  if (prayerPanel.parentElement !== sideNav) {
    if (sideNavHead?.nextSibling) {
      sideNav.insertBefore(prayerPanel, sideNavHead.nextSibling);
    } else {
      sideNav.appendChild(prayerPanel);
    }
  }
}

function setLibraryPanelVisibility(visible) {
  const panel = document.getElementById("library-panel");
  const mainContent = document.querySelector(".main-content");
  if (!panel) return;
  panel.classList.toggle("hidden", !visible);
  if (mainContent) {
    mainContent.classList.toggle("library-focus", visible);
  }
}

function setMarsiyaFullscreenMode(enabled) {
  document.body.classList.toggle("marsiya-fullscreen", Boolean(enabled));
}

function setMarsiyaContentOnlyMode(enabled) {
  document.body.classList.toggle("marsiya-content-only", Boolean(enabled));
}

function updateLibraryActiveState() {
  document.querySelectorAll(".library-side-item").forEach((el) => {
    const idx = Number(el.getAttribute("data-library-index"));
    el.classList.toggle("active", state.libraryOpen && idx === state.libraryIndex);
  });
}

function renderQuranSurahList(filter = "") {
  const root = document.getElementById("quran-surah-list");
  if (!root) return;
  const q = String(filter || "").trim().toLowerCase();
  root.innerHTML = "";
  QURAN_SURAHS.forEach((name, idx) => {
    const number = idx + 1;
    if (q && !`${number} ${name}`.toLowerCase().includes(q)) return;
    const btn = document.createElement("button");
    btn.className = "quran-surah-item";
    if (state.libraryOpen && state.libraryIndex === 0 && state.selectedSurah === number) {
      btn.classList.add("active");
    }
    btn.setAttribute("type", "button");
    btn.setAttribute("data-surah-number", String(number));
    btn.textContent = `${number}. ${name}`;
    root.appendChild(btn);
  });
}

function renderMarsiyaList() {
  const root = document.getElementById("marsiya-list");
  if (!root) return;
  root.innerHTML = "";
  const selectedFromPoem = state.selectedMarsiya ? getMarsiyaById(state.selectedMarsiya)?.sectionId : null;
  const selectedSectionId = state.selectedMarsiyaSection || selectedFromPoem;

  state.marsiyaSections.forEach((section) => {
    const block = document.createElement("details");
    block.className = "marsiya-section";
    block.open = selectedSectionId === section.id;

    const summary = document.createElement("summary");
    summary.textContent = section.title;
    block.appendChild(summary);

    const body = document.createElement("div");
    body.className = "marsiya-section-list";

    section.poems.forEach((item, index) => {
      const btn = document.createElement("button");
      btn.className = "marsiya-item";
      if (state.libraryOpen && state.libraryIndex === 5 && state.selectedMarsiya === item.id) {
        btn.classList.add("active");
      }
      btn.type = "button";
      btn.setAttribute("data-marsiya-id", item.id);
      btn.textContent = item.title;
      body.appendChild(btn);

      if (index < section.poems.length - 1) {
        const divider = document.createElement("hr");
        divider.className = "marsiya-divider";
        body.appendChild(divider);
      }
    });

    block.appendChild(body);
    root.appendChild(block);
  });
}

function getMarsiyaById(itemId) {
  for (const section of state.marsiyaSections) {
    const poem = section.poems.find((item) => item.id === itemId);
    if (poem) return { ...poem, sectionId: section.id, sectionTitle: section.title };
  }
  return null;
}

function getMarsiyaSectionById(sectionId) {
  return state.marsiyaSections.find((section) => section.id === sectionId) || null;
}

function getMarsiyaShareUrl(item) {
  const url = new URL(window.location.href);
  url.searchParams.set("library", "marsiya");
  if (item.sectionId) url.searchParams.set("section", item.sectionId);
  url.searchParams.set("marsiya", item.id);
  return url.toString();
}

function getQuranSurahShareUrl(surahNo) {
  const url = new URL(window.location.href);
  url.searchParams.set("library", "quran");
  url.searchParams.set("surah", String(surahNo));
  return url.toString();
}

function resolveSharePayload(shareType, shareValue) {
  if (shareType === "marsiya") {
    const active = shareValue ? getMarsiyaById(shareValue) : null;
    if (!active) return null;
    return {
      title: active.title,
      text: `Read this Marsiya: ${active.title}`,
      url: getMarsiyaShareUrl(active)
    };
  }

  if (shareType === "quran") {
    const surahNo = Number(shareValue);
    if (Number.isNaN(surahNo) || surahNo < 1 || surahNo > QURAN_SURAHS.length) return null;
    const surahName = QURAN_SURAHS[surahNo - 1] || `Surah ${surahNo}`;
    const title = `Quran · ${surahNo}. ${surahName}`;
    return {
      title,
      text: `Read ${title} on Al Faraj`,
      url: getQuranSurahShareUrl(surahNo)
    };
  }

  return null;
}

async function shareByType(shareType, shareValue, feedbackBtn) {
  const payload = resolveSharePayload(shareType, shareValue);
  if (!payload) return;

  if (navigator.share) {
    navigator.share(payload).catch(() => {});
    return;
  }

  let copied = false;
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(payload.url);
      copied = true;
    } catch {
      copied = false;
    }
  }
  if (!copied) return;
  if (!feedbackBtn) return;
  const original = feedbackBtn.textContent;
  feedbackBtn.textContent = "✓";
  window.setTimeout(() => {
    feedbackBtn.textContent = original || "⤴";
  }, 900);
}

function syncLibraryUrlState() {
  const url = new URL(window.location.href);
  url.searchParams.delete("library");
  url.searchParams.delete("section");
  url.searchParams.delete("marsiya");
  url.searchParams.delete("surah");

  if (state.libraryOpen) {
    if (state.libraryIndex === 5) {
      url.searchParams.set("library", "marsiya");
      if (state.selectedMarsiyaSection) url.searchParams.set("section", state.selectedMarsiyaSection);
      if (state.selectedMarsiya) url.searchParams.set("marsiya", state.selectedMarsiya);
    } else if (state.libraryIndex === 0 && state.selectedSurah) {
      url.searchParams.set("library", "quran");
      url.searchParams.set("surah", String(state.selectedSurah));
    }
  }

  window.history.replaceState({}, "", url.toString());
}

function applyLibraryStateFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const library = params.get("library");
  if (library === "marsiya") {
    const sectionId = params.get("section");
    const marsiyaId = params.get("marsiya");
    state.libraryOpen = true;
    state.libraryIndex = 5;
    state.selectedMarsiyaSection = sectionId || null;
    if (marsiyaId && getMarsiyaById(marsiyaId)) {
      state.selectedMarsiya = marsiyaId;
      if (!state.selectedMarsiyaSection) {
        state.selectedMarsiyaSection = getMarsiyaById(marsiyaId)?.sectionId || null;
      }
    }
    return;
  }

  if (library === "quran") {
    const surah = Number(params.get("surah"));
    if (!Number.isNaN(surah) && surah >= 1 && surah <= QURAN_SURAHS.length) {
      state.libraryOpen = true;
      state.libraryIndex = 0;
      state.selectedSurah = surah;
    }
  }
}

function createMarsiyaCrumb(label, type, value, active = false) {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "marsiya-crumb";
  if (active) btn.classList.add("active");
  btn.textContent = label;
  btn.setAttribute("data-marsiya-nav", type);
  if (value) btn.setAttribute("data-marsiya-nav-value", value);
  return btn;
}

function renderMarsiyaIndex() {
  const titleEl = document.getElementById("library-title");
  const metaEl = document.getElementById("library-meta");
  const contentEl = document.getElementById("library-content");
  if (!titleEl || !metaEl || !contentEl) return;

  titleEl.textContent = "Marsiya";
  metaEl.textContent = "Index";
  setLibraryShareButton(null);
  setMarsiyaFullscreenMode(false);
  setMarsiyaContentOnlyMode(false);
  contentEl.innerHTML = "";

  const nav = document.createElement("div");
  nav.className = "marsiya-crumbs";
  nav.appendChild(createMarsiyaCrumb("Index", "index", "", true));
  contentEl.appendChild(nav);

  state.marsiyaSections.forEach((section) => {
    const row = document.createElement("button");
    row.type = "button";
    row.className = "item marsiya-index-item marsiya-index-button";
    row.setAttribute("data-marsiya-nav", "section");
    row.setAttribute("data-marsiya-nav-value", section.id);

    const head = document.createElement("div");
    head.className = "item-head";
    const h3 = document.createElement("h3");
    h3.textContent = `${section.title} (${section.poems.length})`;
    head.appendChild(h3);
    row.appendChild(head);

    contentEl.appendChild(row);
  });
}

function renderMarsiyaSection(sectionId) {
  const titleEl = document.getElementById("library-title");
  const metaEl = document.getElementById("library-meta");
  const contentEl = document.getElementById("library-content");
  if (!titleEl || !metaEl || !contentEl) return;

  const section = getMarsiyaSectionById(sectionId);
  if (!section) {
    renderMarsiyaIndex();
    return;
  }

  state.selectedMarsiyaSection = section.id;
  state.selectedMarsiya = null;
  syncLibraryUrlState();
  setLibraryShareButton(null);
  setMarsiyaFullscreenMode(false);
  setMarsiyaContentOnlyMode(false);

  titleEl.textContent = `Marsiya · ${section.title}`;
  metaEl.textContent = "Section";
  contentEl.innerHTML = "";

  const nav = document.createElement("div");
  nav.className = "marsiya-crumbs";
  nav.appendChild(createMarsiyaCrumb("Index", "index"));
  nav.appendChild(document.createTextNode("›"));
  nav.appendChild(createMarsiyaCrumb(section.title, "section", section.id, true));
  contentEl.appendChild(nav);

  section.poems.forEach((poem) => {
    const row = document.createElement("button");
    row.type = "button";
    row.className = "item marsiya-index-item marsiya-index-button";
    row.setAttribute("data-marsiya-nav", "poem");
    row.setAttribute("data-marsiya-nav-value", poem.id);

    const head = document.createElement("div");
    head.className = "item-head";
    const h3 = document.createElement("h3");
    h3.textContent = poem.title;
    head.appendChild(h3);
    row.appendChild(head);

    contentEl.appendChild(row);
  });
}

function setLibraryShareButton(item) {
  const btn = document.getElementById("library-share-btn");
  if (!btn) return;
  if (!item) {
    btn.classList.add("hidden");
    btn.removeAttribute("data-share-type");
    btn.removeAttribute("data-share-value");
    return;
  }
  const isMobile = window.matchMedia("(max-width: 900px)").matches;
  if (isMobile && item.type === "marsiya") {
    btn.classList.add("hidden");
    btn.removeAttribute("data-share-type");
    btn.removeAttribute("data-share-value");
    return;
  }
  btn.classList.remove("hidden");
  btn.setAttribute("data-share-type", String(item.type || ""));
  btn.setAttribute("data-share-value", String(item.value || ""));
}

async function loadMarsiyaCatalog() {
  try {
    const res = await fetch(MARSIYA_CATALOG_URL, { cache: "no-store" });
    if (!res.ok) return;
    const payload = await res.json();
    if (!Array.isArray(payload) || payload.length === 0) return;
    state.marsiyaSections = payload
      .filter((section) => section && Array.isArray(section.poems))
      .map((section) => ({
        id: String(section.id || section.title || ""),
        title: String(section.title || "Untitled Section"),
        poems: section.poems.map((poem) => ({
          id: String(poem.id || ""),
          title: String(poem.title || "Untitled Marsiya"),
          page: poem.page,
          file: poem.file || null
        }))
      }))
      .filter((section) => section.poems.length > 0);
  } catch {
    // Keep default sections when catalog cannot be loaded.
  }
}

async function fetchMarsiyaText(item) {
  if (!item.file) return null;
  const cached = state.marsiyaCache[item.id];
  if (cached) return cached;
  const res = await fetch(item.file);
  if (!res.ok) throw new Error(`Marsiya file load failed (${res.status})`);
  const text = await res.text();
  state.marsiyaCache[item.id] = text;
  return text;
}

function formatMarsiyaForDisplay(text) {
  const stanzas = String(text || "")
    .replace(/\r\n/g, "\n")
    .trim()
    .split(/\n{2,}/);

  const formatted = stanzas.map((stanza) => {
    const lines = stanza
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    return lines
      .map((line, index) => {
        const cycleIndex = index % 6;
        if (cycleIndex === 4 || cycleIndex === 5) {
          return line.startsWith("\t") ? line : `\t${line}`;
        }
        return line;
      })
      .join("\n");
  });

  return formatted.join("\n\n");
}

async function renderSelectedMarsiya(itemId) {
  const titleEl = document.getElementById("library-title");
  const metaEl = document.getElementById("library-meta");
  const contentEl = document.getElementById("library-content");
  if (!titleEl || !metaEl || !contentEl) return;

  const item = getMarsiyaById(itemId);
  if (!item) return;
  state.selectedMarsiya = item.id;
  state.selectedMarsiyaSection = item.sectionId;
  syncLibraryUrlState();
  setLibraryShareButton({ type: "marsiya", value: item.id });
  setMarsiyaFullscreenMode(false);
  setMarsiyaContentOnlyMode(window.matchMedia("(max-width: 900px)").matches);
  titleEl.textContent = `Marsiya · ${item.title}`;
  metaEl.textContent = `Section: ${item.sectionTitle}`;
  contentEl.innerHTML = "";
  contentEl.appendChild(createItemCard("Loading", "Fetching marsiya text..."));
  const requestId = ++marsiyaRequestId;

  try {
    const textContent = await fetchMarsiyaText(item);
    if (requestId !== marsiyaRequestId) return;
    if (!state.libraryOpen || state.libraryIndex !== 5 || state.selectedMarsiya !== itemId) return;
    if (!textContent) {
      contentEl.innerHTML = "";
      contentEl.appendChild(
        createItemCard(
          "Coming Soon",
          `Text for "${item.title}" is listed in the index and will be added shortly.`
        )
      );
      return;
    }
    contentEl.innerHTML = "";
    const reader = document.createElement("article");
    reader.className = "item";

    const nav = document.createElement("div");
    nav.className = "marsiya-crumbs";
    nav.appendChild(createMarsiyaCrumb("Index", "index"));
    nav.appendChild(document.createTextNode("›"));
    nav.appendChild(createMarsiyaCrumb(item.sectionTitle, "section", item.sectionId));
    nav.appendChild(document.createTextNode("›"));
    nav.appendChild(createMarsiyaCrumb(item.title, "poem", item.id, true));

    if (window.matchMedia("(max-width: 900px)").matches) {
      const shareInlineBtn = document.createElement("button");
      shareInlineBtn.type = "button";
      shareInlineBtn.className = "marsiya-pin-share marsiya-crumb-share";
      shareInlineBtn.textContent = "⤴";
      shareInlineBtn.setAttribute("aria-label", "Share Marsiya");
      shareInlineBtn.setAttribute("title", "Share Marsiya");
      shareInlineBtn.addEventListener("click", () => {
        shareByType("marsiya", item.id, shareInlineBtn).catch(() => {});
      });
      nav.appendChild(shareInlineBtn);
    }
    reader.appendChild(nav);

    const body = document.createElement("pre");
    body.className = "marsiya-plain-text";
    body.textContent = formatMarsiyaForDisplay(textContent);
    reader.appendChild(body);

    contentEl.appendChild(reader);
  } catch (err) {
    if (requestId !== marsiyaRequestId) return;
    const message = err instanceof Error ? err.message : "Unknown error";
    contentEl.innerHTML = "";
    contentEl.appendChild(createItemCard("Failed to load Marsiya", message));
  }
}

function setSurahLangControlsVisible(visible) {
  const root = document.getElementById("surah-lang-controls");
  if (!root) return;
  root.classList.toggle("hidden", !visible);
}

async function fetchSurahMultilang(surahNo) {
  const endpoint = `https://api.alquran.cloud/v1/surah/${surahNo}/editions/quran-uthmani,en.asad,ur.jalandhry`;
  const res = await fetch(endpoint);
  if (!res.ok) throw new Error(`Surah fetch failed (${res.status})`);
  const payload = await res.json();
  if (!payload?.data || !Array.isArray(payload.data)) {
    throw new Error("Surah payload invalid");
  }

  const arabicEdition = payload.data.find((ed) => ed?.edition?.identifier === "quran-uthmani") || payload.data[0];
  const englishEdition = payload.data.find((ed) => ed?.edition?.identifier === "en.asad") || payload.data[1];
  const urduEdition = payload.data.find((ed) => ed?.edition?.identifier === "ur.jalandhry") || payload.data[2];
  if (!arabicEdition?.ayahs || !englishEdition?.ayahs || !urduEdition?.ayahs) {
    throw new Error("Surah ayahs missing");
  }

  const maxLen = Math.max(arabicEdition.ayahs.length, englishEdition.ayahs.length, urduEdition.ayahs.length);
  const ayahs = Array.from({ length: maxLen }, (_, i) => ({
    numberInSurah: i + 1,
    arabic: arabicEdition.ayahs[i]?.text || "",
    english: englishEdition.ayahs[i]?.text || "",
    urdu: urduEdition.ayahs[i]?.text || ""
  }));

  return {
    surahNo,
    nameArabic: arabicEdition.name || "",
    nameEnglish: englishEdition.englishName || QURAN_SURAHS[surahNo - 1] || `Surah ${surahNo}`,
    ayahs
  };
}

function createSurahAyahNode(row) {
  const article = document.createElement("article");
  article.className = "item surah-ayah-card";

  const head = document.createElement("div");
  head.className = "item-head";
  const h3 = document.createElement("h3");
  h3.textContent = `Ayah ${row.numberInSurah}`;
  head.appendChild(h3);
  article.appendChild(head);

  const ar = document.createElement("p");
  ar.className = "surah-arabic";
  ar.dir = "rtl";
  ar.textContent = row.arabic || "-";
  article.appendChild(ar);

  if (state.surahLangs.urdu) {
    const ur = document.createElement("p");
    ur.className = "surah-translation";
    ur.dir = "rtl";
    ur.textContent = `Urdu: ${row.urdu || "-"}`;
    article.appendChild(ur);
  }

  if (state.surahLangs.english) {
    const en = document.createElement("p");
    en.className = "surah-translation";
    en.textContent = `English: ${row.english || "-"}`;
    article.appendChild(en);
  }

  return article;
}

function renderSurahContent(data) {
  const contentEl = document.getElementById("library-content");
  if (!contentEl) return;
  contentEl.innerHTML = "";
  data.ayahs.forEach((row) => contentEl.appendChild(createSurahAyahNode(row)));
}

async function renderSelectedSurah(surahNo) {
  const titleEl = document.getElementById("library-title");
  const metaEl = document.getElementById("library-meta");
  const contentEl = document.getElementById("library-content");
  if (!titleEl || !metaEl || !contentEl) return;

  const surahName = QURAN_SURAHS[surahNo - 1] || `Surah ${surahNo}`;
  setLibraryShareButton({ type: "quran", value: surahNo });
  setMarsiyaFullscreenMode(false);
  setMarsiyaContentOnlyMode(false);
  titleEl.textContent = `Quran · ${surahNo}. ${surahName}`;
  metaEl.textContent = "Arabic · Urdu · English";

  const cached = state.surahCache[surahNo];
  if (cached) {
    renderSurahContent(cached);
    return;
  }

  contentEl.innerHTML = "";
  contentEl.appendChild(createItemCard("Loading", "Fetching Surah in Arabic, Urdu, and English..."));
  const requestId = ++surahRequestId;

  try {
    const data = await fetchSurahMultilang(surahNo);
    state.surahCache[surahNo] = data;
    if (requestId !== surahRequestId) return;
    if (!state.libraryOpen || state.libraryIndex !== 0 || state.selectedSurah !== surahNo) return;
    renderSurahContent(data);
  } catch (err) {
    if (requestId !== surahRequestId) return;
    const message = err instanceof Error ? err.message : "Unknown error";
    contentEl.innerHTML = "";
    contentEl.appendChild(createItemCard("Failed to load Surah", message));
  }
}

function renderLibrarySection(index = 0) {
  const normalized = ((Number(index) % LIBRARY_SECTIONS.length) + LIBRARY_SECTIONS.length) % LIBRARY_SECTIONS.length;
  state.libraryIndex = normalized;
  syncLibraryUrlState();
  const current = LIBRARY_SECTIONS[normalized];

  const titleEl = document.getElementById("library-title");
  const metaEl = document.getElementById("library-meta");
  const contentEl = document.getElementById("library-content");
  if (!titleEl || !metaEl || !contentEl) return;
  if (normalized !== 5 && normalized !== 0) setLibraryShareButton(null);
  if (normalized !== 5) setMarsiyaFullscreenMode(false);
  if (normalized !== 5) setMarsiyaContentOnlyMode(false);

  if (normalized === 0 && state.selectedSurah) {
    const surahNo = state.selectedSurah;
    updateLibraryActiveState();
    renderQuranSurahList(document.getElementById("quran-surah-search")?.value || "");
    setSurahLangControlsVisible(true);
    renderSelectedSurah(surahNo);
    return;
  }

  if (normalized === 5 && state.selectedMarsiya) {
    updateLibraryActiveState();
    renderQuranSurahList(document.getElementById("quran-surah-search")?.value || "");
    renderMarsiyaList();
    renderSelectedMarsiya(state.selectedMarsiya);
    return;
  }

  if (normalized === 5 && state.selectedMarsiyaSection) {
    updateLibraryActiveState();
    renderQuranSurahList(document.getElementById("quran-surah-search")?.value || "");
    renderMarsiyaList();
    renderMarsiyaSection(state.selectedMarsiyaSection);
    return;
  }

  setSurahLangControlsVisible(false);
  titleEl.textContent = current.title;
  metaEl.textContent = current.meta;
  contentEl.innerHTML = "";
  if (normalized === 0) setLibraryShareButton(null);
  if (normalized === 5) {
    renderMarsiyaIndex();
    updateLibraryActiveState();
    renderQuranSurahList(document.getElementById("quran-surah-search")?.value || "");
    renderMarsiyaList();
    return;
  }
  if (COMING_SOON_LIBRARY_INDEXES.has(normalized)) {
    const banner = document.createElement("p");
    banner.className = "coming-soon-banner";
    banner.textContent = "Coming Soon";
    contentEl.appendChild(banner);
  }
  current.entries.forEach((entry) => {
    contentEl.appendChild(createItemCard(entry.title, entry.text));
  });

  updateLibraryActiveState();
  renderQuranSurahList(document.getElementById("quran-surah-search")?.value || "");
  renderMarsiyaList();
}

function toggleLibrarySection(index) {
  const normalized = ((Number(index) % LIBRARY_SECTIONS.length) + LIBRARY_SECTIONS.length) % LIBRARY_SECTIONS.length;
  if (state.libraryOpen && state.libraryIndex === normalized) {
    state.libraryOpen = false;
    setLibraryPanelVisibility(false);
    setMarsiyaFullscreenMode(false);
    setMarsiyaContentOnlyMode(false);
    setSurahLangControlsVisible(false);
    state.selectedSurah = null;
    updateLibraryActiveState();
    renderQuranSurahList(document.getElementById("quran-surah-search")?.value || "");
    renderMarsiyaList();
    syncLibraryUrlState();
    return;
  }
  state.libraryOpen = true;
  if (normalized !== 0) state.selectedSurah = null;
  setLibraryPanelVisibility(true);
  renderLibrarySection(normalized);
}

function wireLibraryViewer() {
  document.querySelectorAll(".library-side-item").forEach((item) => {
    const idx = Number(item.getAttribute("data-library-index"));
    const summary = item.querySelector("summary");
    const btn = item.querySelector(".library-open-btn");
    summary?.addEventListener("click", () => {
      if (!Number.isNaN(idx)) {
        toggleLibrarySection(idx);
        if (idx === 5 && window.matchMedia("(max-width: 640px)").matches) {
          closeSidebarDrawer();
        }
      }
    });
    btn?.addEventListener("click", () => {
      if (!Number.isNaN(idx)) toggleLibrarySection(idx);
    });
  });

  const quranSearch = document.getElementById("quran-surah-search");
  const quranList = document.getElementById("quran-surah-list");
  quranSearch?.addEventListener("input", () => {
    renderQuranSurahList(quranSearch.value);
  });
  quranList?.addEventListener("click", (event) => {
    const target = event.target;
    const btn = target && target.closest ? target.closest(".quran-surah-item") : null;
    if (!btn) return;
    const number = Number(btn.getAttribute("data-surah-number"));
    if (Number.isNaN(number)) return;
    state.libraryOpen = true;
    state.libraryIndex = 0;
    state.selectedSurah = number;
    setLibraryPanelVisibility(true);
    setSurahLangControlsVisible(true);
    renderLibrarySection(0);
  });

  const marsiyaList = document.getElementById("marsiya-list");
  marsiyaList?.addEventListener("click", (event) => {
    const target = event.target;
    const btn = target && target.closest ? target.closest(".marsiya-item") : null;
    if (!btn) return;
    const itemId = btn.getAttribute("data-marsiya-id");
    if (!itemId) return;
    const picked = getMarsiyaById(itemId);
    state.libraryOpen = true;
    state.libraryIndex = 5;
    state.selectedMarsiya = itemId;
    state.selectedMarsiyaSection = picked?.sectionId || state.selectedMarsiyaSection;
    setLibraryPanelVisibility(true);
    setSurahLangControlsVisible(false);
    renderLibrarySection(5);
    if (window.matchMedia("(max-width: 640px)").matches) {
      closeSidebarDrawer();
    }
  });

  const libraryContent = document.getElementById("library-content");
  libraryContent?.addEventListener("click", (event) => {
    const target = event.target;
    const btn = target && target.closest ? target.closest("[data-marsiya-nav]") : null;
    if (!btn || state.libraryIndex !== 5 || !state.libraryOpen) return;
    const navType = btn.getAttribute("data-marsiya-nav");
    const navValue = btn.getAttribute("data-marsiya-nav-value") || "";

    if (navType === "index") {
      state.selectedMarsiya = null;
      state.selectedMarsiyaSection = null;
      syncLibraryUrlState();
      renderMarsiyaList();
      renderMarsiyaIndex();
      return;
    }

    if (navType === "section") {
      state.selectedMarsiya = null;
      state.selectedMarsiyaSection = navValue;
      syncLibraryUrlState();
      renderMarsiyaList();
      renderMarsiyaSection(navValue);
      return;
    }

    if (navType === "poem" && navValue) {
      state.selectedMarsiya = navValue;
      const item = getMarsiyaById(navValue);
      state.selectedMarsiyaSection = item?.sectionId || state.selectedMarsiyaSection;
      syncLibraryUrlState();
      renderMarsiyaList();
      renderSelectedMarsiya(navValue);
    }
  });

  const libraryShareBtn = document.getElementById("library-share-btn");
  libraryShareBtn?.addEventListener("click", () => {
    if (!state.libraryOpen) return;
    const shareType = libraryShareBtn.getAttribute("data-share-type");
    const shareValue = libraryShareBtn.getAttribute("data-share-value");
    shareByType(shareType, shareValue, libraryShareBtn).catch(() => {});
  });

  const englishCheck = document.querySelector('input[name="surah-lang-english"]');
  const urduCheck = document.querySelector('input[name="surah-lang-urdu"]');
  const onLangToggle = () => {
    state.surahLangs = {
      english: Boolean(englishCheck?.checked),
      urdu: Boolean(urduCheck?.checked)
    };
    if (state.libraryOpen && state.libraryIndex === 0 && state.selectedSurah) {
      renderSelectedSurah(state.selectedSurah);
    }
  };
  englishCheck?.addEventListener("change", onLangToggle);
  urduCheck?.addEventListener("change", onLangToggle);

  setLibraryPanelVisibility(state.libraryOpen);
  setSurahLangControlsVisible(state.libraryOpen && state.libraryIndex === 0 && Boolean(state.selectedSurah));
  updateLibraryActiveState();
  renderQuranSurahList();
  renderMarsiyaList();
  if (state.libraryOpen) renderLibrarySection(state.libraryIndex);
}

async function getJSON(path) {
  const apiBaseUrl = getApiBaseUrl();
  if (!apiBaseUrl) {
    throw new Error("API URL is not configured. Open Settings and set API Base URL.");
  }
  const cacheKey = `${STORAGE_KEYS.apiCachePrefix}${path}`;
  const requestUrl = resolveApiUrl(path);
  try {
    const res = await fetch(requestUrl);
    if (!res.ok) throw new Error(`Request failed: ${res.status}`);
    const json = await res.json();
    saveJSON(cacheKey, json);
    return json;
  } catch (error) {
    const cached = loadJSON(cacheKey, null);
    if (cached !== null) return cached;
    throw error;
  }
}

function isFavorite(id) {
  return state.favorites.some((item) => item.id === id);
}

function toggleFavorite(item) {
  const exists = isFavorite(item.id);
  state.favorites = exists ? state.favorites.filter((fav) => fav.id !== item.id) : [item, ...state.favorites];
  saveJSON(STORAGE_KEYS.favorites, state.favorites);
  renderFavorites();
}

function createItemCard(title, description, favoriteItem) {
  const el = document.createElement("article");
  el.className = "item";
  const hasTitle = Boolean(title && String(title).trim());

  const star = favoriteItem
    ? `<button class="star-btn" data-fav-id="${favoriteItem.id}" title="Toggle favorite">${isFavorite(favoriteItem.id) ? "★" : "☆"}</button>`
    : "";
  const head = hasTitle || star
    ? `<div class="item-head">${hasTitle ? `<h3>${title}</h3>` : "<span></span>"}${star}</div>`
    : "";

  el.innerHTML = `${head}<p>${description}</p>`;
  if (favoriteItem) {
    const btn = el.querySelector(".star-btn");
    btn?.addEventListener("click", () => {
      toggleFavorite(favoriteItem);
      btn.textContent = isFavorite(favoriteItem.id) ? "★" : "☆";
    });
  }
  return el;
}

function mountList(id, rows, makeNode) {
  const root = document.getElementById(id);
  if (!root) return;
  root.innerHTML = "";
  if (!rows.length) {
    root.appendChild(createItemCard("Nothing yet", t("nothing")));
    return;
  }
  rows.forEach((row) => root.appendChild(makeNode(row)));
}

function formatWindow(start, end) {
  return `${new Date(start).toLocaleString()} to ${new Date(end).toLocaleTimeString()}`;
}

function getIslamicDateFallback(date) {
  const gYear = date.getFullYear();
  const gMonth = date.getMonth() + 1;
  const gDay = date.getDate();

  const a = Math.floor((14 - gMonth) / 12);
  const y = gYear + 4800 - a;
  const m = gMonth + 12 * a - 3;
  const jdn =
    gDay +
    Math.floor((153 * m + 2) / 5) +
    365 * y +
    Math.floor(y / 4) -
    Math.floor(y / 100) +
    Math.floor(y / 400) -
    32045;

  const l0 = jdn - 1948440 + 10632;
  const n = Math.floor((l0 - 1) / 10631);
  let l = l0 - 10631 * n + 354;
  const j =
    Math.floor((10985 - l) / 5316) * Math.floor((50 * l) / 17719) +
    Math.floor(l / 5670) * Math.floor((43 * l) / 15238);
  l =
    l -
    Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50) -
    Math.floor(j / 16) * Math.floor((15238 * j) / 43) +
    29;

  const monthIndex = Math.floor((24 * l) / 709) - 1;
  const day = l - Math.floor((709 * (monthIndex + 1)) / 24);
  const year = 30 * n + j - 30;
  const monthNames = [
    "muharram",
    "safar",
    "rabi al-awwal",
    "rabi al-thani",
    "jumada al-awwal",
    "jumada al-thani",
    "rajab",
    "shaban",
    "ramadan",
    "shawwal",
    "dhu al-qadah",
    "dhu al-hijjah"
  ];
  const month = monthNames[Math.max(0, Math.min(monthNames.length - 1, monthIndex))];
  return { day, month, year };
}

function normalizeIslamicMonth(value) {
  const raw = String(value || "").toLowerCase().trim().replace(/\s+/g, " ");
  const monthAliases = {
    muharram: "muharram",
    safar: "safar",
    "rabi al-awwal": "rabi al-awwal",
    "rabi i": "rabi al-awwal",
    "rabi al-thani": "rabi al-thani",
    "rabi ii": "rabi al-thani",
    "jumada al-awwal": "jumada al-awwal",
    "jumada i": "jumada al-awwal",
    "jumada al-thani": "jumada al-thani",
    "jumada ii": "jumada al-thani",
    rajab: "rajab",
    shaban: "shaban",
    shaaban: "shaban",
    ramadan: "ramadan",
    ramazan: "ramadan",
    shawwal: "shawwal",
    "dhu al-qadah": "dhu al-qadah",
    "dhu al-hijjah": "dhu al-hijjah",
    "zul hijjah": "dhu al-hijjah",
    "dhul hijjah": "dhu al-hijjah"
  };
  return monthAliases[raw] || "";
}

function getIslamicDateInfo(date) {
  try {
    const parts = new Intl.DateTimeFormat("en-TN-u-ca-islamic", {
      day: "numeric",
      month: "long",
      year: "numeric"
    }).formatToParts(date);
    const day = Number(parts.find((p) => p.type === "day")?.value ?? "0");
    const month = normalizeIslamicMonth(parts.find((p) => p.type === "month")?.value ?? "");
    const year = Number(parts.find((p) => p.type === "year")?.value ?? "0");
    if (day > 0 && day <= 30 && month && year >= 1300 && year <= 1700) return { day, month, year };
    return getIslamicDateFallback(date);
  } catch {
    return getIslamicDateFallback(date);
  }
}

function formatIslamicDateLabel(date) {
  const h = getIslamicDateInfo(date);
  const monthLabel = h.month
    .split(" ")
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ");
  return `${String(h.day).padStart(2, "0")} ${monthLabel} ${h.year}`;
}

function includesAny(text, words) {
  return words.some((w) => text.includes(w));
}

function getTodayAmaalPlan(now) {
  const weekDay = now.getDay();
  const hijri = getIslamicDateInfo(now);

  const base = {
    label: "Daily Amaal",
    recommended: [
      "Recite Salawat 100 times.",
      "Read at least 10 ayahs of Quran with reflection.",
      "Recite Astaghfirullah 70-100 times.",
      "Read Dua-e-Faraj and pray for Imam al-Mahdi (ajtf)."
    ],
    obligatory: []
  };

  if (weekDay === 5) {
    base.recommended.unshift("Friday: Recite Dua Kumayl and Surah al-Kahf.");
  }

  const m = hijri.month;
  const d = hijri.day;

  if (includesAny(m, ["ramadan", "rama", "ramazan"]) && [19, 21, 23].includes(d)) {
    return {
      label: `Laylat al-Qadr (${d} Ramadan)`,
      recommended: [
        "Perform Amaal-e-Shab al-Qadr (2-rakat prayer and Quran on head).",
        "Recite Jawshan al-Kabir.",
        "Recite Ziyarat Imam Husayn (a.s.).",
        "Engage in prolonged istighfar, salawat, and dua until suhoor."
      ],
      obligatory: [
        "Observe the wajib fast of Ramadan (if not exempt) for the daytime of this date."
      ]
    };
  }

  if (includesAny(m, ["ramadan", "rama", "ramazan"]) && d >= 1 && d <= 30) {
    return {
      label: `Ramadan ${d}`,
      recommended: [
        "Fast with niyyah and protect speech/eyes/heart.",
        "Recite one juz or a fixed portion of Quran.",
        "Read Dua Iftitah at night and Dua Abu Hamza (selected passages).",
        "Give charity before iftar."
      ],
      obligatory: [
        "Observe the wajib fast of Ramadan (if not exempt)."
      ]
    };
  }

  if (includesAny(m, ["shawwal"]) && d === 1) {
    return {
      label: "Eid al-Fitr",
      recommended: [
        "Offer Eid prayer.",
        "Pay/confirm Zakat al-Fitr before Eid prayer.",
        "Recite Takbirat and thank Allah for Ramadan completion.",
        "Maintain family ties and charity."
      ],
      obligatory: [
        "Pay Zakat al-Fitr before Eid prayer (or before Zuhr, per ruling)."
      ]
    };
  }

  if (includesAny(m, ["dhu al-hijjah", "zul hijjah", "dhul hijjah"]) && d === 9) {
    return {
      label: "Day of Arafah",
      recommended: [
        "Recite Dua Arafah of Imam Husayn (a.s.).",
        "Increase tawbah and supplication before Maghrib.",
        "Give charity and pray for all believers."
      ],
      obligatory: []
    };
  }

  if (includesAny(m, ["dhu al-hijjah", "zul hijjah", "dhul hijjah"]) && d === 10) {
    return {
      label: "Eid al-Adha",
      recommended: [
        "Offer Eid prayer.",
        "Recite Takbirat of Eid.",
        "Revive spirit of sacrifice and service."
      ],
      obligatory: []
    };
  }

  if (includesAny(m, ["muharram"]) && d === 10) {
    return {
      label: "Ashura (10 Muharram)",
      recommended: [
        "Recite Ziyarat Ashura with reflection.",
        "Attend/host majlis and remember Karbala.",
        "Do acts of service in the name of Imam Husayn (a.s.)."
      ],
      obligatory: []
    };
  }

  if (includesAny(m, ["dhu al-hijjah", "zul hijjah", "dhul hijjah"]) && d === 18) {
    return {
      label: "Eid al-Ghadir",
      recommended: [
        "Recite Ziyarat Aminallah or Ghadir duas.",
        "Renew allegiance (wilayah) to Imam Ali (a.s.).",
        "Increase salawat and charity."
      ],
      obligatory: []
    };
  }

  return base;
}

function appendAmaalGroup(root, heading, rows) {
  if (!rows.length) return;
  const groupHeading = document.createElement("h3");
  groupHeading.className = "amaal-group-title";
  groupHeading.textContent = heading;
  root.appendChild(groupHeading);
  rows.forEach((text) => root.appendChild(createItemCard("", text)));
}

function renderTodayAmaal(now = new Date()) {
  const root = document.getElementById("today-amaal");
  const meta = document.getElementById("amaal-meta");
  if (!root) return;

  const plan = getTodayAmaalPlan(now);
  if (meta) {
    const g = new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(now);
    const h = formatIslamicDateLabel(now);
    meta.textContent = `${plan.label} · ${g} · ${h} AH`;
  }
  root.innerHTML = "";
  appendAmaalGroup(root, "Obligatory", plan.obligatory || []);
  appendAmaalGroup(root, "Recommended", plan.recommended || []);
}

function applyAmaalDateUI() {
  const input = document.getElementById("amaal-date");
  if (input) input.value = state.amaalDate;
}

function wireAmaalDateControls() {
  const input = document.getElementById("amaal-date");
  const todayBtn = document.getElementById("amaal-date-today");

  input?.addEventListener("change", () => {
    const value = input.value;
    if (!parseIsoDate(value)) return;
    state.amaalDate = value;
    saveJSON(STORAGE_KEYS.amaalDate, state.amaalDate);
    renderTodayAmaal(parseIsoDate(state.amaalDate) || new Date());
  });

  todayBtn?.addEventListener("click", () => {
    state.amaalDate = new Date().toISOString().slice(0, 10);
    saveJSON(STORAGE_KEYS.amaalDate, state.amaalDate);
    applyAmaalDateUI();
    renderTodayAmaal(parseIsoDate(state.amaalDate) || new Date());
  });
}

function applySettingsUI() {
  document.documentElement.style.setProperty("--content-font-size", `${state.settings.fontSize}px`);

  const languageSelect = document.getElementById("language-select");
  const fontSlider = document.getElementById("font-size-range");
  const fontValue = document.getElementById("font-size-value");
  const apiInput = document.getElementById("api-base-url");

  if (languageSelect) languageSelect.value = state.settings.language;
  if (fontSlider) fontSlider.value = String(state.settings.fontSize);
  if (fontValue) fontValue.textContent = `${state.settings.fontSize}px`;
  if (apiInput) apiInput.value = state.settings.apiBaseUrl || "";
}

function wireSettings() {
  const languageSelect = document.getElementById("language-select");
  const fontSlider = document.getElementById("font-size-range");
  const fontValue = document.getElementById("font-size-value");
  const apiInput = document.getElementById("api-base-url");
  const saveApiBtn = document.getElementById("save-api-url");

  languageSelect?.addEventListener("change", (e) => {
    state.settings.language = e.target.value;
    saveJSON(STORAGE_KEYS.settings, state.settings);
    renderAllFromState();
  });

  fontSlider?.addEventListener("input", (e) => {
    state.settings.fontSize = Number(e.target.value);
    saveJSON(STORAGE_KEYS.settings, state.settings);
    if (fontValue) fontValue.textContent = `${state.settings.fontSize}px`;
    applySettingsUI();
  });

  saveApiBtn?.addEventListener("click", () => {
    const next = apiInput?.value?.trim() ?? "";
    state.settings.apiBaseUrl = next.replace(/\/+$/, "");
    saveJSON(STORAGE_KEYS.settings, state.settings);
    saveApiBtn.textContent = "Saved";
    window.setTimeout(() => {
      saveApiBtn.textContent = "Save API URL";
    }, 900);
  });
}

function renderPrayerTracker() {
  const root = document.getElementById("prayer-tracker");
  if (!root) return;

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const gregorianTitle = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(now);
  const hijriTitle = new Intl.DateTimeFormat("en-TN-u-ca-islamic", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(now);

  root.innerHTML = `
    <div class="tracker-tip">${t("trackerTip")}</div>
    <div class="tracker-head">
      <span>${gregorianTitle}</span>
      <span>${hijriTitle} AH</span>
    </div>
  `;

  for (let day = 1; day <= daysInMonth; day += 1) {
    const key = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const dayDate = new Date(year, month, day);
    const hijriDay = new Intl.DateTimeFormat("en-TN-u-ca-islamic", { day: "numeric" }).format(dayDate);
    const btn = document.createElement("button");
    btn.className = `day-chip ${state.prayerTracker[key] ? "active" : ""}`;
    btn.innerHTML = `<span class="day-chip-g">${day}</span><span class="day-chip-h">${hijriDay}</span>`;
    btn.addEventListener("click", () => {
      state.prayerTracker[key] = !state.prayerTracker[key];
      saveJSON(STORAGE_KEYS.tracker, state.prayerTracker);
      btn.classList.toggle("active", Boolean(state.prayerTracker[key]));
    });
    root.appendChild(btn);
  }
}

function renderBookmark() {
  const view = document.getElementById("bookmark-view");
  if (!view) return;
  view.innerHTML = "";

  if (!state.bookmark) {
    view.appendChild(createItemCard("Bookmark", t("bookmarkEmpty")));
    return;
  }

  view.appendChild(
    createItemCard(
      `Surah: ${state.bookmark.surah}`,
      `Ayah: ${state.bookmark.ayah} • ${state.bookmark.updatedAt}`
    )
  );
}

function wireBookmark() {
  const surahInput = document.getElementById("bookmark-surah");
  const ayahInput = document.getElementById("bookmark-ayah");
  const saveBtn = document.getElementById("save-bookmark");

  saveBtn?.addEventListener("click", () => {
    const surah = surahInput?.value?.trim();
    const ayah = ayahInput?.value?.trim();
    if (!surah || !ayah) return;

    state.bookmark = {
      surah,
      ayah,
      updatedAt: new Date().toLocaleString()
    };
    saveJSON(STORAGE_KEYS.bookmark, state.bookmark);
    renderBookmark();
    saveBtn.textContent = t("bookmarkSaved");
    window.setTimeout(() => {
      saveBtn.textContent = "Save Bookmark";
    }, 800);
  });
}

function renderFavorites() {
  mountList("favorites", state.favorites, (item) => createItemCard(item.title, item.description));
  const root = document.getElementById("favorites");
  if (root && state.favorites.length === 0) {
    root.innerHTML = "";
    root.appendChild(createItemCard("Favorites", t("favoritesEmpty")));
  }
}

function renderFallbackMap(publicEvents, privateEvents, places) {
  if (leafletMap) {
    leafletMap.remove();
    leafletMap = null;
  }
  const mapRoot = document.getElementById("map");
  if (!mapRoot) return;

  const points = [
    ...publicEvents.map((event) => ({ lat: event.latitude, lng: event.longitude, label: `Public: ${event.title}` })),
    ...privateEvents.map((event) => ({ lat: event.latitude, lng: event.longitude, label: `Private: ${event.title}` })),
    ...places.map((place) => ({ lat: place.latitude, lng: place.longitude, label: `Prayer: ${place.name}` }))
  ];

  if (!points.length) {
    mapRoot.innerHTML = `<div class="fallback-empty">No map points available.</div>`;
    return;
  }

  const minLat = Math.min(...points.map((p) => p.lat));
  const maxLat = Math.max(...points.map((p) => p.lat));
  const minLng = Math.min(...points.map((p) => p.lng));
  const maxLng = Math.max(...points.map((p) => p.lng));
  const latRange = maxLat - minLat || 0.02;
  const lngRange = maxLng - minLng || 0.02;

  const toX = (lng) => 5 + ((lng - minLng) / lngRange) * 90;
  const toY = (lat) => 95 - ((lat - minLat) / latRange) * 90;

  const dots = points
    .map(
      (point) => `<g><circle cx="${toX(point.lng)}" cy="${toY(point.lat)}" r="1.7"></circle><title>${point.label}</title></g>`
    )
    .join("");

  mapRoot.innerHTML = `
    <div class="fallback-map-note">Tiles unavailable, showing coordinate map fallback.</div>
    <svg viewBox="0 0 100 100" class="fallback-map" role="img" aria-label="Coordinate map">
      <defs>
        <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
          <path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(143,183,255,0.22)" stroke-width="0.2"></path>
        </pattern>
      </defs>
      <rect x="0" y="0" width="100" height="100" fill="url(#grid)"></rect>
      ${dots}
    </svg>
  `;
}

function renderMap(publicEvents, privateEvents, places) {
  if (typeof L === "undefined") {
    renderFallbackMap(publicEvents, privateEvents, places);
    return;
  }

  if (leafletMap) {
    leafletMap.remove();
    leafletMap = null;
  }

  const map = L.map("map", {
    zoomControl: true,
    scrollWheelZoom: false
  }).setView([17.385, 78.4867], 12);
  leafletMap = map;

  let tileLoaded = false;
  let tileErrors = 0;
  const tileLayer = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  });
  tileLayer.on("tileload", () => {
    tileLoaded = true;
  });
  tileLayer.on("tileerror", () => {
    tileErrors += 1;
  });
  tileLayer.addTo(map);

  const points = [];
  const addMarker = (lat, lng, title, note) => {
    const marker = L.marker([lat, lng]).addTo(map);
    marker.bindPopup(`<strong>${title}</strong><p class="marker-label">${note}</p>`);
    points.push([lat, lng]);
  };

  publicEvents.forEach((event) => addMarker(event.latitude, event.longitude, `Public: ${event.title}`, formatWindow(event.start_time, event.end_time)));
  privateEvents.forEach((event) => addMarker(event.latitude, event.longitude, `Private: ${event.title}`, formatWindow(event.start_time, event.end_time)));
  places.forEach((place) => addMarker(place.latitude, place.longitude, `Prayer Place: ${place.name}`, place.address));

  if (points.length > 0) {
    map.fitBounds(points, { padding: [30, 30] });
  }

  window.setTimeout(() => {
    if (!tileLoaded && tileErrors > 0 && leafletMap === map) {
      map.remove();
      leafletMap = null;
      renderFallbackMap(publicEvents, privateEvents, places);
    }
  }, 2500);
}

function renderData(pub, priv, times, places) {
  state.lastData = { pub, priv, places, prayerTimes: times };

  mountList("public-events", pub, (event) =>
    createItemCard(event.title, `${event.description}\n${formatWindow(event.start_time, event.end_time)}`, {
      id: `event-${event.event_id}`,
      title: event.title,
      description: event.description
    })
  );

  mountList("private-events", priv, (event) => createItemCard(event.title, `${event.description}\n${formatWindow(event.start_time, event.end_time)}`));

  mountList("places", places, (place) =>
    createItemCard(
      place.name,
      `${place.address}\nWudu: ${place.has_wudu ? "Yes" : "No"} | Women area: ${place.has_women_area ? "Yes" : "No"}`,
      {
        id: `place-${place.place_id}`,
        title: place.name,
        description: place.address
      }
    )
  );

  const prayerRoot = document.getElementById("prayer-times");
  if (prayerRoot) {
    prayerRoot.innerHTML = "";
    prayerRoot.classList.add("time-grid");
    const orderedNames = ["fajr", "dhuhr", "asr", "maghrib", "isha"];
    const entries = Object.entries((times && times.times) || {})
      .filter(([name]) => orderedNames.includes(name))
      .sort((a, b) => orderedNames.indexOf(a[0]) - orderedNames.indexOf(b[0]));

    entries.forEach(([name, value]) => {
      const row = document.createElement("div");
      row.className = "time-pill";
      row.innerHTML = `<span>${name.toUpperCase()}</span><strong>${value}</strong>`;
      prayerRoot.appendChild(row);
    });

    setPrayerLocationHelpVisible(entries.length === 0 || !hasPrayerTimes(times));
  }

  renderMap(pub, priv, places);
  renderFavorites();
  renderBookmark();
  renderPrayerTracker();
  renderTodayAmaal(parseIsoDate(state.amaalDate) || new Date());
}

function renderAllFromState() {
  applySettingsUI();
  setLibraryPanelVisibility(state.libraryOpen);
  if (state.libraryOpen) renderLibrarySection(state.libraryIndex);
  else updateLibraryActiveState();
  renderData(state.lastData.pub, state.lastData.priv, state.lastData.prayerTimes ?? { times: {} }, state.lastData.places);
}

function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  navigator.serviceWorker.register("./sw.js").catch(() => {});
}

const INSTALL_PROMPT_LAST_SHOWN_KEY = "alfaraj_install_prompt_last_shown";

function getTodayKey() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function hasShownInstallPromptToday() {
  try {
    return localStorage.getItem(INSTALL_PROMPT_LAST_SHOWN_KEY) === getTodayKey();
  } catch {
    return false;
  }
}

function markInstallPromptShownToday() {
  try {
    localStorage.setItem(INSTALL_PROMPT_LAST_SHOWN_KEY, getTodayKey());
  } catch {
    // no-op
  }
}

function removeInstallNudge() {
  const existing = document.getElementById("install-nudge");
  if (existing) existing.remove();
}

function showInstallNudge({ title, text, onInstall }) {
  removeInstallNudge();
  const nudge = document.createElement("section");
  nudge.id = "install-nudge";
  nudge.className = "install-nudge";
  nudge.setAttribute("role", "dialog");
  nudge.setAttribute("aria-live", "polite");
  nudge.innerHTML = `
    <button class="install-nudge-close" type="button" aria-label="Close">✕</button>
    <h3>${title}</h3>
    <p>${text}</p>
    <div class="install-nudge-actions">
      <button class="install-nudge-install" type="button">Install</button>
      <button class="install-nudge-later" type="button">Later</button>
    </div>
  `;
  document.body.appendChild(nudge);

  const close = () => removeInstallNudge();
  nudge.querySelector(".install-nudge-close")?.addEventListener("click", close);
  nudge.querySelector(".install-nudge-later")?.addEventListener("click", close);
  nudge.querySelector(".install-nudge-install")?.addEventListener("click", async () => {
    await onInstall();
    close();
  });
}

function wireInstallPrompt() {
  const installBtn = document.getElementById("install-app-btn");
  if (!installBtn) return;
  const params = new URLSearchParams(window.location.search);
  const libParam = params.get("library");
  const hasSharedDeepLink =
    (libParam === "marsiya" && Boolean(params.get("marsiya"))) ||
    (libParam === "quran" && Boolean(params.get("surah")));
  const ua = navigator.userAgent || "";
  const isIOS =
    /iPad|iPhone|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const isStandalone =
    window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
  const shouldShowSharedInstallNudge = hasSharedDeepLink && !isStandalone && !hasShownInstallPromptToday();

  async function triggerInstallFlow() {
    if (deferredInstallPrompt) {
      deferredInstallPrompt.prompt();
      try {
        await deferredInstallPrompt.userChoice;
      } catch {
        // no-op
      }
      deferredInstallPrompt = null;
      installBtn.classList.add("hidden");
      return;
    }

    if (isIOS && !isStandalone) {
      showInstallNudge({
        title: "Install Al Faraj",
        text: "On iPhone: tap Safari Share, then choose Add to Home Screen.",
        onInstall: async () => {}
      });
    }
  }

  if (isIOS && !isStandalone) {
    installBtn.classList.remove("hidden");
    installBtn.setAttribute("title", "Add to Home Screen");
    installBtn.setAttribute("aria-label", "Add to Home Screen");
    if (shouldShowSharedInstallNudge) {
      markInstallPromptShownToday();
      window.setTimeout(() => {
        showInstallNudge({
          title: "Install Al Faraj",
          text: "Install the app for quicker access to this shared page.",
          onInstall: triggerInstallFlow
        });
      }, 300);
    }
  }

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredInstallPrompt = event;
    installBtn.classList.remove("hidden");
    if (shouldShowSharedInstallNudge) {
      markInstallPromptShownToday();
      window.setTimeout(async () => {
        showInstallNudge({
          title: "Install Al Faraj",
          text: "Install the app for quicker access to this shared page.",
          onInstall: triggerInstallFlow
        });
      }, 300);
    }
  });

  installBtn.addEventListener("click", triggerInstallFlow);

  window.addEventListener("appinstalled", () => {
    deferredInstallPrompt = null;
    installBtn.classList.add("hidden");
    removeInstallNudge();
  });
}

async function load() {
  applySettingsUI();
  wireSettings();
  wireBookmark();
  registerServiceWorker();
  wireInstallPrompt();
  renderPrayerTracker();
  renderFavorites();
  renderBookmark();
  applyAmaalDateUI();
  wireAmaalDateControls();
  wirePrayerLocationControls();
  wireMobileSidebar();
  await loadMarsiyaCatalog();
  applyLibraryStateFromUrl();
  wireLibraryViewer();
  syncPrayerPanelPlacement();
  mobilePrayerPanelQuery.addEventListener("change", syncPrayerPanelPlacement);
  renderTodayAmaal(parseIsoDate(state.amaalDate) || new Date());

  try {
    const today = new Date().toISOString().slice(0, 10);
    const [pub, priv, places] = await Promise.all([
      getJSON("/api/v1/events/public"),
      getJSON("/api/v1/events/private?userId=u1"),
      getJSON("/api/v1/prayer-places")
    ]);

    let times;
    try {
      times = await getLivePrayerTimes(today);
    } catch {
      times = await getJSON(`/api/v1/prayer-times?date=${today}`);
    }

    renderData(pub, priv, times, places);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    ["public-events", "private-events", "prayer-times", "places", "map", "favorites", "bookmark-view"].forEach((id) => {
      const root = document.getElementById(id);
      if (!root) return;
      root.innerHTML = "";
      root.appendChild(createItemCard(t("loadFailed"), message));
    });
    renderPrayerTracker();
    renderTodayAmaal(parseIsoDate(state.amaalDate) || new Date());
  }
}

load();
