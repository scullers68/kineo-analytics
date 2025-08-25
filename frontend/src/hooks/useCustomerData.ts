import { useCustomerStore } from '@/stores/customer-store'

export const useCustomerData = () => {
  const { 
    currentCustomer, 
    customers, 
    isLoading, 
    error, 
    loadCustomers,
    switchCustomer,
    clearCustomerData 
  } = useCustomerStore()

  return {
    data: currentCustomer,
    customers,
    isLoading,
    error,
    refetch: loadCustomers,
    switchCustomer,
    clearData: clearCustomerData
  }
}