import { NextResponse } from 'next/server'
import { auth } from '@/auth'

// Export the auth middleware
export default auth((req) => {
  // Require authentication for all dashboard routes
  const isLoggedIn = !!req.auth
  const isOnDashboard = req.nextUrl.pathname.startsWith('/dashboard')

  if (isOnDashboard && !isLoggedIn) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  return NextResponse.next()
})

// Specify which routes should be protected
export const config = {
  matcher: ['/dashboard/:path*']
}
