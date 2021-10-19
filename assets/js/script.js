// setup luxon
var DateTime = luxon.DateTime

// target elements
var cityInputEl = document.getElementById("city-input");
var searchBtn = document.getElementById("search-button");
var searchHistoryContainerEl = document.getElementById(
  "search-history-container"
);
var cityDateIconContainerEl = document.getElementById("city-date-icon-container");
var tempEl = document.getElementById("temp");
var windEl = document.getElementById("wind");
var humidityEl = document.getElementById("humidity");
var uvIndexEl = document.getElementById("uv-index");
var fiveDayForecastContainerEl = document.getElementById("five-day-container")

// render date
cityDateIconContainerEl.innerText = DateTime.now().toLocaleString()

// render 5-day forecast
var renderFiveDayForecast = () => {
    for(var i = 0; i < 5; i++){
        var fiveDayItemEl = document.createElement("div")
        fiveDayItemEl.setAttribute("class", "fiveDayItem")

        // date
        var fiveDayDateEl = document.createElement("h4")
        fiveDayDateEl.innerText = DateTime.now().plus({days: i+1}).toLocaleString()
        fiveDayItemEl.appendChild(fiveDayDateEl)

        // icon TODO: use api

        // temp TODO: use api
        var fiveDayTempEl = document.createElement("p")
        fiveDayItemEl.appendChild(fiveDayTempEl)

        // wind TODO: use api
        var fiveDayWindEl = document.createElement("p")
        fiveDayItemEl.appendChild(fiveDayWindEl)

        // humidity TODO: use api
        var fiveDayHumidityEl = document.createElement("p")
        fiveDayItemEl.appendChild(fiveDayHumidityEl)

        // render to container
        fiveDayForecastContainerEl.appendChild(fiveDayItemEl)
    }
}
renderFiveDayForecast()
// the api call to open weather
var getForecast = (city) => {
  var apiCity = "";
  if (city) {
    apiCity = city.trim().toLowerCase().replace(" ", "+");
  } else {
    alert("Please enter a city name to search");
  }

  fetch(
    "https://api.openweathermap.org/data/2.5/weather?q=" +
      apiCity +
      "&units=imperial&appid=e1aef3875b4b885d2c8c55ff7afead43"
  )
    .then((response) => {
      if (response.ok) {
        return response.json();
      }
    })
    .then((data) => console.log(data))
    .catch((error) => {
      console.log("there was an error with the request.", error);
    });
};

getForecast("kansas city");
