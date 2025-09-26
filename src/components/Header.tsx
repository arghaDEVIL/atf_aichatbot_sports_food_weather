import { Sun, Moon, Languages } from 'lucide-react'
import { cn } from '../utils/cn'
import { useLanguage } from '../providers/LanguageProvider'
import { useTheme } from '../providers/ThemeProvider'

export function Header() {
  const { language, setLanguage, t } = useLanguage()
  const { theme, toggleTheme } = useTheme()

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-slate-900/95 dark:bg-slate-900/95 border-b border-slate-800/70 dark:border-slate-700/70 shadow-lg dark:shadow-lg">
      <div className="container mx-auto flex h-16 items-center justify-between px-6">
        {/* Left side - Simple logo and title */}
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-sm font-bold">W</span>
          </div>
          <div>
            <h1 className="text-lg font-semibold text-white dark:text-white">
              {t('appTitle')}
            </h1>
          </div>
        </div>

        {/* Right side - Simple controls */}
        <div className="flex items-center space-x-3">
          {/* Language toggle */}
          <button
            onClick={() => setLanguage(language === 'en' ? 'ja' : 'en')}
            className={cn(
              'flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium',
              'text-white dark:text-slate-400 hover:text-gray-200 dark:hover:text-white',
              'hover:bg-slate-800/60 dark:hover:bg-slate-800 transition-colors'
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
              'text-white dark:text-slate-400 hover:text-gray-200 dark:hover:text-white',
              'hover:bg-slate-800/60 dark:hover:bg-slate-800'
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