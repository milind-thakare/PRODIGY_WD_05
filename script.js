document.addEventListener("DOMContentLoaded", () => {
    const searchBtn = document.getElementById("search-btn");
    const locationBtn = document.getElementById("location-btn");
    const cityInput = document.getElementById("city-input");
    
    // UI Elements
    const weatherResult = document.getElementById("weather-result");
    const loading = document.getElementById("loading");
    const errorMessage = document.getElementById("error-message");
    
    // Data Elements
    const locationName = document.getElementById("location-name");
    const tempValue = document.getElementById("temp-value");
    const weatherDesc = document.getElementById("weather-description");
    const windSpeed = document.getElementById("wind-speed");

    // WMO Weather interpretation codes
    const weatherCodes = {
        0: "Clear sky",
        1: "Mainly clear", 2: "Partly cloudy", 3: "Overcast",
        45: "Fog", 48: "Depositing rime fog",
        51: "Light Drizzle", 53: "Moderate Drizzle", 55: "Dense Drizzle",
        61: "Slight Rain", 63: "Moderate Rain", 65: "Heavy Rain",
        71: "Slight Snow", 73: "Moderate Snow", 75: "Heavy Snow",
        95: "Thunderstorm"
    };

    searchBtn.addEventListener("click", () => {
        const city = cityInput.value.trim();
        if (city) {
            getCoordinatesByCity(city);
        } else {
            showError("Please enter a city name.");
        }
    });

    locationBtn.addEventListener("click", () => {
        if (navigator.geolocation) {
            showLoading();
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude;
                    const lon = position.coords.longitude;
                    getWeather(lat, lon, "Your Current Location");
                },
                (error) => {
                    showError("Unable to retrieve your location. Please check your browser permissions.");
                }
            );
        } else {
            showError("Geolocation is not supported by your browser.");
        }
    });

    // Step 1 for text search: Get Lat/Lon from City Name
    async function getCoordinatesByCity(city) {
        showLoading();
        try {
            const geocodingUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;
            const response = await fetch(geocodingUrl);
            const data = await response.json();

            if (data.results && data.results.length > 0) {
                const { latitude, longitude, name, country } = data.results[0];
                getWeather(latitude, longitude, `${name}, ${country}`);
            } else {
                showError("City not found. Please try again.");
            }
        } catch (error) {
            showError("Error fetching location data.");
        }
    }

    // Step 2: Get Weather using Lat/Lon
    async function getWeather(lat, lon, displayName) {
        try {
            const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`;
            const response = await fetch(weatherUrl);
            const data = await response.json();

            if (data.current_weather) {
                displayWeather(data.current_weather, displayName);
            } else {
                showError("Could not retrieve weather data.");
            }
        } catch (error) {
            showError("Error fetching weather data.");
        }
    }

    function displayWeather(weatherData, displayName) {
        hideLoading();
        errorMessage.classList.add("hidden");
        weatherResult.classList.remove("hidden");

        locationName.textContent = displayName;
        tempValue.textContent = weatherData.temperature;
        windSpeed.textContent = `${weatherData.windspeed} km/h`;
        
        // Map the weather code to a readable description
        const desc = weatherCodes[weatherData.weathercode] || "Unknown Conditions";
        weatherDesc.textContent = desc;
    }

    function showLoading() {
        loading.classList.remove("hidden");
        weatherResult.classList.add("hidden");
        errorMessage.classList.add("hidden");
    }

    function hideLoading() {
        loading.classList.add("hidden");
    }

    function showError(message) {
        hideLoading();
        weatherResult.classList.add("hidden");
        errorMessage.textContent = message;
        errorMessage.classList.remove("hidden");
    }
});