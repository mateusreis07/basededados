'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface Team {
  id: string
  name: string
  slug: string
  email: string
}

interface AuthContextType {
  team: Team | null
  login: (email: string, password: string) => Promise<boolean>
  register: (data: { name: string; description?: string; email: string; password: string }) => Promise<boolean>
  logout: () => Promise<void>
  loading: boolean
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [team, setTeam] = useState<Team | null>(null)
  const [loading, setLoading] = useState(true)

  // Verificar autenticação ao carregar
  useEffect(() => {
    checkAuth()
  }, [])

  // Debug: logar mudanças de estado
  useEffect(() => {
    console.log('🔄 Estado Auth atualizado:', {
      team: team?.name || 'null',
      isAuthenticated: !!team,
      loading
    })
  }, [team, loading])

  const checkAuth = async () => {
    try {
      console.log('🔍 Verificando autenticação...')
      const response = await fetch('/api/auth/me')
      console.log('📡 Response status:', response.status)
      if (response.ok) {
        const data = await response.json()
        console.log('✅ Team autenticado:', data.team)
        console.log('🔄 Atualizando estado do team...')
        setTeam(data.team)
      } else {
        console.log('❌ Não autenticado')
        setTeam(null)
      }
    } catch (error) {
      console.log('❌ Erro na verificação:', error)
      setTeam(null)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('🔐 Tentando fazer login...')
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      })

      console.log('📡 Login response status:', response.status)

      if (response.ok) {
        const data = await response.json()
        console.log('✅ Login bem-sucedido:', data.team)
        setTeam(data.team)
        // Não chamar checkAuth novamente para evitar problemas de timing
        return true
      } else {
        const errorData = await response.json()
        console.log('❌ Erro no login:', errorData)
        throw new Error(errorData.error || 'Erro no login')
      }
    } catch (error) {
      console.error('❌ Erro no login:', error)
      throw error
    }
  }

  const register = async (data: { name: string; description?: string; email: string; password: string }): Promise<boolean> => {
    try {
      console.log('📝 Registrando novo team...')
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })

      console.log('📡 Register response status:', response.status)

      if (response.ok) {
        const responseData = await response.json()
        console.log('✅ Registro bem-sucedido:', responseData.team)
        setTeam(responseData.team)
        return true
      } else {
        const errorData = await response.json()
        console.log('❌ Erro no registro:', errorData)
        throw new Error(errorData.error || 'Erro no registro')
      }
    } catch (error) {
      console.error('❌ Erro no registro:', error)
      throw error
    }
  }

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST'
      })
    } catch (error) {
      console.error('Erro no logout:', error)
    } finally {
      setTeam(null)
      window.location.href = '/login'
    }
  }

  return (
    <AuthContext.Provider
      value={{
        team,
        login,
        register,
        logout,
        loading,
        isAuthenticated: !!team
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}