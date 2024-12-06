import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { supabase } from '@/lib/supabase'

interface AuthState {
  user: any | null
  signIn: (email: string, password: string, isHardcodedUser?: boolean) => Promise<void>
  signOut: () => Promise<void>
  checkAuth: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      signIn: async (email: string, password: string, isHardcodedUser = false) => {
        if (isHardcodedUser) {
          // Hardcoded user login
          set({
            user: {
              id: 'hardcoded-user-id',
              email: email,
              user_metadata: { name: 'Vlad Tamas' }
            }
          })
        } else {
          // Regular Supabase authentication
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          })
          if (error) throw error
          set({ user: data.user })
        }
      },
      signOut: async () => {
        const { error } = await supabase.auth.signOut()
        if (error) throw error
        set({ user: null })
      },
      checkAuth: async () => {
        const { data } = await supabase.auth.getSession()
        set({ user: data.session?.user ?? null })
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
)

