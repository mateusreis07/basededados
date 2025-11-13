'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useParams, usePathname } from 'next/navigation'

interface Team {
  id: string
  name: string
  slug: string
  description?: string
  domain?: string
  settings?: any
}

interface TeamContextType {
  currentTeam: Team | null
  teams: Team[]
  isLoading: boolean
  switchTeam: (teamSlug: string) => void
  refreshTeams: () => Promise<void>
}

const TeamContext = createContext<TeamContextType | undefined>(undefined)

export function useTeam() {
  const context = useContext(TeamContext)
  if (context === undefined) {
    throw new Error('useTeam must be used within a TeamProvider')
  }
  return context
}

interface TeamProviderProps {
  children: React.ReactNode
}

export function TeamProvider({ children }: TeamProviderProps) {
  const [currentTeam, setCurrentTeam] = useState<Team | null>(null)
  const [teams, setTeams] = useState<Team[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const params = useParams()
  const pathname = usePathname()

  // Extrair team slug da URL (/team/[slug]/... ou raiz para team padrão)
  const getTeamSlugFromPath = () => {
    if (pathname.startsWith('/team/')) {
      const segments = pathname.split('/')
      return segments[2] // /team/[slug]/...
    }
    return 'default' // Team padrão para URLs antigas
  }

  const fetchTeams = async () => {
    try {
      const response = await fetch('/api/teams')
      if (response.ok) {
        const data = await response.json()
        setTeams(data)

        // Definir team atual baseado na URL
        const teamSlug = getTeamSlugFromPath()
        const team = data.find((t: Team) => t.slug === teamSlug) || data[0]
        setCurrentTeam(team)
      }
    } catch (error) {
      console.error('Erro ao carregar teams:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const switchTeam = (teamSlug: string) => {
    const team = teams.find(t => t.slug === teamSlug)
    if (team) {
      setCurrentTeam(team)
      // Redirecionar para a URL do team
      window.location.href = `/team/${teamSlug}`
    }
  }

  const refreshTeams = async () => {
    setIsLoading(true)
    await fetchTeams()
  }

  useEffect(() => {
    fetchTeams()
  }, [pathname])

  // Atualizar team atual quando a URL muda
  useEffect(() => {
    if (teams.length > 0) {
      const teamSlug = getTeamSlugFromPath()
      const team = teams.find(t => t.slug === teamSlug)
      if (team && team.id !== currentTeam?.id) {
        setCurrentTeam(team)
      }
    }
  }, [pathname, teams, currentTeam])

  return (
    <TeamContext.Provider
      value={{
        currentTeam,
        teams,
        isLoading,
        switchTeam,
        refreshTeams
      }}
    >
      {children}
    </TeamContext.Provider>
  )
}