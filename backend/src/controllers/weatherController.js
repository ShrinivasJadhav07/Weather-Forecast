const logger = require('../utils/logger');
const weatherService = require('../services/weatherService');

/**
 * @module controllers/weatherController
 * @description Handles weather-related API endpoints
 */

/**
 * @function getWeatherByCity
 * @description Fetches weather data for a specific city
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Object} JSON response with weather data or error message
 * 
 * @example
 * // Request: GET /api/weather?city=London
 * // Response: { status: 'success', data: { ...weatherData } }
 * 
 * @middleware
 * - Validates if city parameter is provided
 * - Logs the request for debugging
 * - Handles errors using Express error handling
 */
const getWeatherByCity = async (req, res, next) => {
  try {
    // Extract city from query parameters
    const { city } = req.query;
    
    // Validate input
    if (!city || typeof city !== 'string' || city.trim() === '') {
      logger.warn('City parameter is missing or invalid');
      return res.status(400).json({
        status: 'error',
        message: 'Please provide a valid city name',
        example: '/api/weather?city=London'
      });
    }
    
    // Log the request for debugging
    logger.info(`[WeatherController] Fetching weather for city: ${city}`);
    
    // Call the weather service to get weather data
    const weatherData = await weatherService.getWeatherByCity(city);
    
    // Log successful response
    logger.info(`[WeatherController] Successfully fetched weather for ${city}`);
    
    res.json({
      status: 'success',
      data: weatherData,
      meta: {
        cached: weatherData.fromCache || false,
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    // Log the error for debugging
    logger.error(`[WeatherController] Error fetching weather for ${city}: ${error.message}`, {
      error: error.stack,
      requestParams: { city }
    });
    
    // Send appropriate error response
    if (error.message.includes('not found')) {
      return res.status(404).json({
        status: 'error',
        message: 'City not found. Please check the city name and try again.'
      });
    }
    
    // For other types of errors
    return res.status(500).json({
      status: 'error',
      message: 'An error occurred while fetching weather data',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @function getWeatherByCoords
 * @description Fetches weather data for specific coordinates
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Object} JSON response with weather data or error message
 * 
 * @example
 * // Request: GET /api/weather?lat=37.7749&lon=-122.4194
 * // Response: { status: 'success', data: { ...weatherData } }
 * 
 * @middleware
 * - Validates if latitude and longitude parameters are provided
 * - Logs the request for debugging
 * - Handles errors using Express error handling
 */
const getWeatherByCoords = async (req, res, next) => {
  try {
    // Extract coordinates from query parameters
    const { lat, lon } = req.query;
    
    // Validate input
    if (!lat || !lon) {
      logger.warn('Latitude and longitude parameters are missing');
      return res.status(400).json({
        status: 'error',
        message: 'Please provide valid latitude and longitude',
        example: '/api/weather?lat=37.7749&lon=-122.4194'
      });
    }
    
    // Log the request for debugging
    logger.info(`[WeatherController] Fetching weather for coordinates: ${lat}, ${lon}`);
    
    // Call the weather service to get weather data
    const weatherData = await weatherService.getWeatherByCoords(lat, lon);
    
    // Log successful response
    logger.info(`[WeatherController] Successfully fetched weather for ${lat}, ${lon}`);
    
    // Send success response with weather data
    return res.status(200).json({
      status: 'success',
      message: 'Weather data retrieved successfully',
      data: weatherData,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    // Log the error for debugging
    logger.error(`[WeatherController] Error fetching weather for ${lat}, ${lon}: ${error.message}`, {
      error: error.stack,
      requestParams: { lat, lon }
    });
    
    // Send appropriate error response
    if (error.message.includes('not found')) {
      return res.status(404).json({
        status: 'error',
        message: 'Coordinates not found. Please check the coordinates and try again.'
      });
    }
    
    // For other types of errors
    return res.status(500).json({
      status: 'error',
      message: 'An error occurred while fetching weather data',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Export the controller methods
module.exports = {
  getWeatherByCity,
  getWeatherByCoords
};
