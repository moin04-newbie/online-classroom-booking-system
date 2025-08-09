import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Routes that require authentication
const protectedRoutes = [
  '/',
  '/admin',
  '/analytics',
  '/availability',
  '/book',
  '/bookings',
  '/equipment',
  '/notifications',
  '/reports',
  '/student',
  '/teacher',
  '/users'
]

// Routes that are only accessible when not authenticated
const authRoutes = [
  '/auth/signin',
  '/auth/signup'
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if the current route is protected
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  )
  
  // Check if the current route is an auth route
  const isAuthRoute = authRoutes.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  )

  // For now, we'll allow all routes since Firebase auth state is handled client-side
  // In a production app, you might want to implement server-side auth checking
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
