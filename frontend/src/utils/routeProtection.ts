import { NextRequest, NextResponse } from 'next/server'
import { extractCustomerFromRequest } from './customer'

export function protectRoute(request: NextRequest): NextResponse | null {
  const pathname = request.nextUrl.pathname
  
  // Public routes that don't require authentication
  const publicRoutes = ['/', '/login', '/api/auth']
  
  if (publicRoutes.includes(pathname)) {
    return null // Allow access
  }
  
  // Protected routes require customer context
  const customerId = extractCustomerFromRequest(request)
  
  if (!customerId) {
    // Redirect to login if no customer context
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
  // Add customer context to headers for downstream use
  const response = NextResponse.next()
  response.headers.set('x-customer-id', customerId)
  
  return response
}