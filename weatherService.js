const axios = require('axios');

class WeatherService {
  constructor() {
    this.baseUrl = 'https://api.open-meteo.com/v1/forecast';
  }

  async getWeather(latitude, longitude, date = null) {
    try {
      const params = {
        latitude,
        longitude,
        temperature_unit: 'fahrenheit',
        wind_speed_unit: 'mph',
        timezone: 'auto'
      };

      if (date) {
        // For historical/future dates, use daily weather
        const dateStr = new Date(date).toISOString().split('T')[0];
        params.start_date = dateStr;
        params.end_date = dateStr;
        params.daily = 'temperature_2m_max,temperature_2m_min,weather_code,wind_speed_10m_max,wind_direction_10m_dominant,cloud_cover_mean';
      } else {
        // For current weather
        params.current = 'temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,wind_direction_10m,cloud_cover';
      }

      const response = await axios.get(this.baseUrl, { params });

      if (date) {
        // Return daily weather data
        const { daily, daily_units } = response.data;
        return {
          temperature: (daily.temperature_2m_max[0] + daily.temperature_2m_min[0]) / 2,
          temperatureUnit: daily_units.temperature_2m_max,
          humidity: null, // Not available in daily data
          weatherCode: daily.weather_code[0],
          windSpeed: daily.wind_speed_10m_max[0],
          windDirection: daily.wind_direction_10m_dominant[0],
          cloudCover: daily.cloud_cover_mean[0],
          time: date
        };
      } else {
        // Return current weather data
        const { current, current_units } = response.data;
        return {
          temperature: current.temperature_2m,
          temperatureUnit: current_units.temperature_2m,
          humidity: current.relative_humidity_2m,
          weatherCode: current.weather_code,
          windSpeed: current.wind_speed_10m,
          windDirection: current.wind_direction_10m,
          cloudCover: current.cloud_cover,
          time: current.time
        };
      }
    } catch (error) {
      console.error('Error fetching weather:', error);
      throw error;
    }
  }

  getWeatherDescription(weatherCode) {
    const weatherCodes = {
      0: 'clear sky',
      1: 'mainly clear',
      2: 'partly cloudy',
      3: 'overcast',
      45: 'foggy',
      48: 'depositing rime fog',
      51: 'light drizzle',
      53: 'moderate drizzle',
      55: 'dense drizzle',
      56: 'light freezing drizzle',
      57: 'dense freezing drizzle',
      61: 'slight rain',
      63: 'moderate rain',
      65: 'heavy rain',
      66: 'light freezing rain',
      67: 'heavy freezing rain',
      71: 'slight snow fall',
      73: 'moderate snow fall',
      75: 'heavy snow fall',
      77: 'snow grains',
      80: 'slight rain showers',
      81: 'moderate rain showers',
      82: 'violent rain showers',
      85: 'slight snow showers',
      86: 'heavy snow showers',
      95: 'thunderstorm',
      96: 'thunderstorm with slight hail',
      99: 'thunderstorm with heavy hail'
    };

    return weatherCodes[weatherCode] || 'unknown';
  }

  getWindDirection(degrees) {
    const directions = ['north', 'northeast', 'east', 'southeast', 'south', 'southwest', 'west', 'northwest'];
    const index = Math.round(degrees / 45) % 8;
    return directions[index];
  }
}

module.exports = WeatherService;