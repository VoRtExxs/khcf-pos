import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Edge Middleware for Server-Side Route Guard
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Read authenticated session cookie
  const authCookie = request.cookies.get('khcf_auth_session')
  let sessionUser: { id?: string; name?: string; role?: string } | null = null

  if (authCookie?.value) {
    try {
      sessionUser = JSON.parse(decodeURIComponent(authCookie.value))
    } catch {
      sessionUser = null
    }
  }

  const isAuthenticated = !!sessionUser?.id
  const isAdminOrSupervisor = sessionUser?.role === 'ADMIN' || sessionUser?.role === 'SUPERVISOR'

  // 1. Guard Admin Routes
  if (pathname.startsWith('/admin')) {
    if (!isAuthenticated) {
      const loginUrl = new URL('/', request.url)
      loginUrl.searchParams.set('error', 'auth_required')
      return NextResponse.redirect(loginUrl)
    }

    if (!isAdminOrSupervisor) {
      // Authenticated but insufficient permissions
      const posUrl = new URL('/pos', request.url)
      return NextResponse.redirect(posUrl)
    }
  }

  // 2. Guard POS Routes
  if (pathname.startsWith('/pos')) {
    if (!isAuthenticated) {
      const loginUrl = new URL('/', request.url)
      loginUrl.searchParams.set('error', 'auth_required')
      return NextResponse.redirect(loginUrl)
    }
  }

  // 3. Prevent logged-in users from seeing the login screen again
  if (pathname === '/' && isAuthenticated) {
    if (isAdminOrSupervisor) {
      return NextResponse.redirect(new URL('/admin', request.url))
    } else {
      return NextResponse.redirect(new URL('/pos', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/',
    '/admin/:path*',
    '/pos/:path*'
  ]
}
