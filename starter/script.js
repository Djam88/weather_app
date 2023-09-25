document.addEventListener("DOMContentLoaded", function () {
  // Constants
  const apiKey = "dac08af8ea689414f3702cb1ea5bf065"; // Replace with your OpenWeatherMap API key
  const historyForm = document.getElementById("history");
  const cityInput = document.getElementById("city-input");
  const searchButton = document.getElementById("search-button");
  const clearHistoryButton = document.getElementById("clear-history");
  const cityName = document.getElementById("city-name");
  const currentPic = document.getElementById("current-pic");
  const temperature = document.getElementById("temperature");
  const humidity = document.getElementById("humidity");
  const windSpeed = document.getElementById("wind-speed");
  const uvIndex = document.getElementById("UV-index");
  const forecastDivs = document.querySelectorAll(".forecast-card");

  // Function to fetch weather data
  function fetchWeatherData(city) {
    const queryURL = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

    fetch(queryURL)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        // Update the display with weather data
        cityName.textContent = data.name;
        temperature.textContent = `Temperature: ${data.main.temp}°C`;
        humidity.textContent = `Humidity: ${data.main.humidity}%`;
        windSpeed.textContent = `Wind Speed: ${data.wind.speed} m/s`;
        // You'll need to fetch UV index from another API endpoint or calculate it separately
        uvIndex.textContent = "UV Index: N/A";

        // Fetch and display weather icon
        const iconCode = data.weather[0].icon;
        const iconURL = `https://openweathermap.org/img/w/${iconCode}.png`;
        currentPic.src = iconURL;

        // Store search history
        const historyItem = document.createElement("button");
        historyItem.className = "btn btn-secondary";
        historyItem.textContent = city;
        historyItem.addEventListener("click", function () {
          fetchWeatherData(city);
        });
        historyForm.prepend(historyItem);

        // Fetch 5-day forecast data
        fetchFiveDayForecast(city);
      })
      .catch((error) => {
        console.error("There was a problem fetching the weather data:", error);
        // Handle errors here
      });
  }

  // Function to fetch 5-day forecast data
  function fetchFiveDayForecast(city) {
    const forecastURL = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;

    fetch(forecastURL)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((response) => {
        const forecastList = response.list;

        // Clear existing forecast cards
        forecastDivs.forEach((div) => {
          div.innerHTML = "";
        });

        // Loop through the forecast data and create cards for each day
        for (let i = 0; i < forecastList.length; i += 8) {
          const forecast = forecastList[i];
          const date = new Date(forecast.dt * 1000);
          const iconCode = forecast.weather[0].icon;
          const iconURL = `https://openweathermap.org/img/w/${iconCode}.png`;

          // Create a forecast card element
          const card = document.createElement("div");
          card.className = "forecast-card text-center mb-3";

          // Date
          const cardDate = document.createElement("p");
          cardDate.className = "date";
          cardDate.textContent = date.toLocaleDateString();
          card.appendChild(cardDate);

          // Weather Icon
          const cardIcon = document.createElement("img");
          cardIcon.src = iconURL;
          cardIcon.alt = "Weather Icon";
          cardIcon.className = "forecast-icon";
          card.appendChild(cardIcon);

          // Temperature
          const cardTemp = document.createElement("p");
          cardTemp.className = "temp";
          cardTemp.textContent = `Temp: ${forecast.main.temp}°C`;
          card.appendChild(cardTemp);

          // Humidity
          const cardHumidity = document.createElement("p");
          cardHumidity.className = "humidity";
          cardHumidity.textContent = `Humidity: ${forecast.main.humidity}%`;
          card.appendChild(cardHumidity);

          // Append the card to the appropriate forecast div
          const forecastDivIndex = Math.floor(i / 8); // Determine the index of the forecast div
          forecastDivs[forecastDivIndex].appendChild(card);
        }
      })
      .catch((error) => {
        console.error("There was a problem fetching the forecast data:", error);
        // Handle errors here
      });
  }

  // Call the function to fetch weather data with London as the default city
  fetchWeatherData("London");

  // Event handler for search button click
  searchButton.addEventListener("click", function () {
    const city = cityInput.value.trim();
    if (city === "") {
      return;
    }

    // Call the function to fetch weather data
    fetchWeatherData(city);
  });

  // Event handler for clear history button click
  clearHistoryButton.addEventListener("click", function () {
    historyForm.innerHTML = "";
    localStorage.clear();
  });
});
