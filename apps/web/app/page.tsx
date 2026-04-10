'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    const auth =
      typeof window !== 'undefined' ? localStorage.getItem('aha_auth') : null
    if (auth) {
      router.replace('/chat')
    } else {
      router.replace('/login')
    }
  }, [router])

  return null
}
