import { GoogleGenerativeAI } from '@google/generative-ai'
import type { WeatherData } from './weatherService'

interface CityDateExtraction {
  city: string | null
  date: string | null
  confidence: number
  needsWeatherAPI: boolean
}

interface WeatherContextAnalysis {
  hasWeatherContext: boolean
  weatherDescription: string | null
  temperature: number | null
  conditions: string | null
  confidence: number
}

interface FoodSportsRecommendations {
  foods: string[]
  sports: string[]
  reasoning: string
}

export class GeminiService {
  private genAI: GoogleGenerativeAI | null = null
  private model: any = null
  private hasApiKey: boolean = false

  private cleanJsonResponse(text: string): string {
    // Remove markdown code blocks and clean the response
    let cleaned = text.trim()

    // Remove ```json and ``` markers
    if (cleaned.startsWith('```json')) {
      cleaned = cleaned.replace(/^```json\s*/, '')
    }
    if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```\s*/, '')
    }
    if (cleaned.endsWith('```')) {
      cleaned = cleaned.replace(/\s*```$/, '')
    }

    return cleaned.trim()
  }

  constructor() {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY
    if (!apiKey || apiKey === 'AIzaSyBvLbaQOzA-3m6lzDzmquIQsYy19ru9hac') {
      console.warn('Gemini API key not found, using fallback responses')
      this.hasApiKey = false
      return
    }

    try {
      this.genAI = new GoogleGenerativeAI(apiKey)
      // Try different model names for free tier
      const modelNames = [
        'gemini-1.5-flash-8b-latest',
        'gemini-1.5-flash-latest',
        'gemini-pro',
        'gemini-1.0-pro'
      ]

      let modelInitialized = false
      for (const modelName of modelNames) {
        try {
          this.model = this.genAI.getGenerativeModel({ model: modelName })
          this.hasApiKey = true
          console.log(`Gemini AI initialized successfully with model: ${modelName}`)
          modelInitialized = true
          break
        } catch (modelError) {
          console.warn(`Failed to initialize model ${modelName}:`, modelError)
          continue
        }
      }

      if (!modelInitialized) {
        throw new Error('No compatible Gemini model found')
      }
    } catch (error) {
      console.error('Error initializing Gemini AI, using fallback responses:', error)
      this.hasApiKey = false
    }
  }

  private detectLanguage(text: string): 'en' | 'ja' {
    // Simple Japanese character detection
    const japaneseRegex = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/
    return japaneseRegex.test(text) ? 'ja' : 'en'
  }

  async extractCityAndDate(
    userInput: string,
    conversationHistory?: Array<{ role: string, content: string }>,
    lastMentionedCity?: string | null
  ): Promise<CityDateExtraction> {
    if (!this.hasApiKey || !this.model) {
      // Enhanced fallback: More comprehensive pattern matching for both English and Japanese
      const weatherQuestionPatterns = [
        // English patterns
        /weather.*?(?:in|for|at)\s+([^,.!?]+)/i,
        /(?:in|for|at)\s+([^,.!?]+).*?weather/i,
        /(?:how|what).*?weather.*?(?:in|at|for)\s+([^,.!?]+)/i,
        /([^,.!?]+).*?weather.*?(?:today|tomorrow|like)/i,

        // Enhanced Japanese patterns
        /([^、。！？\s]+)の天気/,
        /([^、。！？\s]+)の気温/,
        /([^、。！？\s]+)で.*?天気/,
        /([^、。！？\s]+)は.*?天気/,
        /([^、。！？\s]+)の.*?予報/,
        /([^、。！？\s]+)って.*?天気/,
        /([^、。！？\s]+).*?どう.*?天気/,
        /天気.*?([^、。！？\s]+)/,
        /気温.*?([^、。！？\s]+)/,
        /([^、。！？\s]+).*?暑い/,
        /([^、。！？\s]+).*?寒い/,
        /([^、。！？\s]+).*?雨/,
        /([^、。！？\s]+).*?晴れ/,
        /([^、。！？\s]+).*?曇り/,
        /([^、。！？\s]+).*?雪/
      ]

      let city = null
      for (const pattern of weatherQuestionPatterns) {
        const match = userInput.match(pattern)
        if (match) {
          city = match[1].trim()
          break
        }
      }

      // Enhanced language-specific keywords
      const weatherKeywords = [
        // English
        'weather', 'temperature', 'forecast', 'climate', 'conditions', 'sunny', 'rainy', 'cloudy', 'cold', 'hot', 'warm', 'cool', 'humid',
        // Japanese
        '天気', '気温', '天候', '予報', '気候', '晴れ', '雨', '曇り', '雪', '暑い', '寒い', '温かい', '涼しい', '湿度', '風', '台風'
      ]
      const dateKeywords = [
        // English
        'tomorrow', 'today', 'yesterday', 'jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec',
        'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday', 'next week', 'last week', 'this week',
        'day after tomorrow', 'day before yesterday', 'weekend', 'weekday',
        // Japanese
        '明日', '今日', '昨日', '明後日', '一昨日', '来週', '先週', '今週', '月曜', '火曜', '水曜', '木曜', '金曜', '土曜', '日曜',
        '1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月',
        '来月', '先月', '今月', '週末', '平日', 'あさって', 'おととい'
      ]

      const isWeatherQuery = weatherKeywords.some(keyword => userInput.includes(keyword))
      const hasDateReference = dateKeywords.some(keyword => userInput.includes(keyword))

      // Use last mentioned city if:
      // 1. User asks about weather without city
      // 2. User mentions a date (implying weather query) and we have a last mentioned city
      if (!city && lastMentionedCity && (isWeatherQuery || hasDateReference)) {
        city = lastMentionedCity
        console.log('Using last mentioned city from memory:', city)
      }

      // Enhanced date extraction for both languages
      let date = null
      const currentDate = new Date()
      const currentYear = currentDate.getFullYear()
      const currentMonth = currentDate.getMonth() + 1 // 0-based, so add 1
      const input = userInput.toLowerCase()

      // Japanese and English relative dates
      if (input.includes('tomorrow') || userInput.includes('明日')) {
        const tomorrow = new Date(currentDate)
        tomorrow.setDate(tomorrow.getDate() + 1)
        date = tomorrow.toISOString().split('T')[0]
      } else if (input.includes('yesterday') || userInput.includes('昨日')) {
        const yesterday = new Date(currentDate)
        yesterday.setDate(yesterday.getDate() - 1)
        date = yesterday.toISOString().split('T')[0]
      } else if (input.includes('next week') || userInput.includes('来週')) {
        const nextWeek = new Date(currentDate)
        nextWeek.setDate(nextWeek.getDate() + 7)
        date = nextWeek.toISOString().split('T')[0]
      } else if (input.includes('last week') || userInput.includes('先週')) {
        const lastWeek = new Date(currentDate)
        lastWeek.setDate(lastWeek.getDate() - 7)
        date = lastWeek.toISOString().split('T')[0]
      } else if (input.includes('day after tomorrow') || userInput.includes('明後日') || userInput.includes('あさって')) {
        const dayAfter = new Date(currentDate)
        dayAfter.setDate(dayAfter.getDate() + 2)
        date = dayAfter.toISOString().split('T')[0]
      } else if (input.includes('day before yesterday') || userInput.includes('一昨日') || userInput.includes('おととい')) {
        const dayBefore = new Date(currentDate)
        dayBefore.setDate(dayBefore.getDate() - 2)
        date = dayBefore.toISOString().split('T')[0]
      } else if (input.includes('this week') || userInput.includes('今週')) {
        // Keep current date for "this week"
        date = null
      } else if (input.includes('next month') || userInput.includes('来月')) {
        const nextMonth = new Date(currentDate)
        nextMonth.setMonth(nextMonth.getMonth() + 1, 1)
        date = nextMonth.toISOString().split('T')[0]
      } else if (input.includes('last month') || userInput.includes('先月')) {
        const lastMonth = new Date(currentDate)
        lastMonth.setMonth(lastMonth.getMonth() - 1, 1)
        date = lastMonth.toISOString().split('T')[0]
      }
      // Specific dates (English and Japanese)
      else if (input.includes('2nd jan') || input.includes('january 2') || userInput.includes('1月2日')) {
        if (currentMonth > 1) {
          date = `${currentYear + 1}-01-02`
        } else {
          date = `${currentYear}-01-02`
        }
      } else if (input.includes('1st jan') || input.includes('january 1') || input.includes('first jan') || userInput.includes('1月1日')) {
        if (currentMonth > 1) {
          date = `${currentYear + 1}-01-01`
        } else {
          date = `${currentYear}-01-01`
        }
      }
      // More Japanese month patterns and special dates
      else if (userInput.includes('12月25日') || input.includes('december 25') || input.includes('christmas') || userInput.includes('クリスマス')) {
        date = `${currentYear}-12-25`
      } else if (userInput.includes('12月31日') || input.includes('december 31') || input.includes('new year') || userInput.includes('大晦日')) {
        date = `${currentYear}-12-31`
      } else if (userInput.includes('元日') || userInput.includes('お正月')) {
        date = `${currentYear + 1}-01-01`
      }
      // Check for Japanese date patterns like "3月15日"
      else {
        const japaneseDateMatch = userInput.match(/(\d{1,2})月(\d{1,2})日/)
        if (japaneseDateMatch) {
          const month = parseInt(japaneseDateMatch[1])
          const day = parseInt(japaneseDateMatch[2])
          if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
            // If the month has passed this year, use next year
            if (month < currentMonth || (month === currentMonth && day < currentDate.getDate())) {
              date = `${currentYear + 1}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`
            } else {
              date = `${currentYear}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`
            }
          }
        }
      }

      // Don't set date for "today" - let it use current weather
      if (input.includes('today') || userInput.includes('今日')) {
        date = null
      }

      // Enhanced check if user is asking for weather vs providing context
      const isAskingForWeather = isWeatherQuery || hasDateReference ||
        (userInput.includes('?') || userInput.includes('？') ||
         input.includes('how') || input.includes('what') || input.includes('when') || input.includes('where') ||
         userInput.includes('どう') || userInput.includes('何') || userInput.includes('いつ') || userInput.includes('どこ') ||
         userInput.includes('教えて') || userInput.includes('知りたい') || userInput.includes('どんな') ||
         userInput.includes('ですか') || userInput.includes('でしょうか') || userInput.includes('かな'))

      return {
        city: city,
        date: date,
        confidence: city ? 0.8 : 0.3,
        needsWeatherAPI: !!(city && isAskingForWeather)
      }
    }

    const currentDate = new Date()
    const currentYear = currentDate.getFullYear()
    const currentDateStr = currentDate.toISOString().split('T')[0]
    const language = this.detectLanguage(userInput)

    const prompt = `
    IMPORTANT CONTEXT: Today's date is ${currentDateStr} and the current year is ${currentYear}.
    
    Analyze the following user input and determine if the user is asking for weather information for a specific city, or if they're providing weather context themselves or asking general questions.
    
    LANGUAGE DETECTION: The user input appears to be in ${language === 'ja' ? 'Japanese' : 'English'}.

    User input: "${userInput}"
    
    ${conversationHistory && conversationHistory.length > 0 ? `
    Recent conversation context:
    ${conversationHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n')}
    ` : ''}
    
    ${lastMentionedCity ? `
    IMPORTANT: Last mentioned city in conversation: ${lastMentionedCity}
    If the user asks about weather without specifying a city, use this city.
    ` : ''}

    Please respond with a JSON object in this exact format:
    {
      "city": "city name or null if not found",
      "date": "date in YYYY-MM-DD format or null if not found or if it's 'today'",
      "confidence": number between 0 and 1,
      "needsWeatherAPI": boolean
    }

    Rules for needsWeatherAPI: true ONLY when:
    -when user is asking weather conditions of a place 

    Rules for needsWeatherAPI: false when:
    - when user is asking about anything else other than the weather of a city 


    Special rules for conversation context:
    - Read the query and determine needsWeatherAPI, if true identify the city and ALWAYS convert relative dates to actual dates
    - If city not in query, use the last mentioned city
    - ALWAYS convert relative date terms to actual YYYY-MM-DD format:
      * "tomorrow"/"明日" → actual tomorrow's date
      * "yesterday"/"昨日" → actual yesterday's date  
      * "next week"/"来週" → date 7 days from today
      * "today"/"今日" → null (use current weather)
    - Take current year unless year is specifically mentioned 
    
    Date parsing examples for BOTH English and Japanese (remember current year is ${currentYear} and today is ${currentDateStr}):
    
    English examples:
    - "today" → null (don't set date, use current weather)
    - "tomorrow" → ${new Date(currentDate.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
    - "yesterday" → ${new Date(currentDate.getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
    - "next week" → ${new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
    - "first jan" or "1st jan" or "january 1st" → ${currentYear + 1}-01-01 (if we're past January)
    
    Japanese examples:
    - "今日" → null (don't set date, use current weather)
    - "明日" → ${new Date(currentDate.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
    - "昨日" → ${new Date(currentDate.getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
    - "来週" → ${new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
    - "明後日" → ${new Date(currentDate.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
    - "一昨日" → ${new Date(currentDate.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
    - "1月1日" → ${currentYear + 1}-01-01 (if we're past January)
    - "1月2日" → ${currentYear + 1}-01-02 (if we're past January)
    
    CRITICAL: Always convert relative date terms in BOTH languages to actual YYYY-MM-DD format dates!

    Confidence should be high (0.8+) only if you're very sure about the classification.

    IMPORTANT: Respond with ONLY a valid JSON object. Do not use markdown formatting, code blocks, or any other text. Return raw JSON only.
    `

    try {
      const result = await this.model.generateContent(prompt)
      const response = await result.response
      const text = response.text()

      // Parse the JSON response
      const cleanedText = this.cleanJsonResponse(text)
      console.log('Cleaned JSON text:', cleanedText)
      const parsed = JSON.parse(cleanedText)
      return {
        city: parsed.city,
        date: parsed.date,
        confidence: parsed.confidence || 0.5,
        needsWeatherAPI: parsed.needsWeatherAPI || false
      }
    } catch (error) {
      console.error('Error extracting city and date:', error)
      return {
        city: null,
        date: null,
        confidence: 0,
        needsWeatherAPI: false
      }
    }
  }

  async analyzeWeatherContext(userInput: string): Promise<WeatherContextAnalysis> {
    const language = this.detectLanguage(userInput)

    const prompt = `
    Analyze the following user input to extract weather context that the user has provided themselves.
    
    LANGUAGE: The input appears to be in ${language === 'ja' ? 'Japanese' : 'English'}.
    
    User input: "${userInput}"
    
    Please respond with a JSON object in this exact format:
    {
      "hasWeatherContext": boolean,
      "weatherDescription": "description of weather conditions or null",
      "temperature": number or null (in Celsius if mentioned),
      "conditions": "weather conditions like sunny, rainy, cold, hot, etc. or null",
      "confidence": number between 0 and 1
    }
    
    Examples (English):
    - "It's raining outside, what should I eat?" → hasWeatherContext: true, conditions: "rainy"
    - "The weather is sunny and 25°C, what sports can I play?" → hasWeatherContext: true, temperature: 25, conditions: "sunny"
    - "I'm feeling cold, suggest some warm food" → hasWeatherContext: true, conditions: "cold"
    - "What's the weather in Tokyo?" → hasWeatherContext: false
    
    Examples (Japanese):
    - "外は雨が降っています、何を食べればいいですか？" → hasWeatherContext: true, conditions: "rainy"
    - "今日は晴れで25度です、どんなスポーツができますか？" → hasWeatherContext: true, temperature: 25, conditions: "sunny"
    - "寒いです、温かい食べ物を教えてください" → hasWeatherContext: true, conditions: "cold"
    - "東京の天気はどうですか？" → hasWeatherContext: false
    
    Rules:
    - Only set hasWeatherContext: true if user provides weather information themselves
    - Extract temperature if mentioned (convert to Celsius if needed)
    - Extract weather conditions (sunny/晴れ, rainy/雨, cold/寒い, hot/暑い, windy/風が強い, etc.)
    - Set confidence high (0.8+) only if weather context is clearly provided
    - Handle both English and Japanese weather terms
    
    Respond only with the JSON object, no other text.
    `

    try {
      const result = await this.model.generateContent(prompt)
      const response = await result.response
      const text = response.text()

      // Parse the JSON response
      const cleanedText = this.cleanJsonResponse(text)
      const parsed = JSON.parse(cleanedText)
      return {
        hasWeatherContext: parsed.hasWeatherContext || false,
        weatherDescription: parsed.weatherDescription,
        temperature: parsed.temperature,
        conditions: parsed.conditions,
        confidence: parsed.confidence || 0.5
      }
    } catch (error) {
      console.error('Error analyzing weather context:', error)
      return {
        hasWeatherContext: false,
        weatherDescription: null,
        temperature: null,
        conditions: null,
        confidence: 0
      }
    }
  }

  async getFoodAndSportsRecommendationsFromContext(weatherContext: WeatherContextAnalysis, language: 'en' | 'ja' = 'en'): Promise<FoodSportsRecommendations> {
    const prompt = `
    Based on the following weather context provided by the user, recommend appropriate foods and sports activities.
    
    IMPORTANT: Respond in ${language === 'ja' ? 'Japanese' : 'English'} language.
    
    Weather Context:
    - Temperature: ${weatherContext.temperature ? `${weatherContext.temperature}°C` : 'Not specified'}
    - Conditions: ${weatherContext.conditions || 'Not specified'}
    - Description: ${weatherContext.weatherDescription || 'Not specified'}
    
    Please provide recommendations in this exact JSON format:
    {
      "foods": ["food1", "food2", "food3", "food4", "food5"],
      "sports": ["sport1", "sport2", "sport3", "sport4", "sport5"],
      "reasoning": "Brief explanation of why these foods and sports are suitable for this weather"
    }
    
    Guidelines:
    - Foods should be appropriate for the temperature and weather conditions mentioned
    - Sports should be safe and enjoyable in the described weather
    - Consider both indoor and outdoor options when appropriate
    - Keep recommendations practical and accessible
    - Reasoning should be 2-3 sentences maximum
    - If weather context is limited, provide general recommendations
    ${language === 'ja' ? '- すべての回答を日本語で提供してください' : '- Provide all responses in English'}
    
    Respond only with the JSON object, no other text.
    `

    try {
      const result = await this.model.generateContent(prompt)
      const response = await result.response
      const text = response.text()

      // Parse the JSON response
      const cleanedText = this.cleanJsonResponse(text)
      const parsed = JSON.parse(cleanedText)
      return {
        foods: parsed.foods || [],
        sports: parsed.sports || [],
        reasoning: parsed.reasoning || 'Recommendations based on the weather context you provided.'
      }
    } catch (error) {
      console.error('Error getting recommendations from context:', error)
      return {
        foods: ['Seasonal fruits', 'Warm soup', 'Hot tea', 'Comfort food', 'Healthy snacks'],
        sports: ['Walking', 'Indoor yoga', 'Stretching', 'Light exercise', 'Meditation'],
        reasoning: 'General recommendations suitable for most weather conditions.'
      }
    }
  }

  async getGeneralRecommendations(userInput: string): Promise<FoodSportsRecommendations> {
    const language = this.detectLanguage(userInput)

    const prompt = `
    The user is asking a general question about weather, food, or sports. Provide helpful recommendations based on their question.
    
    IMPORTANT: Respond in ${language === 'ja' ? 'Japanese' : 'English'} language.
    
    User question: "${userInput}"
    
    Please provide recommendations in this exact JSON format:
    {
      "foods": ["food1", "food2", "food3", "food4", "food5"],
      "sports": ["sport1", "sport2", "sport3", "sport4", "sport5"],
      "reasoning": "Brief explanation of why these recommendations are relevant to the user's question"
    }
    
    Guidelines:
    - If the question mentions weather conditions, provide appropriate recommendations
    - If it's about food preferences, suggest weather-appropriate options
    - If it's about sports, consider different weather scenarios
    - Keep recommendations practical and accessible
    - Reasoning should be 2-3 sentences maximum
    - Focus on weather-related aspects when possible
    ${language === 'ja' ? '- すべての回答を日本語で提供してください' : '- Provide all responses in English'}
    
    Examples (English):
    - "What should I eat when it's cold?" → Focus on warming foods
    - "What sports are good for rainy days?" → Focus on indoor activities
    - "I love sunny weather" → Suggest outdoor activities and refreshing foods
    
    Examples (Japanese):
    - "寒い時に何を食べればいいですか？" → 温かい食べ物に焦点を当てる
    - "雨の日にはどんなスポーツがいいですか？" → 屋内活動に焦点を当てる
    - "晴れの日が好きです" → 屋外活動と爽やかな食べ物を提案
    
    Respond only with the JSON object, no other text.
    `

    try {
      const result = await this.model.generateContent(prompt)
      const response = await result.response
      const text = response.text()

      // Parse the JSON response
      const cleanedText = this.cleanJsonResponse(text)
      const parsed = JSON.parse(cleanedText)
      return {
        foods: parsed.foods || [],
        sports: parsed.sports || [],
        reasoning: parsed.reasoning || 'General recommendations based on your question.'
      }
    } catch (error) {
      console.error('Error getting general recommendations:', error)
      return {
        foods: ['Seasonal fruits', 'Balanced meals', 'Hydrating drinks', 'Energy snacks', 'Comfort food'],
        sports: ['Walking', 'Swimming', 'Cycling', 'Yoga', 'Team sports'],
        reasoning: 'General recommendations suitable for various weather conditions and preferences.'
      }
    }
  }

  async getFoodAndSportsRecommendations(weatherData: WeatherData, language: 'en' | 'ja' = 'en'): Promise<FoodSportsRecommendations> {
    const prompt = `
    Based on the following weather conditions, recommend appropriate foods and sports activities.
    
    IMPORTANT: Respond in ${language === 'ja' ? 'Japanese' : 'English'} language.
    
    Weather Details:
    - Location: ${weatherData.city}, ${weatherData.country}
    - Temperature: ${weatherData.temperature}°C (feels like ${weatherData.feelsLike}°C)
    - Conditions: ${weatherData.description}
    - Humidity: ${weatherData.humidity}%
    - Wind Speed: ${weatherData.windSpeed} km/h
    - Visibility: ${weatherData.visibility} km
    - Date: ${weatherData.date}
    
    Please provide recommendations in this exact JSON format:
    {
      "foods": ["food1", "food2", "food3", "food4", "food5"],
      "sports": ["sport1", "sport2", "sport3", "sport4", "sport5"],
      "reasoning": "Brief explanation of why these foods and sports are suitable for this weather"
    }
    
    Guidelines:
    - Foods should be appropriate for the temperature and weather conditions
    - Sports should be safe and enjoyable in the current weather
    - Consider both indoor and outdoor options when appropriate
    - Keep recommendations practical and accessible
    - Reasoning should be 2-3 sentences maximum
    ${language === 'ja' ? '- すべての回答を日本語で提供してください' : '- Provide all responses in English'}
    
    Respond only with the JSON object, no other text.
    `

    try {
      const result = await this.model.generateContent(prompt)
      const response = await result.response
      const text = response.text()

      // Parse the JSON response
      const cleanedText = this.cleanJsonResponse(text)
      const parsed = JSON.parse(cleanedText)
      return {
        foods: parsed.foods || [],
        sports: parsed.sports || [],
        reasoning: parsed.reasoning || 'Recommendations based on current weather conditions.'
      }
    } catch (error) {
      console.error('Error getting food and sports recommendations:', error)
      return {
        foods: ['Seasonal fruits', 'Warm soup', 'Hot tea', 'Comfort food', 'Healthy snacks'],
        sports: ['Walking', 'Indoor yoga', 'Stretching', 'Light exercise', 'Meditation'],
        reasoning: 'General recommendations suitable for most weather conditions.'
      }
    }
  }

  async generateConversationalResponse(
    userInput: string,
    weatherData: WeatherData | null,
    recommendations: FoodSportsRecommendations | null,
    conversationHistory: Array<{ role: string, content: string }>,
    weatherContext?: WeatherContextAnalysis,
    weatherError?: string
  ): Promise<string> {
    const language = this.detectLanguage(userInput)

    if (!this.hasApiKey || !this.model) {
      // Fallback responses when no API key is available
      if (weatherData) {
        if (recommendations) {
          if (language === 'ja') {
            return `${weatherData.city}の${weatherData.description}の天気（${weatherData.temperature}°C）に基づいて、おすすめをご紹介します！🌟\n\n🍽️ **食べ物**: ${recommendations.foods.slice(0, 3).join('、')}\n⚽ **スポーツ**: ${recommendations.sports.slice(0, 3).join('、')}\n\n${recommendations.reasoning}`
          } else {
            return `Based on the ${weatherData.description} weather in ${weatherData.city} (${weatherData.temperature}°C), here are some suggestions! 🌟\n\n🍽️ **Food**: ${recommendations.foods.slice(0, 3).join(', ')}\n⚽ **Sports**: ${recommendations.sports.slice(0, 3).join(', ')}\n\n${recommendations.reasoning}`
          }
        } else {
          if (language === 'ja') {
            return `${weatherData.city}は${weatherData.description}で${weatherData.temperature}°Cですね！天気が良ければ屋外活動、そうでなければ屋内でゆっくり過ごすのに良い天気です。この天気に合った食べ物やスポーツについて何か知りたいことはありますか？🌤️`
          } else {
            return `I see it's ${weatherData.description} in ${weatherData.city} at ${weatherData.temperature}°C! Great weather for outdoor activities if it's nice, or cozy indoor time if not. What would you like to know about food or sports for this weather? 🌤️`
          }
        }
      }

      if (recommendations) {
        if (language === 'ja') {
          return `素晴らしいおすすめをご紹介します！🌟\n\n🍽️ **食べ物**: ${recommendations.foods.slice(0, 3).join('、')}\n⚽ **スポーツ**: ${recommendations.sports.slice(0, 3).join('、')}\n\n${recommendations.reasoning}`
        } else {
          return `Here are some great suggestions for you! 🌟\n\n🍽️ **Food**: ${recommendations.foods.slice(0, 3).join(', ')}\n⚽ **Sports**: ${recommendations.sports.slice(0, 3).join(', ')}\n\n${recommendations.reasoning}`
        }
      }

      // Language-specific fallback responses
      if (language === 'ja') {
        if (userInput.includes('天気') && userInput.includes('？')) {
          return "天気情報のお手伝いをさせていただきます！特定の都市について、現在の天候をお伝えし、適切な食べ物や活動をご提案できます。どちらの都市にご興味がありますか？🌤️"
        }
        if (userInput.includes('食べ物') || userInput.includes('食事') || userInput.includes('料理')) {
          return "天気に基づいた食べ物のおすすめが私の専門です！現在の天候や都市を教えていただければ、その条件にぴったりの食べ物をご提案します！🍽️"
        }
        if (userInput.includes('スポーツ') || userInput.includes('運動') || userInput.includes('活動')) {
          return "天気に基づいたスポーツや活動のおすすめが大好きです！天候を教えていただければ、楽しめる最適な活動をご提案します！⚽"
        }
        return "私は天気に基づいた食べ物とスポーツのおすすめを専門とするアシスタントです！天候について質問したり、現在の天気を教えていただければ、素晴らしい食べ物や活動をご提案します！🌟"
      } else {
        if (userInput.toLowerCase().includes('weather') && userInput.includes('?')) {
          return "I'd love to help with weather information! For specific cities, I can provide current conditions and suggest appropriate food and activities. What city are you interested in? 🌤️"
        }
        if (userInput.toLowerCase().includes('food') || userInput.toLowerCase().includes('eat')) {
          return "Food recommendations based on weather are my specialty! Tell me about the current weather conditions or what city you're in, and I'll suggest perfect foods for the conditions! 🍽️"
        }
        if (userInput.toLowerCase().includes('sport') || userInput.toLowerCase().includes('activity') || userInput.toLowerCase().includes('exercise')) {
          return "I love recommending sports and activities based on weather! Share the weather conditions with me and I'll suggest the best activities to enjoy! ⚽"
        }
        return "I'm your weather-focused assistant for food and sports recommendations! Ask me about weather conditions, or tell me what the weather is like and I'll suggest great food and activities! 🌟"
      }
    }

    const systemPrompt = `
    You are a friendly AI assistant specializing in weather-based food and sports recommendations.
    
    IMPORTANT: Respond in ${language === 'ja' ? 'Japanese' : 'English'} language based on the user's input language.

    Your personality and rules:
    - Enthusiastic about weather, food, and sports
    - Helpful and conversational, but stay focused
    - ONLY discuss weather, food, and sports topics
    - If users ask about other topics (politics, technology, general knowledge, etc.), politely redirect:
      ${language === 'ja' ?
        '- Japanese: "私は天気に関連した食べ物とスポーツのおすすめを専門としています！代わりにそのことについて話しましょう。"' :
        '- English: "I\'m here to help with weather-related food and sports recommendations! Let\'s talk about that instead."'
      }
    - Use emojis occasionally to make responses more engaging
    - Keep responses concise but informative (2-4 sentences max)
    - Don't act like a general chatbot - you're specialized
    ${language === 'ja' ? '- すべての回答を自然な日本語で提供してください' : '- Provide all responses in natural English'}

    Current context:
    ${weatherError ? `
    Weather API Error: ${weatherError}
    ` : ''}

    ${weatherData ? `
    Weather Data (from API): ${weatherData.temperature}°C in ${weatherData.city}, ${weatherData.description}
    ` : ''}

    ${weatherContext?.hasWeatherContext ? `
    Weather Context (user provided): ${weatherContext.conditions || 'conditions mentioned'}, ${weatherContext.temperature ? weatherContext.temperature + '°C' : 'temperature mentioned'}
    ` : ''}

    ${recommendations ? `
    Recommendations:
    Foods: ${recommendations.foods.join(', ')}
    Sports: ${recommendations.sports.join(', ')}
    Reasoning: ${recommendations.reasoning}
    ` : ''}

    Recent conversation:
    ${conversationHistory.slice(-4).map(msg => `${msg.role}: ${msg.content}`).join('\n')}

    User: ${userInput}

    Instructions:
    - If you have weather data or context, provide relevant food/sports suggestions based on the ACTUAL weather conditions
    - If user provides weather context themselves, acknowledge it and give recommendations
    - For general weather/food/sports questions, provide helpful answers
    - Stay conversational but focused on your specialty
    - If off-topic, redirect politely but firmly
    - Don't provide weather forecasts unless you have actual weather data
    - If there's a weather error, acknowledge the limitation and suggest alternatives
    - NEVER make up weather conditions - only use actual data provided
    - Match your enthusiasm to the actual weather conditions (e.g., don't say "sunny day" if it's rainy)

    Respond naturally and conversationally.
    `

    try {
      const result = await this.model.generateContent(systemPrompt)
      const response = await result.response
      return response.text()
    } catch (error) {
      console.error('Error generating conversational response:', error)
      return "I'm sorry, I'm having trouble processing your request right now. Could you try asking about weather-related food or sports recommendations? 🌤️"
    }
  }
}

export const geminiService = new GeminiService()
export type { CityDateExtraction, FoodSportsRecommendations }
