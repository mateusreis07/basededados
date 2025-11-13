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

export default function InformacoesPage() {
  const [informacoes, setInformacoes] = useState<Item[]>([])
  const [filteredInformacoes, setFilteredInformacoes] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchInformacoes()
  }, [])

  useEffect(() => {
    if (searchQuery) {
      const filtered = informacoes.filter(info =>
        info.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        info.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        info.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
      setFilteredInformacoes(filtered)
    } else {
      setFilteredInformacoes(informacoes)
    }
  }, [searchQuery, informacoes])

  const fetchInformacoes = async () => {
    try {
      const response = await fetch('/api/items?sectionId=informacoes')
      if (response.ok) {
        const data = await response.json()
        setInformacoes(data)
        setFilteredInformacoes(data)
      }
    } catch (error) {
      console.error('Erro ao carregar informações:', error)
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
    return content.split('\n').map((line, index) => (
      <p key={index} className="mb-2">
        {line}
      </p>
    ))
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="ml-64 flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Informações Gerais</h1>
            <p className="text-gray-600">Documentação e informações importantes do sistema</p>
          </div>

          <div className="mb-6">
            <SearchBar
              onSearch={handleSearch}
              placeholder="Pesquisar informações..."
              className="w-full max-w-md"
            />
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredInformacoes.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">
                    {searchQuery ? 'Nenhuma informação encontrada para a pesquisa.' : 'Nenhuma informação cadastrada ainda.'}
                  </p>
                </div>
              ) : (
                filteredInformacoes.map((info) => (
                  <div
                    key={info.id}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          {info.title}
                        </h3>
                        {info.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-3">
                            {info.tags.map((tag, index) => (
                              <span
                                key={index}
                                className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <CopyButton text={info.content} />
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <div className="text-gray-800 leading-relaxed">
                        {formatContent(info.content)}
                      </div>
                    </div>

                    <div className="text-sm text-gray-500">
                      Criado em: {formatDate(info.createdAt)}
                      {info.updatedAt !== info.createdAt && (
                        <span className="ml-4">
                          Atualizado em: {formatDate(info.updatedAt)}
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
                Adicionar Nova Informação
              </a>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}