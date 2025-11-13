'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Sidebar from '../../../components/Sidebar'
import EmojiPicker from '../../../components/EmojiPicker'

interface SectionType {
  id: string
  name: string
  description: string
  icon: string
  color: string
  order: number
  active: boolean
  createdAt: string
  updatedAt: string
}

export default function AdminSections() {
  const [sectionTypes, setSectionTypes] = useState<SectionType[]>([])
  const [allSections, setAllSections] = useState<any[]>([])
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
    loadSections()
    loadAllSections()
    migrateFromLocalStorage()
  }, [])

  const loadSections = async () => {
    try {
      const response = await fetch('/api/section-types')
      if (response.ok) {
        const data = await response.json()
        setSectionTypes(data)
      } else {
        console.error('Erro ao carregar tipos de seção da API')
      }
    } catch (error) {
      console.error('Erro ao carregar tipos de seção:', error)
    } finally {
      setLoading(false)
    }
  }

  // Função para migrar dados do localStorage para o banco (executada uma vez)
  const migrateFromLocalStorage = async () => {
    try {
      const savedTypes = JSON.parse(localStorage.getItem('section_types') || '[]')

      if (savedTypes.length > 0) {
        console.log('Migrando dados do localStorage para o banco...')
        const response = await fetch('/api/section-types/migrate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ localStorageTypes: savedTypes })
        })

        if (response.ok) {
          const result = await response.json()
          console.log('Migração realizada:', result.message)

          // Limpar localStorage após migração bem-sucedida
          localStorage.removeItem('section_types')

          // Recarregar dados da API
          await loadSections()
        }
      }
    } catch (error) {
      console.error('Erro na migração:', error)
    }
  }

  const loadAllSections = async () => {
    try {
      const response = await fetch('/api/sections')
      if (response.ok) {
        const data = await response.json()
        setAllSections(data)
      }
    } catch (error) {
      console.error('Erro ao carregar seções:', error)
    }
  }

  const saveSectionType = async (typeData: Partial<SectionType>, isEdit: boolean = false) => {
    try {
      const url = isEdit ? `/api/section-types/${typeData.id}` : '/api/section-types'
      const method = isEdit ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(typeData)
      })

      if (response.ok) {
        // Recarregar dados da API
        await loadSections()

        // Disparar evento para atualizar o sidebar
        window.dispatchEvent(new CustomEvent('sectionTypesUpdated'))

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

      // Editar tipo existente
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
      // Criar novo tipo
      const success = await saveSectionType({
        name: formData.name,
        description: formData.description,
        icon: formData.icon,
        color: formData.color,
        active: formData.active,
        // order será calculado automaticamente pela API
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
        const response = await fetch(`/api/section-types/${id}`, {
          method: 'DELETE'
        })

        if (response.ok) {
          // Recarregar dados da API
          await loadSections()

          // Disparar evento para atualizar o sidebar
          window.dispatchEvent(new CustomEvent('sectionTypesUpdated'))

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

      // Trocar as ordens
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

      // Trocar as ordens
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
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
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
                <Link
                  href="/admin"
                  className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium transition-colors gap-2 mr-4"
                >
                  ← Voltar para Admin
                </Link>
                <span className="text-2xl mr-3">📂</span>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Tipos de Seções</h1>
                  <p className="text-gray-600 mt-1">Gerencie os tipos de seções disponíveis na base de conhecimento</p>
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
                              Criado em: {new Date(type.createdAt).toLocaleDateString('pt-BR')}
                              {type.updatedAt !== type.createdAt && (
                                <span className="ml-4">
                                  Atualizado em: {new Date(type.updatedAt).toLocaleDateString('pt-BR')}
                                </span>
                              )}
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
                <div className="text-6xl mb-4">📂</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhum tipo de seção encontrado
                </h3>
                <p className="text-sm text-gray-500 mb-6">
                  Comece criando seu primeiro tipo de seção.
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