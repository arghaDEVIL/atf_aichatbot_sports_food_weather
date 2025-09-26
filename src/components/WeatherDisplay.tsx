import { Cloud, Droplets, Wind, Sun, Thermometer, Eye } from 'lucide-react'
import { cn } from '../utils/cn'
import { useLanguage } from '../providers/LanguageProvider'
import type { WeatherData } from '../models'

interface WeatherDisplayProps {
  weather: WeatherData | null
  isLoading?: boolean
}

export function WeatherDisplay({ weather, isLoading }: WeatherDisplayProps) {
  const { t } = useLanguage()

  if (isLoading) {
    return (
      <div className="w-full">
        <div className="minimal-card p-4 animate-pulse">
          <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-32 mb-3"></div>
          <div className="grid grid-cols-1 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white/80 dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50 p-3 rounded-xl backdrop-blur-sm">
                <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded mb-2"></div>
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!weather) return null

  const weatherMetrics = [
    {
      icon: Thermometer,
      label: 'Temperature',
      value: `${weather.temperature}°C`,
      color: 'text-red-500 dark:text-red-400'
    },
    {
      icon: Droplets,
      label: 'Humidity',
      value: `${weather.humidity}%`,
      color: 'text-blue-500 dark:text-blue-400'
    },
    {
      icon: Wind,
      label: 'Wind Speed',
      value: `${weather.windSpeed}m/s`,
      color: 'text-emerald-500 dark:text-emerald-400'
    },
    {
      icon: Cloud,
      label: 'Cloud Cover',
      value: `${weather.cloudCover}%`,
      color: 'text-slate-500 dark:text-slate-400'
    },
    {
      icon: Sun,
      label: 'UV Index',
      value: `${weather.uvIndex}`,
      color: 'text-amber-500 dark:text-amber-400'
    },
    {
      icon: Eye,
      label: 'Precipitation',
      value: `${weather.precipitation}mm`,
      color: 'text-indigo-500 dark:text-indigo-400'
    }
  ]

  return (
    <div className="w-full animate-fadeIn">
      <div className="minimal-card p-4 shadow-lg hover:shadow-xl transition-all duration-300">
        {/* Header */}
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
            {weather.city}, {weather.country}
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 capitalize">
            {weather.description}
          </p>
        </div>

        {/* Weather Grid - Single column for narrow layout */}
        <div className="grid grid-cols-1 gap-3">
          {weatherMetrics.map((metric, index) => {
            const IconComponent = metric.icon
            return (
              <div
                key={metric.label}
                className="bg-white/90 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/50 p-4 rounded-xl hover:bg-white hover:shadow-lg dark:hover:bg-slate-800 hover:shadow-md transition-all duration-200 backdrop-blur-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <IconComponent className={cn('w-4 h-4', metric.color)} />
                    <div className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      {metric.label}
                    </div>
                  </div>
                  <div className="text-lg font-bold text-slate-900 dark:text-white">
                    {metric.value}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}