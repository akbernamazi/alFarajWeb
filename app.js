const DEFAULT_API_BASE_URL =
  window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://localhost:4000/api/v1"
    : "https://akbernamazi.github.io/alFarajService/api/v1";

const STORAGE_KEYS = {
  settings: "aza.settings.v1",
  favorites: "aza.favorites.v1",
  bookmark: "aza.bookmark.v1",
  tracker: "aza.tracker.v1",
  apiCachePrefix: "aza.api.cache."
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
  lastData: { pub: [], priv: [], places: [], prayerTimes: null }
};

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
  const raw = `${apiBaseUrl}${path}`;
  if (!apiBaseUrl.includes("github.io")) return raw;

  const url = new URL(raw);
  let cleanPath = url.pathname;
  if (cleanPath.endsWith("/events/private")) cleanPath = `${cleanPath}.json`;
  if (cleanPath.endsWith("/prayer-times")) cleanPath = `${cleanPath}.json`;
  if (cleanPath.endsWith("/events/public")) cleanPath = `${cleanPath}.json`;
  if (cleanPath.endsWith("/prayer-places")) cleanPath = `${cleanPath}.json`;
  if (cleanPath.endsWith("/health")) cleanPath = `${cleanPath}.json`;
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

  const star = favoriteItem
    ? `<button class="star-btn" data-fav-id="${favoriteItem.id}" title="Toggle favorite">${isFavorite(favoriteItem.id) ? "★" : "☆"}</button>`
    : "";

  el.innerHTML = `<div class="item-head"><h3>${title}</h3>${star}</div><p>${description}</p>`;
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

  root.innerHTML = `<div class="tracker-tip">${t("trackerTip")}</div>`;

  for (let day = 1; day <= daysInMonth; day += 1) {
    const key = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const btn = document.createElement("button");
    btn.className = `day-chip ${state.prayerTracker[key] ? "active" : ""}`;
    btn.textContent = String(day);
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

  const map = L.map("map", {
    zoomControl: true,
    scrollWheelZoom: false
  }).setView([17.385, 78.4867], 12);

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
    if (!tileLoaded && tileErrors > 0) {
      map.remove();
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
    Object.entries((times && times.times) || {})
      .filter(([name]) => name !== "date")
      .forEach(([name, value]) => {
        const row = document.createElement("div");
        row.className = "time-row";
        row.innerHTML = `<span>${name.toUpperCase()}</span><strong>${value}</strong>`;
        prayerRoot.appendChild(row);
      });
  }

  renderMap(pub, priv, places);
  renderFavorites();
  renderBookmark();
  renderPrayerTracker();
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

  try {
    const today = new Date().toISOString().slice(0, 10);
    const [pub, priv, times, places] = await Promise.all([
      getJSON("/api/v1/events/public"),
      getJSON("/api/v1/events/private?userId=u1"),
      getJSON(`/api/v1/prayer-times?date=${today}`),
      getJSON("/api/v1/prayer-places")
    ]);
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
  }
}

load();
