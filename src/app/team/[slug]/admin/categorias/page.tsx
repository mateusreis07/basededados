'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Sidebar from '../../../../../components/Sidebar'

interface Category {
  id: string
  name: string
  description?: string
  color: string
  createdAt: string
  updatedAt: string
  _count?: {
    items: number
  }
}

interface Team {
  id: string
  name: string
  slug: string
  description?: string
}

export default function TeamCategoriasPage() {
  const params = useParams()
  const teamSlug = params.slug as string
  const [team, setTeam] = useState<Team | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#6B7280',
  })

  useEffect(() => {
    if (teamSlug) {
      Promise.all([
        fetch(`/api/teams/${teamSlug}`),
        fetch(`/api/teams/${teamSlug}/categories`)
      ])
        .then(async ([teamRes, categoriesRes]) => {
          const teamData = await teamRes.json()
          const categoriesData = await categoriesRes.json()

          setTeam(teamData)
          setCategories(categoriesData)
          setLoading(false)
        })
        .catch(err => {
          console.error('Erro ao carregar dados:', err)
          setLoading(false)
        })
    }
  }, [teamSlug])

  const loadCategories = async () => {
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

  const saveCategory = async (categoryData: Partial<Category>, isEdit: boolean = false) => {
    try {
      const url = isEdit ?
        `/api/teams/${teamSlug}/categories/${categoryData.id}` :
        `/api/teams/${teamSlug}/categories`
      const method = isEdit ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(categoryData)
      })

      if (response.ok) {
        await loadCategories()
        return true
      } else {
        const error = await response.json()
        alert(error.error || 'Erro ao salvar categoria')
        return false
      }
    } catch (error) {
      console.error('Erro ao salvar categoria:', error)
      alert('Erro ao salvar categoria')
      return false
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      alert('Nome da categoria é obrigatório')
      return
    }

    if (editingCategory) {
      const success = await saveCategory({
        id: editingCategory.id,
        name: formData.name,
        description: formData.description,
        color: formData.color,
      }, true)

      if (success) {
        resetForm()
      }
    } else {
      const success = await saveCategory({
        name: formData.name,
        description: formData.description,
        color: formData.color,
      })

      if (success) {
        resetForm()
      }
    }
  }

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      description: category.description || '',
      color: category.color,
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta categoria?')) {
      try {
        const response = await fetch(`/api/teams/${teamSlug}/categories/${id}`, {
          method: 'DELETE'
        })

        if (response.ok) {
          await loadCategories()
          alert('Categoria excluída com sucesso!')
        } else {
          const error = await response.json()
          alert(error.error || 'Erro ao excluir categoria')
        }
      } catch (error) {
        console.error('Erro ao excluir categoria:', error)
        alert('Erro ao excluir categoria')
      }
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      color: '#6B7280',
    })
    setEditingCategory(null)
    setShowForm(false)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
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
                <span className="text-2xl mr-3">🏷️</span>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    Categorias - {team.name}
                  </h1>
                  <p className="text-gray-600 mt-1">
                    Gerencie categorias para organizar conteúdo do team {team.name}
                  </p>
                  <div className="mt-2 text-sm text-blue-600 font-medium">
                    Team: {team.slug}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowForm(true)}
                  className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-300 gap-2"
                >
                  <span>➕</span>
                  Nova Categoria
                </button>
              </div>
            </div>
          </div>

          {/* Form Modal */}
          {showForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
                <form onSubmit={handleSubmit}>
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">
                      {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
                    </h3>
                  </div>

                  <div className="px-6 py-4 space-y-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                        Nome da Categoria *
                      </label>
                      <input
                        type="text"
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                        placeholder="Ex: Urgente, Importante, Dicas"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="color" className="block text-sm font-medium text-gray-700">
                        Cor da Categoria
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
                          className="flex-1 border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                          placeholder="#6B7280"
                          pattern="^#[0-9A-Fa-f]{6}$"
                        />
                      </div>
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
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                        placeholder="Descrição da categoria..."
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
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                    >
                      {editingCategory ? 'Salvar Alterações' : 'Criar Categoria'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Categories List */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            {categories.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {categories.map((category) => (
                  <div key={category.id} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        <div className="flex-shrink-0 mt-1">
                          <div
                            className="w-8 h-8 rounded-full border-2 border-gray-300"
                            style={{ backgroundColor: category.color }}
                            title={`Cor: ${category.color}`}
                          ></div>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-medium text-gray-900">
                              {category.name}
                            </h3>
                            <span
                              className="px-2 py-1 text-xs font-medium rounded-full text-white"
                              style={{ backgroundColor: category.color }}
                            >
                              {category._count?.items || 0} itens
                            </span>
                          </div>
                          {category.description && (
                            <p className="text-sm text-gray-600 mb-2">{category.description}</p>
                          )}
                          <div className="text-xs text-gray-500">
                            Criado em: {formatDate(category.createdAt)} |
                            ID: {category.id}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEdit(category)}
                          className="px-3 py-1 bg-yellow-500 hover:bg-yellow-600 text-white text-sm font-medium rounded-md transition-colors"
                        >
                          ✏️ Editar
                        </button>
                        <button
                          onClick={() => handleDelete(category.id)}
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
                <div className="text-6xl mb-4">🏷️</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhuma categoria encontrada
                </h3>
                <p className="text-sm text-gray-500 mb-6">
                  Crie sua primeira categoria para organizar o conteúdo do team {team.name}.
                </p>
                <button
                  onClick={() => setShowForm(true)}
                  className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors gap-2"
                >
                  <span>➕</span>
                  Nova Categoria
                </button>
              </div>
            )}
          </div>

          {/* Links úteis */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <a
              href={`/team/${team.slug}/admin/gerenciarsecoes`}
              className="block p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="text-lg font-medium text-gray-900 mb-1">📂 Gerenciar Seções</div>
              <div className="text-sm text-gray-600">Visualize e organize as seções do team</div>
            </a>

            <a
              href={`/team/${team.slug}/admin/itenssecoes`}
              className="block p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="text-lg font-medium text-gray-900 mb-1">📝 Gerenciar Itens</div>
              <div className="text-sm text-gray-600">Adicione e edite itens das seções</div>
            </a>
          </div>
        </div>
      </main>
    </div>
  )
}