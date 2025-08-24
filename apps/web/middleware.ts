import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Allow all requests to pass through
  return NextResponse.next()
}

export const config = {
  matcher: [
    // Skip all internal paths (_next, images, etc)
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}