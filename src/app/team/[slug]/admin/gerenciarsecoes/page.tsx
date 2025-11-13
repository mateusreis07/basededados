'use client'

import { useState, useEffect } from 'react'
import Sidebar from '../../../../../components/Sidebar'
import { useParams } from 'next/navigation'

interface Section {
  id: string
  name: string
  description?: string
  type: 'FIXED' | 'CUSTOM' | 'MENU'
  order: number
  isActive: boolean
  _count: {
    items: number
  }
}

interface Team {
  id: string
  name: string
  slug: string
  description?: string
}

export default function TeamGerenciarSecoesPage() {
  const params = useParams()
  const teamSlug = params.slug as string
  const [team, setTeam] = useState<Team | null>(null)
  const [sections, setSections] = useState<Section[]>([])
  const [sectionTypes, setSectionTypes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingSection, setEditingSection] = useState<Section | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'CUSTOM' as string
  })

  useEffect(() => {
    if (teamSlug) {
      // Carregar team, seções e tipos de seção
      Promise.all([
        fetch(`/api/teams/${teamSlug}`),
        fetch(`/api/teams/${teamSlug}/sections`),
        fetch(`/api/teams/${teamSlug}/section-types`)
      ])
        .then(async ([teamRes, sectionsRes, typesRes]) => {
          const teamData = await teamRes.json()
          const sectionsData = await sectionsRes.json()
          const typesData = await typesRes.json()

          setTeam(teamData)
          setSections(sectionsData)
          setSectionTypes(typesData.filter((type: any) => type.active))
          setLoading(false)

          // Definir tipo padrão se houver tipos disponíveis
          if (typesData.length > 0) {
            setFormData(prev => ({ ...prev, type: typesData[0].sectionFilter }))
          }
        })
        .catch(err => {
          console.error('Erro ao carregar dados:', err)
          setLoading(false)
        })
    }
  }, [teamSlug])

  const loadSections = async () => {
    try {
      const response = await fetch(`/api/teams/${teamSlug}/sections`)
      if (response.ok) {
        const data = await response.json()
        setSections(data)
      }
    } catch (error) {
      console.error('Erro ao carregar seções:', error)
    }
  }

  const handleCreateSection = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      alert('Nome da seção é obrigatório')
      return
    }

    try {
      const response = await fetch(`/api/teams/${teamSlug}/sections`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        await loadSections()
        resetForm()
        alert('Seção criada com sucesso!')
      } else {
        const error = await response.json()
        alert(error.error || 'Erro ao criar seção')
      }
    } catch (error) {
      console.error('Erro ao criar seção:', error)
      alert('Erro ao criar seção')
    }
  }

  const handleEditSection = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      alert('Nome da seção é obrigatório')
      return
    }

    if (!editingSection) {
      alert('Seção não encontrada')
      return
    }

    try {
      const response = await fetch(`/api/teams/${teamSlug}/sections/${editingSection.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        await loadSections()
        resetForm()
        alert('Seção atualizada com sucesso!')
      } else {
        const error = await response.json()
        alert(error.error || 'Erro ao atualizar seção')
      }
    } catch (error) {
      console.error('Erro ao atualizar seção:', error)
      alert('Erro ao atualizar seção')
    }
  }

  const openEditModal = (section: Section) => {
    setEditingSection(section)
    setFormData({
      name: section.name,
      description: section.description || '',
      type: section.type
    })
    setShowForm(true)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      type: sectionTypes.length > 0 ? sectionTypes[0].sectionFilter : 'CUSTOM'
    })
    setEditingSection(null)
    setShowForm(false)
  }

  // Função para identificar seções padrão que não podem ser deletadas/desativadas
  const isDefaultSection = (sectionName: string) => {
    const defaultSections = ['Relatórios', 'Informações Gerais', 'Scripts PostgreSQL', 'Erros']
    return defaultSections.includes(sectionName)
  }

  // Função para alternar status ativo/inativo da seção
  const handleToggleSection = async (section: Section) => {
    if (isDefaultSection(section.name)) {
      alert('Seções padrão não podem ser desativadas.')
      return
    }

    const confirmMessage = section.isActive
      ? `Tem certeza que deseja desativar a seção "${section.name}"?`
      : `Tem certeza que deseja ativar a seção "${section.name}"?`

    if (!confirm(confirmMessage)) {
      return
    }

    try {
      const response = await fetch(`/api/teams/${teamSlug}/sections/${section.id}/toggle`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        await loadSections()
        const statusText = section.isActive ? 'desativada' : 'ativada'
        alert(`Seção ${statusText} com sucesso!`)
      } else {
        const error = await response.json()
        alert(error.error || 'Erro ao alterar status da seção')
      }
    } catch (error) {
      console.error('Erro ao alterar status da seção:', error)
      alert('Erro ao alterar status da seção')
    }
  }

  // Função para deletar seção
  const handleDeleteSection = async (section: Section) => {
    if (isDefaultSection(section.name)) {
      alert('Seções padrão não podem ser excluídas.')
      return
    }

    if (section._count?.items > 0) {
      alert(`Não é possível excluir a seção "${section.name}" pois ela contém ${section._count.items} item(s). Remova todos os itens antes de excluir a seção.`)
      return
    }

    const confirmMessage = `Tem certeza que deseja EXCLUIR PERMANENTEMENTE a seção "${section.name}"? Esta ação não pode ser desfeita.`

    if (!confirm(confirmMessage)) {
      return
    }

    try {
      const response = await fetch(`/api/teams/${teamSlug}/sections/${section.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        await loadSections()
        alert(`Seção "${section.name}" excluída com sucesso!`)
      } else {
        const error = await response.json()
        alert(error.error || 'Erro ao excluir seção')
      }
    } catch (error) {
      console.error('Erro ao excluir seção:', error)
      alert('Erro ao excluir seção')
    }
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Gerenciar Seções - {team.name}
            </h1>
            <p className="text-gray-600">
              Visualize e gerencie as seções do team {team.name}
            </p>
            <div className="mt-2 text-sm text-blue-600 font-medium">
              Team: {team.slug}
            </div>
          </div>

          {/* Form Modal */}
          {showForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
                <form onSubmit={editingSection ? handleEditSection : handleCreateSection}>
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">
                      {editingSection ? `Editar Seção: ${editingSection.name}` : `Nova Seção - ${team?.name}`}
                    </h3>
                  </div>

                  <div className="px-6 py-4 space-y-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                        Nome da Seção *
                      </label>
                      <input
                        type="text"
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="Ex: Minha Nova Seção"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                        Descrição
                      </label>
                      <textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={3}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="Descrição da seção..."
                      />
                    </div>

                    <div>
                      <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                        Tipo da Seção
                      </label>
                      <select
                        id="type"
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      >
                        {sectionTypes.length > 0 ? (
                          sectionTypes.map((sectionType) => (
                            <option key={sectionType.id} value={sectionType.sectionFilter}>
                              {sectionType.icon} {sectionType.name}
                            </option>
                          ))
                        ) : (
                          <>
                            <option value="CUSTOM">📁 Personalizada</option>
                            <option value="MENU">📋 Menu</option>
                            <option value="FIXED">📌 Fixa</option>
                          </>
                        )}
                      </select>
                      {sectionTypes.length === 0 && (
                        <p className="mt-1 text-xs text-gray-500">
                          Nenhum tipo de seção personalizado encontrado. Usando tipos padrão.
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                    >
                      {editingSection ? 'Atualizar Seção' : 'Criar Seção'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Seções do Team */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">
                Seções do Team ({sections.length})
              </h2>
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-md transition-colors gap-1"
              >
                ➕ Nova Seção
              </button>
            </div>

            {sections.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">📂</div>
                <p className="text-gray-600 mb-4">Nenhuma seção encontrada para este team.</p>
                <p className="text-sm text-gray-500">
                  Execute o script de populate para criar as seções padrão.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {sections.map((section) => (
                  <div
                    key={section.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className={`text-lg font-medium ${section.isActive ? 'text-gray-900' : 'text-gray-500'}`}>
                          {section.name}
                        </h3>
                        {isDefaultSection(section.name) && (
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                            Padrão
                          </span>
                        )}
                        {!section.isActive && (
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                            Inativa
                          </span>
                        )}
                      </div>
                      {section.description && (
                        <p className="text-sm text-gray-600 mt-1">
                          {section.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span>ID: {section.id}</span>
                        <span>Ordem: {section.order}</span>
                        <span>Itens: {section._count?.items || 0}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={`/team/${team.slug}/section/${section.id}`}
                        className="inline-flex items-center px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-md transition-colors"
                      >
                        👁️ Ver
                      </a>
                      <button
                        className="inline-flex items-center px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 text-sm font-medium rounded-md transition-colors"
                        onClick={() => openEditModal(section)}
                      >
                        ✏️ Editar
                      </button>
                      {!isDefaultSection(section.name) && (
                        <>
                          <button
                            className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                              section.isActive
                                ? 'bg-yellow-100 hover:bg-yellow-200 text-yellow-800'
                                : 'bg-green-100 hover:bg-green-200 text-green-800'
                            }`}
                            onClick={() => handleToggleSection(section)}
                            title={section.isActive ? 'Desativar seção' : 'Ativar seção'}
                          >
                            {section.isActive ? '❌ Desativar' : '✅ Ativar'}
                          </button>
                          <button
                            className="inline-flex items-center px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 text-sm font-medium rounded-md transition-colors"
                            onClick={() => handleDeleteSection(section)}
                            title="Excluir seção"
                            disabled={section._count?.items > 0}
                          >
                            🗑️ Excluir
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Links úteis */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <a
              href={`/team/${team.slug}/admin/itenssecoes`}
              className="block p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="text-lg font-medium text-gray-900 mb-1">📝 Gerenciar Itens</div>
              <div className="text-sm text-gray-600">Adicione e edite itens das seções</div>
            </a>

            <a
              href={`/team/${team.slug}/admin/categorias`}
              className="block p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="text-lg font-medium text-gray-900 mb-1">🏷️ Gerenciar Categorias</div>
              <div className="text-sm text-gray-600">Organize itens por categorias</div>
            </a>
          </div>
        </div>
      </main>
    </div>
  )
}