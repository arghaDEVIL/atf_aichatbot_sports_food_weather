import { Cloud, Droplets, Wind, Thermometer, Eye, UtensilsCrossed, Dumbbell } from 'lucide-react'
import { cn } from '../../utils/cn'
import type { WeatherData } from '../../services/weatherService'
import type { FoodSportsRecommendations } from '../../services/geminiService'

interface WeatherCardProps {
  weatherData: WeatherData
  recommendations?: FoodSportsRecommendations
}

export function WeatherCard({ weatherData, recommendations }: WeatherCardProps) {
  const metrics = [
    {
      icon: Thermometer,
      label: 'Temperature',
      value: `${weatherData.temperature}°C`,
      color: 'text-red-500 dark:text-red-400'
    },
    {
      icon: Thermometer,
      label: 'Feels Like',
      value: `${weatherData.feelsLike}°C`,
      color: 'text-orange-500 dark:text-orange-400'
    },
    {
      icon: Droplets,
      label: 'Humidity',
      value: `${weatherData.humidity}%`,
      color: 'text-blue-500 dark:text-blue-400'
    },
    {
      icon: Wind,
      label: 'Wind Speed',
      value: `${weatherData.windSpeed} km/h`,
      color: 'text-emerald-500 dark:text-emerald-400'
    },
    {
      icon: Eye,
      label: 'Visibility',
      value: `${weatherData.visibility} km`,
      color: 'text-indigo-500 dark:text-indigo-400'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Weather Card */}
      <div className="minimal-card p-6 max-w-2xl">
        {/* Header */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
            🌤️ {weatherData.city}, {weatherData.country}
          </h3>
          <p className="text-slate-600 dark:text-slate-400 capitalize">
            {weatherData.description} • {weatherData.date}
          </p>
        </div>

        {/* Weather Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {metrics.map((metric) => {
            const IconComponent = metric.icon
            return (
              <div
                key={metric.label}
                className="bg-slate-50 dark:bg-gray-600/70 p-4 rounded-xl border border-slate-200/50 dark:border-gray-500/50 hover:bg-white dark:hover:bg-slate-800 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <IconComponent className={cn('w-5 h-5', metric.color)} />
                </div>
                <div className="space-y-1">
                  <div className="text-xl font-bold text-slate-900 dark:text-white">
                    {metric.value}
                  </div>
                  <div className="text-xs font-medium text-slate-600 dark:text-slate-400">
                    {metric.label}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Recommendations Card */}
      {recommendations && (
        <div className="minimal-card p-6 max-w-2xl">
          <div className="mb-4">
            <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              🍽️ Recommendations for This Weather
            </h4>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {recommendations.reasoning}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Food Recommendations */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <UtensilsCrossed className="w-5 h-5 text-orange-500 dark:text-orange-400" />
                <h5 className="font-semibold text-slate-900 dark:text-white">Food Ideas</h5>
              </div>
              <div className="space-y-2">
                {recommendations.foods.map((food, index) => (
                  <div
                    key={index}
className="bg-purple-50/50 dark:bg-purple-800/20 border border-purple-200 dark:border-black-700/50 px-3 py-2 rounded-lg text-sm text-slate-800 dark:text-purple-100"
>                    {food}
                  </div>
                ))}
              </div>
            </div>

            {/* Sports Recommendations */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Dumbbell className="w-5 h-5 text-green-500 dark:text-green-400" />
                <h5 className="font-semibold text-slate-900 dark:text-white">Sports & Activities</h5>
              </div>
              <div className="space-y-2">
                {recommendations.sports.map((sport, index) => (
                  <div
                    key={index}
className="bg-blue-50/50 dark:bg-blue-800/20 border border-blue-200 dark:border-black-700/50 px-3 py-2 rounded-lg text-sm text-slate-800 dark:text-blue-100">                    {sport}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}