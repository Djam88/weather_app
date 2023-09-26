document.addEventListener("DOMContentLoaded", function () {
  // Constants
  const apiKey = "7f83aa2e08346202098dfd1ee67f065f";
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
        // Get the current date
        const currentDate = new Date();

        // Update the display with weather data and current date
        cityName.textContent = `${data.name} - ${currentDate.toLocaleDateString(
          "en-UK",
          { year: "numeric", month: "numeric", day: "numeric" }
        )}`;
        temperature.textContent = `Temperature: ${data.main.temp}°C`;
        humidity.textContent = `Humidity: ${data.main.humidity}%`;
        windSpeed.textContent = `Wind Speed: ${data.wind.speed} m/s`;
        // UV index from another API endpoint
        uvIndex.textContent = "UV Index: N/A";

        // Store search history
        addToSearchHistory(city);

        // Fetch and display weather icon
        const iconCode = data.weather[0].icon;
        const iconURL = `https://openweathermap.org/img/w/${iconCode}.png`;
        currentPic.src = iconURL;

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

  // Function to add a city to the search history
  function addToSearchHistory(city) {
    // Get existing search history from local storage
    let searchHistory = localStorage.getItem("searchHistory");

    // If there is no search history, initialize it as an empty array
    if (!searchHistory) {
      searchHistory = [];
    } else {
      // Parse the existing search history from JSON
      searchHistory = JSON.parse(searchHistory);
    }

    // Add the new city to the search history
    searchHistory.push(city);

    // Store the updated search history back in local storage
    localStorage.setItem("searchHistory", JSON.stringify(searchHistory));

    // Update the search history display
    updateSearchHistoryDisplay(searchHistory);
  }

  // Function to update the search history display
  function updateSearchHistoryDisplay(searchHistory) {
    // Clear the existing search history display
    historyForm.innerHTML = "";

    // Loop through the search history and create buttons
    searchHistory.forEach((city) => {
      const historyItem = document.createElement("button");
      historyItem.className = "btn btn-secondary history-item";
      historyItem.textContent = city;
      historyItem.addEventListener("click", function () {
        fetchWeatherData(city);
      });
      historyForm.appendChild(historyItem);
    });
  }

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
    // Clear search history from local storage
    localStorage.removeItem("searchHistory");

    // Clear the search history display
    historyForm.innerHTML = "";
  });

  // Load and display the initial search history from local storage
  const initialSearchHistory = localStorage.getItem("searchHistory");
  if (initialSearchHistory) {
    updateSearchHistoryDisplay(JSON.parse(initialSearchHistory));
  }

  // Call the function to fetch weather data with London as the default city
  fetchWeatherData("London");
});
