'use client'

import { useState, useEffect } from 'react'
import Sidebar from '../../../components/Sidebar'

interface Category {
  id: string
  name: string
  description?: string
  color: string
  _count: {
    items: number
  }
}

export default function CategoriasPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [showCategoryForm, setShowCategoryForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [categoryFormData, setCategoryFormData] = useState({
    name: '',
    description: '',
    color: '#3B82F6'
  })

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      }
    } catch (error) {
      console.error('Erro ao carregar categorias:', error)
    }
  }

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category)
    setCategoryFormData({
      name: category.name,
      description: category.description || '',
      color: category.color
    })
    setShowCategoryForm(true)
  }

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = editingCategory ? `/api/categories/${editingCategory.id}` : '/api/categories'
      const method = editingCategory ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoryFormData)
      })

      if (response.ok) {
        resetCategoryForm()
        fetchCategories()
        alert(editingCategory ? 'Categoria atualizada com sucesso!' : 'Categoria criada com sucesso!')
      } else {
        alert(editingCategory ? 'Erro ao atualizar categoria' : 'Erro ao criar categoria')
      }
    } catch (error) {
      console.error('Erro ao salvar categoria:', error)
      alert('Erro ao salvar categoria')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteCategory = async (id: string, name: string) => {
    if (!confirm(`Tem certeza que deseja deletar a categoria "${name}"?`)) return

    setLoading(true)
    try {
      const response = await fetch(`/api/categories/${id}`, { method: 'DELETE' })
      if (response.ok) {
        fetchCategories()
        alert('Categoria deletada com sucesso!')
      } else {
        const errorData = await response.json()
        alert(errorData.error || 'Erro ao deletar categoria')
      }
    } catch (error) {
      console.error('Erro ao deletar categoria:', error)
      alert('Erro ao deletar categoria')
    } finally {
      setLoading(false)
    }
  }

  const resetCategoryForm = () => {
    setCategoryFormData({ name: '', description: '', color: '#3B82F6' })
    setEditingCategory(null)
    setShowCategoryForm(false)
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="ml-64 flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Gerenciar Categorias</h1>
            <p className="text-gray-600">Organize e gerencie as categorias dos itens da base de conhecimento</p>
          </div>

          {/* Header with Create Button */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Categorias</h2>
                <p className="text-sm text-gray-500 mt-1">
                  As categorias ajudam a organizar e filtrar os itens por assunto ou tipo
                </p>
              </div>
              <button
                onClick={() => setShowCategoryForm(true)}
                className="inline-flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-300 gap-2"
              >
                <span>➕</span>
                Criar Categoria
              </button>
            </div>

            {/* Categories List */}
            <div className="space-y-4">
              {categories.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🏷️</div>
                  <p className="text-lg text-gray-500 mb-2">Nenhuma categoria criada ainda</p>
                  <p className="text-sm text-gray-400">Clique em "Criar Categoria" para começar</p>
                </div>
              ) : (
                categories.map((category) => (
                  <div key={category.id} className="bg-gray-50 border border-gray-200 rounded-lg p-5">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div
                            className="w-5 h-5 rounded-full border-2 border-white shadow-sm"
                            style={{ backgroundColor: category.color }}
                          ></div>
                          <h3 className="text-lg font-medium text-gray-900">{category.name}</h3>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-600 text-white">
                            {category._count.items} {category._count.items === 1 ? 'item' : 'itens'}
                          </span>
                        </div>
                        {category.description && (
                          <p className="text-gray-600 ml-8">{category.description}</p>
                        )}
                        <div className="flex items-center gap-4 text-sm text-gray-500 mt-2 ml-8">
                          <span>Cor: {category.color}</span>
                          <span>ID: {category.id.substring(0, 8)}...</span>
                        </div>
                      </div>
                      <div className="flex gap-3 ml-6">
                        <button
                          onClick={() => handleEditCategory(category)}
                          className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white text-sm font-medium rounded-md transition-colors duration-200"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(category.id, category.name)}
                          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-md transition-colors duration-200"
                          disabled={category._count.items > 0}
                        >
                          Excluir
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Category Form Modal */}
        {showCategoryForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-lg">
              <h2 className="text-xl font-semibold mb-4">
                {editingCategory ? 'Editar Categoria' : 'Criar Nova Categoria'}
              </h2>

              <form onSubmit={handleCreateCategory}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome da Categoria *
                  </label>
                  <input
                    type="text"
                    value={categoryFormData.name}
                    onChange={(e) => setCategoryFormData({ ...categoryFormData, name: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Ex: Fluxo de Trabalho"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descrição (opcional)
                  </label>
                  <textarea
                    value={categoryFormData.description}
                    onChange={(e) => setCategoryFormData({ ...categoryFormData, description: e.target.value })}
                    rows={3}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Processos e procedimentos de trabalho"
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cor da Categoria *
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={categoryFormData.color}
                      onChange={(e) => setCategoryFormData({ ...categoryFormData, color: e.target.value })}
                      className="w-12 h-10 border border-gray-300 rounded-md cursor-pointer"
                    />
                    <input
                      type="text"
                      value={categoryFormData.color}
                      onChange={(e) => setCategoryFormData({ ...categoryFormData, color: e.target.value })}
                      className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="#3B82F6"
                      pattern="^#[0-9A-Fa-f]{6}$"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Cor para identificação visual da categoria
                  </p>
                </div>

                <div className="flex gap-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-4 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    {loading
                      ? (editingCategory ? 'Salvando...' : 'Criando...')
                      : (editingCategory ? 'Salvar Alterações' : 'Criar Categoria')
                    }
                  </button>
                  <button
                    type="button"
                    onClick={resetCategoryForm}
                    className="px-6 py-3 bg-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-400 transition-colors duration-200"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}