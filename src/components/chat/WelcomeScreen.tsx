import { Bot, Sparkles, Cloud, UtensilsCrossed, Dumbbell } from 'lucide-react'
import { useLanguage } from '../../providers/LanguageProvider'

export function WelcomeScreen() {
  const { t } = useLanguage()

  return (
    <div className="flex items-center justify-center h-full min-h-96">
      <div className="text-center space-y-8 max-w-2xl mx-auto">
        {/* Hero Section */}
        <div className="space-y-4">
          <div className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-2xl">
            <Bot className="w-12 h-12 text-white" />
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              {t('welcomeTitle') || 'Welcome to Munch and Play!'}
            </h1>
            <p className="text-lg text-slate-700 dark:text-slate-400">
              {t('welcomeMessage') || 'Your AI assistant for weather forecasts and food & sports recommendations'}
            </p>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="minimal-card p-6 text-center space-y-3 hover:shadow-lg transition-all duration-300">
            <div className="w-12 h-12 mx-auto bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <Cloud className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="font-semibold text-slate-900 dark:text-white">Weather Insights</h3>
            <p className="text-sm text-slate-700 dark:text-slate-400">
              Get real-time weather information and forecasts for any location
            </p>
          </div>

          <div className="minimal-card p-6 text-center space-y-3 hover:shadow-lg transition-all duration-300">
            <div className="w-12 h-12 mx-auto bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
              <UtensilsCrossed className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <h3 className="font-semibold text-slate-900 dark:text-white">Food Recommendations</h3>
            <p className="text-sm text-slate-700 dark:text-slate-400">
              Get personalized food suggestions based on weather conditions
            </p>
          </div>

          <div className="minimal-card p-6 text-center space-y-3 hover:shadow-lg transition-all duration-300">
            <div className="w-12 h-12 mx-auto bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <Dumbbell className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="font-semibold text-slate-900 dark:text-white">Sports Activities</h3>
            <p className="text-sm text-slate-700 dark:text-slate-400">
              Discover the best sports and activities for current weather
            </p>
          </div>
        </div>

        {/* Call to Action */}
        <div className="pt-4">
          <p className="text-slate-600 dark:text-slate-400">
            Start a conversation by typing in the panel on the right →
          </p>
        </div>
      </div>
    </div>
  )
}