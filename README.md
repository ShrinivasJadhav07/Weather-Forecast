# Weather App Backend

This is the backend service for the Weather Application, built with Node.js and Express. It provides RESTful APIs to fetch weather data from WeatherAPI.com with caching capabilities.

## Features

- Get current weather by city name
- Response caching for improved performance
- Rate limiting to prevent abuse
- Comprehensive error handling
- Request logging
- Environment-based configuration

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- WeatherAPI.com API key (get it from [WeatherAPI.com](https://www.weatherapi.com/))

## Installation

1. Clone the repository
2. Navigate to the backend directory:
   ```bash
   cd weather-app/backend
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Create a `.env` file in the root directory and add your WeatherAPI.com API key:
   ```env
   WEATHERAPI_KEY=your_api_key_here
   ```

## Configuration

The application can be configured using environment variables. Create a `.env` file in the root directory with the following variables:

```env
# Server Configuration
PORT=5000

# WeatherAPI.com Configuration
WEATHERAPI_KEY=your_api_key_here
WEATHERAPI_BASE_URL=http://api.weatherapi.com/v1

# Cache Configuration
CACHE_TTL=600  # Cache time-to-live in seconds (10 minutes)
MAX_CACHE_ENTRIES=100  # Maximum number of entries to store in cache

# Logging
LOG_LEVEL=info  # error, warn, info, debug
NODE_ENV=development  # production or development
```

## Running the Application

### Development Mode

```bash
npm run dev
```

### Production Mode

```bash
npm start
```


This will start the server with nodemon, which automatically restarts the server when files change.


## Available Endpoints

### Get Weather by City

```
GET /api/weather/city?city={cityName}
```


## Error Handling

The API returns appropriate HTTP status codes and JSON error responses in the following format:

```json
{
  "status": "error",
  "message": "Error message here"
}
```

## Rate Limiting

The API is rate limited to 100 requests per 15 minutes per IP address. This helps prevent abuse and ensures fair usage.

## Caching

Responses are cached for 10 minutes by default to improve performance and reduce API calls to OpenWeatherMap. The cache can store up to 100 entries by default.

## Logging

Logs are written to both the console and log files in the `logs` directory. The log level can be configured using the `LOG_LEVEL` environment variable.
