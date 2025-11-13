'use client'

import { useState, useEffect } from 'react'
import Sidebar from '../../../../components/Sidebar'
import { useParams } from 'next/navigation'

interface Section {
  id: string
  name: string
  description?: string
  type: 'FIXED' | 'CUSTOM' | 'MENU'
  order: number
  _count: {
    items: number
  }
}

interface MenuItem {
  id: string
  name: string
  href: string
  icon: string
  order: number
  isActive: boolean
}

interface Category {
  id: string
  name: string
  description?: string
  color: string
}

interface Item {
  id: string
  title: string
  content: string
  tags: string[]
  sectionId: string
  categoryId?: string
  section: Section
  category?: Category
  createdAt: string
  updatedAt: string
}

interface Team {
  id: string
  name: string
  slug: string
  description?: string
}

export default function TeamAdminPage() {
  const params = useParams()
  const teamSlug = params.slug as string
  const [team, setTeam] = useState<Team | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (teamSlug) {
      fetch(`/api/teams/${teamSlug}`)
        .then(res => res.json())
        .then(data => {
          setTeam(data)
          setLoading(false)
        })
        .catch(err => {
          console.error('Erro ao carregar team:', err)
          setLoading(false)
        })
    }
  }, [teamSlug])

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <main className="ml-64 flex-1 p-8">
          <div className="max-w-6xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (!team) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <main className="ml-64 flex-1 p-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center py-8">
              <div className="text-4xl mb-4">❌</div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Team não encontrado</h1>
              <p className="text-gray-600">O team "{teamSlug}" não existe ou não está disponível.</p>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="ml-64 flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Administração - {team.name}
            </h1>
            <p className="text-gray-600">
              Gerencie o conteúdo da base de conhecimento para o team {team.name}
            </p>
            <div className="mt-2 text-sm text-blue-600 font-medium">
              Team: {team.slug}
            </div>
          </div>

          {/* Gerenciar Seções do Team */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">
                Gerenciar Team: {team.name}
              </h2>
              <div className="flex items-center gap-2 flex-wrap">
                <a
                  href={`/team/${team.slug}/admin/profile`}
                  className="inline-flex items-center px-3 py-1 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium rounded-md transition-colors gap-1"
                  title="Gerenciar perfil do team"
                >
                  👤 Perfil do Time
                </a>
                <a
                  href={`/team/${team.slug}/admin/members`}
                  className="inline-flex items-center px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-md transition-colors gap-1"
                  title="Gerenciar membros do team"
                >
                  👥 Membros
                </a>
                <a
                  href={`/team/${team.slug}/admin/sections`}
                  className="inline-flex items-center px-3 py-1 bg-purple-500 hover:bg-purple-600 text-white text-sm font-medium rounded-md transition-colors gap-1"
                  title="Gerenciar tipos de seção do team"
                >
                  🎨 Tipos de Seção
                </a>
                <a
                  href={`/team/${team.slug}/admin/gerenciarsecoes`}
                  className="inline-flex items-center px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-md transition-colors gap-1"
                >
                  📂 Gerenciar Seções
                </a>
                <a
                  href={`/team/${team.slug}/admin/itenssecoes`}
                  className="inline-flex items-center px-3 py-1 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-md transition-colors gap-1"
                  title="Gerenciar itens das seções do team"
                >
                  📝 Itens das Seções
                </a>
                <a
                  href={`/team/${team.slug}/admin/categorias`}
                  className="inline-flex items-center px-3 py-1 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-md transition-colors gap-1"
                  title="Gerenciar categorias do team"
                >
                  🏷️ Categorias
                </a>
              </div>
            </div>

            <div className="text-center py-8">
              <div className="text-4xl mb-4">⚙️</div>
              <p className="text-gray-600 mb-4">
                Use os botões acima para acessar as páginas de configuração do team <strong>{team.name}</strong>
              </p>
              <div className="text-sm text-gray-500 space-y-1">
                <p>👤 <strong>Perfil do Time</strong>: Editar informações básicas, email e senha do time</p>
                <p>👥 <strong>Membros</strong>: Adicionar, editar e gerenciar membros do team</p>
                <p>🎨 <strong>Tipos de Seção</strong>: Configurar categorias e grupos de seções do team</p>
                <p>📂 <strong>Gerenciar Seções</strong>: Criar, editar e organizar seções do team</p>
                <p>📝 <strong>Itens das Seções</strong>: Adicionar, editar e organizar conteúdo das seções do team</p>
                <p>🏷️ <strong>Categorias</strong>: Gerenciar categorias para organizar itens do team</p>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  )
}