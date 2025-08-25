'use client'

interface FooterProps {
  children?: React.ReactNode
  className?: string
}

export default function Footer({ children, className = '' }: FooterProps) {
  return (
    <footer className={`bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 px-6 py-4 ${className}`}>
      {children || (
        <div className="text-sm text-gray-600 dark:text-gray-400 text-center">
          © 2025 Kineo Analytics. All rights reserved.
        </div>
      )}
    </footer>
  )
}