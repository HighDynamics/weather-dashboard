// setup luxon
var DateTime = luxon.DateTime;
var currentDate = DateTime.now().toLocaleString();

// target elements
var cityInputEl = document.getElementById("city-input");
var searchBtn = document.getElementById("search-button");
var searchHistoryContainerEl = document.getElementById(
  "search-history-container"
);
var cityDateContainerEl = document.getElementById("city-date-container");
var iconContainerEl = document.getElementById("icon-container");
var tempEl = document.getElementById("temp");
var windEl = document.getElementById("wind");
var humidityEl = document.getElementById("humidity");
var uvIndexContainerEl = document.getElementById("uv-index-container");
console.log(uvIndexContainerEl);
var uvIndexKeyEl = document.getElementById("uv-index-key");
var fiveDayForecastContainerEl = document.getElementById("five-day-container");

// render date
cityDateContainerEl.innerText = currentDate;

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
  cityDateContainerEl.innerText = "";
  tempEl.innerText = "Temp:";
  windEl.innerText = "Wind:";
  humidityEl.innerText = "Humidity:";
  uvIndexKeyEl.innerText = "UV index:";

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
        var cityNameEl = document.createElement("h3");
        var dateEl = document.createElement("span");
        dateEl.setAttribute("class", "date");

        cityNameEl.innerText = location.string;
        dateEl.innerText = currentDate;

        // empty container and append elements
        cityDateContainerEl.innerText = "";
        cityDateContainerEl.append(cityNameEl, dateEl);

        // render data to detailed forecast
        tempEl.innerText += " " + data.current.temp + " \u00BAF";
        windEl.innerText += " " + data.current.wind_speed + " MPH";
        humidityEl.innerText += " " + data.current.humidity + "%";

        var uvIndex = data.current.uvi;
        var uvIndexValueEl = document.createElement("span");
        uvIndexValueEl.innerText = uvIndex;

        // apply color to uv index
        switch (true) {
          case uvIndex < 3:
            uvIndexValueEl.setAttribute(
              "style",
              "background-color: rgb(111 192	131)"
            );
            break;
          case uvIndex > 2 && uvIndex < 6:
            uvIndexValueEl.setAttribute(
              "style",
              "background-color: rgb(255 215	49)"
            );
            break;
          case uvIndex > 5 && uvIndex < 8:
            uvIndexValueEl.setAttribute(
              "style",
              "background-color: rgb(240 121	43)"
            );
            break;
          case uvIndex > 7 && uvIndex < 11:
            uvIndexValueEl.setAttribute(
              "style",
              "background-color: rgb(247 28 40)"
            );
            break;
          case uvIndex > 10:
            uvIndexValueEl.setAttribute(
              "style",
              "background-color: rgb(221 47 120)"
            );
            break;
          default:
            break;
        }

        // replace index value with new or append new
        var oldUvIndexValueEl = document.querySelector(
          "#uv-index-container span"
        );
        if (oldUvIndexValueEl) {
          oldUvIndexValueEl.replaceWith(uvIndexValueEl);
        } else {
          uvIndexContainerEl.appendChild(uvIndexValueEl);
        }

        // remove old icon, render new icon
        iconContainerEl.innerHTML = ""
        var iconCode = data.current.weather[0].icon;
        var iconEl = document.createElement("img");
        iconEl.setAttribute(
          "src",
          "http://openweathermap.org/img/wn/" + iconCode + ".png"
        );
        iconContainerEl.appendChild(iconEl);

        renderFiveDayForecast(data.daily);
      })
      .catch((error) => {
        //TODO:alert("There was a problem with the request.");
        console.error(error);
      });
  }
};

// render 5-day forecast
var renderFiveDayForecast = (dailyArray) => {
  // clear previous 5-day forecast
  fiveDayForecastContainerEl.innerHTML = "";

  // create new elements
  for (var i = 0; i < 5; i++) {
    var selectedDate = dailyArray[i];
    var fiveDayItemEl = document.createElement("div");
    fiveDayItemEl.setAttribute("class", "five-day-item");

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
    var fiveDayTempContainerEl = document.createElement("div");
    var fiveDayTempKeyEl = document.createElement("p");
    var fiveDayTempValueEl = document.createElement("span");

    fiveDayTempKeyEl.innerText = "Temp";
    fiveDayTempValueEl.innerText = selectedDate.temp.day + " \u00BAF";

    fiveDayTempContainerEl.append(fiveDayTempKeyEl, fiveDayTempValueEl);
    fiveDayItemEl.appendChild(fiveDayTempContainerEl);

    // wind
    var fiveDayWindContainerEl = document.createElement("div");
    var fiveDayWindKeyEl = document.createElement("p");
    var fiveDayWindValueEl = document.createElement("span");

    fiveDayWindKeyEl.innerText = "Wind";
    fiveDayWindValueEl.innerText = selectedDate.wind_speed + " MPH";

    fiveDayWindContainerEl.append(fiveDayWindKeyEl, fiveDayWindValueEl);
    fiveDayItemEl.appendChild(fiveDayWindContainerEl);

    // humidity
    var fiveDayHumidityContainerEl = document.createElement("div");
    var fiveDayHumidityKeyEl = document.createElement("p");
    var fiveDayHumidityValueEl = document.createElement("span");

    fiveDayHumidityKeyEl.innerText = "Humidity";
    fiveDayHumidityValueEl.innerText = selectedDate.humidity + "%";

    fiveDayHumidityContainerEl.append(
      fiveDayHumidityKeyEl,
      fiveDayHumidityValueEl
    );
    fiveDayItemEl.appendChild(fiveDayHumidityContainerEl);

    // render to container
    fiveDayForecastContainerEl.appendChild(fiveDayItemEl);
  }
};

// create buttons from localStorage
var createSavedSearchButton = (dataObject) => {
  var savedSearchButton = document.createElement("button");
  savedSearchButton.setAttribute("class", "btn");
  savedSearchButton.setAttribute("data-city", dataObject.storageKey);
  savedSearchButton.innerText = dataObject.string;

  searchHistoryContainerEl.appendChild(savedSearchButton);
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

// when a saved city is clicked
var handleSavedSearchClick = (event) => {
  var city = event.target.getAttribute("data-city");
  getForecast(JSON.parse(localStorage[city]));
};

// save data to localStorage
var saveSearch = (dataObject) => {
  createSavedSearchButton(dataObject);

  localStorage[dataObject.storageKey] = JSON.stringify(dataObject);
};

// check localStorage for data; render if available
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
