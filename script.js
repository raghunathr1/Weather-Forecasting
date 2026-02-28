const API_KEY = "485f9bc87c18cb5fc1bb5f1d37d19882";
const BASE_URL = "https://api.openweathermap.org/data/2.5";

// DOM

const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const locationBtn = document.getElementById("locationBtn");
const errorMessage = document.getElementById("errorMessage");
const weatherIcon = document.getElementById("weatherIcon");

const currentWeatherSection = document.getElementById("currentWeather");
const forecastSection = document.getElementById("forecastSection");

const cityNameEl = document.getElementById("cityName");
const weatherConditionEl = document.getElementById("weatherCondition");
const temperatureEl = document.getElementById("temperature");
const humidityEl = document.getElementById("humidity");
const windEl = document.getElementById("wind");
const alertMessageEl = document.getElementById("alertMessage");
const unitToggleBtn = document.getElementById("unitToggle");

const recentContainer = document.getElementById("recentContainer");
const recentCitiesSelect = document.getElementById("recentCities");
const forecastCardsContainer = document.getElementById("forecastCards");

// STATE

let currentTempCelsius = null;
let isCelsius = true;

// DATE FORMATT

function formatFullDate(dateObj) {
  return dateObj.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatShortDate(dateString) {
  const d = new Date(dateString);
  return d.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

// EVENTS

searchBtn.addEventListener("click", () => {
  const city = cityInput.value.trim();
  if (!city) return showError("Please enter a city name.");
  fetchWeatherByCity(city);
});

locationBtn.addEventListener("click", getWeatherByLocation);

recentCitiesSelect.addEventListener("change", () => {
  const city = recentCitiesSelect.value;
  if (city) fetchWeatherByCity(city);
});

unitToggleBtn.addEventListener("click", toggleTemperatureUnit);

// FETCH WEATHER

async function fetchWeatherByCity(city) {
  clearError();

  try {
    const res = await fetch(
      `${BASE_URL}/weather?q=${city}&units=metric&appid=${API_KEY}`
    );

    if (!res.ok) throw new Error("City not found");

    const data = await res.json();

    displayCurrentWeather(data);
    saveRecentCity(data.name);

    fetchForecast(data.coord.lat, data.coord.lon);
  } catch (err) {
    showError(err.message);
  }
}

function getWeatherByLocation() {
  navigator.geolocation.getCurrentPosition((pos) => {
    fetchWeatherByCoords(pos.coords.latitude, pos.coords.longitude);
  });
}

async function fetchWeatherByCoords(lat, lon) {
  const res = await fetch(
    `${BASE_URL}/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
  );

  const data = await res.json();
  displayCurrentWeather(data);
  fetchForecast(lat, lon);
}

async function fetchForecast(lat, lon) {
  const res = await fetch(
    `${BASE_URL}/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
  );

  const data = await res.json();
  displayForecast(data.list);
}

//  CURRENT WEATHER

function displayCurrentWeather(data) {
  currentWeatherSection.classList.remove("hidden");
  forecastSection.classList.remove("hidden");

  cityNameEl.innerHTML = `
    ${data.name}
    <div class="date">${formatFullDate(new Date())}</div>
  `;

  weatherConditionEl.textContent = data.weather[0].description;

  weatherIcon.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;

  currentTempCelsius = data.main.temp;
  isCelsius = true;
  updateTemperatureDisplay();

  humidityEl.textContent = `${data.main.humidity}%`;
  windEl.textContent = `${data.wind.speed} m/s`;

  applyWeatherAlert(data.main.temp);
  applyBackground(data.weather[0].main);
}

// 5 DAY FORECAST

function displayForecast(list) {
  forecastCardsContainer.innerHTML = "";

  const daily = list.filter(item => item.dt_txt.includes("12:00:00"));

  daily.slice(1, 6).forEach(day => {
    const card = document.createElement("div");
    card.className = "forecast-card";

    card.innerHTML = `
      <h3>${formatShortDate(day.dt_txt)}</h3>
      <p>🌡️ ${Math.round(day.main.temp)}°C</p>
      <p>💧 ${day.main.humidity}%</p>
      <p>💨 ${day.wind.speed} m/s</p>
    `;
    

    forecastCardsContainer.appendChild(card);
  });
}

//  TEMP TOGGLE

function toggleTemperatureUnit() {
  if (currentTempCelsius === null) return;
  isCelsius = !isCelsius;
  updateTemperatureDisplay();
}

function updateTemperatureDisplay() {
  temperatureEl.textContent = isCelsius
    ? `${Math.round(currentTempCelsius)}°C`
    : `${Math.round(currentTempCelsius * 1.8 + 32)}°F`;
}

// ALERT

function applyWeatherAlert(temp) {
  alertMessageEl.textContent =
    temp >= 40 ? "Extreme Heat Alert!" : "No alerts";
}

// BACKGROUND

function applyBackground(condition) {
  document.body.className = "";

  if (condition.includes("Rain")) document.body.classList.add("weather-rainy");
  else if (condition.includes("Cloud")) document.body.classList.add("weather-cloudy");
  else if (condition.includes("Clear")) document.body.classList.add("weather-clear");

  if (currentTempCelsius >= 40) document.body.classList.add("weather-hot");
}

// RECENT CITIES

function saveRecentCity(city) {
  let cities = JSON.parse(localStorage.getItem("recentCities")) || [];

  if (!cities.includes(city)) {
    cities.unshift(city);
    if (cities.length > 5) cities.pop();
  }

  localStorage.setItem("recentCities", JSON.stringify(cities));
  updateRecentCities();
}

function updateRecentCities() {
  const cities = JSON.parse(localStorage.getItem("recentCities")) || [];

  if (!cities.length) return;

  recentContainer.classList.remove("hidden");
  recentCitiesSelect.innerHTML = `<option value="">Select a city</option>`;

  cities.forEach(city => {
    const option = document.createElement("option");
    option.value = city;
    option.textContent = city;
    recentCitiesSelect.appendChild(option);
  });
}

// ERROR

function showError(msg) {
  errorMessage.textContent = msg;
  errorMessage.classList.remove("hidden");
}

function clearError() {
  errorMessage.classList.add("hidden");
}

// INIT

updateRecentCities();
