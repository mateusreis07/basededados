'use client'

import { useState, useEffect } from 'react'
import Sidebar from '../../../components/Sidebar'

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

export default function ItensSecoesPage() {
  const [sections, setSections] = useState<Section[]>([])
  const [selectedSection, setSelectedSection] = useState('')
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(false)

  // Form states
  const [showForm, setShowForm] = useState(false)
  const [editingItem, setEditingItem] = useState<Item | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    tags: '',
    sectionId: '',
    categoryId: ''
  })

  useEffect(() => {
    fetchSections()
  }, [])

  useEffect(() => {
    if (selectedSection) {
      fetchItems()
    }
  }, [selectedSection])

  const fetchSections = async () => {
    try {
      const response = await fetch('/api/sections')
      if (response.ok) {
        const data = await response.json()
        setSections(data)
      }
    } catch (error) {
      console.error('Erro ao carregar seções:', error)
    }
  }

  const fetchItems = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/items?sectionId=${selectedSection}`)
      if (response.ok) {
        const data = await response.json()
        setItems(data)
      }
    } catch (error) {
      console.error('Erro ao carregar itens:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const itemData = {
      ...formData,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      sectionId: formData.sectionId || selectedSection
    }

    try {
      const url = editingItem ? `/api/items/${editingItem.id}` : '/api/items'
      const method = editingItem ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(itemData)
      })

      if (response.ok) {
        resetForm()
        if (selectedSection) {
          fetchItems()
        }
        alert(editingItem ? 'Item atualizado com sucesso!' : 'Item criado com sucesso!')
      } else {
        alert('Erro ao salvar item')
      }
    } catch (error) {
      console.error('Erro ao salvar:', error)
      alert('Erro ao salvar item')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (item: Item) => {
    setEditingItem(item)
    setFormData({
      title: item.title,
      content: item.content,
      tags: item.tags.join(', '),
      sectionId: item.sectionId,
      categoryId: item.categoryId || ''
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja deletar este item?')) return

    setLoading(true)
    try {
      const response = await fetch(`/api/items/${id}`, { method: 'DELETE' })
      if (response.ok) {
        fetchItems()
        alert('Item deletado com sucesso!')
      } else {
        alert('Erro ao deletar item')
      }
    } catch (error) {
      console.error('Erro ao deletar:', error)
      alert('Erro ao deletar item')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({ title: '', content: '', tags: '', sectionId: '', categoryId: '' })
    setEditingItem(null)
    setShowForm(false)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="ml-64 flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Gerenciar Itens das Seções</h1>
            <p className="text-gray-600">Adicione, edite e organize os itens de conteúdo das seções</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Section Selector */}
            <div className="lg:col-span-1">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h2 className="text-lg font-semibold mb-4">Selecionar Seção</h2>
                <select
                  value={selectedSection}
                  onChange={(e) => setSelectedSection(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Selecione uma seção</option>
                  {sections.map((section) => (
                    <option key={section.id} value={section.id}>
                      {section.name} ({section._count.items} {section._count.items === 1 ? 'item' : 'itens'})
                    </option>
                  ))}
                </select>

                {selectedSection && (
                  <div className="mt-4">
                    <button
                      onClick={() => setShowForm(true)}
                      className="w-full px-4 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-300"
                    >
                      📄 Adicionar Novo Item
                    </button>
                  </div>
                )}
              </div>

              {selectedSection && (
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {sections.find(s => s.id === selectedSection)?.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {sections.find(s => s.id === selectedSection)?.description || 'Seção selecionada para gerenciamento'}
                  </p>
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <div className="text-sm text-blue-800">
                      <strong>Total de itens:</strong> {sections.find(s => s.id === selectedSection)?._count.items || 0}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Items List */}
            <div className="lg:col-span-2">
              {selectedSection ? (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">
                      Itens - {sections.find(s => s.id === selectedSection)?.name}
                    </h2>
                    {items.length > 0 && (
                      <span className="text-sm text-gray-500">
                        {items.length} {items.length === 1 ? 'item encontrado' : 'itens encontrados'}
                      </span>
                    )}
                  </div>

                  {loading ? (
                    <div className="flex justify-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  ) : items.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="text-6xl mb-4">📝</div>
                      <p className="text-lg text-gray-500 mb-2">Nenhum item encontrado nesta seção</p>
                      <p className="text-sm text-gray-400">Clique em "Adicionar Novo Item" para começar</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {items.map((item) => (
                        <div
                          key={item.id}
                          className="p-5 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors duration-200"
                        >
                          <div className="flex justify-between items-start mb-3">
                            <h3 className="font-medium text-gray-900 text-lg">{item.title}</h3>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEdit(item)}
                                className="px-3 py-1 bg-yellow-500 hover:bg-yellow-600 text-white text-sm font-medium rounded-md transition-colors duration-200"
                              >
                                Editar
                              </button>
                              <button
                                onClick={() => handleDelete(item.id)}
                                className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-md transition-colors duration-200"
                              >
                                Deletar
                              </button>
                            </div>
                          </div>
                          <p className="text-gray-600 text-sm mb-3 leading-relaxed">
                            {item.content.substring(0, 200)}...
                          </p>
                          <div className="flex justify-between items-center text-xs text-gray-500">
                            <div className="flex items-center gap-4">
                              <span>Criado: {formatDate(item.createdAt)}</span>
                              {item.category && (
                                <span
                                  className="px-2 py-1 rounded-full text-white text-xs font-medium"
                                  style={{ backgroundColor: item.category.color }}
                                >
                                  {item.category.name}
                                </span>
                              )}
                            </div>
                            {item.tags.length > 0 && (
                              <div className="flex items-center gap-1">
                                <span>🏷️ {item.tags.join(', ')}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                  <div className="text-6xl mb-4">📂</div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">Selecione uma Seção</h3>
                  <p className="text-gray-500">Escolha uma seção no painel ao lado para gerenciar seus itens</p>
                </div>
              )}
            </div>
          </div>

          {/* Form Modal */}
          {showForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                <h2 className="text-xl font-semibold mb-4">
                  {editingItem ? 'Editar Item' : 'Novo Item'}
                </h2>

                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Título *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Digite o título do item"
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Conteúdo *
                    </label>
                    <textarea
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      rows={12}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Digite o conteúdo detalhado do item"
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tags (separadas por vírgula)
                    </label>
                    <input
                      type="text"
                      value={formData.tags}
                      onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="postgresql, query, select, documentação"
                    />
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Seção *
                    </label>
                    <select
                      value={formData.sectionId || selectedSection}
                      onChange={(e) => setFormData({ ...formData, sectionId: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      {sections.map((section) => (
                        <option key={section.id} value={section.id}>
                          {section.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex gap-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 px-4 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                    >
                      {loading ?
                        (editingItem ? 'Salvando...' : 'Criando...') :
                        (editingItem ? 'Salvar Alterações' : 'Criar Item')
                      }
                    </button>
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-6 py-3 bg-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-400 transition-colors duration-200"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}