import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Basic middleware for route protection
  // This will be enhanced with authentication logic
  const pathname = request.nextUrl.pathname
  
  // Allow public routes
  if (pathname === '/' || pathname.startsWith('/api/auth')) {
    return NextResponse.next()
  }
  
  // For now, allow all routes
  // TODO: Add authentication checks
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)']
}