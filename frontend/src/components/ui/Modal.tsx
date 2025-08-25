'use client'

import { ReactNode, useEffect } from 'react'
import { clsx } from 'clsx'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  children: ReactNode
  className?: string
  overlay?: boolean
  closeOnEscape?: boolean
  closeOnOverlay?: boolean
}

const sizeClasses = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl'
}

export default function Modal({
  isOpen,
  onClose,
  title,
  size = 'md',
  children,
  className = '',
  overlay = true,
  closeOnEscape = true,
  closeOnOverlay = true
}: ModalProps) {
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, closeOnEscape, onClose])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="modal-overlay fixed inset-0 z-50 flex items-center justify-center p-4">
      {overlay && (
        <div 
          className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={closeOnOverlay ? onClose : undefined}
        />
      )}
      
      <div className={clsx(
        'modal-content',
        'relative bg-white dark:bg-gray-800',
        'rounded-lg shadow-xl',
        'border border-gray-200 dark:border-gray-700',
        'w-full',
        sizeClasses[size],
        'max-h-[90vh] overflow-y-auto',
        className
      )}>
        {title && (
          <div className="modal-header flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {title}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <span className="sr-only">Close</span>
              ✕
            </button>
          </div>
        )}
        
        <div className="modal-body p-6">
          {children}
        </div>
      </div>
    </div>
  )
}