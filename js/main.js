// ===== HARIZONE AIR - MAIN JAVASCRIPT =====

const WEATHER_API_KEY = "bd5e378503939ddaee76f12ad7a97608";
const WEATHER_BASE_URL = "https://api.openweathermap.org/data/2.5/weather";

// ── Simple in-memory cache: city → {data, timestamp} ──
const weatherCache = {};
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

// ── Retry helper: tries fn up to `attempts` times with a delay between each ──
async function fetchWithRetry(url, attempts = 3, delayMs = 1500) {
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await fetch(url);

      // Rate-limited → wait and retry
      if (res.status === 429) {
        if (i < attempts - 1) {
          await new Promise(r => setTimeout(r, delayMs * (i + 1)));
          continue;
        }
        throw new Error("rate_limited");
      }

      // City not found → don't retry
      if (res.status === 404) throw new Error("city_not_found");

      // Other server errors → retry
      if (!res.ok) {
        if (i < attempts - 1) {
          await new Promise(r => setTimeout(r, delayMs));
          continue;
        }
        throw new Error("server_error");
      }

      return await res.json();

    } catch (err) {
      // Re-throw our labelled errors immediately
      if (["rate_limited", "city_not_found", "server_error"].includes(err.message)) throw err;
      // Network error → retry
      if (i < attempts - 1) {
        await new Promise(r => setTimeout(r, delayMs));
        continue;
      }
      throw new Error("network_error");
    }
  }
}

// ── Friendly error messages ──
function errorHTML(type, cityName) {
  const msgs = {
    rate_limited: {
      icon: "⏳",
      title: "Too many requests",
      body: "The weather service is busy right now. Please wait a moment and try again.",
      tip: "Free weather lookups are limited per minute — try again in 60 seconds."
    },
    city_not_found: {
      icon: "🔍",
      title: `"${cityName}" not found`,
      body: "Double-check the city name and try again. Use English names (e.g. <em>Rome</em>, <em>Nairobi</em>).",
      tip: "Tip: search for the main city rather than a neighbourhood or district."
    },
    server_error: {
      icon: "🌐",
      title: "Weather service unavailable",
      body: "The weather server returned an error. Please try again in a moment.",
      tip: ""
    },
    network_error: {
      icon: "📡",
      title: "No connection",
      body: "Check your internet connection and try again.",
      tip: ""
    }
  };

  const m = msgs[type] || msgs.server_error;
  return `
    <div style="max-width:480px;margin:0 auto;background:rgba(224,92,92,0.1);
    border:1px solid rgba(224,92,92,0.4);border-radius:14px;padding:22px 26px;text-align:center;">
      <div style="font-size:2rem;margin-bottom:8px;">${m.icon}</div>
      <strong style="color:#e05c5c;font-size:1rem;">${m.title}</strong>
      <p style="color:#c8d0dc;font-size:0.88rem;margin:10px 0 0;line-height:1.6;">${m.body}</p>
      ${m.tip ? `<p style="color:#7a90a8;font-size:0.78rem;margin-top:10px;">💡 ${m.tip}</p>` : ""}
    </div>`;
}

// ===== TEMPERATURE-BASED TRAVEL ADVISORY =====
function getTemperatureAdvisory(tempC) {
  if (tempC >= 29) {
    return {
      type: "best",
      icon: "✅",
      label: "Great time to travel",
      message: `At ${tempC}°C the temperature is warm and pleasant — ideal for outdoor exploration.`,
      tip: "Pack sunscreen, light clothing, and stay hydrated."
    };
  } else if (tempC < 25) {
    return {
      type: "worst",
      icon: "⚠️",
      label: "Not advised for travel",
      message: `At ${tempC}°C the weather is cooler and may be uncomfortable for some travellers.`,
      tip: "Carry warm clothing and consider indoor attractions."
    };
  } else {
    return {
      type: "neutral",
      icon: "🌤️",
      label: "Decent travel conditions",
      message: `At ${tempC}°C the weather is mild and comfortable.`,
      tip: "A light jacket may be needed during evenings."
    };
  }
}

// ===== FETCH & DISPLAY WEATHER =====
async function getWeather(city, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const cacheKey = city.toLowerCase().trim();

  // Show loading state
  container.innerHTML = `
    <div style="max-width:480px;margin:0 auto;text-align:center;padding:30px 0;color:#8ca0c0;">
      <div style="font-size:2rem;animation:spin 1s linear infinite;display:inline-block;">🌐</div>
      <p style="margin-top:10px;font-size:0.9rem;">Loading weather for <strong style="color:#f3f6f2;">${city}</strong>…</p>
    </div>
    <style>@keyframes spin{to{transform:rotate(360deg)}}</style>`;

  try {
    let data;

    // Use cache if fresh
    const cached = weatherCache[cacheKey];
    if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
      data = cached.data;
    } else {
      const url = `${WEATHER_BASE_URL}?q=${encodeURIComponent(city)}&appid=${WEATHER_API_KEY}&units=metric`;
      data = await fetchWithRetry(url, 3, 1500);
      weatherCache[cacheKey] = { data, timestamp: Date.now() };
    }

    const tempC     = Math.round(data.main.temp);
    const feelsLike = Math.round(data.main.feels_like);
    const iconUrl   = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
    const advisory  = getTemperatureAdvisory(tempC);

    const rowClass =
      advisory.type === "best"  ? "advisory-best"  :
      advisory.type === "worst" ? "advisory-worst"  :
      "advisory-neutral";

    container.innerHTML = `
      <div class="weather-widget">
        <h2>📍 ${data.name}, ${data.sys.country}</h2>
        <img src="${iconUrl}" alt="Weather icon" width="80" height="80" style="border-radius:0;margin:0 auto;">
        <div class="weather-temp">${tempC}°C</div>
        <div class="weather-desc">${data.weather[0].description}</div>
        <div class="weather-details">
          <div>💧 Humidity<br><strong>${data.main.humidity}%</strong></div>
          <div>🌬️ Wind<br><strong>${data.wind.speed} m/s</strong></div>
          <div>👁️ Feels Like<br><strong>${feelsLike}°C</strong></div>
        </div>
      </div>
      <div class="travel-advisory">
        <div class="advisory-row ${rowClass}">
          <span class="advisory-icon">${advisory.icon}</span>
          <div>
            <strong>${advisory.label}</strong>
            <span>${advisory.message}</span>
          </div>
        </div>
        <p class="advisory-reason">💡 ${advisory.tip}</p>
      </div>`;

  } catch (err) {
    container.innerHTML = errorHTML(err.message, city);
  }
}

// ===== BUDGET CALCULATOR =====
function calculateBudget() {
  const destination = document.getElementById("dest")?.value || "Unknown";
  const days        = parseInt(document.getElementById("days")?.value) || 0;
  const travelers   = parseInt(document.getElementById("travelers")?.value) || 1;
  const style       = document.getElementById("style")?.value || "budget";

  const rates = {
    budget:   { hotel: 25,  food: 15,  transport: 10, activities: 8  },
    standard: { hotel: 80,  food: 40,  transport: 25, activities: 20 },
    luxury:   { hotel: 250, food: 100, transport: 80, activities: 60 }
  };

  const cost       = rates[style];
  const total      = (cost.hotel + cost.food + cost.transport + cost.activities) * days * travelers;
  const flight     = travelers * (style === "budget" ? 350 : style === "standard" ? 700 : 1500);
  const grandTotal = total + flight;

  const result = document.getElementById("budget-result");
  if (result) {
    result.style.display = "block";
    result.innerHTML = `
      <strong>✈️ Trip to ${destination}</strong><br>
      📅 ${days} days · 👥 ${travelers} traveler(s) ·  ${style}<br><br>
      🏨 Hotel: $${(cost.hotel * days * travelers).toLocaleString()}<br>
      🍽️ Food: $${(cost.food * days * travelers).toLocaleString()}<br>
      🚌 Transport: $${(cost.transport * days * travelers).toLocaleString()}<br>
      🎭 Activities: $${(cost.activities * days * travelers).toLocaleString()}<br>
      ✈️ Flights: $${flight.toLocaleString()}<br><br>
      <strong style="color:var(--gold);font-size:1.1rem;">Total: $${grandTotal.toLocaleString()} USD</strong>`;
  }
}

// ===== DESTINATION SEARCH =====
function searchDestination() {
  const query = document.getElementById("dest-search")?.value.toLowerCase().trim() || "";
  document.querySelectorAll(".dest-card").forEach(card => {
    const name = card.dataset.name?.toLowerCase() || "";
    card.style.display = name.includes(query) ? "block" : "none";
  });
}

// ===== WEATHER SEARCH (triggered by button or Enter key) =====
function searchWeather() {
  const city = document.getElementById("weather-city-input")?.value.trim();
  if (city) getWeather(city, "weather-output");
}

// ===== QUICK CITY BUTTONS =====
function quickWeather(city) {
  getWeather(city, "quick-weather-output");
}

// ===== DOM READY =====
window.addEventListener("DOMContentLoaded", () => {

  // Enter key in weather search input
  document.getElementById("weather-city-input")
    ?.addEventListener("keydown", e => { if (e.key === "Enter") searchWeather(); });

  // Auto-load weather on weather page
  if (document.getElementById("weather-output")) getWeather("Nairobi", "weather-output");

  // Mini weather widget on home page
  if (document.getElementById("home-weather")) getWeather("Nairobi", "home-weather");

  // Highlight active nav link
  const current = window.location.pathname.split("/").pop();
  document.querySelectorAll(".nav-links a").forEach(link => {
    if (link.getAttribute("href") === current) link.classList.add("active");
  });
});

  