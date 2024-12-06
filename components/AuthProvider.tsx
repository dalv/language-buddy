'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuthStore } from '@/store/useAuthStore'

const PUBLIC_PATHS = ['/signin', '/reset-password']

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, checkAuth, signOut } = useAuthStore()

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  useEffect(() => {
    if (!user && !PUBLIC_PATHS.includes(pathname)) {
      router.push('/signin')
    }
  }, [user, pathname, router])

  if (!user && !PUBLIC_PATHS.includes(pathname)) {
    return null
  }

  return (
    <div className="min-h-screen flex flex-col">
      {user && (
        <header className="bg-primary text-primary-foreground p-4">
          <div className="container mx-auto flex justify-between items-center">
            <h1 className="text-2xl font-bold">Language Buddy</h1>
            <button onClick={signOut} className="bg-secondary text-secondary-foreground px-4 py-2 rounded">
              Sign Out
            </button>
          </div>
        </header>
      )}
      <main className="flex-grow container mx-auto p-4">
        {children}
      </main>
    </div>
  )
}

