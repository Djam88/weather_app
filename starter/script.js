document.addEventListener("DOMContentLoaded", function () {
  const elements = {
    inputEl: document.getElementById("city-input"),
    searchEl: document.getElementById("search-button"),
    clearEl: document.getElementById("clear-history"),
    nameEl: document.getElementById("city-name"),
    currentPicEl: document.getElementById("current-pic"),
    currentTempEl: document.getElementById("temperature"),
    currentHumidityEl: document.getElementById("humidity"),
    currentWindEl: document.getElementById("wind-speed"),
    currentUVEl: document.getElementById("UV-index"),
    historyEl: document.getElementById("history"),
  };

  let searchHistory = JSON.parse(localStorage.getItem("search")) || [];
  const APIKey = "5f8666da9776365c51c0682114c6ab9d";

  function getWeather(cityName) {
    fetchWeatherData(cityName)
      .then((data) => {
        renderCurrentWeather(data);
        renderUVIndex(data.coord.lat, data.coord.lon);
        return data.id;
      })
      .then((cityID) => fetchForecast(cityID))
      .then((forecastData) => renderForecast(forecastData));
  }

  function fetchWeatherData(cityName) {
    let queryURL =
      "https://api.openweathermap.org/data/2.5/weather?q=" +
      cityName +
      "&appid=" +
      APIKey;
    return fetch(queryURL).then((response) => response.json());
  }

  function fetchForecast(cityID) {
    let forecastQueryURL =
      "https://api.openweathermap.org/data/2.5/forecast?id=" +
      cityID +
      "&appid=" +
      APIKey;
    return fetch(forecastQueryURL).then((response) => response.json());
  }

  function renderCurrentWeather(data) {
    const currentDate = new Date(data.dt * 1000);
    const day = currentDate.getDate();
    const month = currentDate.getMonth() + 1;
    const year = currentDate.getFullYear();
    elements.nameEl.innerHTML =
      data.name + " (" + month + "/" + day + "/" + year + ") ";
    let weatherPic = data.weather[0].icon;
    elements.currentPicEl.setAttribute(
      "src",
      "https://openweathermap.org/img/wn/" + weatherPic + "@2x.png"
    );
    elements.currentPicEl.setAttribute("alt", data.weather[0].description);
    elements.currentTempEl.innerHTML =
      "Temperature: " + k2f(data.main.temp) + " &#176F";
    elements.currentHumidityEl.innerHTML =
      "Humidity: " + data.main.humidity + "%";
    elements.currentWindEl.innerHTML =
      "Wind Speed: " + data.wind.speed + " MPH";
  }

  function renderUVIndex(lat, lon) {
    let UVQueryURL =
      "https://api.openweathermap.org/data/2.5/uvi/forecast?lat=" +
      lat +
      "&lon=" +
      lon +
      "&appid=" +
      APIKey +
      "&cnt=1";
    fetch(UVQueryURL)
      .then((response) => response.json())
      .then((uvData) => {
        let UVIndex = document.createElement("span");
        UVIndex.setAttribute("class", "badge badge-danger");
        UVIndex.innerHTML = uvData[0].value;
        elements.currentUVEl.innerHTML = "UV Index: ";
        elements.currentUVEl.append(UVIndex);
      });
  }

  function renderForecast(forecastData) {
    const forecastEls = document.querySelectorAll(".forecast");
    for (let i = 0; i < forecastEls.length; i++) {
      forecastEls[i].innerHTML = "";
      const forecastIndex = i * 8 + 4;
      const forecastDate = new Date(forecastData.list[forecastIndex].dt * 1000);
      const forecastDay = forecastDate.getDate();
      const forecastMonth = forecastDate.getMonth() + 1;
      const forecastYear = forecastDate.getFullYear();
      const forecastDateEl = document.createElement("p");
      forecastDateEl.setAttribute("class", "mt-3 mb-0 forecast-date");
      forecastDateEl.innerHTML =
        forecastMonth + "/" + forecastDay + "/" + forecastYear;
      forecastEls[i].append(forecastDateEl);
      const forecastWeatherEl = document.createElement("img");
      forecastWeatherEl.setAttribute(
        "src",
        "https://openweathermap.org/img/wn/" +
          forecastData.list[forecastIndex].weather[0].icon +
          "@2x.png"
      );
      forecastWeatherEl.setAttribute(
        "alt",
        forecastData.list[forecastIndex].weather[0].description
      );
      forecastEls[i].append(forecastWeatherEl);
      const forecastTempEl = document.createElement("p");
      forecastTempEl.innerHTML =
        "Temp: " + k2f(forecastData.list[forecastIndex].main.temp) + " &#176F";
      forecastEls[i].append(forecastTempEl);
      const forecastHumidityEl = document.createElement("p");
      forecastHumidityEl.innerHTML =
        "Humidity: " + forecastData.list[forecastIndex].main.humidity + "%";
      forecastEls[i].append(forecastHumidityEl);
    }
  }

  elements.searchEl.addEventListener("click", function () {
    const searchTerm = elements.inputEl.value;
    getWeather(searchTerm);
    searchHistory.push(searchTerm);
    localStorage.setItem("search", JSON.stringify(searchHistory));
    renderSearchHistory();
  });

  elements.clearEl.addEventListener("click", function () {
    searchHistory = [];
    localStorage.setItem("search", JSON.stringify(searchHistory));
    renderSearchHistory();
  });

  function k2f(K) {
    return Math.floor((K - 273.15) * 1.8 + 32);
  }

  function renderSearchHistory() {
    elements.historyEl.innerHTML = "";
    for (let i = 0; i < searchHistory.length; i++) {
      const historyItem = document.createElement("input");
      historyItem.setAttribute("type", "text");
      historyItem.setAttribute("readonly", true);
      historyItem.setAttribute("class", "form-control d-block bg-white");
      historyItem.setAttribute("value", searchHistory[i]);
      historyItem.addEventListener("click", function () {
        getWeather(historyItem.value);
      });
      elements.historyEl.append(historyItem);
    }
  }

  renderSearchHistory();
  if (searchHistory.length > 0) {
    getWeather(searchHistory[searchHistory.length - 1]);
  }
});
