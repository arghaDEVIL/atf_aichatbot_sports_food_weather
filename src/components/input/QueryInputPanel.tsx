import { useState } from 'react'
import { Rocket, Mic, MicOff } from 'lucide-react'
import { cn } from '../../utils/cn'
import { useChat } from '../../providers/ChatProvider'
import { useLanguage } from '../../providers/LanguageProvider'
import { useSpeechRecognition } from '../../utilities/speechRecognition'
import { RocketAnimation } from './RocketAnimation'

export function QueryInputPanel() {
  const [inputValue, setInputValue] = useState('')
  const [showRocket, setShowRocket] = useState(false)
  const { sendMessage, isLoading } = useChat()
  const { language, t } = useLanguage()

  const handleVoiceResult = (transcript: string) => {
    setInputValue(transcript)
  }

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim() || isLoading) return

    // Show rocket animation
    setShowRocket(true)

    // Send message
    await sendMessage(inputValue)

    // Clear input and hide rocket
    setInputValue('')
    setTimeout(() => setShowRocket(false), 1000)
  }

  const handleVoiceToggle = () => {
    if (isListening) {
      stopListening()
    } else {
      startListening()
    }
  }

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-white/98 via-slate-50/95 to-gray-100/90 dark:from-stone-900/50 dark:via-neutral-900/40 dark:to-zinc-900/50">
      {/* Header */}
      <div className="p-4 lg:p-6 border-b border-slate-300/80 dark:border-stone-700/60">
        <h2 className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent mb-2">
          {t('inputTitle') || 'Ask me anything'}
        </h2>
        <p className="text-sm lg:text-base text-slate-800 dark:text-stone-400">
          {t('inputDescription') || 'Weather, fashion, or any question you have'}
        </p>
      </div>

      {/* Content Area - Suggestions */}
      <div className="flex-1 p-4 lg:p-6 space-y-4 lg:space-y-6 overflow-y-auto">
        <div className="hidden lg:block">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-stone-300 mb-4">
            Quick suggestions:
          </h3>
          <div className="space-y-3">
            {[
              "What's the weather like in Tokyo today?",
              "What food should I eat on a cold day?",
              "Best sports for sunny weather?",
              "Weather forecast for New York tomorrow?"
            ].map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => setInputValue(suggestion)}
                className="w-full text-left p-4 text-sm bg-white/95 dark:bg-stone-800/80 hover:bg-white dark:hover:bg-stone-700 border border-slate-300/80 dark:border-stone-600/60 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md backdrop-blur-sm text-slate-900 dark:text-stone-200"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Input Area */}
      <div className="p-4 lg:p-6 border-t border-slate-300/80 dark:border-stone-700/60 bg-white/90 dark:bg-stone-800/20 backdrop-blur-sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={t('inputPlaceholder') || 'Type your message...'}
              disabled={isLoading}
              rows={window.innerWidth < 1024 ? 2 : 3}
              className="w-full px-4 py-3 lg:px-6 lg:py-4 bg-white/95 dark:bg-stone-800/90 border border-slate-300 dark:border-stone-600/60 rounded-2xl text-slate-900 dark:text-stone-100 placeholder-slate-600 dark:placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:focus:ring-purple-400 dark:focus:border-purple-400 resize-none transition-all duration-300 shadow-lg backdrop-blur-sm"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSubmit(e)
                }
              }}
            />

            {/* Rocket Animation */}
            {showRocket && <RocketAnimation />}
          </div>

          <div className="flex items-center justify-between">
            {/* Voice Button */}
            <div className="flex items-center space-x-2">
              {isSupported && (
                <button
                  type="button"
                  onClick={handleVoiceToggle}
                  disabled={isLoading}
                  className={cn(
                    'p-2 rounded-lg transition-all duration-200',
                    isListening
                      ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg'
                      : 'bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
                  )}
                >
                  {isListening ? (
                    <MicOff className="w-4 h-4" />
                  ) : (
                    <Mic className="w-4 h-4" />
                  )}
                </button>
              )}

              {isListening && (
                <div className="flex items-center space-x-2 px-3 py-1 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-full">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-blue-700 dark:text-blue-300">
                    {t('listening') || 'Listening...'}
                  </span>
                </div>
              )}
            </div>

            {/* Send Button */}
            <button
              type="submit"
              disabled={!inputValue.trim() || isLoading}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 hover:from-purple-600 hover:via-indigo-600 hover:to-blue-600 disabled:from-slate-300 disabled:via-slate-300 disabled:to-slate-300 dark:disabled:from-stone-700 dark:disabled:via-stone-700 dark:disabled:to-stone-700 disabled:text-slate-500 dark:disabled:text-stone-400 text-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 backdrop-blur-sm transform hover:scale-105 active:scale-95"
            >
              <Rocket className={cn(
                'w-5 h-5 transition-transform duration-300',
                isLoading ? 'animate-bounce' : 'group-hover:rotate-12'
              )} />
              <span className="text-sm lg:text-base font-semibold">
                {isLoading ? (t('sending') || 'Sending...') : (t('send') || 'Send')}
              </span>
            </button>
          </div>
        </form>

        {/* Voice Error */}
        {voiceError && (
          <div className="mt-3 p-2 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-700 dark:text-red-300">
              {voiceError}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}