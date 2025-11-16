const logger = require('../../utils/logger');

class WeatherService {
  constructor() {
    // In production, this would use a real weather API like OpenWeatherMap, WeatherAPI, etc.
    this.mockWeatherConditions = [
      'Sunny',
      'Partly Cloudy',
      'Cloudy',
      'Light Rain',
      'Rain',
      'Thunderstorms',
      'Snow',
      'Fog',
      'Clear',
    ];
  }

  async getForecast(location, date) {
    try {
      // Calculate days from now
      const targetDate = new Date(date);
      const today = new Date();
      const daysFromNow = Math.ceil((targetDate - today) / (1000 * 60 * 60 * 24));

      // Mock weather data
      const baseTemp = 20; // Base temperature in Celsius
      const seasonalVariation = this.getSeasonalVariation(targetDate);
      const dailyVariation = Math.random() * 10 - 5; // ±5°C variation

      const temperature = Math.round(baseTemp + seasonalVariation + dailyVariation);
      const condition = this.mockWeatherConditions[Math.floor(Math.random() * this.mockWeatherConditions.length)];
      const precipitation = condition.includes('Rain') || condition.includes('Snow') ? Math.round(Math.random() * 100) : 0;
      const windSpeed = Math.round(Math.random() * 30 + 5); // 5-35 km/h
      const humidity = Math.round(Math.random() * 40 + 40); // 40-80%

      const forecast = {
        date: targetDate.toISOString().split('T')[0],
        location,
        condition,
        temperature: {
          high: temperature + 3,
          low: temperature - 3,
          current: temperature,
          unit: 'C',
        },
        precipitation: {
          probability: precipitation,
          amount: precipitation > 50 ? `${Math.random() * 10 + 1}mm` : '0mm',
        },
        wind: {
          speed: windSpeed,
          direction: this.getWindDirection(),
          unit: 'km/h',
        },
        humidity,
        visibility: condition === 'Fog' ? 'Low' : 'Good',
        uvIndex: condition === 'Sunny' || condition === 'Clear' ? Math.round(Math.random() * 5 + 5) : Math.round(Math.random() * 3 + 1),
        recommendations: this.getRecommendations(condition, temperature),
        accuracy: daysFromNow <= 3 ? 'High' : daysFromNow <= 7 ? 'Medium' : 'Low',
      };

      logger.info('Weather forecast generated:', {
        location,
        date: targetDate.toISOString().split('T')[0],
        condition,
        temperature,
      });

      return forecast;
    } catch (error) {
      logger.error('Failed to get weather forecast:', error);
      throw error;
    }
  }

  getSeasonalVariation(date) {
    const month = date.getMonth();
    // Simple seasonal temperature variation (Northern Hemisphere)
    const seasonalTemp = {
      0: -10, // January
      1: -8, // February
      2: -3, // March
      3: 2, // April
      4: 8, // May
      5: 12, // June
      6: 15, // July
      7: 14, // August
      8: 10, // September
      9: 5, // October
      10: -2, // November
      11: -8, // December
    };
    return seasonalTemp[month] || 0;
  }

  getWindDirection() {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    return directions[Math.floor(Math.random() * directions.length)];
  }

  getRecommendations(condition, temperature) {
    const recommendations = [];

    // Weather-based recommendations
    if (condition.includes('Rain')) {
      recommendations.push('Bring umbrella and raincoat');
      recommendations.push('Allow extra travel time');
      recommendations.push('Consider indoor property showings first');
    } else if (condition.includes('Snow')) {
      recommendations.push('Check road conditions before travel');
      recommendations.push('Wear warm, waterproof clothing');
      recommendations.push('Allow significant extra travel time');
    } else if (condition === 'Fog') {
      recommendations.push('Drive carefully with low visibility');
      recommendations.push('Allow extra travel time');
      recommendations.push('Use fog lights if driving');
    } else if (condition === 'Thunderstorms') {
      recommendations.push('Consider rescheduling outdoor appointments');
      recommendations.push('Stay indoors during storm activity');
      recommendations.push('Check for weather warnings');
    }

    // Temperature-based recommendations
    if (temperature > 30) {
      recommendations.push('Stay hydrated');
      recommendations.push('Wear sun protection');
      recommendations.push('Schedule breaks in air-conditioned spaces');
    } else if (temperature < 5) {
      recommendations.push('Dress in warm layers');
      recommendations.push('Check heating in properties before showing');
      recommendations.push('Warm up vehicle before travel');
    }

    // General recommendations
    if (condition === 'Sunny' || condition === 'Clear') {
      recommendations.push('Great day for exterior photos');
      recommendations.push('Ideal conditions for property showings');
    }

    return recommendations.length > 0 ? recommendations : ['Weather conditions are favorable for appointments'];
  }

  async getMultiDayForecast(location, startDate, days = 7) {
    try {
      const forecasts = [];
      const start = new Date(startDate);

      for (let i = 0; i < days; i++) {
        const forecastDate = new Date(start);
        forecastDate.setDate(start.getDate() + i);
        const forecast = await this.getForecast(location, forecastDate);
        forecasts.push(forecast);
      }

      return {
        location,
        startDate,
        endDate: new Date(start.setDate(start.getDate() + days - 1)),
        days,
        forecasts,
      };
    } catch (error) {
      logger.error('Failed to get multi-day forecast:', error);
      throw error;
    }
  }

  async getWeatherAlerts(location) {
    // Mock weather alerts
    const alerts = [];
    const hasAlert = Math.random() > 0.8; // 20% chance of alert

    if (hasAlert) {
      alerts.push({
        type: 'WARNING',
        title: 'Weather Advisory',
        description: 'Potential severe weather conditions expected',
        severity: 'moderate',
        startTime: new Date(),
        endTime: new Date(Date.now() + 6 * 60 * 60 * 1000), // 6 hours from now
        areas: [location],
      });
    }

    return {
      location,
      alerts,
      hasActiveAlerts: alerts.length > 0,
      lastChecked: new Date(),
    };
  }
}

module.exports = new WeatherService();
