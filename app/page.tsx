'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Session } from '@supabase/supabase-js'

export default function HomePage() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  
  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      }: { data: { session: Session | null } } = await supabase.auth.getSession()

      if (session) {
        router.push('/dashboard')
      } else {
        router.push('/login')
      }
    }

    checkSession()
  }, [router, supabase])

  return <p>Bezig met controleren...</p>
}
