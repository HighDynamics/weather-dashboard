// setup luxon
var DateTime = luxon.DateTime;
var currentDate = DateTime.now().toLocaleString();

// target elements
var cityInputEl = document.getElementById("city-input");
var searchBtn = document.getElementById("search-button");
var searchHistoryContainerEl = document.getElementById(
  "search-history-container"
);
var cityDateIconContainerEl = document.getElementById(
  "city-date-icon-container"
);
var tempEl = document.getElementById("temp");
var windEl = document.getElementById("wind");
var humidityEl = document.getElementById("humidity");
var uvIndexEl = document.getElementById("uv-index");
var fiveDayForecastContainerEl = document.getElementById("five-day-container");

// render date
cityDateIconContainerEl.innerText = currentDate;

// render 5-day forecast
var renderFiveDayForecast = (dailyArray) => {
  // clear previous 5-day forecast
  fiveDayForecastContainerEl.innerHTML = "";

  // create new elements
  for (var i = 0; i < 5; i++) {
    var selectedDate = dailyArray[i];
    var fiveDayItemEl = document.createElement("div");
    fiveDayItemEl.setAttribute("class", "fiveDayItem");

    // date
    var fiveDayDateEl = document.createElement("h4");
    fiveDayDateEl.innerText = DateTime.now()
      .plus({ days: i + 1 })
      .toLocaleString();
    fiveDayItemEl.appendChild(fiveDayDateEl);

    // icon
    var iconCode = selectedDate.weather[0].icon;
    var fiveDayIconEl = document.createElement("img");
    fiveDayIconEl.setAttribute(
      "src",
      "http://openweathermap.org/img/wn/" + iconCode + ".png"
    );
    fiveDayItemEl.appendChild(fiveDayIconEl);

    // temp
    var fiveDayTempEl = document.createElement("p");
    fiveDayTempEl.innerText = "Temp: " + selectedDate.temp.day + " \u00BAF";
    fiveDayItemEl.appendChild(fiveDayTempEl);

    // wind
    var fiveDayWindEl = document.createElement("p");
    fiveDayWindEl.innerText = "Wind: " + selectedDate.wind_speed + " MPH";
    fiveDayItemEl.appendChild(fiveDayWindEl);

    // humidity
    var fiveDayHumidityEl = document.createElement("p");
    fiveDayHumidityEl.innerText = "Humidity: " + selectedDate.humidity + "%";
    fiveDayItemEl.appendChild(fiveDayHumidityEl);

    // render to container
    fiveDayForecastContainerEl.appendChild(fiveDayItemEl);
  }
};

// the api call to open weather geo
var getLocation = (input) => {
  var inputArray = input.split(",");
  var apiCity = inputArray[0].trim().replace(" ", "+");
  var apiState = inputArray[1] ? inputArray[1].trim().replace(" ", "+") : "";

  var apiEndpoint =
    "http://api.openweathermap.org/geo/1.0/direct?q=" +
    apiCity +
    "," +
    apiState +
    ",us&limit=1&appid=4afb253040e7beb67564a44b1a358f8d";

  fetch(apiEndpoint)
    .then((response) => {
      if (response.ok) {
        return response.json();
      }
    })
    .then((data) => {
      if (data.length === 0) {
        alert("City not found, try again");
        return;
      }

      var dataObject = {
        lat: data[0].lat,
        lon: data[0].lon,
        string: data[0].name + ", " + data[0].state,
        storageKey: data[0].name + data[0].state,
      };

      // persist to local storage if not previously saved
      if (!localStorage[dataObject.storageKey]) {
        saveSearch(dataObject);
      }

      return dataObject;
    })
    .then((location) => getForecast(location));
};

// the api call to open weather onecall
var getForecast = (location) => {
  // reset previous values
  cityDateIconContainerEl.innerText = "";
  tempEl.innerText = "Temp:";
  windEl.innerText = "Wind:";
  humidityEl.innerText = "Humidity:";
  uvIndexEl.innerText = "UV index:";

  if (location) {
    fetch(
      "https://api.openweathermap.org/data/2.5/onecall?lat=" +
        location.lat +
        "&lon=" +
        location.lon +
        "&units=imperial&appid=4afb253040e7beb67564a44b1a358f8d"
    )
      .then((response) => {
        if (response.ok) {
          return response.json();
        }
      })
      .then((data) => {
        // render data to detailed forecast
        cityDateIconContainerEl.innerText = location.string + " " + currentDate;
        tempEl.innerText += " " + data.current.temp + " \u00BAF";
        windEl.innerText += " " + data.current.wind_speed + " MPH";
        humidityEl.innerText += " " + data.current.humidity + "%";
        uvIndexEl.innerText += " " + data.current.uvi;

        // create and append img for icon
        var iconCode = data.current.weather[0].icon;
        var iconEl = document.createElement("img");
        iconEl.setAttribute(
          "src",
          "http://openweathermap.org/img/wn/" + iconCode + ".png"
        );
        cityDateIconContainerEl.appendChild(iconEl);

        renderFiveDayForecast(data.daily);
      })
      .catch((error) => {
        //TODO:alert("There was a problem with the request.");
        console.error(error);
      });
  }
};

// when 'search' button is clicked
var handleSearch = () => {
  // sentinel
  if (!cityInputEl.value) {
    alert("Please enter a city to search.");
    return;
  }

  var value = cityInputEl.value;

  getLocation(value);

  // clear input
  cityInputEl.value = "";
};

// create buttons from localStorage
var createSavedSearchButton = (dataObject) => {
  var savedSearchButton = document.createElement("button");
  savedSearchButton.setAttribute("class", "btn");
  savedSearchButton.setAttribute("data-city", dataObject.storageKey);
  savedSearchButton.innerText = dataObject.string;

  searchHistoryContainerEl.appendChild(savedSearchButton);
};

var saveSearch = (dataObject) => {
  createSavedSearchButton(dataObject);

  localStorage[dataObject.storageKey] = JSON.stringify(dataObject);
};

var handleSavedSearchClick = (event) => {
  var city = event.target.getAttribute("data-city");
  getForecast(JSON.parse(localStorage[city]));
};

// check local storage for data; render if available
var renderSavedSearches = () => {
  // sentinel
  if (localStorage.length === 0) {
    return;
  }

  for (var i = 0; i < localStorage.length; i++) {
    var data = JSON.parse(localStorage.getItem(localStorage.key(i)));
    createSavedSearchButton(data);
  }
};
renderSavedSearches();

searchBtn.addEventListener("click", handleSearch);
searchHistoryContainerEl.addEventListener("click", handleSavedSearchClick);