'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/useAuthStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { supabase } from '@/lib/supabase'

const getLastResetAttempt = () => {
  if (typeof window === 'undefined') return 0
  return parseInt(localStorage.getItem('lastResetAttempt') || '0')
}

const setLastResetAttempt = () => {
  if (typeof window === 'undefined') return
  localStorage.setItem('lastResetAttempt', Date.now().toString())
}

export default function SignIn() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { signIn, user } = useAuthStore()

  useEffect(() => {
    if (user) {
      router.push('/')
    }
  }, [user, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    try {
      if (email === 'vlad.tamas@gmail.com' && password === 'test123') {
        // Hardcoded user login
        await signIn(email, password, true)
      } else {
        // Regular Supabase authentication
        await signIn(email, password)
      }
      // The useEffect hook will handle the redirection
    } catch (err) {
      setError('Invalid email or password')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetPassword = async () => {
    if (!email) {
      setError('Please enter your email address')
      return
    }

    const lastAttempt = getLastResetAttempt()
    const now = Date.now()
    const timeSinceLastAttempt = now - lastAttempt

    if (timeSinceLastAttempt < 60000) { // 1 minute cooldown
      const remainingSeconds = Math.ceil((60000 - timeSinceLastAttempt) / 1000)
      setError(`Please wait ${remainingSeconds} seconds before requesting another reset email`)
      return
    }

    setIsLoading(true)
    setError('')
    setMessage('')

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      })
      if (error) {
        if (error.status === 429) {
          throw new Error('Too many reset attempts. Please try again in a few minutes.')
        }
        throw error
      }
      setLastResetAttempt()
      setMessage('Password reset email sent. Check your inbox.')
    } catch (err) {
      console.error('Reset password error:', err)
      setError(err instanceof Error ? err.message : 'Failed to send reset password email. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Sign In to Language Buddy</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            {message && <p className="text-green-500 text-sm">{message}</p>}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>
          <Button 
            variant="link" 
            onClick={handleResetPassword} 
            className="mt-4 w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : 'Forgot Password?'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

