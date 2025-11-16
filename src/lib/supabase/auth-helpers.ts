import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function getUser() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return null
  }

  // Get additional user data from database
  const { data: profile } = await supabase
    .from('User')
    .select('*')
    .eq('email', user.email)
    .single()

  return {
    ...user,
    profile
  }
}

export async function requireAuth() {
  const user = await getUser()

  if (!user) {
    redirect('/login')
  }

  return user
}

export async function requireAdmin() {
  const user = await getUser()

  if (!user || user.profile?.role !== 'ADMIN') {
    redirect('/')
  }

  return user
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}