import React, { useState, useEffect, useRef } from 'react';
import './App.css';

// Weather Icons mapping
const weatherIcons = {
  '01d': '☀️', '01n': '🌙',
  '02d': '⛅', '02n': '☁️',
  '03d': '☁️', '03n': '☁️',
  '04d': '☁️', '04n': '☁️',
  '09d': '🌧️', '09n': '🌧️',
  '10d': '🌦️', '10n': '🌧️',
  '11d': '⛈️', '11n': '⛈️',
  '13d': '❄️', '13n': '❄️',
  '50d': '🌫️', '50n': '🌫️'
};

// Format time to 12-hour format
const formatTime = (timeString) => {
  if (!timeString) return '';
  const time = timeString.split(' ')[1];
  const [hourStr, minutes] = time.split(':');
  const hour = parseInt(hourStr, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
};

function App() {
  const [weather, setWeather] = useState(null);
  const [city, setCity] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionsRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const API_KEY = '9a983165173b4de69a1170742252411';
  const API_BASE_URL = 'http://api.weatherapi.com/v1';

  // Debounce function to limit API calls
  const debounce = (func, delay) => {
    let timeoutId;
    return function(...args) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        func.apply(this, args);
      }, delay);
    };
  };

  const fetchWeather = async (cityName) => {
    if (!cityName) return;

    setLoading(true);
    setError('');

    try {
      // Current weather
      const currentResponse = await fetch(
        `${API_BASE_URL}/current.json?key=${API_KEY}&q=${encodeURIComponent(cityName)}&aqi=yes`
      );
      const currentData = await currentResponse.json();

      if (!currentData.error) {
        const weatherData = {
          city: currentData.location.name,
          country: currentData.location.country,
          temp: Math.round(currentData.current.temp_c),
          description: currentData.current.condition.text,
          icon: `https:${currentData.current.condition.icon}`,
          humidity: currentData.current.humidity,
          wind: currentData.current.wind_kph,
          wind_dir: currentData.current.wind_dir,
          pressure: currentData.current.pressure_mb,
          visibility: currentData.current.vis_km,
          feels_like: Math.round(currentData.current.feelslike_c),
          last_updated: currentData.current.last_updated
        };

        setWeather(weatherData);
        setCity('');
      } else {
        setError(currentData.error?.message || 'City not found.');
      }
    } catch (err) {
      setError('Failed to fetch weather data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch city suggestions
  const fetchSuggestions = async (query) => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }
    
    try {
      const response = await fetch(
        `${API_BASE_URL}/search.json?key=${API_KEY}&q=${encodeURIComponent(query)}`
      );
      const data = await response.json();
      setSuggestions(data || []);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions([]);
    }
  };

  // Debounced version of fetchSuggestions
  const debouncedFetchSuggestions = useRef(
    debounce((query) => fetchSuggestions(query), 300)
  ).current;

  useEffect(() => {
    return () => {
      debouncedFetchSuggestions.cancel?.();
    };
  }, [debouncedFetchSuggestions]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (city.trim()) {
      fetchWeather(city);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setCity(suggestion.name);
    setShowSuggestions(false);
    fetchWeather(suggestion.name);
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const getWeatherEmoji = (iconUrl) => {
    if (!iconUrl) return '🌡️';
    const iconCode = iconUrl.split('/').pop().split('.')[0];
    return weatherIcons[iconCode] || '🌡️';
  };

  return (
    <div className="app">
      <div className="container">
        <h1>Weather Forecast</h1>

        {/* Search Input */}
        <form onSubmit={handleSearch} className="search-box">
          <div className="search-container" ref={suggestionsRef}>
            <input
              type="text"
              value={city}
              onChange={(e) => {
                setCity(e.target.value);
                debouncedFetchSuggestions(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              placeholder="Enter city name"
              className="search-input"
              autoComplete="off"
            />
            {showSuggestions && suggestions.length > 0 && (
              <ul className="suggestions-list">
                {suggestions.map((suggestion, index) => (
                  <li 
                    key={`${suggestion.id || index}-${suggestion.name}`}
                    className="suggestion-item"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    {suggestion.name}, {suggestion.region ? `${suggestion.region}, ` : ''}{suggestion.country}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <button type="submit" disabled={loading || !city.trim()}>
            {loading ? <span className="loading-dots">Searching</span> : 'Get Weather'}
          </button>
        </form>

        {error && <div className="error">{error}</div>}

        {/* Loading */}
        {loading ? (
          <div className="loading">Loading weather data...</div>
        ) : weather ? (
          <>
            {/* Weather Card */}
            <div className="weather-card">
              <div className="location">
                <h2>{weather.city}, {weather.country}</h2>
                <p>Last updated: {formatTime(weather.last_updated)}</p>
              </div>

              <div className="weather-main">
                <div className="weather-icon">
                  <img
                    src={weather.icon}
                    alt={weather.description}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.style.display = 'none';
                      e.target.parentNode.innerHTML = getWeatherEmoji(weather.icon);
                    }}
                  />
                </div>
                <div className="temp">{weather.temp}°</div>
              </div>

              <div className="weather-desc">{weather.description}</div>

              <div className="weather-details">
                <div className="detail-item">
                  <div className="icon">🌡️</div>
                  <div className="info">
                    <span className="value">{weather.feels_like}°</span>
                    <span className="label">Feels Like</span>
                  </div>
                </div>

                <div className="detail-item">
                  <div className="icon">💧</div>
                  <div className="info">
                    <span className="value">{weather.humidity}%</span>
                    <span className="label">Humidity</span>
                  </div>
                </div>

                <div className="detail-item">
                  <div className="icon">💨</div>
                  <div className="info">
                    <span className="value">{weather.wind} km/h</span>
                    <span className="label">{weather.wind_dir} Wind</span>
                  </div>
                </div>

                <div className="detail-item">
                  <div className="icon">📊</div>
                  <div className="info">
                    <span className="value">{weather.pressure} mb</span>
                    <span className="label">Pressure</span>
                  </div>
                </div>

                <div className="detail-item">
                  <div className="icon">👁️</div>
                  <div className="info">
                    <span className="value">{weather.visibility} km</span>
                    <span className="label">Visibility</span>
                  </div>
                </div>
              </div>
            </div>

          </>
        ) : (
          <div className="welcome-message">
            <div className="welcome-card">
              <h3>Welcome to Weather App</h3>
              <p>Enter a city name to check the current weather</p>

              <div className="example-cities">
                <p>Try searching:</p>
                <div className="city-tags">
                  <span onClick={() => fetchWeather('New York')}>New York</span>
                  <span onClick={() => fetchWeather('London')}>London</span>
                  <span onClick={() => fetchWeather('Tokyo')}>Tokyo</span>
                  <span onClick={() => fetchWeather('Sydney')}>Sydney</span>
                </div>
              </div>

            </div>
          </div>
        )}

        <footer>
          <p>
            Powered by{" "}
            <a
              href="https://www.weatherapi.com/"
              target="_blank"
              rel="noopener noreferrer"
            >
              WeatherAPI.com
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;
