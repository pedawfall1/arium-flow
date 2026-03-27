import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  
  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // Redirect to onboarding after successful login/signup via magic link or OAuth
      // Normally signup redirects to onboarding, login to dashboard
      // To differentiate, we might just redirect to dashboard and let middleware handle it
      return NextResponse.redirect(`${origin}/dashboard`)
    }
  }

  // Return to login page if there's an error
  return NextResponse.redirect(`${origin}/login?error=auth-callback-failed`)
}
