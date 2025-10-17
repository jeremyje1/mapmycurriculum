import { createServerSupabaseClient } from './supabase-server'
import { cache } from 'react'
import { redirect } from 'next/navigation'

// Types for our auth system
export interface AuthUser {
  id: string
  email: string
  institutionId?: string
  role?: string
}

export interface AuthSession {
  user: AuthUser
  accessToken: string
}

/**
 * Get the current user session (cached per request)
 * Returns null if not authenticated
 */
export const getSession = cache(async (): Promise<AuthSession | null> => {
  const supabase = createServerSupabaseClient()
  
  const { data: { session }, error } = await supabase.auth.getSession()
  
  if (error || !session) {
    return null
  }

  // Get additional user data from our User table
  const { data: userData } = await supabase
    .from('User')
    .select('id, email, institutionId, role')
    .eq('email', session.user.email)
    .single()

  return {
    user: {
      id: session.user.id,
      email: session.user.email!,
      institutionId: userData?.institutionId,
      role: userData?.role,
    },
    accessToken: session.access_token,
  }
})

/**
 * Get the current authenticated user
 * Returns null if not authenticated
 */
export const getUser = cache(async (): Promise<AuthUser | null> => {
  const session = await getSession()
  return session?.user ?? null
})

/**
 * Require authentication - redirects to sign-in if not authenticated
 * Use in Server Components that need authentication
 */
export async function requireAuth(): Promise<AuthSession> {
  const session = await getSession()
  
  if (!session) {
    redirect('/sign-in')
  }
  
  return session
}

/**
 * Require specific role - redirects to unauthorized if insufficient permissions
 */
export async function requireRole(allowedRoles: string[]): Promise<AuthSession> {
  const session = await requireAuth()
  
  if (!session.user.role || !allowedRoles.includes(session.user.role)) {
    redirect('/unauthorized')
  }
  
  return session
}

/**
 * Check if user is authenticated (boolean)
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession()
  return session !== null
}

/**
 * Sign out the current user
 */
export async function signOut(): Promise<void> {
  const supabase = createServerSupabaseClient()
  await supabase.auth.signOut()
}

/**
 * Get user's institution ID (useful for RLS queries)
 */
export async function getUserInstitutionId(): Promise<string | null> {
  const user = await getUser()
  return user?.institutionId ?? null
}
