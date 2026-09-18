"use client"

import React, { createContext, useContext, useState, useEffect } from "react"

export type User = {
  id: string
  volunteer_id: string
  name: string
  role: string
  national_id?: string
} | null

type AuthContextType = {
  user: User
  login: (id: string, password: string) => Promise<boolean>
  logout: () => void
  isAuthLoading: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => false,
  logout: () => {},
  isAuthLoading: true
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null)
  const [isAuthLoading, setIsAuthLoading] = useState(true)

  useEffect(() => {
    try {
      // 1. Purge legacy global localStorage session so it doesn't cross-contaminate tabs
      const legacy = localStorage.getItem("khcf_session")
      if (legacy && !sessionStorage.getItem("khcf_session")) {
        sessionStorage.setItem("khcf_session", legacy)
        localStorage.removeItem("khcf_session")
      } else if (legacy) {
        localStorage.removeItem("khcf_session")
      }

      // 2. Read tab-scoped session from sessionStorage
      const saved = sessionStorage.getItem("khcf_session")
      if (saved) {
        setUser(JSON.parse(saved))
      }
    } catch (e) {
      console.error("Auth session parse error:", e)
    } finally {
      setIsAuthLoading(false)
    }
  }, [])

  const login = async (id: string, password: string) => {
    // Call our secure PostgREST RPC
    const { supabaseFetch } = await import('../lib/supabaseClient')
    const { data, error } = await supabaseFetch('rpc/login_volunteer', {
      method: 'POST',
      body: JSON.stringify({ p_national_id: id, p_password: password })
    })

    if (error || !data?.success) {
      alert(data?.message || 'خطأ في تسجيل الدخول. تأكد من الرقم وكلمة المرور.')
      return false
    }

    const authUser = {
      id: data.volunteer.id,
      volunteer_id: data.volunteer.national_id,
      name: data.volunteer.name,
      role: data.volunteer.role
    }

    setUser(authUser)
    // Isolate session to this specific tab/window and set server-verifiable cookie
    try {
      sessionStorage.setItem('khcf_session', JSON.stringify(authUser))
      localStorage.removeItem('khcf_session')
      document.cookie = `khcf_auth_session=${encodeURIComponent(JSON.stringify(authUser))}; path=/; max-age=86400; SameSite=Lax`
    } catch (_) {}
    return true
  }

  const logout = () => {
    setUser(null)
    try {
      sessionStorage.removeItem("khcf_session")
      localStorage.removeItem("khcf_session")
      document.cookie = "khcf_auth_session=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax"
    } catch (_) {}
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
