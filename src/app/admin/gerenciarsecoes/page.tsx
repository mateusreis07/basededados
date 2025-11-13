'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Sidebar from '../../../components/Sidebar'

interface Section {
  id: string
  name: string
  description?: string
  type: 'FIXED' | 'CUSTOM' | 'MENU' | 'MATEUS'
  order: number
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

export default function GerenciarSecoes() {
  const [sections, setSections] = useState<Section[]>([])
  const [sectionTypes, setSectionTypes] = useState<SectionType[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingSection, setEditingSection] = useState<Section | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'CUSTOM' as 'FIXED' | 'CUSTOM' | 'MENU' | 'MATEUS',
    order: 0
  })

  useEffect(() => {
    fetchSections()
    fetchSectionTypes()

    // Listener para mudanças nos tipos de seção
    const handleSectionTypesUpdate = () => {
      fetchSectionTypes()
    }

    window.addEventListener('sectionTypesUpdated', handleSectionTypesUpdate)

    return () => {
      window.removeEventListener('sectionTypesUpdated', handleSectionTypesUpdate)
    }
  }, [])

  const fetchSections = async () => {
    try {
      const response = await fetch('/api/sections')
      if (response.ok) {
        const data = await response.json()
        setSections(data)
      }
    } catch (error) {
      console.error('Erro ao carregar seções:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchSectionTypes = async () => {
    try {
      const response = await fetch('/api/section-types')
      if (response.ok) {
        const data = await response.json()
        setSectionTypes(data)
      } else {
        console.error('Erro ao carregar tipos de seção da API')

        // Fallback para localStorage se a API falhar
        const savedTypes = JSON.parse(localStorage.getItem('section_types') || '[]')
        if (savedTypes.length > 0) {
          setSectionTypes(savedTypes)
        }
      }
    } catch (error) {
      console.error('Erro ao carregar tipos de seção:', error)

      // Fallback para localStorage se a API falhar
      const savedTypes = JSON.parse(localStorage.getItem('section_types') || '[]')
      if (savedTypes.length > 0) {
        setSectionTypes(savedTypes)
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      alert('Nome da seção é obrigatório')
      return
    }

    setLoading(true)

    try {
      if (editingSection) {
        // Editar seção existente
        const response = await fetch(`/api/sections/${editingSection.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        })

        if (response.ok) {
          alert('Seção atualizada com sucesso!')
          fetchSections()
        } else {
          alert('Erro ao atualizar seção')
        }
      } else {
        // Criar nova seção
        const response = await fetch('/api/sections', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        })

        if (response.ok) {
          alert('Seção criada com sucesso!')
          fetchSections()
        } else {
          alert('Erro ao criar seção')
        }
      }

      resetForm()
    } catch (error) {
      console.error('Erro ao salvar seção:', error)
      alert('Erro interno do servidor')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (section: Section) => {
    setEditingSection(section)
    setFormData({
      name: section.name,
      description: section.description || '',
      type: section.type,
      order: section.order
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta seção? Todos os itens da seção também serão removidos.')) {
      try {
        const response = await fetch(`/api/sections/${id}`, {
          method: 'DELETE'
        })

        if (response.ok) {
          alert('Seção excluída com sucesso!')
          fetchSections()
        } else {
          alert('Erro ao excluir seção')
        }
      } catch (error) {
        console.error('Erro ao excluir seção:', error)
        alert('Erro interno do servidor')
      }
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      type: 'CUSTOM',
      order: 0
    })
    setEditingSection(null)
    setShowForm(false)
  }


  const getTypeBadge = (type: string) => {
    const badges = {
      MENU: { label: 'Menu', class: 'bg-blue-100 text-blue-800' },
      FIXED: { label: 'Fixa', class: 'bg-green-100 text-green-800' },
      CUSTOM: { label: 'Personalizada', class: 'bg-purple-100 text-purple-800' },
      MATEUS: { label: 'Mateus', class: 'bg-orange-100 text-orange-800' }
    }
    const badge = badges[type as keyof typeof badges] || badges.CUSTOM
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.class}`}>
        {badge.label}
      </span>
    )
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
                  <h1 className="text-3xl font-bold text-gray-900">Gerenciar Seções</h1>
                  <p className="text-gray-600 mt-1">Crie, edite e organize as seções individuais da base de conhecimento</p>
                </div>
              </div>
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-300 gap-2"
              >
                <span>➕</span>
                Nova Seção
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
                      {editingSection ? 'Editar Seção' : 'Nova Seção'}
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
                        placeholder="Ex: Scripts Oracle"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                        Tipo da Seção *
                      </label>
                      <select
                        id="type"
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        required
                      >
                        {sectionTypes.length > 0 ? (
                          sectionTypes
                            .filter(type => type.active)
                            .sort((a, b) => a.order - b.order)
                            .map(type => (
                              <option key={type.id} value={type.sectionFilter || 'CUSTOM'}>
                                {type.icon} {type.name}
                              </option>
                            ))
                        ) : (
                          <>
                            <option value="MENU">⭐ SEÇÕES PRINCIPAIS</option>
                            <option value="FIXED">📌 SEÇÕES FIXAS</option>
                            <option value="CUSTOM">🎨 SEÇÕES PERSONALIZADAS</option>
                            <option value="MATEUS">📁 MATEUS</option>
                          </>
                        )}
                      </select>
                      <p className="mt-1 text-xs text-gray-500">
                        Selecione em qual grupo esta seção aparecerá no sidebar
                      </p>
                    </div>

                    <div>
                      <label htmlFor="order" className="block text-sm font-medium text-gray-700">
                        Ordem de Exibição
                      </label>
                      <input
                        type="number"
                        id="order"
                        value={formData.order}
                        onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        min="0"
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
                      {editingSection ? 'Salvar Alterações' : 'Criar Seção'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Sections List */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            {sections.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {sections
                  .sort((a, b) => {
                    // Ordenar por tipo primeiro, depois por ordem
                    const typeOrder = { 'MENU': 1, 'FIXED': 2, 'CUSTOM': 3 }
                    const aTypeOrder = typeOrder[a.type as keyof typeof typeOrder] || 4
                    const bTypeOrder = typeOrder[b.type as keyof typeof typeOrder] || 4

                    if (aTypeOrder !== bTypeOrder) {
                      return aTypeOrder - bTypeOrder
                    }
                    return a.order - b.order
                  })
                  .map((section) => (
                    <div key={section.id} className="px-6 py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-start space-x-3 flex-1">
                          <div className="flex-shrink-0 mt-1">
                            <span className="text-xl">📁</span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-medium text-gray-900">
                                {section.name}
                              </h3>
                              {(() => {
                                const parentType = sectionTypes.find(st => st.sectionFilter === section.type)
                                return parentType ? (
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-500">→</span>
                                    <span className="text-sm font-medium" style={{ color: parentType.color }}>
                                      {parentType.icon} {parentType.name}
                                    </span>
                                  </div>
                                ) : null
                              })()}
                              <span className="text-sm text-gray-500">
                                {section._count.items} {section._count.items === 1 ? 'item' : 'itens'}
                              </span>
                            </div>
                            {section.description && (
                              <p className="text-sm text-gray-600 mb-2">{section.description}</p>
                            )}
                            <div className="text-xs text-gray-500 flex items-center gap-4">
                              <span>Ordem: {section.order}</span>
                              <span>ID: {section.id.substring(0, 8)}...</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEdit(section)}
                            className="px-3 py-1 bg-yellow-500 hover:bg-yellow-600 text-white text-sm font-medium rounded-md transition-colors"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDelete(section.id)}
                            className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-md transition-colors"
                          >
                            Excluir
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
                  Nenhuma seção encontrada
                </h3>
                <p className="text-sm text-gray-500 mb-6">
                  Comece criando sua primeira seção da base de conhecimento.
                </p>
                <button
                  onClick={() => setShowForm(true)}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors gap-2"
                >
                  <span>➕</span>
                  Nova Seção
                </button>
              </div>
            )}
          </div>

          {/* Info Box */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="h-5 w-5 text-blue-400">ℹ️</span>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  Como Funciona o Sistema de Seções
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <ul className="list-disc list-inside space-y-1">
                    <li><strong>Tipos de Seção:</strong> São as categorias principais criadas em <a href="/admin/sections" className="underline">/admin/sections</a></li>
                    <li><strong>Seções Individuais:</strong> São os itens específicos que aparecem dentro de cada tipo no sidebar</li>
                    <li><strong>Hierarquia:</strong> Cada seção individual pertence a um tipo de seção</li>
                    <li><strong>Resultado:</strong> No sidebar, você verá os tipos como grupos e as seções como itens dentro desses grupos</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}