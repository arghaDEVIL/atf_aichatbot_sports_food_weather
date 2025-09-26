import { useEffect, useState } from 'react'

interface FloatingShape {
  id: number
  x: number
  y: number
  size: number
  color: string
  duration: number
}

export function BackgroundPattern() {
  const [shapes, setShapes] = useState<FloatingShape[]>([])

  useEffect(() => {
    const colors = [
      'rgba(236, 156, 8, 0.1)',   // primary
      'rgba(247, 112, 112, 0.08)', // secondary
      'rgba(14, 165, 233, 0.06)',  // accent
    ]

    const generateShapes = () => {
      const newShapes: FloatingShape[] = []
      for (let i = 0; i < 8; i++) {
        newShapes.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 200 + 100,
          color: colors[Math.floor(Math.random() * colors.length)],
          duration: Math.random() * 10 + 15, // 15-25 seconds
        })
      }
      setShapes(newShapes)
    }

    generateShapes()
  }, [])

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Organic floating shapes - different from original's geometric blobs */}
      {shapes.map((shape) => (
        <div
          key={shape.id}
          className="absolute rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-drift"
          style={{
            left: `${shape.x}%`,
            top: `${shape.y}%`,
            width: `${shape.size}px`,
            height: `${shape.size}px`,
            background: `radial-gradient(circle, ${shape.color} 0%, transparent 70%)`,
            animation: `drift ${shape.duration}s ease-in-out infinite`,
            animationDelay: `${shape.id * 2}s`,
          }}
        />
      ))}

      {/* Subtle mesh gradient overlay */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background: `
            radial-gradient(circle at 20% 30%, rgba(236, 156, 8, 0.03) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(247, 112, 112, 0.03) 0%, transparent 50%),
            radial-gradient(circle at 60% 80%, rgba(14, 165, 233, 0.03) 0%, transparent 50%),
            radial-gradient(circle at 40% 60%, rgba(236, 156, 8, 0.02) 0%, transparent 50%)
          `,
        }}
      />

      {/* Light rays effect - unique addition */}
      <div className="absolute inset-0">
        <div
          className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-primary-200/20 via-transparent to-transparent animate-pulse-slow"
          style={{ animationDelay: '0s' }}
        />
        <div
          className="absolute top-0 left-2/3 w-px h-full bg-gradient-to-b from-secondary-200/15 via-transparent to-transparent animate-pulse-slow"
          style={{ animationDelay: '2s' }}
        />
        <div
          className="absolute top-0 right-1/4 w-px h-full bg-gradient-to-b from-accent-200/10 via-transparent to-transparent animate-pulse-slow"
          style={{ animationDelay: '4s' }}
        />
      </div>
    </div>
  )
}