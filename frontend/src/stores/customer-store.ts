import { create } from 'zustand'
import { persist, devtools } from 'zustand/middleware'
import type { CustomerStore, Customer } from '@/types/store'
import { validateCustomerData } from '@/utils/customer'

const useCustomerStore = create<CustomerStore>()(
  devtools(
    persist(
      (set, get) => ({
        // State
        currentCustomer: null,
        customers: [],
        isLoading: false,
        error: null,

        // Actions
        setCurrentCustomer: (customer: Customer | null) => {
          if (customer && !validateCustomerData(customer)) {
            set({
              error: 'Invalid customer data: missing required fields'
            }, false, 'customer/set-invalid')
            return
          }

          set({
            currentCustomer: customer,
            error: null,
          }, false, 'customer/set-current')
        },

        loadCustomers: async () => {
          set({ isLoading: true, error: null }, false, 'customer/load-start')

          try {
            // TODO: Replace with actual API call
            const response = await fetch('/api/customers')
            
            if (!response.ok) {
              throw new Error('Failed to load customers')
            }

            const customers: Customer[] = await response.json()
            
            // Validate all customer data
            const validCustomers = customers.filter(validateCustomerData)
            
            if (validCustomers.length !== customers.length) {
              console.warn('Some customer data was invalid and filtered out')
            }

            set({
              customers: validCustomers,
              isLoading: false,
              error: null,
            }, false, 'customer/load-success')
          } catch (error) {
            set({
              error: error instanceof Error ? error.message : 'Unknown error',
              isLoading: false,
            }, false, 'customer/load-error')
          }
        },

        switchCustomer: async (customerId: string) => {
          const { customers } = get()
          const customer = customers.find(c => c.id === customerId)
          
          if (!customer) {
            set({
              error: `Customer with ID ${customerId} not found`
            }, false, 'customer/switch-not-found')
            return
          }

          set({ isLoading: true }, false, 'customer/switch-start')

          try {
            // TODO: Add any customer switching API calls here
            // For now, just set the current customer
            get().setCurrentCustomer(customer)
            
            set({ isLoading: false }, false, 'customer/switch-success')
          } catch (error) {
            set({
              error: error instanceof Error ? error.message : 'Failed to switch customer',
              isLoading: false,
            }, false, 'customer/switch-error')
          }
        },

        clearCustomerData: () => {
          set({
            currentCustomer: null,
            customers: [],
            isLoading: false,
            error: null,
          }, false, 'customer/clear')
        },
      }),
      {
        name: 'customer-storage',
        partialize: (state) => ({
          currentCustomer: state.currentCustomer,
          customers: state.customers,
        }),
      }
    ),
    { name: 'customer-store' }
  )
)

// Add persistence configuration access for testing - removed due to TypeScript issues

export { useCustomerStore }