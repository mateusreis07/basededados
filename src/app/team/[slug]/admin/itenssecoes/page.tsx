'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Sidebar from '../../../../../components/Sidebar'

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

interface Category {
  id: string
  name: string
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

export default function TeamItensSecoesPage() {
  const params = useParams()
  const teamSlug = params.slug as string
  const [team, setTeam] = useState<Team | null>(null)
  const [sections, setSections] = useState<Section[]>([])
  const [selectedSection, setSelectedSection] = useState('')
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [itemsLoading, setItemsLoading] = useState(false)

  useEffect(() => {
    if (teamSlug) {
      Promise.all([
        fetch(`/api/teams/${teamSlug}`),
        fetch(`/api/teams/${teamSlug}/sections`)
      ])
        .then(async ([teamRes, sectionsRes]) => {
          const teamData = await teamRes.json()
          const sectionsData = await sectionsRes.json()

          setTeam(teamData)
          setSections(sectionsData)
          setLoading(false)
        })
        .catch(err => {
          console.error('Erro ao carregar dados:', err)
          setLoading(false)
        })
    }
  }, [teamSlug])

  useEffect(() => {
    if (selectedSection) {
      fetchItems()
    }
  }, [selectedSection])

  const fetchItems = async () => {
    setItemsLoading(true)
    try {
      const response = await fetch(`/api/teams/${teamSlug}/items?sectionId=${selectedSection}`)
      if (response.ok) {
        const data = await response.json()
        setItems(data)
      }
    } catch (error) {
      console.error('Erro ao carregar itens:', error)
    } finally {
      setItemsLoading(false)
    }
  }

  const handleDeleteItem = async (itemId: string) => {
    if (confirm('Tem certeza que deseja excluir este item?')) {
      try {
        const response = await fetch(`/api/teams/${teamSlug}/items/${itemId}`, {
          method: 'DELETE'
        })

        if (response.ok) {
          await fetchItems()
          alert('Item excluído com sucesso!')
        } else {
          const error = await response.json()
          alert(error.error || 'Erro ao excluir item')
        }
      } catch (error) {
        console.error('Erro ao excluir item:', error)
        alert('Erro ao excluir item')
      }
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const truncateContent = (content: string, maxLength: number = 150) => {
    if (content.length <= maxLength) return content
    return content.substring(0, maxLength) + '...'
  }

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
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <a
                href={`/team/${team.slug}/admin`}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                ← Voltar para Admin do Team
              </a>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  📝 Itens das Seções - {team.name}
                </h1>
                <p className="text-gray-600">
                  Visualize e gerencie itens das seções do team {team.name}
                </p>
                <div className="mt-2 text-sm text-blue-600 font-medium">
                  Team: {team.slug}
                </div>
              </div>
            </div>
          </div>

          {/* Section Selector */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Selecionar Seção
              </h2>
              <span className="text-sm text-gray-500">
                {sections.length} seções disponíveis
              </span>
            </div>

            {sections.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">📂</div>
                <p className="text-gray-600 mb-4">Nenhuma seção encontrada para este team.</p>
                <a
                  href={`/team/${team.slug}/admin/gerenciarsecoes`}
                  className="inline-flex items-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-md transition-colors"
                >
                  📂 Gerenciar Seções
                </a>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setSelectedSection(section.id)}
                    className={`p-4 rounded-lg border-2 transition-colors text-left ${
                      selectedSection === section.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <h3 className="font-medium text-gray-900 mb-1">
                      {section.name}
                    </h3>
                    {section.description && (
                      <p className="text-sm text-gray-600 mb-2">
                        {section.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>{section._count.items} itens</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Items List */}
          {selectedSection && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Itens da Seção: {sections.find(s => s.id === selectedSection)?.name}
                  </h2>
                  <span className="text-sm text-gray-500">
                    {items.length} itens encontrados
                  </span>
                </div>
              </div>

              {itemsLoading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-600 mt-2">Carregando itens...</p>
                </div>
              ) : items.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="text-4xl mb-4">📄</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Nenhum item encontrado
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Esta seção ainda não possui itens.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {items.map((item) => (
                    <div key={item.id} className="px-6 py-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-medium text-gray-900">
                              {item.title}
                            </h3>
                            {item.category && (
                              <span
                                className="px-2 py-1 text-xs font-medium rounded-full text-white"
                                style={{ backgroundColor: item.category.color }}
                              >
                                {item.category.name}
                              </span>
                            )}
                          </div>

                          <p className="text-sm text-gray-600 mb-3">
                            {truncateContent(item.content)}
                          </p>

                          {item.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-2">
                              {item.tags.map((tag, index) => (
                                <span
                                  key={index}
                                  className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md"
                                >
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          )}

                          <div className="text-xs text-gray-500">
                            Criado em: {formatDate(item.createdAt)} |
                            ID: {item.id}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 ml-4">
                          <a
                            href={`/team/${team.slug}/section/${item.sectionId}`}
                            className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-md transition-colors"
                          >
                            👁️ Ver
                          </a>
                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 text-sm font-medium rounded-md transition-colors"
                          >
                            🗑️ Excluir
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {!selectedSection && sections.length > 0 && (
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="text-center py-8">
                <div className="text-4xl mb-4">👆</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Selecione uma seção
                </h3>
                <p className="text-sm text-gray-500">
                  Escolha uma seção acima para visualizar seus itens.
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}