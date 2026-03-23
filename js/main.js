// ===== HARIZONE AIR - MAIN JAVASCRIPT =====

// OpenWeatherMap API Key (free key — replace with your own from openweathermap.org)
const WEATHER_API_KEY = "bd5e378503939ddaee76f12ad7a97608";
const WEATHER_BASE_URL = "https://api.openweathermap.org/data/2.5/weather";

// ===== WEATHER FUNCTION =====
async function getWeather(city, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = `<p style="color: var(--text-muted);">⏳ Loading weather for <strong>${city}</strong>...</p>`;

  try {
    const response = await fetch(
      `${WEATHER_BASE_URL}?q=${encodeURIComponent(city)}&appid=${WEATHER_API_KEY}&units=metric`
    );

    if (!response.ok) {
      throw new Error("City not found");
    }

    const data = await response.json();

    const iconCode = data.weather[0].icon;
    const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;

    container.innerHTML = `
      <div class="weather-widget">
        <h2>📍 ${data.name}, ${data.sys.country}</h2>
        <img src="${iconUrl}" alt="weather icon" style="width:80px;height:80px;border-radius:0;">
        <div class="weather-temp">${Math.round(data.main.temp)}°C</div>
        <div class="weather-desc">${data.weather[0].description}</div>
        <div class="weather-details">
          <div>💧 Humidity<br><strong>${data.main.humidity}%</strong></div>
          <div>🌬️ Wind<br><strong>${data.wind.speed} m/s</strong></div>
          <div>👁️ Feels Like<br><strong>${Math.round(data.main.feels_like)}°C</strong></div>
        </div>
      </div>
    `;
  } catch (error) {
    container.innerHTML = `<p style="color:#e05c5c;">❌ Could not get weather: ${error.message}</p>`;
  }
}

// ===== BUDGET CALCULATOR =====
function calculateBudget() {
  const destination = document.getElementById("dest")?.value || "Unknown";
  const days = parseInt(document.getElementById("days")?.value || 0);
  const travelers = parseInt(document.getElementById("travelers")?.value || 1);
  const style = document.getElementById("style")?.value || "budget";

  const rates = {
    budget: { hotel: 25, food: 15, transport: 10, activities: 8 },
    standard: { hotel: 80, food: 40, transport: 25, activities: 20 },
    luxury: { hotel: 250, food: 100, transport: 80, activities: 60 }
  };

  const r = rates[style];
  const perPerson = (r.hotel + r.food + r.transport + r.activities) * days;
  const total = perPerson * travelers;
  const flight = travelers * (style === "budget" ? 350 : style === "standard" ? 700 : 1500);
  const grand = total + flight;

  const result = document.getElementById("budget-result");
  if (result) {
    result.style.display = "block";
    result.innerHTML = `
      <strong>✈️ Trip to ${destination}</strong><br>
      📅 ${days} days · 👥 ${travelers} traveler(s) · 🏨 ${style.charAt(0).toUpperCase() + style.slice(1)} Class<br><br>
      🏨 Hotel: $${(r.hotel * days * travelers).toLocaleString()}<br>
      🍽️ Food: $${(r.food * days * travelers).toLocaleString()}<br>
      🚌 Transport: $${(r.transport * days * travelers).toLocaleString()}<br>
      🎭 Activities: $${(r.activities * days * travelers).toLocaleString()}<br>
      ✈️ Estimated Flights: $${flight.toLocaleString()}<br><br>
      <strong style="color: var(--gold); font-size:1.1rem;">Total Estimate: $${grand.toLocaleString()} USD</strong>
    `;
  }
}

// ===== DESTINATION SEARCH =====
function searchDestination() {
  const query = document.getElementById("dest-search")?.value.toLowerCase().trim();
  const cards = document.querySelectorAll(".dest-card");

  cards.forEach(card => {
    const name = card.getAttribute("data-name")?.toLowerCase() || "";
    card.style.display = name.includes(query) ? "block" : "none";
  });
}

// ===== WEATHER SEARCH ON PAGE =====
function searchWeather() {
  const city = document.getElementById("weather-city-input")?.value;
  if (city) {
    getWeather(city, "weather-output");
  }
}

// ===== AUTO-LOAD WEATHER ON WEATHER PAGE =====
window.addEventListener("DOMContentLoaded", () => {
  // Load default weather
  if (document.getElementById("weather-output")) {
    getWeather("Paris", "weather-output");
  }

  // Load mini weather on home page
  if (document.getElementById("home-weather")) {
    getWeather("Nairobi", "home-weather");
  }

  // Highlight active nav link
  const links = document.querySelectorAll(".nav-links a");
  const current = window.location.pathname.split("/").pop();
  links.forEach(link => {
    if (link.getAttribute("href") === current) {
      link.classList.add("active");
    }
  });
});