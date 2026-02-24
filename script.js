const API_KEY = "485f9bc87c18cb5fc1bb5f1d37d19882";
const BASE_URL = "https://api.openweathermap.org/data/2.5";

const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const locationBtn = document.getElementById("locationBtn");
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
