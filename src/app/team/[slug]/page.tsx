'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useTeam } from '../../../contexts/TeamContext'
import Sidebar from '../../../components/Sidebar'

interface Section {
  id: string
  name: string
  description?: string
  type: string
  _count: {
    items: number
  }
}

export default function TeamDashboard() {
  const { currentTeam, isLoading: teamLoading } = useTeam()
  const [sections, setSections] = useState<Section[]>([])
  const [loading, setLoading] = useState(true)
  const params = useParams()

  const fetchTeamSections = async () => {
    if (!currentTeam) return

    try {
      setLoading(true)
      const response = await fetch(`/api/teams/${currentTeam.slug}/sections`)
      if (response.ok) {
        const data = await response.json()
        setSections(data)
      }
    } catch (error) {
      console.error('Erro ao carregar seções do team:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (currentTeam && !teamLoading) {
      fetchTeamSections()
    }
  }, [currentTeam, teamLoading])

  if (teamLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <div className="w-64">
          <div className="h-16 bg-white border-b border-gray-200 flex items-center px-4">
            <div className="animate-pulse bg-gray-300 h-6 w-32 rounded"></div>
          </div>
          <div className="p-4 space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="animate-pulse bg-gray-300 h-10 rounded"></div>
            ))}
          </div>
        </div>
        <div className="flex-1 p-8">
          <div className="animate-pulse bg-gray-300 h-8 w-64 rounded mb-4"></div>
          <div className="animate-pulse bg-gray-300 h-4 w-96 rounded"></div>
        </div>
      </div>
    )
  }

  if (!currentTeam) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Team não encontrado</h1>
          <p className="text-gray-600">O team solicitado não existe ou você não tem acesso.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />

      <div className="flex-1 ml-64 p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {currentTeam.name}
            </h1>
            {currentTeam.description && (
              <p className="text-gray-600">{currentTeam.description}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sections.map((section) => (
              <div
                key={section.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => window.location.href = `/team/${currentTeam.slug}/section/${section.id}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">{section.name}</h3>
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                    {section._count.items} {section._count.items === 1 ? 'item' : 'itens'}
                  </span>
                </div>
                {section.description && (
                  <p className="text-gray-600 text-sm mb-4">{section.description}</p>
                )}
                <div className="flex items-center justify-end text-sm text-gray-500">
                  <span>→</span>
                </div>
              </div>
            ))}
          </div>

          {sections.length === 0 && !loading && (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📁</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhuma seção encontrada
              </h3>
              <p className="text-gray-600 mb-6">
                Crie sua primeira seção para organizar o conhecimento do seu team.
              </p>
              <button
                onClick={() => window.location.href = `/team/${currentTeam.slug}/admin/sections`}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Gerenciar Seções
              </button>
            </div>
          )}
      </div>
    </div>
  )
}