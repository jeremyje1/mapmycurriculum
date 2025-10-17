import { createServerSupabaseClient } from '@/lib/supabase-server'
import { NextRequest, NextResponse } from 'next/server'

/**
 * Auth callback handler for Supabase Auth
 * Handles the redirect after email confirmation, password reset, etc.
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') || '/enterprise/dashboard'

  if (code) {
    const supabase = createServerSupabaseClient()
    
    // Exchange the code for a session
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Redirect to the next URL or dashboard
      return NextResponse.redirect(new URL(next, requestUrl.origin))
    }
  }

  // If there's an error or no code, redirect to sign-in with error
  return NextResponse.redirect(
    new URL('/sign-in?error=auth_callback_failed', requestUrl.origin)
  )
}

