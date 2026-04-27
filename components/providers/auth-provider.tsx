'use client'

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import useSWR from 'swr'

type User = {
  id: number
  email: string
  name: string | null
}

type AuthContextType = {
  user: User | null
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<{ error?: string }>
  signUp: (email: string, password: string, name?: string) => Promise<{ error?: string }>
  signOut: () => Promise<void>
  refresh: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const fetcher = (url: string) => fetch(url).then(res => res.json())

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data, isLoading, mutate } = useSWR<{ user: User | null }>('/api/auth/me', fetcher)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const signIn = useCallback(async (email: string, password: string) => {
    setIsSubmitting(true)
    try {
      const res = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      
      if (data.error) {
        return { error: data.error }
      }
      
      await mutate()
      return {}
    } finally {
      setIsSubmitting(false)
    }
  }, [mutate])
  
  const signUp = useCallback(async (email: string, password: string, name?: string) => {
    setIsSubmitting(true)
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      })
      const data = await res.json()
      
      if (data.error) {
        return { error: data.error }
      }
      
      await mutate()
      return {}
    } finally {
      setIsSubmitting(false)
    }
  }, [mutate])
  
  const signOut = useCallback(async () => {
    await fetch('/api/auth/signout', { method: 'POST' })
    await mutate()
  }, [mutate])
  
  const refresh = useCallback(() => {
    mutate()
  }, [mutate])
  
  return (
    <AuthContext.Provider value={{
      user: data?.user ?? null,
      isLoading: isLoading || isSubmitting,
      signIn,
      signUp,
      signOut,
      refresh,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
