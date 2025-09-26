import { useState, useCallback, useRef, useEffect } from 'react'
import { Mic, MicOff, Send, User, Bot } from 'lucide-react'
import { cn } from '../utils/cn'
import { useLanguage } from '../providers/LanguageProvider'
import { useSpeechRecognition } from '../utilities/speechRecognition'
import type { ChatMessage, WeatherData } from '../models'

interface ChatInterfaceProps {
  weatherData?: WeatherData
}

export function ChatInterface({ weatherData }: ChatInterfaceProps) {
  const { language, t } = useLanguage()
  const [currentWeatherData, setCurrentWeatherData] = useState<WeatherData | undefined>(weatherData)
  const [inputValue, setInputValue] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleVoiceResult = useCallback((transcript: string) => {
    setInputValue(transcript)
  }, [])

  const {
    isListening,
    isSupported,
    error: voiceError,
    startListening,
    stopListening
  } = useSpeechRecognition({
    onResult: handleVoiceResult,
    language
  })

  const fetchWeatherForLocation = useCallback(async (location: string) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1500))
      const mockWeather: WeatherData = {
        city: location,
        country: 'Global',
        temperature: Math.floor(Math.random() * 30) + 10,
        description: ['sunny', 'cloudy', 'rainy', 'partly cloudy'][Math.floor(Math.random() * 4)],
        humidity: Math.floor(Math.random() * 60) + 30,
        windSpeed: Math.floor(Math.random() * 15) + 3,
        precipitation: Math.floor(Math.random() * 20),
        cloudCover: Math.floor(Math.random() * 100),
        uvIndex: Math.floor(Math.random() * 10) + 1,
        timestamp: new Date().toISOString()
      }
      setCurrentWeatherData(mockWeather)
    } catch (error) {
      console.error('Weather fetch failed:', error)
    }
  }, [])

  const getAIResponse = async (message: string): Promise<string> => {
    await new Promise(resolve => setTimeout(resolve, 1000))

    if (message.toLowerCase().includes('weather')) {
      return `Based on the current weather conditions, I'd recommend wearing comfortable layers. The temperature looks perfect for outdoor activities! 🌟`
    }

    return `That's a great question! I'd suggest choosing outfits that balance comfort and style based on the weather. Remember, confidence is your best accessory! ✨`
  }

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (inputValue.trim() && !isLoading) {
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'user',
        content: inputValue.trim()
      }

      setMessages(prev => [...prev, userMessage])
      setIsLoading(true)
      setInputValue('')

      const locationMatch = inputValue.match(/weather.*?(?:in|for|at)\\s+([^,.\n?!]+)/i)
      if (locationMatch) {
        const location = locationMatch[1].trim()
        await fetchWeatherForLocation(location)
      }

      try {
        const aiResponse = await getAIResponse(inputValue)
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: aiResponse
        }
        setMessages(prev => [...prev, assistantMessage])
      } catch (error) {
        console.error('AI response failed:', error)
      } finally {
        setIsLoading(false)
      }
    }
  }, [inputValue, isLoading, fetchWeatherForLocation])

  const handleVoiceToggle = () => {
    if (isListening) {
      stopListening()
    } else {
      startListening()
    }
  }

  return (
    <div className="h-full w-full flex flex-col">
      <div className="minimal-card overflow-hidden h-full flex flex-col">
        {/* Header */}
        <div className="border-b border-slate-200 dark:border-slate-700 p-4 flex-shrink-0">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            {t('assistantTitle')}
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {t('assistantDescription')}
          </p>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-6 max-w-lg">
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                  <Bot className="w-10 h-10 text-white" />
                </div>

                <div className="space-y-3">
                  <h4 className="text-xl font-semibold text-slate-900 dark:text-white">
                    {t('welcomeTitle')}
                  </h4>
                  <p className="text-slate-600 dark:text-slate-400">
                    {t('welcomeMessage')}
                  </p>
                </div>

                <div className="flex flex-wrap justify-center gap-3">
                  <span className="px-4 py-2 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors cursor-pointer">
                    {t('exampleQueries.weather')}
                  </span>
                  <span className="px-4 py-2 bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-700 text-purple-700 dark:text-purple-300 rounded-full text-sm font-medium hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors cursor-pointer">
                    {t('exampleQueries.fashion')}
                  </span>
                  <span className="px-4 py-2 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 rounded-full text-sm font-medium hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors cursor-pointer">
                    {t('exampleQueries.travel')}
                  </span>
                </div>
              </div>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                'flex items-start space-x-3 animate-slideUp',
                message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
              )}
            >
              {/* Avatar */}
              <div className={cn(
                'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
                message.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
              )}>
                {message.role === 'user' ? (
                  <User className="w-4 h-4" />
                ) : (
                  <Bot className="w-4 h-4" />
                )}
              </div>

              {/* Message */}
              <div className={cn(
                'flex-1 max-w-md p-3 rounded-2xl text-sm shadow-sm',
                message.role === 'user'
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white'
                  : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white'
              )}>
                {message.content}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-start space-x-3 animate-slideUp">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                <Bot className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              </div>
              <div className="flex-1 max-w-md p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-slate-500 dark:bg-slate-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-slate-500 dark:bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-slate-500 dark:bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    {t('thinking')}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-slate-200 dark:border-slate-700 p-4 flex-shrink-0">
          <form onSubmit={handleSubmit} className="flex items-center space-x-3">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={t('inputPlaceholder')}
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-700 transition-all duration-200"
            />

            {/* Voice Button */}
            {isSupported && (
              <button
                type="button"
                onClick={handleVoiceToggle}
                disabled={isLoading}
                className={cn(
                  'p-2 rounded-xl transition-all duration-200',
                  isListening
                    ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg'
                    : 'bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-600 hover:shadow-md'
                )}
              >
                {isListening ? (
                  <MicOff className="w-5 h-5" />
                ) : (
                  <Mic className="w-5 h-5" />
                )}
              </button>
            )}

            {/* Send Button */}
            <button
              type="submit"
              disabled={!inputValue.trim() || isLoading}
              className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 disabled:from-slate-300 disabled:to-slate-300 dark:disabled:from-slate-700 dark:disabled:to-slate-700 disabled:text-slate-500 dark:disabled:text-slate-400 text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>

          {/* Voice feedback */}
          {voiceError && (
            <div className="mt-2 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl">
              <p className="text-sm text-red-700 dark:text-red-300">
                {voiceError}
              </p>
            </div>
          )}

          {isListening && (
            <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-xl">
              <p className="text-sm text-blue-700 dark:text-blue-300 flex items-center gap-2">
                <span className="animate-pulse-subtle">🎤</span>
                {t('listening')}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}