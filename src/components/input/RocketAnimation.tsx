import { Rocket } from 'lucide-react'

export function RocketAnimation() {
  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
      <div className="animate-rocket-launch relative">
        <Rocket className="w-8 h-8 text-blue-500 transform rotate-45" />
        <div className="absolute top-1/2 -left-5 w-5 h-0.5 bg-gradient-to-r from-transparent via-blue-500 to-indigo-600 animate-rocket-trail transform -translate-y-1/2"></div>
      </div>
    </div>
  )
}