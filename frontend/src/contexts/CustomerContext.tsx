'use client'

import { createContext, useContext, ReactNode } from 'react'
import { useCustomerStore } from '@/stores/customer-store'
import type { Customer } from '@/types/store'

interface CustomerBranding {
  customerId: string
  logo: string
  colors: {
    primary: string
    secondary: string
    background: string
  }
  typography: {
    fontFamily: string
    fontSize: number
  }
  watermark: boolean
}

interface CustomerContextType {
  customer: Customer | null
  setCustomer: (customer: Customer | null) => void
  branding: CustomerBranding
}

const CustomerContext = createContext<CustomerContextType | undefined>(undefined)

export function CustomerProvider({ children }: { children: ReactNode }) {
  // Now connected to Zustand store
  const { currentCustomer: customer, setCurrentCustomer: setCustomer } = useCustomerStore()

  // Mock branding for testing
  const branding: CustomerBranding = {
    customerId: 'customer_001',
    logo: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCI+PC9zdmc+',
    colors: {
      primary: '#0066CC',
      secondary: '#FF6B35', 
      background: '#FFFFFF'
    },
    typography: {
      fontFamily: 'Inter, sans-serif',
      fontSize: 14
    },
    watermark: false
  }

  return (
    <CustomerContext.Provider value={{ customer, setCustomer, branding }}>
      {children}
    </CustomerContext.Provider>
  )
}

export function useCustomer() {
  const context = useContext(CustomerContext)
  if (context === undefined) {
    throw new Error('useCustomer must be used within a CustomerProvider')
  }
  return context
}

// Export the context for testing
export { CustomerContext }