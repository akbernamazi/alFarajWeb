const DEFAULT_API_BASE_URL =
  window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://localhost:4000/api/v1"
    : "https://api.example.com/api/v1";
const API_BASE_URL = (window.AZA_API_BASE_URL || DEFAULT_API_BASE_URL).replace(/\/+$/, "");

async function getJSON(path) {
  const res = await fetch(`${API_BASE_URL}${path}`);
  if (!res.ok) throw new Error(`Request failed: ${res.status} (${path})`);
  return res.json();
}

function card(title, description) {
  const el = document.createElement("article");
  el.className = "item";
  el.innerHTML = `<h3>${title}</h3><p>${description}</p>`;
  return el;
}

function mountList(id, rows, makeNode) {
  const root = document.getElementById(id);
  root.innerHTML = "";
  if (!rows.length) {
    root.appendChild(card("Nothing yet", "No records available."));
    return;
  }
  rows.forEach((row) => root.appendChild(makeNode(row)));
}

function formatWindow(start, end) {
  return `${new Date(start).toLocaleString()} to ${new Date(end).toLocaleTimeString()}`;
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
      (point) =>
        `<g><circle cx="${toX(point.lng)}" cy="${toY(point.lat)}" r="1.7"></circle><title>${point.label}</title></g>`
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

  publicEvents.forEach((event) =>
    addMarker(event.latitude, event.longitude, `Public: ${event.title}`, formatWindow(event.start_time, event.end_time))
  );
  privateEvents.forEach((event) =>
    addMarker(event.latitude, event.longitude, `Private: ${event.title}`, formatWindow(event.start_time, event.end_time))
  );
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

async function load() {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const [pub, priv, times, places] = await Promise.all([
      getJSON("/events/public"),
      getJSON("/events/private?userId=u1"),
      getJSON(`/prayer-times?date=${today}`),
      getJSON("/prayer-places")
    ]);

    mountList("public-events", pub, (event) => card(event.title, `${event.description}\n${formatWindow(event.start_time, event.end_time)}`));
    mountList("private-events", priv, (event) => card(event.title, `${event.description}\n${formatWindow(event.start_time, event.end_time)}`));
    mountList("places", places, (place) =>
      card(
        place.name,
        `${place.address}\nWudu: ${place.has_wudu ? "Yes" : "No"} | Women area: ${place.has_women_area ? "Yes" : "No"} | Parking: ${place.has_parking ? "Yes" : "No"}`
      )
    );

    const prayerRoot = document.getElementById("prayer-times");
    prayerRoot.innerHTML = "";
    Object.entries(times.times)
      .filter(([name]) => name !== "date")
      .forEach(([name, value]) => {
        const row = document.createElement("div");
        row.className = "time-row";
        row.innerHTML = `<span>${name.toUpperCase()}</span><strong>${value}</strong>`;
        prayerRoot.appendChild(row);
      });

    renderMap(pub, priv, places);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    ["public-events", "private-events", "prayer-times", "places", "map"].forEach((id) => {
      const root = document.getElementById(id);
      if (!root) return;
      root.innerHTML = "";
      root.appendChild(card("Load failed", message));
    });
  }
}

load();
