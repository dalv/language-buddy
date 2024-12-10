'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { supabase } from '@/lib/supabase'

export default function ResetPassword() {
  const [newPassword, setNewPassword] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [resetToken, setResetToken] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const getResetTokenFromURL = () => {
      if (typeof window !== 'undefined') {
        const hash = window.location.hash;
        var urlToken = null;

        if (hash) {
          // Remove the leading '#' and parse it
          const params = new URLSearchParams(hash.substring(1));
          const token = params.get('access_token');
          urlToken = token;
        }

        if (urlToken) {
          setResetToken(urlToken)
          setIsLoading(false)
        } else {
          setError('Invalid reset link. Please request a new password reset email.')
          setIsLoading(false)
        }
      }
    }

    getResetTokenFromURL()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)


    try {
      if (!resetToken) {
        throw new Error('Invalid reset token')
      }

      const { data, error } = await supabase.auth.exchangeCodeForSession(resetToken)
      console.log("Reset token:");
      console.log(resetToken);
      console.log("Session:");
      console.log(data);
    } catch (err) {
      console.error('Failedget session from reset token:', err)
      setError('Failed to update password. Please try again or request a new password reset email.')
    } finally {
      setIsLoading(false)
    }

    try {
      if (!resetToken) {
        throw new Error('Invalid reset token')
      }
      
      const { data, error } = await supabase.auth.updateUser({password: `${newPassword}`});
      if (error) throw error

      setMessage('Password updated successfully. Redirecting to sign in...')
      setTimeout(() => router.push('/signin'), 3000)
    } catch (err) {
      console.error('Failed to update password:', err)
      setError('Failed to update password. Please try again or request a new password reset email.')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>
  }

  return (
    <div className="flex justify-center items-center min-h-screen">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Reset Your Password</CardTitle>
        </CardHeader>
        <CardContent>
          {error ? (
            <div>
              <p className="text-red-500 text-sm mb-4">{error}</p>
              <Button onClick={() => router.push('/signin')} className="w-full">
                Return to Sign In
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Input
                  type="password"
                  placeholder="New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
              {message && <p className="text-green-500 text-sm">{message}</p>}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Updating...' : 'Reset Password'}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

