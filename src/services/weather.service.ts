import axios from 'axios';
import logger from '../config/logger';
import redis from '../config/redis';

interface WeatherData {
  location: string;
  temperature: number;
  description: string;
  humidity: number;
  windSpeed: number;
  rainfall?: number;
}

class WeatherService {
  private apiKey: string;
  private cacheTimeout = 1800; // 30 minutes

  constructor() {
    this.apiKey = process.env.OPENWEATHER_API_KEY || '';
  }

  /**
   * Get weather data for a location
   */
  async getWeather(location: string): Promise<WeatherData | null> {
    try {
      // Check cache first
      const cacheKey = `weather:${location.toLowerCase()}`;
      const cached = await redis.get(cacheKey);

      if (cached) {
        logger.info('Weather data from cache', { location });
        return JSON.parse(cached);
      }

      // Fetch from OpenWeather API
      const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(location)},KE&appid=${this.apiKey}&units=metric`;

      const response = await axios.get(url);
      const data = response.data;

      const weatherData: WeatherData = {
        location: data.name,
        temperature: Math.round(data.main.temp),
        description: data.weather[0].description,
        humidity: data.main.humidity,
        windSpeed: data.wind.speed,
        rainfall: data.rain?.['1h'] || 0,
      };

      // Cache for 30 minutes
      await redis.setex(cacheKey, this.cacheTimeout, JSON.stringify(weatherData));

      logger.info('Weather data fetched', { location, temperature: weatherData.temperature });
      return weatherData;
    } catch (error) {
      logger.error('Weather fetch error', { location, error });
      return null;
    }
  }

  /**
   * Get weather forecast (3-day)
   */
  async getForecast(location: string): Promise<any> {
    try {
      const cacheKey = `forecast:${location.toLowerCase()}`;
      const cached = await redis.get(cacheKey);

      if (cached) {
        return JSON.parse(cached);
      }

      const url = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(location)},KE&appid=${this.apiKey}&units=metric&cnt=24`;

      const response = await axios.get(url);
      const data = response.data;

      // Cache for 1 hour
      await redis.setex(cacheKey, 3600, JSON.stringify(data));

      return data;
    } catch (error) {
      logger.error('Forecast fetch error', { location, error });
      return null;
    }
  }

  /**
   * Get weather advice for farming based on current conditions
   */
  getWeatherAdvice(weather: WeatherData, language: string = 'en'): string {
    const advice: { [key: string]: any } = {
      en: {
        hot: 'High temperature today. Ensure adequate irrigation and consider shade for sensitive crops.',
        cold: 'Cool temperatures. Good for highland crops. Protect seedlings if below 10°C.',
        rain: 'Rain expected. Good time for planting. Ensure drainage is adequate.',
        dry: 'Dry conditions. Irrigate crops regularly. Mulch to retain soil moisture.',
      },
      sw: {
        hot: 'Joto kali leo. Hakikisha umwagiliaji wa kutosha na fikiria kivuli kwa mazao nyeti.',
        cold: 'Hali baridi. Nzuri kwa mazao ya vilima. Linda miche ikiwa chini ya 10°C.',
        rain: 'Mvua inatarajiwa. Wakati mzuri wa kupanda. Hakikisha maji yanaondoka vizuri.',
        dry: 'Hali kavu. Nyunyizia mazao mara kwa mara. Tumia ukoko kudumisha unyevu wa udongo.',
      },
    };

    const lang = language === 'sw' ? 'sw' : 'en';
    const messages = advice[lang];

    if (weather.temperature > 30) return messages.hot;
    if (weather.temperature < 15) return messages.cold;
    if (weather.rainfall && weather.rainfall > 0) return messages.rain;
    if (weather.humidity < 40) return messages.dry;

    return '';
  }
}

export default new WeatherService();
