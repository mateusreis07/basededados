'use client'

import { useState, useEffect } from 'react'
import Sidebar from '../../components/Sidebar'
import SearchBar from '../../components/SearchBar'
import CopyButton from '../../components/CopyButton'

interface Item {
  id: string
  title: string
  content: string
  tags: string[]
  createdAt: string
  updatedAt: string
}

export default function ScriptsPage() {
  const [scripts, setScripts] = useState<Item[]>([])
  const [filteredScripts, setFilteredScripts] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchScripts()
  }, [])

  useEffect(() => {
    if (searchQuery) {
      const filtered = scripts.filter(script =>
        script.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        script.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        script.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
      setFilteredScripts(filtered)
    } else {
      setFilteredScripts(scripts)
    }
  }, [searchQuery, scripts])

  const fetchScripts = async () => {
    try {
      const response = await fetch('/api/items?sectionId=scripts')
      if (response.ok) {
        const data = await response.json()
        setScripts(data)
        setFilteredScripts(data)
      }
    } catch (error) {
      console.error('Erro ao carregar scripts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Scripts PostgreSQL</h1>
            <p className="text-gray-600">Coleção de queries e scripts PostgreSQL</p>
          </div>

          <div className="mb-6">
            <SearchBar
              onSearch={handleSearch}
              placeholder="Pesquisar por título, conteúdo ou tags..."
              className="w-full max-w-md"
            />
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredScripts.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">
                    {searchQuery ? 'Nenhum script encontrado para a pesquisa.' : 'Nenhum script cadastrado ainda.'}
                  </p>
                </div>
              ) : (
                filteredScripts.map((script) => (
                  <div
                    key={script.id}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          {script.title}
                        </h3>
                        {script.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-3">
                            {script.tags.map((tag, index) => (
                              <span
                                key={index}
                                className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <CopyButton text={script.content} />
                    </div>

                    <div className="bg-gray-900 rounded-lg p-4 mb-4">
                      <pre className="text-green-400 text-sm overflow-x-auto">
                        <code>{script.content}</code>
                      </pre>
                    </div>

                    <div className="text-sm text-gray-500">
                      Criado em: {formatDate(script.createdAt)}
                      {script.updatedAt !== script.createdAt && (
                        <span className="ml-4">
                          Atualizado em: {formatDate(script.updatedAt)}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {!loading && !searchQuery && (
            <div className="mt-8 text-center">
              <a
                href="/admin"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Adicionar Novo Script
              </a>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}