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

export default function ErrosPage() {
  const [erros, setErros] = useState<Item[]>([])
  const [filteredErros, setFilteredErros] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchErros()
  }, [])

  useEffect(() => {
    if (searchQuery) {
      const filtered = erros.filter(erro =>
        erro.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        erro.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        erro.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
      setFilteredErros(filtered)
    } else {
      setFilteredErros(erros)
    }
  }, [searchQuery, erros])

  const fetchErros = async () => {
    try {
      const response = await fetch('/api/items?sectionId=erros')
      if (response.ok) {
        const data = await response.json()
        setErros(data)
        setFilteredErros(data)
      }
    } catch (error) {
      console.error('Erro ao carregar erros:', error)
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

  const formatContent = (content: string) => {
    const sections = content.split('\n\n')
    return sections.map((section, index) => {
      const lines = section.split('\n')
      if (lines[0].startsWith('**') || lines[0].startsWith('##')) {
        return (
          <div key={index} className="mb-4">
            <h4 className="font-semibold text-gray-900 mb-2">
              {lines[0].replace(/\*\*|##/g, '')}
            </h4>
            {lines.slice(1).map((line, lineIndex) => (
              <p key={lineIndex} className="mb-1 text-gray-700">
                {line}
              </p>
            ))}
          </div>
        )
      }
      return (
        <div key={index} className="mb-3">
          {lines.map((line, lineIndex) => (
            <p key={lineIndex} className="mb-1 text-gray-700">
              {line}
            </p>
          ))}
        </div>
      )
    })
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="ml-64 flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Erros</h1>
            <p className="text-gray-600">Base de conhecimento para resolução de problemas e erros comuns</p>
          </div>

          <div className="mb-6">
            <SearchBar
              onSearch={handleSearch}
              placeholder="Pesquisar erros e soluções..."
              className="w-full max-w-md"
            />
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredErros.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">
                    {searchQuery ? 'Nenhum erro encontrado para a pesquisa.' : 'Nenhum erro cadastrado ainda.'}
                  </p>
                </div>
              ) : (
                filteredErros.map((erro) => (
                  <div
                    key={erro.id}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 border-l-4 border-l-red-500"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <span className="text-red-500 text-lg mr-2">⚠️</span>
                          <h3 className="text-xl font-semibold text-gray-900">
                            {erro.title}
                          </h3>
                        </div>
                        {erro.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-3">
                            {erro.tags.map((tag, index) => (
                              <span
                                key={index}
                                className="inline-block bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <CopyButton text={erro.content} />
                    </div>

                    <div className="bg-red-50 rounded-lg p-4 mb-4">
                      <div className="text-gray-800 leading-relaxed">
                        {formatContent(erro.content)}
                      </div>
                    </div>

                    <div className="text-sm text-gray-500">
                      Criado em: {formatDate(erro.createdAt)}
                      {erro.updatedAt !== erro.createdAt && (
                        <span className="ml-4">
                          Atualizado em: {formatDate(erro.updatedAt)}
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
                Adicionar Novo Erro/Solução
              </a>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}