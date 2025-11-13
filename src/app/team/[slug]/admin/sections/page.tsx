'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Sidebar from '../../../../../components/Sidebar'
import EmojiPicker from '../../../../../components/EmojiPicker'

interface SectionType {
  id: string
  name: string
  description: string
  icon: string
  color: string
  order: number
  active: boolean
  sectionFilter: string
  createdAt: string
  updatedAt: string
}

interface Team {
  id: string
  name: string
  slug: string
  description?: string
}

export default function TeamSectionsPage() {
  const params = useParams()
  const teamSlug = params.slug as string
  const [team, setTeam] = useState<Team | null>(null)
  const [sectionTypes, setSectionTypes] = useState<SectionType[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingType, setEditingType] = useState<SectionType | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: '📁',
    color: '#3B82F6',
    active: true,
  })

  useEffect(() => {
    if (teamSlug) {
      Promise.all([
        fetch(`/api/teams/${teamSlug}`),
        fetch(`/api/teams/${teamSlug}/section-types`)
      ])
        .then(async ([teamRes, typesRes]) => {
          const teamData = await teamRes.json()
          const typesData = await typesRes.json()

          setTeam(teamData)
          setSectionTypes(typesData)
          setLoading(false)
        })
        .catch(err => {
          console.error('Erro ao carregar dados:', err)
          setLoading(false)
        })
    }
  }, [teamSlug])

  const loadSectionTypes = async () => {
    try {
      const response = await fetch(`/api/teams/${teamSlug}/section-types`)
      if (response.ok) {
        const data = await response.json()
        setSectionTypes(data)
      }
    } catch (error) {
      console.error('Erro ao carregar tipos de seção:', error)
    }
  }

  const saveSectionType = async (typeData: Partial<SectionType>, isEdit: boolean = false) => {
    try {
      const url = isEdit ?
        `/api/teams/${teamSlug}/section-types/${typeData.id}` :
        `/api/teams/${teamSlug}/section-types`
      const method = isEdit ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(typeData)
      })

      if (response.ok) {
        await loadSectionTypes()
        return true
      } else {
        const error = await response.json()
        alert(error.error || 'Erro ao salvar alterações')
        return false
      }
    } catch (error) {
      console.error('Erro ao salvar tipo de seção:', error)
      alert('Erro ao salvar alterações')
      return false
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      alert('Nome do tipo é obrigatório')
      return
    }

    if (editingType) {
      const success = await saveSectionType({
        id: editingType.id,
        name: formData.name,
        description: formData.description,
        icon: formData.icon,
        color: formData.color,
        active: formData.active,
        order: editingType.order
      }, true)

      if (success) {
        resetForm()
      }
    } else {
      const success = await saveSectionType({
        name: formData.name,
        description: formData.description,
        icon: formData.icon,
        color: formData.color,
        active: formData.active,
      })

      if (success) {
        resetForm()
      }
    }
  }

  const handleEdit = (type: SectionType) => {
    setEditingType(type)
    setFormData({
      name: type.name,
      description: type.description,
      icon: type.icon,
      color: type.color,
      active: type.active,
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este tipo de seção?')) {
      try {
        const response = await fetch(`/api/teams/${teamSlug}/section-types/${id}`, {
          method: 'DELETE'
        })

        if (response.ok) {
          await loadSectionTypes()
          alert('Tipo de seção excluído com sucesso!')
        } else {
          const error = await response.json()
          alert(error.error || 'Erro ao excluir tipo de seção')
        }
      } catch (error) {
        console.error('Erro ao excluir tipo de seção:', error)
        alert('Erro ao excluir tipo de seção')
      }
    }
  }

  const handleToggleActive = async (id: string) => {
    const type = sectionTypes.find(t => t.id === id)
    if (type) {
      await saveSectionType({
        ...type,
        active: !type.active
      }, true)
    }
  }

  const handleMoveUp = async (id: string) => {
    const currentIndex = sectionTypes.findIndex(s => s.id === id)
    if (currentIndex > 0) {
      const currentType = sectionTypes[currentIndex]
      const previousType = sectionTypes[currentIndex - 1]

      await saveSectionType({
        ...currentType,
        order: previousType.order
      }, true)

      await saveSectionType({
        ...previousType,
        order: currentType.order
      }, true)
    }
  }

  const handleMoveDown = async (id: string) => {
    const currentIndex = sectionTypes.findIndex(s => s.id === id)
    if (currentIndex < sectionTypes.length - 1) {
      const currentType = sectionTypes[currentIndex]
      const nextType = sectionTypes[currentIndex + 1]

      await saveSectionType({
        ...currentType,
        order: nextType.order
      }, true)

      await saveSectionType({
        ...nextType,
        order: currentType.order
      }, true)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      icon: '📁',
      color: '#3B82F6',
      active: true,
    })
    setEditingType(null)
    setShowForm(false)
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
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <a
                  href={`/team/${team.slug}/admin`}
                  className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium transition-colors gap-2 mr-4"
                >
                  ← Voltar para Admin do Team
                </a>
                <span className="text-2xl mr-3">🎨</span>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    Tipos de Seção - {team.name}
                  </h1>
                  <p className="text-gray-600 mt-1">
                    Configure tipos e grupos de seções para o team {team.name}
                  </p>
                  <div className="mt-2 text-sm text-blue-600 font-medium">
                    Team: {team.slug}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-300 gap-2"
              >
                <span>➕</span>
                Novo Tipo
              </button>
            </div>
          </div>

          {/* Form Modal */}
          {showForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
                <form onSubmit={handleSubmit}>
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">
                      {editingType ? 'Editar Tipo' : 'Novo Tipo'}
                    </h3>
                  </div>

                  <div className="px-6 py-4 space-y-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                        Nome do Tipo *
                      </label>
                      <input
                        type="text"
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="Ex: Especiais"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="color" className="block text-sm font-medium text-gray-700">
                        Cor do Tipo
                      </label>
                      <div className="mt-1 flex items-center gap-3">
                        <input
                          type="color"
                          id="color"
                          value={formData.color}
                          onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                          className="w-12 h-8 border border-gray-300 rounded cursor-pointer"
                        />
                        <input
                          type="text"
                          value={formData.color}
                          onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                          className="flex-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          placeholder="#3B82F6"
                          pattern="^#[0-9A-Fa-f]{6}$"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="icon" className="block text-sm font-medium text-gray-700 mb-2">
                        Ícone
                      </label>
                      <EmojiPicker
                        value={formData.icon}
                        onChange={(emoji) => setFormData({ ...formData, icon: emoji })}
                        placeholder="Escolha um ícone"
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
                        placeholder="Descrição do tipo de seção..."
                      />
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="active"
                        checked={formData.active}
                        onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="active" className="ml-2 block text-sm text-gray-900">
                        Tipo ativo
                      </label>
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
                      {editingType ? 'Salvar Alterações' : 'Criar Tipo'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Section Types List */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            {sectionTypes.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {sectionTypes
                  .sort((a, b) => a.order - b.order)
                  .map((type) => (
                    <div key={type.id} className="px-6 py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-start space-x-3 flex-1">
                          <div className="flex-shrink-0 mt-1">
                            <span className="text-xl">{type.icon}</span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-medium text-gray-900">
                                {type.name}
                              </h3>
                              <div
                                className="w-6 h-6 rounded-full border-2 border-gray-300"
                                style={{ backgroundColor: type.color }}
                                title={`Cor: ${type.color}`}
                              ></div>
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                type.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {type.active ? 'Ativo' : 'Inativo'}
                              </span>
                            </div>
                            {type.description && (
                              <p className="text-sm text-gray-600 mb-2">{type.description}</p>
                            )}
                            <div className="text-xs text-gray-500">
                              Filtro: {type.sectionFilter} |
                              Criado em: {new Date(type.createdAt).toLocaleDateString('pt-BR')}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="flex flex-col gap-1">
                            <button
                              onClick={() => handleMoveUp(type.id)}
                              disabled={sectionTypes.findIndex(s => s.id === type.id) === 0}
                              className="px-2 py-1 bg-gray-500 hover:bg-gray-600 text-white text-xs font-medium rounded disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Mover para cima"
                            >
                              ⬆️
                            </button>
                            <button
                              onClick={() => handleMoveDown(type.id)}
                              disabled={sectionTypes.findIndex(s => s.id === type.id) === sectionTypes.length - 1}
                              className="px-2 py-1 bg-gray-500 hover:bg-gray-600 text-white text-xs font-medium rounded disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Mover para baixo"
                            >
                              ⬇️
                            </button>
                          </div>
                          <button
                            onClick={() => handleToggleActive(type.id)}
                            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                              type.active
                                ? 'bg-red-100 hover:bg-red-200 text-red-700'
                                : 'bg-green-100 hover:bg-green-200 text-green-700'
                            }`}
                          >
                            {type.active ? '🔴 Desativar' : '🟢 Ativar'}
                          </button>
                          <button
                            onClick={() => handleEdit(type)}
                            className="px-3 py-1 bg-yellow-500 hover:bg-yellow-600 text-white text-sm font-medium rounded-md transition-colors"
                          >
                            ✏️ Editar
                          </button>
                          <button
                            onClick={() => handleDelete(type.id)}
                            className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-md transition-colors"
                          >
                            🗑️ Excluir
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="px-6 py-12 text-center">
                <div className="text-6xl mb-4">🎨</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhum tipo de seção encontrado
                </h3>
                <p className="text-sm text-gray-500 mb-6">
                  Comece criando seu primeiro tipo de seção para o team {team.name}.
                </p>
                <button
                  onClick={() => setShowForm(true)}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors gap-2"
                >
                  <span>➕</span>
                  Novo Tipo
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}