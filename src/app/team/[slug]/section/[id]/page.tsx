'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import { useTeam } from '../../../../../contexts/TeamContext'
import Sidebar from '../../../../../components/Sidebar'
import SearchBar from '../../../../../components/SearchBar'
import CopyButton from '../../../../../components/CopyButton'
import RichTextEditor from '../../../../../components/RichTextEditor'

interface Section {
  id: string
  name: string
  description?: string
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
  createdAt: string
  updatedAt: string
  section: Section
  category?: Category
}

export default function SectionPage() {
  const params = useParams()
  const { currentTeam } = useTeam()
  const sectionId = params.id as string
  const teamSlug = params.slug as string

  const [section, setSection] = useState<Section | null>(null)
  const [items, setItems] = useState<Item[]>([])
  const [filteredItems, setFilteredItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())
  const [showEditModal, setShowEditModal] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingItem, setEditingItem] = useState<Item | null>(null)
  const [categories, setCategories] = useState<any[]>([])
  const [sections, setSections] = useState<any[]>([])
  const savingRef = useRef(false)

  useEffect(() => {
    if (sectionId && currentTeam) {
      fetchSectionData()
      fetchCategories()
      fetchSections()
    }
  }, [sectionId, currentTeam])

  useEffect(() => {
    let filtered = items

    // Filtro por pesquisa
    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }

    // Filtro por categoria
    if (selectedCategory) {
      console.log('Filtering by category:', selectedCategory)
      console.log('Items before filter:', filtered.map(item => ({id: item.id, title: item.title, category: item.category})))
      filtered = filtered.filter(item => item.category?.id === selectedCategory)
      console.log('Items after filter:', filtered.map(item => ({id: item.id, title: item.title, category: item.category})))
    }

    setFilteredItems(filtered)
  }, [items, searchQuery, selectedCategory])

  // Gerenciar expansão dos itens separadamente - só quando filtros mudam
  useEffect(() => {
    // Não mexer com expansão se estamos salvando
    if (savingRef.current) {
      return
    }

    // Auto-expandir itens encontrados na pesquisa
    if (searchQuery) {
      // Recriar filtro para obter IDs atuais
      let filtered = items

      if (searchQuery) {
        filtered = filtered.filter(item =>
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
        )
      }

      if (selectedCategory) {
        filtered = filtered.filter(item => item.category?.id === selectedCategory)
      }

      const matchedItemIds = filtered.map(item => item.id)
      setExpandedItems(new Set(matchedItemIds))
    }
    // Não recolher itens quando não há pesquisa ativa - preservar estado atual
  }, [searchQuery, selectedCategory, items])

  const fetchSectionData = async () => {
    if (!currentTeam) return

    try {
      setLoading(true)

      // Buscar seção específica usando API do team
      const sectionResponse = await fetch(`/api/teams/${teamSlug}/sections/${sectionId}`)
      if (sectionResponse.ok) {
        const sectionData = await sectionResponse.json()
        setSection(sectionData)
        setItems(sectionData.items || [])
        setFilteredItems(sectionData.items || [])
      } else if (sectionResponse.status === 404) {
        // Se seção não existe, buscar itens por sectionId diretamente
        const itemsResponse = await fetch(`/api/teams/${teamSlug}/items?sectionId=${sectionId}`)
        if (itemsResponse.ok) {
          const itemsData = await itemsResponse.json()
          if (itemsData.length > 0) {
            setSection({
              id: sectionId,
              name: itemsData[0].section?.name || sectionId,
              description: `Seção ${sectionId}`
            })
            setItems(itemsData)
            setFilteredItems(itemsData)
          }
        }
      }
    } catch (error) {
      console.error('Erro ao carregar seção:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  const toggleItemExpansion = (itemId: string) => {
    setExpandedItems(prev => {
      const newExpanded = new Set(prev)
      if (newExpanded.has(itemId)) {
        newExpanded.delete(itemId)
      } else {
        newExpanded.add(itemId)
      }
      return newExpanded
    })
  }

  const fetchCategories = async () => {
    if (!currentTeam) return

    try {
      const response = await fetch(`/api/teams/${teamSlug}/categories`)
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      }
    } catch (error) {
      console.error('Erro ao carregar categorias:', error)
    }
  }

  const fetchSections = async () => {
    if (!currentTeam) return

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

  const handleEditItem = (item: Item) => {
    setEditingItem(item)
    setShowEditModal(true)
  }

  const handleCreateItem = async (formData: any) => {
    if (!currentTeam) return

    try {
      const response = await fetch(`/api/teams/${teamSlug}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          tags: formData.tags.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag),
          sectionId: formData.sectionId || sectionId
        })
      })

      if (response.ok) {
        await fetchSectionData()
        setShowCreateModal(false)
        alert('Item criado com sucesso!')
      } else {
        alert('Erro ao criar item')
      }
    } catch (error) {
      console.error('Erro ao criar:', error)
      alert('Erro ao criar item')
    }
  }

  const handleSaveEdit = async (formData: any) => {
    if (!editingItem) return

    try {
      console.log('Enviando dados para atualização:', formData)

      const response = await fetch(`/api/teams/${teamSlug}/items/${editingItem.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          tags: formData.tags ? formData.tags.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag) : []
        })
      })

      if (response.ok) {
        await fetchSectionData()
        setShowEditModal(false)
        setEditingItem(null)
        alert('Item atualizado com sucesso!')
      } else {
        const errorData = await response.json().catch(() => ({}))
        console.error('Erro do servidor:', errorData)
        alert(`Erro ao atualizar item: ${errorData.error || 'Erro desconhecido'}`)
      }
    } catch (error) {
      console.error('Erro ao salvar:', error)
      alert('Erro ao salvar item')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  const handleContentUpdate = async (itemId: string, newContent: string) => {
    try {
      // Marcar que estamos salvando para evitar interferência nos expandedItems
      savingRef.current = true

      // Encontrar o item atual para preservar outros campos
      const currentItem = items.find(item => item.id === itemId)
      if (!currentItem) {
        throw new Error('Item não encontrado')
      }

      // Dados mínimos para atualização - apenas o conteúdo
      const updateData = {
        content: newContent
      }

      const response = await fetch(`/api/teams/${teamSlug}/items/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData)
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Erro ao atualizar item')
      }

      const updatedItem = await response.json()

      // Atualizar o estado local com o item retornado pela API
      setItems(prevItems =>
        prevItems.map(item =>
          item.id === itemId ? { ...item, ...updatedItem } : item
        )
      )

      // Atualizar filteredItems também
      setFilteredItems(prevItems =>
        prevItems.map(item =>
          item.id === itemId ? { ...item, ...updatedItem } : item
        )
      )

      console.log('Conteúdo atualizado com sucesso')

    } catch (error) {
      console.error('Erro ao atualizar conteúdo:', error)
      alert(`Erro ao salvar alterações: ${error instanceof Error ? error.message : 'Tente novamente.'}`)
    } finally {
      // Marcar que não estamos mais salvando
      setTimeout(() => {
        savingRef.current = false
      }, 100) // Pequeno delay para garantir que o useEffect não rode
    }
  }


  const getSectionIcon = (sectionId: string) => {
    switch (sectionId) {
      case 'scripts': return '🗄️'
      case 'informacoes': return 'ℹ️'
      case 'erros': return '⚠️'
      default: return '📁'
    }
  }

  const getSectionColor = (sectionId: string) => {
    switch (sectionId) {
      case 'scripts': return 'blue'
      case 'informacoes': return 'green'
      case 'erros': return 'red'
      default: return 'gray'
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <main className="ml-64 flex-1 p-8 pt-4">
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </main>
      </div>
    )
  }

  if (!section) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <main className="ml-64 flex-1 p-8 pt-4">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Seção não encontrada</h1>
            <p className="text-gray-600">A seção "{sectionId}" não existe ou não possui conteúdo.</p>
          </div>
        </main>
      </div>
    )
  }

  const color = getSectionColor(sectionId)

  return (
    <div className="flex min-h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      <main className="ml-64 flex-1 p-8 overflow-x-hidden">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <span className="text-2xl mr-3">{getSectionIcon(sectionId)}</span>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{section.name}</h1>
                  {section.description && (
                    <p className="text-gray-600 mt-1">{section.description}</p>
                  )}
                </div>
              </div>

              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-300 gap-2"
              >
                <span>➕</span>
                Adicionar Novo Item
              </button>
            </div>
          </div>

          <div className="mb-6 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <SearchBar
                onSearch={handleSearch}
                placeholder="Pesquisar nesta seção..."
                className="flex-1 max-w-md"
              />

              <div className="flex items-center gap-2">
                <label htmlFor="category-filter" className="text-sm font-medium text-gray-700 whitespace-nowrap">
                  Filtrar por categoria:
                </label>
                <select
                  id="category-filter"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white min-w-[180px]"
                >
                  <option value="">Todas as categorias</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Indicadores de filtros ativos */}
            {(searchQuery || selectedCategory) && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>Filtros ativos:</span>
                {searchQuery && (
                  <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                    Pesquisa: "{searchQuery}"
                    <button
                      onClick={() => setSearchQuery('')}
                      className="ml-1 hover:text-blue-600"
                    >
                      ×
                    </button>
                  </span>
                )}
                {selectedCategory && (
                  <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                    Categoria: {categories.find(c => c.id === selectedCategory)?.name}
                    <button
                      onClick={() => setSelectedCategory('')}
                      className="ml-1 hover:text-green-600"
                    >
                      ×
                    </button>
                  </span>
                )}
                <button
                  onClick={() => {
                    setSearchQuery('')
                    setSelectedCategory('')
                  }}
                  className="text-xs text-gray-500 hover:text-gray-700 underline"
                >
                  Limpar todos
                </button>
              </div>
            )}
          </div>

          <div className="space-y-6 w-full max-w-full">
            {filteredItems.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">
                  {searchQuery
                    ? 'Nenhum item encontrado para a pesquisa.'
                    : 'Esta seção não possui conteúdo ainda.'
                  }
                </p>
              </div>
            ) : (
              filteredItems.map((item) => {
                const isExpanded = expandedItems.has(item.id)
                return (
                  <div
                    key={item.id}
                    className={`bg-white rounded-lg shadow-sm border border-gray-200 w-full overflow-hidden transition-all duration-200 hover:shadow-md ${
                      color === 'red' ? 'border-l-4 border-l-red-500' : ''
                    }`}
                  >
                    {/* Header - Sempre visível */}
                    <div
                      className="p-6 cursor-pointer hover:bg-blue-50 transition-colors"
                      onClick={() => toggleItemExpansion(item.id)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            {color === 'red' && <span className="text-red-500 text-lg mr-2">⚠️</span>}
                            <h3 className="text-xl font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                              {item.title}
                            </h3>
                            <span className="ml-3 text-gray-400 transform transition-transform duration-200">
                              {isExpanded ? '▼' : '▶'}
                            </span>
                          </div>

                          {item.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-2">
                              {item.tags.map((tag, index) => (
                                <span
                                  key={index}
                                  className={`inline-block text-xs px-2 py-1 rounded-full ${
                                    color === 'blue'
                                      ? 'bg-blue-100 text-blue-800'
                                      : color === 'green'
                                      ? 'bg-green-100 text-green-800'
                                      : color === 'red'
                                      ? 'bg-red-100 text-red-800'
                                      : 'bg-gray-100 text-gray-800'
                                  }`}
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}

                          <div className="text-sm text-gray-500 flex items-center gap-4">
                            <span>Criado em: {formatDate(item.createdAt)}</span>
                            {item.updatedAt !== item.createdAt && (
                              <span>Atualizado em: {formatDate(item.updatedAt)}</span>
                            )}
                            {item.category && (
                              <span
                                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white"
                                style={{ backgroundColor: item.category.color }}
                              >
                                {item.category.name}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="ml-4 flex items-center gap-2">
                          <span className="text-xs text-gray-400 hidden sm:block">
                            {isExpanded ? 'Clique para recolher' : 'Clique para expandir'}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleEditItem(item)
                            }}
                            className="px-3 py-1 bg-yellow-500 hover:bg-yellow-600 text-white text-sm font-medium rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-300"
                            title="Editar item"
                          >
                            ✏️ Editar
                          </button>
                          <CopyButton text={item.content} />
                        </div>
                      </div>
                    </div>

                    {/* Conteúdo - Só aparece quando expandido */}
                    {isExpanded && (
                      <div className="px-6 pb-6 border-t border-gray-100 group">
                        <div className="pt-4">
                          <RichTextEditor
                            initialContent={item.content}
                            onSave={(newContent) => handleContentUpdate(item.id, newContent)}
                            isEditable={true}
                            className="min-h-[100px]"
                            keepEditingAfterSave={true}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>

        </div>
      </main>

      {/* Modal de Edição */}
      {showEditModal && editingItem && (
        <EditItemModal
          item={editingItem}
          categories={categories}
          onSave={handleSaveEdit}
          onClose={() => {
            setShowEditModal(false)
            setEditingItem(null)
          }}
        />
      )}

      {/* Modal de Criação */}
      {showCreateModal && (
        <CreateItemModal
          sections={sections}
          categories={categories}
          defaultSectionId={sectionId}
          onSave={handleCreateItem}
          onClose={() => setShowCreateModal(false)}
        />
      )}

    </div>
  )
}

// Componente Modal de Edição
interface EditItemModalProps {
  item: Item
  categories: any[]
  onSave: (formData: any) => void
  onClose: () => void
}

function EditItemModal({ item, categories, onSave, onClose }: EditItemModalProps) {
  const [formData, setFormData] = useState({
    title: item.title,
    content: item.content,
    tags: item.tags.join(', '),
    categoryId: item.category?.id || ''
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await onSave(formData)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">Editar Item</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Título
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Conteúdo
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={12}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
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
              placeholder="sql, query, select"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categoria
            </label>
            <select
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Sem categoria</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-400 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Componente Modal de Criação
interface CreateItemModalProps {
  sections: any[]
  categories: any[]
  defaultSectionId: string
  onSave: (formData: any) => void
  onClose: () => void
}

function CreateItemModal({ sections, categories, defaultSectionId, onSave, onClose }: CreateItemModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    tags: '',
    sectionId: defaultSectionId,
    categoryId: ''
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await onSave(formData)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">Novo Item</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Título
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              placeholder="Digite o título do item"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Conteúdo
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={12}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
              required
              placeholder="Digite o conteúdo do item (SQL, texto, etc.)"
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
              placeholder="sql, query, select, exemplo"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Seção
            </label>
            <select
              value={formData.sectionId}
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

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categoria
            </label>
            <select
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Sem categoria</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-400 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Criando...' : 'Criar Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}