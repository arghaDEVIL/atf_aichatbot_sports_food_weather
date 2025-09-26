import { Bot } from 'lucide-react'

export function LoadingIndicator() {
  return (
    <div className="flex items-start space-x-4">
      {/* Avatar */}
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
        <Bot className="w-5 h-5 text-slate-600 dark:text-slate-300" />
      </div>

      {/* Loading Content */}
      <div className="flex-1 max-w-3xl">
        <div className="px-4 py-3 rounded-2xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center space-x-3">
            {/* Animated Dots */}
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-slate-500 dark:bg-slate-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-slate-500 dark:bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-slate-500 dark:bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>

            {/* Loading Text */}
            <span className="text-sm text-slate-600 dark:text-slate-400">
              Thinking...
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}