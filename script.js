// OpenWeatherMap API key
const API_KEY = 'dc0bea70da8e805e8d4947626f8b47f9';

// Selecting DOM elements
const cityInput = document.getElementById("city_input");
const searchBtn = document.getElementById("searchBtn");
const locationBtn = document.getElementById("locationBtn");
const weatherResult = document.getElementById("weather-result");
const weatherLeft = document.querySelector(".weather-left");
const weatherRight = document.querySelector(".weather-right");

console.log("Script loaded successfully!");

// Event listeners
searchBtn.addEventListener("click", () => {
  const city = cityInput.value.trim();
  if (city) {
    fetchWeatherData(city);
  } else {
    alert("Please enter a city name.");
  }
});

locationBtn.addEventListener("click", () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        fetchWeatherByCoords(latitude, longitude);
      },
      (error) => {
        alert("Unable to retrieve location. Please try again.");
      }
    );
  } else {
    alert("Geolocation is not supported by this browser.");
  }
});

// Fetch weather data by city name
async function fetchWeatherData(city) {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_KEY}`
    );
    const data = await response.json();
    if (data.cod === 200) {
      updateUI(data);
      fetchForecastData(city);
    } else {
      alert(data.message);
    }
  } catch (error) {
    console.error("Error fetching weather data:", error);
    alert("Failed to fetch weather data. Please try again.");
  }
}

// Fetch weather data by coordinates
async function fetchWeatherByCoords(lat, lon) {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
    );
    const data = await response.json();
    if (data.cod === 200) {
      updateUI(data);
      fetchForecastData(data.name);
    } else {
      alert(data.message);
    }
  } catch (error) {
    console.error("Error fetching weather data:", error);
    alert("Failed to fetch weather data. Please try again.");
  }
}

// Fetch 5-day forecast
async function fetchForecastData(city) {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${API_KEY}`
    );
    const data = await response.json();
    if (data.cod === "200") {
      updateForecastUI(data);
    } else {
      console.error("Failed to fetch forecast data:", data.message);
    }
  } catch (error) {
    console.error("Error fetching forecast data:", error);
  }
}

// Update UI with current weather data
function updateUI(data) {
  const { name, main, weather, wind, visibility, sys } = data;
  const { temp, humidity, pressure, feels_like } = main;
  const { description, icon } = weather[0];

  weatherResult.innerHTML = `
    <h3>${name}</h3>
    <p>${description}</p>
  `;

  weatherLeft.innerHTML = `
    <div class="card">
      <div class="current-weather">
        <div class="details">
          <p>Now</p>
          <h2>${Math.round(temp)}°C</h2>
          <p>${description}</p>
        </div>
        <div class="weather-icon">
          <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="${description}">
        </div>
      </div>
      <hr>
      <div class="card-footer">
        <p><i class="fa-light fa-calendar"></i> ${new Date().toLocaleDateString()}</p>
        <p><i class="fa-light fa-location-dot"></i> ${name}</p>
      </div>
    </div>
  `;

  // Update highlights
  document.getElementById("humidityval").textContent = `${humidity}%`;
  document.getElementById("pressureval").textContent = `${pressure} hPa`;
  document.getElementById("visibilityval").textContent = `${(visibility / 1000).toFixed(1)} km`;
  document.getElementById("windspeedval").textContent = `${wind.speed} m/s`;
  document.getElementById("feelsval").textContent = `${Math.round(feels_like)}°C`;

  // Sunrise and Sunset
  const sunrise = new Date(sys.sunrise * 1000).toLocaleTimeString();
  const sunset = new Date(sys.sunset * 1000).toLocaleTimeString();
  document.querySelector(".sunrise-sunset .item:nth-child(1) h2").textContent = sunrise;
  document.querySelector(".sunrise-sunset .item:nth-child(2) h2").textContent = sunset;
}

// Update UI with 5-day forecast data
function updateForecastUI(data) {
  const forecastItems = data.list.filter((item) => item.dt_txt.includes("12:00:00"));
  const forecastContainer = document.querySelector(".day-forecast");
  forecastContainer.innerHTML = forecastItems
    .map((forecast) => {
      const { dt_txt, main, weather } = forecast;
      const { temp } = main;
      const { icon, description } = weather[0];
      return `
        <div class="forecast-item">
          <div class="icon-wrapper">
            <img src="https://openweathermap.org/img/wn/${icon}.png" alt="${description}">
            <span>${Math.round(temp)}°C</span>
          </div>
          <p>${new Date(dt_txt).toLocaleDateString()}</p>
          <p>${description}</p>
        </div>
      `;
    })
    .join("");
}
