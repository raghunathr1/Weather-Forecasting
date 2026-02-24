const API_KEY = "485f9bc87c18cb5fc1bb5f1d37d19882";
const BASE_URL = "https://api.openweathermap.org/data/2.5";

//  DOM ELEMENTS

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

//  STATE

let currentTempCelsius = null;
let isCelsius = true;

// EVENT LISTENERS

searchBtn.addEventListener("click", () => {
  const city = cityInput.value.trim();
  if (!city) {
    showError("Please enter a city name.");
    return;
  }
  fetchWeatherByCity(city);
});

locationBtn.addEventListener("click", getWeatherByLocation);

recentCitiesSelect.addEventListener("change", () => {
  const city = recentCitiesSelect.value;
  if (city) {
    fetchWeatherByCity(city);
  }
});

unitToggleBtn.addEventListener("click", toggleTemperatureUnit);

// FETCH FUNCTIONS

async function fetchWeatherByCity(city) {
  clearError();
  try {
    const currentRes = await fetch(
      `${BASE_URL}/weather?q=${city}&units=metric&appid=${API_KEY}`
    );

    if (!currentRes.ok) {
      throw new Error("City not found");
    }

    const currentData = await currentRes.json();
    displayCurrentWeather(currentData);
    saveRecentCity(currentData.name);

    fetchForecast(currentData.coord.lat, currentData.coord.lon);
  } catch (error) {
    showError(error.message);
  }
}

function getWeatherByLocation() {
  if (!navigator.geolocation) {
    showError("location is not supported by your browser.");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      fetchWeatherByCoords(latitude, longitude);
    },
    () => {
      showError("Unable to retrieve your location.");
    }
  );
}

async function fetchWeatherByCoords(lat, lon) {
  clearError();
  try {
    const currentRes = await fetch(
      `${BASE_URL}/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
    );

    const currentData = await currentRes.json();
    displayCurrentWeather(currentData);
    saveRecentCity(currentData.name);

    fetchForecast(lat, lon);
  } catch {
    showError("Failed to fetch weather data.");
  }
}

async function fetchForecast(lat, lon) {
  try {
    const forecastRes = await fetch(
      `${BASE_URL}/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
    );

    const forecastData = await forecastRes.json();
    displayForecast(forecastData.list);
  } catch {
    showError("Unable to fetch forecast data.");
  }
}

// DISPLAY FUNCTIONS

function displayCurrentWeather(data) {
  currentWeatherSection.classList.remove("hidden");
  forecastSection.classList.remove("hidden");

  cityNameEl.textContent = data.name;
  weatherConditionEl.textContent = data.weather[0].description;

  //  WEATHER ICON ADDED
  const iconCode = data.weather[0].icon;
  weatherIcon.src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  weatherIcon.alt = data.weather[0].description;

  currentTempCelsius = data.main.temp;
  isCelsius = true;
  updateTemperatureDisplay();

  humidityEl.textContent = `${data.main.humidity}%`;
  windEl.textContent = `${data.wind.speed} m/s`;

  applyWeatherAlert(data.main.temp);
  applyBackground(data.weather[0].main);
}

function displayForecast(forecastList) {
  forecastCardsContainer.innerHTML = "";

  const dailyForecasts = forecastList.filter((_, index) => index % 8 === 0);

  dailyForecasts.slice(0, 5).forEach((item) => {
    const date = new Date(item.dt_txt).toDateString();
    const temp = Math.round(item.main.temp);
    const humidity = item.main.humidity;
    const wind = item.wind.speed;

    const card = document.createElement("div");
    card.className = "forecast-card";

    card.innerHTML = `
      <p>${date}</p>
      <p>🌡 ${temp}°C</p>
      <p>💧 ${humidity}%</p>
      <p>💨 ${wind} m/s</p>
    `;

    forecastCardsContainer.appendChild(card);
  });
}

// HELPER FUNCTIONS

function toggleTemperatureUnit() {
  if (currentTempCelsius === null) return;
  isCelsius = !isCelsius;
  updateTemperatureDisplay();
}

function updateTemperatureDisplay() {
  if (isCelsius) {
    temperatureEl.textContent = `${Math.round(currentTempCelsius)}°C`;
  } else {
    const fahrenheit = currentTempCelsius * 1.8 + 32;
    temperatureEl.textContent = `${Math.round(fahrenheit)}°F`;
  }
}

function applyWeatherAlert(temp) {
  if (temp >= 40) {
    alertMessageEl.textContent = "Extreme Heat Alert!";
  } else {
    alertMessageEl.textContent = "No alerts";
  }
}

function applyBackground(condition) {
  document.body.classList.remove(
    "weather-clear",
    "weather-cloudy",
    "weather-rainy",
    "weather-hot"
  );

  if (condition.includes("Rain")) {
    document.body.classList.add("weather-rainy");
  } else if (condition.includes("Cloud")) {
    document.body.classList.add("weather-cloudy");
  } else if (condition.includes("Clear")) {
    document.body.classList.add("weather-clear");
  }

  if (currentTempCelsius >= 40) {
    document.body.classList.add("weather-hot");
  }
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

  if (cities.length === 0) return;

  recentContainer.classList.remove("hidden");
  recentCitiesSelect.innerHTML =
    '<option value="">Select a city</option>';

  cities.forEach((city) => {
    const option = document.createElement("option");
    option.value = city;
    option.textContent = city;
    recentCitiesSelect.appendChild(option);
  });
}

// ERROR HANDLING

function showError(message) {
  errorMessage.textContent = message;
  errorMessage.classList.remove("hidden");
}

function clearError() {
  errorMessage.textContent = "";
  errorMessage.classList.add("hidden");
}

// INITIAL LOAD

updateRecentCities();
