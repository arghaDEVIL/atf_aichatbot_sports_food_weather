import { Sun, Moon, Languages, Trash2 } from 'lucide-react'
import { cn } from '../../utils/cn'
import { useLanguage } from '../../providers/LanguageProvider'
import { useTheme } from '../../providers/ThemeProvider'
import { useChat } from '../../providers/ChatProvider'

export function NavigationBar() {
  const { language, setLanguage, t } = useLanguage()
  const { theme, toggleTheme } = useTheme()
  const { clearConversation } = useChat()

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-white/98 dark:bg-slate-900/95 border-b border-slate-300/80 dark:border-slate-800/70 shadow-lg dark:shadow-lg">
      <div className="container mx-auto flex h-16 items-center justify-between px-6">
        {/* Left side - Logo and title */}
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
            <span className="text-white text-sm font-bold">W</span>
          </div>
          <div>
            <h1 className="text-lg font-semibold text-slate-900 dark:text-white">
              {t('appTitle')}
            </h1>
          </div>
        </div>

        {/* Right side - Controls */}
        <div className="flex items-center space-x-3">
          {/* Clear conversation */}
          <button
            onClick={clearConversation}
            className={cn(
              'p-2 rounded-lg transition-colors',
              'text-slate-700 dark:text-white hover:text-slate-900 dark:hover:text-gray-200',
              'hover:bg-slate-100 dark:hover:bg-slate-800/60'
            )}
            title="Clear conversation"
          >
            <Trash2 className="h-5 w-5" />
          </button>

          {/* Language toggle */}
          <button
            onClick={() => setLanguage(language === 'en' ? 'ja' : 'en')}
            className={cn(
              'flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium',
              'text-slate-700 dark:text-white hover:text-slate-900 dark:hover:text-gray-200',
              'hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors'
            )}
          >
            <Languages className="h-4 w-4" />
            <span>{language.toUpperCase()}</span>
          </button>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className={cn(
              'p-2 rounded-lg transition-colors',
              'text-slate-700 dark:text-white hover:text-slate-900 dark:hover:text-gray-200',
              'hover:bg-slate-100 dark:hover:bg-slate-800/60'
            )}
          >
            {theme === 'light' ? (
              <Moon className="h-5 w-5" />
            ) : (
              <Sun className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>
    </header>
  )
}