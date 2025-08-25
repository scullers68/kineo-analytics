'use client'

interface MainContentProps {
  children: React.ReactNode
  className?: string
}

export default function MainContent({ children, className = '' }: MainContentProps) {
  return (
    <main className={`flex-1 overflow-auto ${className}`}>
      {children}
    </main>
  )
}