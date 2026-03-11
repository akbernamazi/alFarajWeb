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

const state = {
  settings: loadJSON(STORAGE_KEYS.settings, { language: "en", fontSize: 16, apiBaseUrl: "" }),
  favorites: loadJSON(STORAGE_KEYS.favorites, []),
  bookmark: loadJSON(STORAGE_KEYS.bookmark, null),
  prayerTracker: loadJSON(STORAGE_KEYS.tracker, {}),
  amaalDate: loadJSON(STORAGE_KEYS.amaalDate, new Date().toISOString().slice(0, 10)),
  lastData: { pub: [], priv: [], places: [], prayerTimes: null },
  locationSuggestions: {}
};
let leafletMap = null;

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

function getIslamicDateInfo(date) {
  try {
    const parts = new Intl.DateTimeFormat("en-TN-u-ca-islamic", {
      day: "numeric",
      month: "long",
      year: "numeric"
    }).formatToParts(date);
    const day = Number(parts.find((p) => p.type === "day")?.value ?? "0");
    const month = String(parts.find((p) => p.type === "month")?.value ?? "").toLowerCase();
    const year = Number(parts.find((p) => p.type === "year")?.value ?? "0");
    return { day, month, year };
  } catch {
    return { day: 0, month: "", year: 0 };
  }
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
    const h = new Intl.DateTimeFormat("en-TN-u-ca-islamic", { day: "2-digit", month: "short", year: "numeric" }).format(now);
    meta.textContent = `${plan.label} · ${g} · ${h} AH`;
  }
  root.innerHTML = "";
  appendAmaalGroup(root, "Recommended", plan.recommended || []);
  appendAmaalGroup(root, "Obligatory", plan.obligatory || []);
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
  renderData(state.lastData.pub, state.lastData.priv, state.lastData.prayerTimes ?? { times: {} }, state.lastData.places);
}

function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  navigator.serviceWorker.register("./sw.js").catch(() => {});
}

async function load() {
  applySettingsUI();
  wireSettings();
  wireBookmark();
  registerServiceWorker();
  renderPrayerTracker();
  renderFavorites();
  renderBookmark();
  applyAmaalDateUI();
  wireAmaalDateControls();
  wirePrayerLocationControls();
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
