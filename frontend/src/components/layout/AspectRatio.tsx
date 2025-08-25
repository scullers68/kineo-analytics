'use client'

interface AspectRatioProps {
  children: React.ReactNode
  className?: string
  ratio?: number | string // e.g., 16/9 or "16:9"
  width?: number | string
  height?: number | string
}

export default function AspectRatio({ 
  children, 
  className = '',
  ratio = 16/9,
  width,
  height
}: AspectRatioProps) {
  // Calculate aspect ratio percentage
  let aspectRatioValue: number
  
  if (typeof ratio === 'string') {
    const [w, h] = ratio.split(':').map(Number)
    aspectRatioValue = (h / w) * 100
  } else {
    aspectRatioValue = (1 / ratio) * 100
  }

  const style: React.CSSProperties = {
    paddingBottom: `${aspectRatioValue}%`,
    ...(width && { width }),
    ...(height && { height })
  }

  return (
    <div className={`relative w-full ${className}`}>
      <div style={style} />
      <div className="absolute inset-0">
        {children}
      </div>
    </div>
  )
}