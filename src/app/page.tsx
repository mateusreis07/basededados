'use client'

import { useState, useEffect } from 'react'
import Sidebar from '../components/Sidebar'

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
  category?: Category
  createdAt: string
}

export default function Home() {
  const [homepageItems, setHomepageItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchHomepageItems()
  }, [])

  const fetchHomepageItems = async () => {
    setLoading(true)
    try {
      // Buscar seção "Página Principal"
      const sectionsResponse = await fetch('/api/sections')
      if (sectionsResponse.ok) {
        const sections = await sectionsResponse.json()
        const homepageSection = sections.find((s: any) => s.name === 'Página Principal')

        if (homepageSection) {
          // Buscar itens da página principal
          const itemsResponse = await fetch(`/api/items?sectionId=${homepageSection.id}`)
          if (itemsResponse.ok) {
            const items = await itemsResponse.json()
            setHomepageItems(items)
          }
        }
      }
    } catch (error) {
      console.error('Erro ao carregar itens da página principal:', error)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content).then(() => {
      alert('Conteúdo copiado para a área de transferência!')
    })
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="ml-64 flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Base de Conhecimento
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Bem-vindo ao sistema de gestão de conhecimento. Use a navegação lateral para acessar as diferentes seções.
          </p>

          {/* Itens da Página Principal */}
          {homepageItems.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">📌 Destaques</h2>
              <div className="space-y-4">
                {homepageItems.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
                      <div className="flex items-center gap-2">
                        {item.category && (
                          <span
                            className="px-2 py-1 rounded-full text-white text-xs"
                            style={{ backgroundColor: item.category.color }}
                          >
                            {item.category.name}
                          </span>
                        )}
                        <button
                          onClick={() => copyToClipboard(item.content)}
                          className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
                        >
                          📋 Copiar
                        </button>
                      </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-md">
                      <pre className="text-sm text-gray-800 whitespace-pre-wrap overflow-x-auto">
                        {item.content}
                      </pre>
                    </div>
                    {item.tags.length > 0 && (
                      <div className="mt-3 text-xs text-gray-500">
                        <span className="font-medium">Tags:</span> {item.tags.join(', ')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Cards das Seções Fixas */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">🗂️ Seções</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center mb-4">
                  <span className="text-2xl mr-3">🗄️</span>
                  <h3 className="text-xl font-semibold text-gray-900">Scripts PostgreSQL</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Coleção de queries e scripts PostgreSQL com busca e funcionalidade de cópia.
                </p>
                <a
                  href="/scripts"
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Acessar →
                </a>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center mb-4">
                  <span className="text-2xl mr-3">ℹ️</span>
                  <h3 className="text-xl font-semibold text-gray-900">Informações Gerais</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Documentação e informações importantes do sistema.
                </p>
                <a
                  href="/informacoes"
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Acessar →
                </a>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center mb-4">
                  <span className="text-2xl mr-3">⚠️</span>
                  <h3 className="text-xl font-semibold text-gray-900">Erros</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Base de conhecimento para resolução de problemas e erros comuns.
                </p>
                <a
                  href="/erros"
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Acessar →
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
