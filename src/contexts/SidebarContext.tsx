'use client'

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { useTeam } from './TeamContext'

interface Section {
  id: string
  name: string
  description?: string
  type: 'FIXED' | 'CUSTOM' | 'MENU' | 'MATEUS'
  order: number
  isActive: boolean
  _count: {
    items: number
  }
}

interface SectionType {
  id: string
  name: string
  description: string
  icon: string
  color: string
  order: number
  active: boolean
  sectionFilter?: 'MENU' | 'FIXED' | 'CUSTOM' | 'MATEUS'
  createdAt: string
  updatedAt: string
}

interface SidebarContextType {
  sections: Section[]
  sectionTypes: SectionType[]
  loading: boolean
  refreshSections: () => Promise<void>
  refreshSectionTypes: () => Promise<void>
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined)

interface SidebarProviderProps {
  children: ReactNode
}

export function SidebarProvider({ children }: SidebarProviderProps) {
  const { currentTeam } = useTeam()
  const [sections, setSections] = useState<Section[]>([])
  const [sectionTypes, setSectionTypes] = useState<SectionType[]>([])
  const [loading, setLoading] = useState(false)

  const refreshSections = useCallback(async () => {
    if (!currentTeam) {
      console.log('SidebarContext: Sem team atual, aguardando...')
      return
    }

    try {
      console.log('SidebarContext: Carregando seções da API para team:', currentTeam.slug)
      const response = await fetch(`/api/teams/${currentTeam.slug}/sections`)
      if (response.ok) {
        const data = await response.json()
        console.log('SidebarContext: Seções carregadas:', data.length, 'seções')
        setSections(data)
      }
    } catch (error) {
      console.error('Erro ao carregar seções:', error)
    }
  }, [currentTeam])

  const refreshSectionTypes = useCallback(async () => {
    if (!currentTeam) {
      console.log('SidebarContext: Sem team atual para tipos, aguardando...')
      return
    }

    try {
      console.log('SidebarContext: Carregando tipos de seção da API para team:', currentTeam.slug)
      const response = await fetch(`/api/teams/${currentTeam.slug}/section-types`)
      if (response.ok) {
        const data = await response.json()
        console.log('SidebarContext: Tipos de seção carregados da API:', data.length, 'tipos')
        setSectionTypes(data)
      } else {
        console.log('SidebarContext: API falhou, tentando localStorage...')
        // Fallback para localStorage se a API falhar
        const savedTypes = JSON.parse(localStorage.getItem('section_types') || '[]')
        if (savedTypes.length > 0) {
          console.log('SidebarContext: Tipos carregados do localStorage:', savedTypes.length, 'tipos')
          setSectionTypes(savedTypes)
        }
      }
    } catch (error) {
      console.error('Erro ao carregar tipos de seção:', error)
      console.log('SidebarContext: Erro na API, tentando localStorage...')
      // Fallback para localStorage se a API falhar
      const savedTypes = JSON.parse(localStorage.getItem('section_types') || '[]')
      if (savedTypes.length > 0) {
        console.log('SidebarContext: Tipos carregados do localStorage (fallback):', savedTypes.length, 'tipos')
        setSectionTypes(savedTypes)
      }
    }
  }, [currentTeam])

  // Carregar dados iniciais quando team estiver disponível
  useEffect(() => {
    if (!currentTeam) {
      setSections([])
      setSectionTypes([])
      setLoading(false)
      return
    }

    const loadInitialData = async () => {
      console.log('SidebarContext: Carregando dados iniciais para team:', currentTeam.slug)
      await Promise.all([refreshSections(), refreshSectionTypes()])
      setLoading(false)
      console.log('SidebarContext: Dados iniciais carregados')
    }

    loadInitialData()
  }, [currentTeam, refreshSections, refreshSectionTypes])

  // Listener para mudanças críticas apenas
  useEffect(() => {
    const handleSectionTypesUpdate = () => {
      console.log('SidebarContext: Evento sectionTypesUpdated recebido, atualizando...')
      if (currentTeam) {
        refreshSectionTypes()
        refreshSections()
      }
    }

    window.addEventListener('sectionTypesUpdated', handleSectionTypesUpdate)

    return () => {
      window.removeEventListener('sectionTypesUpdated', handleSectionTypesUpdate)
    }
  }, [currentTeam, refreshSectionTypes, refreshSections])

  const value: SidebarContextType = {
    sections,
    sectionTypes,
    loading,
    refreshSections,
    refreshSectionTypes
  }

  return (
    <SidebarContext.Provider value={value}>
      {children}
    </SidebarContext.Provider>
  )
}

export function useSidebar() {
  const context = useContext(SidebarContext)
  if (context === undefined) {
    throw new Error('useSidebar deve ser usado dentro de um SidebarProvider')
  }
  return context
}