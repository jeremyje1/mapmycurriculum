'use server'

import { createServerSupabaseClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

/**
 * Server action to sign out the current user
 */
export async function signOutAction() {
  const supabase = createServerSupabaseClient()
  
  await supabase.auth.signOut()
  
  // Revalidate all pages to clear cached auth data
  revalidatePath('/', 'layout')
  
  // Redirect to home page
  redirect('/')
}

/**
 * Server action to sign in with email/password
 */
export async function signInAction(email: string, password: string) {
  const supabase = createServerSupabaseClient()
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  
  if (error) {
    return { error: error.message }
  }
  
  if (data.session) {
    revalidatePath('/', 'layout')
    return { success: true }
  }
  
  return { error: 'Failed to sign in' }
}

/**
 * Server action to sign up with email/password
 */
export async function signUpAction(
  email: string,
  password: string,
  institutionName: string,
  state: string
) {
  const supabase = createServerSupabaseClient()
  
  // Sign up the user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  })
  
  if (authError) {
    return { error: authError.message }
  }
  
  if (!authData.user) {
    return { error: 'Failed to create user' }
  }
  
  // Create institution and user record
  try {
    // Create institution
    const { data: institution, error: institutionError } = await supabase
      .from('institutions')
      .insert({
        name: institutionName,
        state,
      })
      .select()
      .single()
    
    if (institutionError) throw institutionError
    
    // Update user record with institution
    const { error: userError } = await supabase
      .from('users')
      .update({
        institution_id: institution.id,
        role: 'admin', // First user is admin
      })
      .eq('id', authData.user.id)
    
    if (userError) throw userError
    
    return { 
      success: true, 
      message: 'Account created! Please check your email to verify your account.' 
    }
  } catch (error: any) {
    // Clean up auth user if institution/user creation fails
    await supabase.auth.admin.deleteUser(authData.user.id)
    return { error: error.message || 'Failed to create institution' }
  }
}
