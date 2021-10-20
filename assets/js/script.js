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
var renderFiveDayForecast = () => {
  for (var i = 0; i < 5; i++) {
    var fiveDayItemEl = document.createElement("div");
    fiveDayItemEl.setAttribute("class", "fiveDayItem");

    // date
    var fiveDayDateEl = document.createElement("h4");
    fiveDayDateEl.innerText = DateTime.now()
      .plus({ days: i + 1 })
      .toLocaleString();
    fiveDayItemEl.appendChild(fiveDayDateEl);

    // icon TODO: use api

    // temp TODO: use api
    var fiveDayTempEl = document.createElement("p");
    fiveDayItemEl.appendChild(fiveDayTempEl);

    // wind TODO: use api
    var fiveDayWindEl = document.createElement("p");
    fiveDayItemEl.appendChild(fiveDayWindEl);

    // humidity TODO: use api
    var fiveDayHumidityEl = document.createElement("p");
    fiveDayItemEl.appendChild(fiveDayHumidityEl);

    // render to container
    fiveDayForecastContainerEl.appendChild(fiveDayItemEl);
  }
};
renderFiveDayForecast();

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
      return {
        lat: data[0].lat,
        lon: data[0].lon,
        string: data[0].name + ", " + data[0].state,
      };
    })
    .then((location) => getForecast(location));
};

// the api call to open weather onecall
var getForecast = (location) => {
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
        console.log(data);
        // create img for icon
        var iconCode = data.current.weather[0].icon;
        var iconEl = document.createElement("img");
        iconEl.setAttribute(
          "src",
          "http://openweathermap.org/img/wn/" + iconCode + ".png"
        );

        // render data to detailed forecast
        cityDateIconContainerEl.innerText = location.string + " " + currentDate;
        // add icon
        cityDateIconContainerEl.appendChild(iconEl);

        tempEl.innerText += " " + Math.round(data.current.temp);
        windEl.innerText += " " + data.current.wind_speed + " MPH";
        humidityEl.innerText += " " + data.current.humidity + " %";
        uvIndexEl.innerText += " " + data.current.uvi;
      })
      .catch((error) => {
        //TODO:alert("There was a problem with the request.");
        console.error(error);
      });
  }
};

getLocation("london, ky");
