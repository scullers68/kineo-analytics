import { useAuthStore } from '@/stores/auth-store'
import { useCustomerStore } from '@/stores/customer-store'

export const useCustomerAuth = () => {
  const { isAuthenticated, user, login, logout } = useAuthStore()
  const { currentCustomer } = useCustomerStore()

  return {
    isAuthenticated,
    customer: currentCustomer,
    user,
    login,
    logout
  }
}