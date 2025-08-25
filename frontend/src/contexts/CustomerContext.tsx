'use client'

import { createContext, useContext, ReactNode } from 'react'
import { useCustomerStore } from '@/stores/customer-store'
import type { Customer } from '@/types/store'

interface CustomerContextType {
  customer: Customer | null
  setCustomer: (customer: Customer | null) => void
}

const CustomerContext = createContext<CustomerContextType | undefined>(undefined)

export function CustomerProvider({ children }: { children: ReactNode }) {
  // Now connected to Zustand store
  const { currentCustomer: customer, setCurrentCustomer: setCustomer } = useCustomerStore()

  return (
    <CustomerContext.Provider value={{ customer, setCustomer }}>
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