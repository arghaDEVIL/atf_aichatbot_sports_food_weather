interface WeatherData {
  city: string
  country: string
  temperature: number
  feelsLike: number
  humidity: number
  windSpeed: number
  visibility: number
  description: string
  icon: string
  date: string
}

export class WeatherService {
  private openMeteoUrl = 'https://api.open-meteo.com/v1'
  private archiveUrl = 'https://archive-api.open-meteo.com/v1'
  private geocodingUrl = 'https://geocoding-api.open-meteo.com/v1'

  constructor() {
    console.log('Weather service initialized with Open-Meteo API (free, no API key required)')
  }

  private async getCoordinates(city: string): Promise<{ lat: number, lon: number, name: string, country: string } | null> {
    try {
      const response = await fetch(
        `${this.geocodingUrl}/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`
      )

      if (!response.ok) {
        throw new Error(`Geocoding API error: ${response.status}`)
      }

      const data = await response.json()
      if (data.results && data.results.length > 0) {
        const result = data.results[0]
        return {
          lat: result.latitude,
          lon: result.longitude,
          name: result.name,
          country: result.country_code?.toUpperCase() || result.country || 'Unknown'
        }
      }
      return null
    } catch (error) {
      console.error('Error getting coordinates:', error)
      return null
    }
  }

  private async getWeatherFromOpenMeteo(city: string, date?: string): Promise<WeatherData | null> {
    try {
      console.log('=== OPEN-METEO API CALL ===')
      console.log('Getting coordinates for city:', city)
      const coords = await this.getCoordinates(city)
      if (!coords) {
        console.error('Could not find coordinates for city:', city)
        return null
      }
      console.log('Coordinates found:', coords)

      // Determine if we need historical data, current data, or forecast data
      const today = new Date()
      const targetDate = date ? new Date(date) : today
      const todayStr = today.toISOString().split('T')[0]
      const targetDateStr = targetDate.toISOString().split('T')[0]

      console.log('Today:', todayStr)
      console.log('Target date:', targetDateStr)

      let weatherUrl: string
      let isHistorical = false

      if (targetDateStr < todayStr) {
        // Historical data (past dates) - using archive API
        console.log('Using archive weather API for past date')
        isHistorical = true
        weatherUrl = `${this.archiveUrl}/archive?latitude=${coords.lat}&longitude=${coords.lon}&start_date=${targetDateStr}&end_date=${targetDateStr}&daily=temperature_2m_max,temperature_2m_min,weather_code,wind_speed_10m_max,relative_humidity_2m_max&timezone=auto`
      } else {
        // Current and future data (forecast)
        console.log('Using forecast API for current/future date')
        weatherUrl = `${this.openMeteoUrl}/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,weather_code,wind_speed_10m_max,relative_humidity_2m_max&timezone=auto&forecast_days=16`
      }

      console.log('Weather URL:', weatherUrl)
      const response = await fetch(weatherUrl)
      if (!response.ok) {
        console.error(`Open-Meteo API error: ${response.status}`)
        const errorText = await response.text()
        console.error('Error response:', errorText)
        throw new Error(`Open-Meteo API error: ${response.status}`)
      }

      const data = await response.json()
      console.log('Open-Meteo API response:', data)

      // Handle historical data response
      if (isHistorical) {
        if (data.daily && data.daily.time && data.daily.time.length > 0) {
          const maxTemp = data.daily.temperature_2m_max[0] || 20
          const minTemp = data.daily.temperature_2m_min[0] || 10
          const avgTemp = Math.round((maxTemp + minTemp) / 2)

          return {
            city: coords.name,
            country: coords.country,
            temperature: avgTemp,
            feelsLike: avgTemp,
            humidity: data.daily.relative_humidity_2m_max ? data.daily.relative_humidity_2m_max[0] : 50,
            windSpeed: Math.round((data.daily.wind_speed_10m_max[0] || 0) * 3.6),
            visibility: 10,
            description: this.getWeatherDescription(data.daily.weather_code[0] || 0),
            icon: this.getWeatherIcon(data.daily.weather_code[0] || 0),
            date: new Date(targetDateStr).toLocaleDateString()
          }
        } else {
          console.warn('No historical data found for the requested date')
          return null
        }
      }

      // If no date specified, return current weather
      if (!date) {
        if (data.current) {
          return {
            city: coords.name,
            country: coords.country,
            temperature: Math.round(data.current.temperature_2m || 0),
            feelsLike: Math.round(data.current.apparent_temperature || data.current.temperature_2m || 0),
            humidity: data.current.relative_humidity_2m || 50,
            windSpeed: Math.round((data.current.wind_speed_10m || 0) * 3.6),
            visibility: 10, // Default value
            description: this.getWeatherDescription(data.current.weather_code || 0),
            icon: this.getWeatherIcon(data.current.weather_code || 0),
            date: new Date().toLocaleDateString()
          }
        }
      }

      // For specific dates, find the matching day in the forecast
      if (data.daily && data.daily.time && data.daily.time.length > 0) {
        const targetDate = date || new Date().toISOString().split('T')[0]
        console.log('Looking for date:', targetDate)
        console.log('Available dates in forecast:', data.daily.time)
        console.log('Forecast range: from', data.daily.time[0], 'to', data.daily.time[data.daily.time.length - 1])

        // Check if target date is within forecast range
        const targetDateObj = new Date(targetDate)
        const firstForecastDate = new Date(data.daily.time[0])
        const lastForecastDate = new Date(data.daily.time[data.daily.time.length - 1])

        console.log('Target date object:', targetDateObj)
        console.log('First forecast date:', firstForecastDate)
        console.log('Last forecast date:', lastForecastDate)

        if (targetDateObj < firstForecastDate) {
          console.warn(`Target date ${targetDate} is in the past. Forecast starts from ${data.daily.time[0]}`)
        } else if (targetDateObj > lastForecastDate) {
          console.warn(`Target date ${targetDate} is too far in the future. Forecast only goes until ${data.daily.time[data.daily.time.length - 1]} (${data.daily.time.length} days from today)`)
        }

        // Find the index of the target date
        let dayIndex = -1
        for (let i = 0; i < data.daily.time.length; i++) {
          if (data.daily.time[i] === targetDate) {
            dayIndex = i
            break
          }
        }

        console.log('Found day index:', dayIndex)

        // If exact date not found, try to find a close match
        if (dayIndex === -1) {
          console.log('Exact date not found, checking for alternative matches...')

          // Extract month and day from target date
          const targetParts = targetDate.split('-')
          const targetMonth = targetParts[1]
          const targetDay = targetParts[2]

          console.log('Looking for month:', targetMonth, 'day:', targetDay)

          // Try to find same month/day in current year
          for (let i = 0; i < data.daily.time.length; i++) {
            const availableDate = data.daily.time[i]
            const availableParts = availableDate.split('-')

            if (availableParts[1] === targetMonth && availableParts[2] === targetDay) {
              console.log('Found matching month/day:', availableDate)
              dayIndex = i
              break
            }
          }
        }

        if (dayIndex >= 0) {
          const maxTemp = data.daily.temperature_2m_max[dayIndex] || 20
          const minTemp = data.daily.temperature_2m_min[dayIndex] || 10
          const avgTemp = Math.round((maxTemp + minTemp) / 2)

          return {
            city: coords.name,
            country: coords.country,
            temperature: avgTemp,
            feelsLike: avgTemp,
            humidity: data.daily.relative_humidity_2m_max ? data.daily.relative_humidity_2m_max[dayIndex] : 50,
            windSpeed: Math.round((data.daily.wind_speed_10m_max[dayIndex] || 0) * 3.6),
            visibility: 10,
            description: this.getWeatherDescription(data.daily.weather_code[dayIndex] || 0),
            icon: this.getWeatherIcon(data.daily.weather_code[dayIndex] || 0),
            date: new Date(targetDate).toLocaleDateString()
          }
        } else {
          console.warn(`Target date ${targetDate} not found in forecast data`)
          console.warn(`Available forecast range: ${data.daily.time[0]} to ${data.daily.time[data.daily.time.length - 1]}`)
          console.warn(`The Open-Meteo API only provides forecasts for the next ${data.daily.time.length} days`)

          // Check if the date is too far in the future
          const targetDateObj = new Date(targetDate)
          const lastForecastDate = new Date(data.daily.time[data.daily.time.length - 1])

          if (targetDateObj > lastForecastDate) {
            const daysDifference = Math.ceil((targetDateObj.getTime() - lastForecastDate.getTime()) / (1000 * 60 * 60 * 24))
            console.error(`Requested date is ${daysDifference} days beyond the forecast range`)
            throw new Error(`Weather forecast is only available for the next ${data.daily.time.length} days. Requested date ${targetDate} is ${daysDifference} days beyond the available range.`)
          }

          // Return the first available day as fallback for past dates
          if (data.daily.time.length > 0) {
            console.log('Returning first available forecast day as fallback:', data.daily.time[0])
            const maxTemp = data.daily.temperature_2m_max[0] || 20
            const minTemp = data.daily.temperature_2m_min[0] || 10
            const avgTemp = Math.round((maxTemp + minTemp) / 2)

            return {
              city: coords.name,
              country: coords.country,
              temperature: avgTemp,
              feelsLike: avgTemp,
              humidity: data.daily.relative_humidity_2m_max ? data.daily.relative_humidity_2m_max[0] : 50,
              windSpeed: Math.round((data.daily.wind_speed_10m_max[0] || 0) * 3.6),
              visibility: 10,
              description: this.getWeatherDescription(data.daily.weather_code[0] || 0),
              icon: this.getWeatherIcon(data.daily.weather_code[0] || 0),
              date: new Date(data.daily.time[0]).toLocaleDateString()
            }
          }
        }
      }

      console.warn('No weather data found in API response')
      return null
    } catch (error) {
      console.error('Error fetching weather from Open-Meteo:', error)
      return null
    }
  }

  private getWeatherDescription(code: number): string {
    const weatherCodes: { [key: number]: string } = {
      0: 'Clear sky',
      1: 'Mainly clear',
      2: 'Partly cloudy',
      3: 'Overcast',
      45: 'Fog',
      48: 'Depositing rime fog',
      51: 'Light drizzle',
      53: 'Moderate drizzle',
      55: 'Dense drizzle',
      61: 'Slight rain',
      63: 'Moderate rain',
      65: 'Heavy rain',
      71: 'Slight snow fall',
      73: 'Moderate snow fall',
      75: 'Heavy snow fall',
      80: 'Slight rain showers',
      81: 'Moderate rain showers',
      82: 'Violent rain showers',
      95: 'Thunderstorm',
      96: 'Thunderstorm with slight hail',
      99: 'Thunderstorm with heavy hail'
    }
    return weatherCodes[code] || 'Unknown weather'
  }

  private getWeatherIcon(code: number): string {
    // Map Open-Meteo weather codes to OpenWeatherMap-style icons
    const iconMap: { [key: number]: string } = {
      0: '01d', // Clear sky
      1: '02d', // Mainly clear
      2: '03d', // Partly cloudy
      3: '04d', // Overcast
      45: '50d', // Fog
      48: '50d', // Depositing rime fog
      51: '09d', // Light drizzle
      53: '09d', // Moderate drizzle
      55: '09d', // Dense drizzle
      61: '10d', // Slight rain
      63: '10d', // Moderate rain
      65: '10d', // Heavy rain
      71: '13d', // Slight snow fall
      73: '13d', // Moderate snow fall
      75: '13d', // Heavy snow fall
      80: '09d', // Slight rain showers
      81: '09d', // Moderate rain showers
      82: '09d', // Violent rain showers
      95: '11d', // Thunderstorm
      96: '11d', // Thunderstorm with slight hail
      99: '11d'  // Thunderstorm with heavy hail
    }
    return iconMap[code] || '01d'
  }

  async getWeatherForDate(city: string, date?: string): Promise<WeatherData | null> {
    console.log('=== WEATHER SERVICE ===')
    console.log('Fetching weather data from Open-Meteo for:', city, date ? `on ${date}` : '(current)')

    const result = await this.getWeatherFromOpenMeteo(city, date)
    if (result) {
      console.log('Successfully got weather from Open-Meteo:', result)
      // Check if it's actually demo data
      if (result.country === 'Demo') {
        console.warn('Received demo data from Open-Meteo method')
      }
      return result
    }

    // Fallback to mock data if Open-Meteo fails
    console.warn('Open-Meteo failed, returning mock data')
    return this.getMockWeatherData(city, date)
  }

  async getForecast(city: string, days: number = 7): Promise<WeatherData[] | null> {
    try {
      const coords = await this.getCoordinates(city)
      if (!coords) {
        console.error('Could not find coordinates for city:', city)
        return null
      }

      const today = new Date().toISOString().split('T')[0]
      const endDate = new Date()
      endDate.setDate(endDate.getDate() + days - 1)
      const endDateStr = endDate.toISOString().split('T')[0]

      const weatherUrl = `${this.openMeteoUrl}/forecast?latitude=${coords.lat}&longitude=${coords.lon}&daily=temperature_2m_max,temperature_2m_min,weather_code,wind_speed_10m_max,relative_humidity_2m_max&start_date=${today}&end_date=${endDateStr}&timezone=auto`

      const response = await fetch(weatherUrl)
      if (!response.ok) {
        throw new Error(`Open-Meteo API error: ${response.status}`)
      }

      const data = await response.json()

      if (data.daily && data.daily.time) {
        const forecasts: WeatherData[] = []

        for (let i = 0; i < Math.min(data.daily.time.length, days); i++) {
          const avgTemp = Math.round((data.daily.temperature_2m_max[i] + data.daily.temperature_2m_min[i]) / 2)

          forecasts.push({
            city: coords.name,
            country: coords.country,
            temperature: avgTemp,
            feelsLike: avgTemp,
            humidity: data.daily.relative_humidity_2m_max[i] || 50,
            windSpeed: Math.round(data.daily.wind_speed_10m_max[i] * 3.6),
            visibility: 10, // Default value
            description: this.getWeatherDescription(data.daily.weather_code[i]),
            icon: this.getWeatherIcon(data.daily.weather_code[i]),
            date: new Date(data.daily.time[i]).toLocaleDateString()
          })
        }

        return forecasts
      }

      return null
    } catch (error) {
      console.error('Error fetching weather forecast from Open-Meteo:', error)
      return null
    }
  }

  private getMockWeatherData(city: string, date?: string): WeatherData {
    return {
      city: city,
      country: 'Demo',
      temperature: Math.floor(Math.random() * 30) + 5,
      feelsLike: Math.floor(Math.random() * 30) + 5,
      humidity: Math.floor(Math.random() * 60) + 30,
      windSpeed: Math.floor(Math.random() * 20) + 5,
      visibility: Math.floor(Math.random() * 10) + 5,
      description: ['sunny', 'cloudy', 'rainy', 'partly cloudy'][Math.floor(Math.random() * 4)],
      icon: '01d',
      date: date ? new Date(date).toLocaleDateString() : new Date().toLocaleDateString()
    }
  }
}

export const weatherService = new WeatherService()
export type { WeatherData }