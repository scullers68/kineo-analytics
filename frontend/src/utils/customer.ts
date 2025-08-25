import { NextRequest } from 'next/server'

export interface Customer {
  id: string
  name: string
  subdomain: string
  settings?: {
    theme?: string
    timezone?: string
    currency?: string
  }
}

export function extractCustomerFromRequest(request: NextRequest): string | null {
  // Extract customer ID from subdomain or header
  const host = request.headers.get('host')
  if (!host) return null
  
  // Example: customer1.kineo-analytics.com -> customer1
  const subdomain = host.split('.')[0]
  if (subdomain && subdomain !== 'www') {
    return subdomain
  }
  
  return null
}

export function validateCustomerData(customer: any): customer is Customer {
  return (
    customer &&
    typeof customer.id === 'string' &&
    typeof customer.name === 'string' &&
    typeof customer.subdomain === 'string'
  )
}