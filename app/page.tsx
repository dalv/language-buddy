'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/store/useAuthStore'

export default function Home() {
  const { user, checkAuth } = useAuthStore()

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  if (!user) {
    return <div>Loading...</div>
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h2 className="text-2xl font-semibold mb-6">Welcome, {user.email}</h2>
      <div className="space-x-4">
        <Link href="/manage">
          <Button>Manage Flashcards</Button>
        </Link>
        <Link href="/study">
          <Button>Study Flashcards</Button>
        </Link>
      </div>
    </div>
  )
}

