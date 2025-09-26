import React, { createContext, useContext, useState, useCallback } from 'react'
import { weatherService, type WeatherData } from '../services/weatherService'
import { geminiService, type FoodSportsRecommendations } from '../services/geminiService'

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  weatherData?: WeatherData
  recommendations?: FoodSportsRecommendations
}

interface ConversationContextType {
  messages: Message[]
  isLoading: boolean
  sendMessage: (content: string) => Promise<void>
  clearConversation: () => void
}

const ConversationContext = createContext<ConversationContextType | undefined>(undefined)

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [lastMentionedCity, setLastMentionedCity] = useState<string | null>(null)

  const processMessage = useCallback(async (userInput: string): Promise<{ content: string, weatherData?: WeatherData, recommendations?: FoodSportsRecommendations }> => {
    try {
      // Detect language for Japanese support
      const japaneseRegex = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/
      const language: 'en' | 'ja' = japaneseRegex.test(userInput) ? 'ja' : 'en'
      console.log('Detected language:', language)
      
      // Step 1: Extract city and date from user input using Gemini
      console.log('Analyzing user input:', userInput)
      console.log('Last mentioned city in memory:', lastMentionedCity)
      
      const conversationHistory = messages.slice(-6).map(msg => ({
        role: msg.role,
        content: msg.content
      }))
      
      const extraction = await geminiService.extractCityAndDate(userInput, conversationHistory, lastMentionedCity)
      console.log('Extraction result:', extraction)

      let weatherData: WeatherData | null = null
      let recommendations: FoodSportsRecommendations | null = null
      let weatherContext: any = null

      // Update city memory if a city is mentioned (even if not making API call)
      if (extraction.city && extraction.city !== lastMentionedCity) {
        console.log('Updating last mentioned city to:', extraction.city)
        setLastMentionedCity(extraction.city)
      }

      // Step 2: Check if user needs weather API data
      if (extraction.needsWeatherAPI && extraction.city && extraction.confidence > 0.3) {
        console.log('=== WEATHER API CALL ===')
        console.log('City:', extraction.city)
        console.log('Date:', extraction.date)
        console.log('Confidence:', extraction.confidence)
        console.log('========================')
        
        try {
          weatherData = await weatherService.getWeatherForDate(extraction.city, extraction.date || undefined)
          console.log('Weather data received:', weatherData)

          // Get recommendations based on API weather data
          if (weatherData) {
            console.log('Getting recommendations for weather data')
            recommendations = await geminiService.getFoodAndSportsRecommendations(weatherData, language)
            console.log('Recommendations:', recommendations)
          }
        } catch (weatherError: any) {
          console.error('Weather service error:', weatherError)
          
          // Handle specific error for dates too far in the future
          if (weatherError.message && weatherError.message.includes('beyond the available range')) {
            const errorMessage = language === 'ja' 
              ? `申し訳ございませんが、天気予報は今後16日間のみ提供できます。${weatherError.message} 📅\n\n今後2週間以内の日付について天気をお尋ねいただくか、一般的な食べ物やスポーツのおすすめについてお聞きください！🌤️`
              : `I'm sorry, but I can only provide weather forecasts for the next 16 days. ${weatherError.message} 📅\n\nTry asking about weather for dates within the next two weeks, or ask me about general food and sports recommendations! 🌤️`
            return {
              content: errorMessage
            }
          }
          
          // For other weather errors, continue with general recommendations
          console.log('Weather API failed, continuing with general recommendations')
        }
      } else {
        // Step 3: Check if user provided weather context themselves
        console.log('Analyzing weather context from user input')
        weatherContext = await geminiService.analyzeWeatherContext(userInput)
        console.log('Weather context:', weatherContext)

        if (weatherContext.hasWeatherContext && weatherContext.confidence > 0.6) {
          // Get recommendations based on user-provided weather context
          console.log('Getting recommendations from user weather context')
          recommendations = await geminiService.getFoodAndSportsRecommendationsFromContext(weatherContext, language)
          console.log('Context-based recommendations:', recommendations)
        } else {
          // Step 4: Handle general weather/food/sports questions
          console.log('Getting general recommendations')
          recommendations = await geminiService.getGeneralRecommendations(userInput)
          console.log('General recommendations:', recommendations)
        }
      }

     // Step 5: Use default message instead of generating conversational response
      let content = "Here is the weather statistics and the Food and Sports Recommendation"

      // If there's no weather data and no recommendations, provide a more appropriate message
      if (!weatherData && !recommendations) {
        content = await geminiService.generateConversationalResponse(
          userInput,
          weatherData,
          recommendations,
          conversationHistory,
          weatherContext
        )
      }

      return {
        content,
        weatherData: weatherData || undefined,
        recommendations: recommendations || undefined
      }
    } catch (error) {
      console.error('Error processing message:', error)
      // Detect language for error message
      const japaneseRegex = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/
      const language: 'en' | 'ja' = japaneseRegex.test(userInput) ? 'ja' : 'en'
      
      const errorMessage = language === 'ja'
        ? "申し訳ございませんが、現在リクエストの処理に問題が発生しています。天気に関連した食べ物やスポーツのおすすめについてお聞きいただけますか？🌤️"
        : "I'm sorry, I'm having trouble processing your request right now. Could you try asking about weather-related food or sports recommendations? 🌤️"
      
      return {
        content: errorMessage
      }
    }
  }, [messages])

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)

    try {
      const response = await processMessage(content.trim())

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.content,
        timestamp: new Date(),
        weatherData: response.weatherData,
        recommendations: response.recommendations
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Failed to generate response:', error)

      // Add error message with language detection
      const japaneseRegex = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/
      const language: 'en' | 'ja' = japaneseRegex.test(content) ? 'ja' : 'en'
      
      const errorContent = language === 'ja'
        ? "申し訳ございません、何か問題が発生しました。もう一度お試しください！😅"
        : "I'm sorry, something went wrong. Please try again! 😅"
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: errorContent,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }, [isLoading, processMessage])

  const clearConversation = useCallback(() => {
    setMessages([])
    setLastMentionedCity(null)
  }, [])

  return (
    <ConversationContext.Provider value={{
      messages,
      isLoading,
      sendMessage,
      clearConversation
    }}>
      {children}
    </ConversationContext.Provider>
  )
}

export function useChat() {
  const context = useContext(ConversationContext)
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider')
  }
  return context
}