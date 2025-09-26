import { useRef, useEffect } from 'react'
import { Bot, User } from 'lucide-react'
import { cn } from '../../utils/cn'
import { useChat } from '../../providers/ChatProvider'
import { useLanguage } from '../../providers/LanguageProvider'
import { MessageBubble } from './MessageBubble'
import { WeatherCard } from './WeatherCard'
import { LoadingIndicator } from './LoadingIndicator'
import { WelcomeScreen } from './WelcomeScreen'

export function ConversationPanel() {
  const { messages, isLoading } = useChat()
  const { t } = useLanguage()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isLoading])

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-white/80 via-slate-50/70 to-gray-100/60 dark:from-stone-900/50 dark:via-neutral-900/40 dark:to-zinc-900/50">
      <div className="flex-1 overflow-y-auto p-6">
        {messages.length === 0 && !isLoading ? (
          <WelcomeScreen />
        ) : (
          <div className="max-w-4xl mx-auto space-y-6">
            {messages.map((message) => (
              <div key={message.id} className="space-y-4">
                <MessageBubble message={message} />

                {/* Show weather card if assistant message includes weather data */}
                {message.role === 'assistant' && message.weatherData && (
                  <div className="ml-12">
                    <WeatherCard 
                      weatherData={message.weatherData} 
                      recommendations={message.recommendations}
                    />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="ml-0">
                <LoadingIndicator />
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
    </div>
  )
}