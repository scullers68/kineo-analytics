import { useCustomer as useCustomerContext } from '@/contexts/CustomerContext'

export const useCustomer = () => {
  return useCustomerContext()
}