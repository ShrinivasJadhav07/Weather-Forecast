const axios = require('axios');
const NodeCache = require('node-cache');
const logger = require('../utils/logger');

// Initialize cache with TTL and max entries from environment variables
const cache = new NodeCache({
  stdTTL: parseInt(process.env.CACHE_TTL || 600), // Default 10 minutes
  maxKeys: parseInt(process.env.MAX_CACHE_ENTRIES || 100)
});

/**
 * Fetches weather data for a given city
 * @param {string} city - The city name to fetch weather for
 * @returns {Promise<Object>} Weather data
 */
async function getWeatherByCity(city) {
  const cacheKey = `weather_${city.toLowerCase()}`;
  
  // Check cache first
  const cachedData = cache.get(cacheKey);
  if (cachedData) {
    logger.info(`Cache hit for city: ${city}`);
    return { ...cachedData, fromCache: true };
  }

  try {
    logger.info(`Fetching weather data for city: ${city}`);
    
    // Make API call to WeatherAPI.com
    const response = await axios.get(`${process.env.WEATHERAPI_BASE_URL}/current.json`, {
      params: {
        q: city,
        key: process.env.WEATHERAPI_KEY,
        aqi: 'yes'
      }
    });

    if (response.status === 200 && response.data) {
      const weatherData = formatWeatherData(response.data);
      // Store in cache
      cache.set(cacheKey, weatherData);
      return { ...weatherData, fromCache: false };
    }
    
    throw new Error('Invalid response from weather API');
  } catch (error) {
    logger.error(`Error fetching weather data for ${city}: ${error.message}`);
    throw new Error(`Failed to fetch weather data: ${error.response?.data?.error?.message || error.message}`);
  }
}

/**
 * Formats the raw weather data from the API
 * @param {Object} data - Raw weather data from WeatherAPI.com
 * @returns {Object} Formatted weather data
 */
function formatWeatherData(data) {
  const current = data.current;
  const location = data.location;
  
  return {
    city: location?.name,
    country: location?.country,
    coordinates: {
      lat: location?.lat,
      lon: location?.lon
    },
    weather: {
      main: current?.condition?.text,
      description: current?.condition?.text,
      icon: current?.condition?.icon
    },
    main: {
      temp: Math.round(current?.temp_c),
      feels_like: Math.round(current?.feelslike_c),
      temp_min: Math.round(current?.temp_c - 2), // Approximate min temp
      temp_max: Math.round(current?.temp_c + 2), // Approximate max temp
      pressure: current?.pressure_mb,
      humidity: current?.humidity
    },
    wind: {
      speed: current?.wind_kph,
      deg: current?.wind_degree,
      dir: current?.wind_dir
    },
    visibility: current?.vis_km,
    last_updated: location?.localtime,
    aqi: current?.air_quality,
    is_day: current?.is_day === 1 ? 'day' : 'night',
    timestamp: new Date().toISOString()
  };
}

module.exports = {
  getWeatherByCity
};
