const API_KEY = "485f9bc87c18cb5fc1bb5f1d37d19882";
const BASE_URL = "https://api.openweathermap.org/data/2.5";

const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const locationBtn = document.getElementById("locationBtn");
const errorMessage = document.getElementById("errorMessage");
const weatherIcon = document.getElementById("weatherIcon");

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
