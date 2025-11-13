'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Sidebar from '../../components/Sidebar'

interface Report {
  id: string
  title: string
  content: string
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
  category: string
  tags: string[]
  createdAt: string
  updatedAt: string
  author: string
}

export default function Reports() {
  const [reports, setReports] = useState<Report[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [copySuccess, setCopySuccess] = useState<string | null>(null)
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    status: '',
    dateFrom: '',
    dateTo: ''
  })

  useEffect(() => {
    fetchReports()
    fetchCategories()
  }, [filters])

  const fetchReports = async () => {
    try {
      // Construir query params para filtros
      const queryParams = new URLSearchParams()

      if (filters.search) queryParams.append('search', filters.search)
      if (filters.category) queryParams.append('category', filters.category)
      if (filters.status) queryParams.append('status', filters.status)
      if (filters.dateFrom) queryParams.append('dateFrom', filters.dateFrom)
      if (filters.dateTo) queryParams.append('dateTo', filters.dateTo)

      const url = `/api/reports${queryParams.toString() ? '?' + queryParams.toString() : ''}`

      const response = await fetch(url)

      if (!response.ok) {
        throw new Error('Erro ao carregar relatórios')
      }

      const reportsData = await response.json()
      setReports(reportsData)
    } catch (error) {
      console.error('Erro ao carregar relatórios:', error)
      // Fallback para dados mock em caso de erro de conexão
      const mockReports: Report[] = [
        {
          id: '1',
          title: 'Relatório de Performance do Sistema',
          content: 'Análise detalhada da performance do sistema durante o último mês...',
          status: 'PUBLISHED',
          category: 'Performance',
          tags: ['performance', 'sistema', 'análise'],
          createdAt: '2024-11-01T10:00:00Z',
          updatedAt: '2024-11-01T10:00:00Z',
          author: 'Sistema'
        }
      ]
      setReports(mockReports)
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      // Categorias de exemplo
      setCategories(['Performance', 'Uso', 'Análise', 'Segurança', 'Manutenção', 'Operacional'])
    } catch (error) {
      console.error('Erro ao carregar categorias:', error)
    }
  }

  const getStatusBadge = (status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED') => {
    const styles = {
      DRAFT: 'bg-yellow-100 text-yellow-800',
      PUBLISHED: 'bg-green-100 text-green-800',
      ARCHIVED: 'bg-gray-100 text-gray-800'
    }

    const labels = {
      DRAFT: 'Rascunho',
      PUBLISHED: 'Publicado',
      ARCHIVED: 'Arquivado'
    }

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}>
        {labels[status]}
      </span>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  const copyReportToClipboard = async (report: Report) => {
    try {
      await navigator.clipboard.writeText(report.content)
      setCopySuccess(report.id)
      setTimeout(() => setCopySuccess(null), 2000)
    } catch (error) {
      console.error('Erro ao copiar texto:', error)
      // Fallback para navegadores que não suportam clipboard API
      const textArea = document.createElement('textarea')
      textArea.value = report.content
      document.body.appendChild(textArea)
      textArea.select()
      try {
        document.execCommand('copy')
        setCopySuccess(report.id)
        setTimeout(() => setCopySuccess(null), 2000)
      } catch (err) {
        console.error('Fallback copy failed:', err)
      }
      document.body.removeChild(textArea)
    }
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
                <span className="text-2xl mr-3">📊</span>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Relatórios</h1>
                  <p className="text-gray-600 mt-1">Visualize análises e relatórios da base de conhecimento</p>
                </div>
              </div>
              <Link
                href="/reports/new"
                className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-300 gap-2"
              >
                <span>➕</span>
                Novo Relatório
              </Link>
            </div>
          </div>

          {/* Filtros */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Filtros</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Pesquisa */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-400">🔍</span>
                </div>
                <input
                  type="text"
                  placeholder="Buscar relatórios..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                />
              </div>

              {/* Categoria */}
              <select
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              >
                <option value="">Todas as categorias</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>

              {/* Status */}
              <select
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              >
                <option value="">Todos os status</option>
                <option value="DRAFT">Rascunho</option>
                <option value="PUBLISHED">Publicado</option>
                <option value="ARCHIVED">Arquivado</option>
              </select>

              {/* Botão Limpar Filtros */}
              <button
                onClick={() => setFilters({ search: '', category: '', status: '', dateFrom: '', dateTo: '' })}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-lg transition-colors"
              >
                Limpar Filtros
              </button>
            </div>
          </div>

          {/* Lista de Relatórios */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            {reports.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {reports.map((report) => (
                  <div key={report.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0 mt-1">
                            <span className="text-lg">📊</span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="text-lg font-medium text-gray-900 mb-1">
                              {report.title}
                            </h3>
                            <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
                              <span>📂 {report.category}</span>
                              <span>👤 {report.author}</span>
                              <span>📅 {formatDate(report.createdAt)}</span>
                            </div>
                            <p className="text-sm text-gray-600 line-clamp-2">
                              {report.content.substring(0, 150)}...
                            </p>
                            {report.tags.filter(tag =>
                              tag !== 'relatorio-operacional' &&
                              tag !== 'published' &&
                              tag !== 'draft'
                            ).length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {report.tags
                                  .filter(tag =>
                                    tag !== 'relatorio-operacional' &&
                                    tag !== 'published' &&
                                    tag !== 'draft'
                                  )
                                  .map((tag, index) => (
                                    <span
                                      key={index}
                                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                    >
                                      {tag}
                                    </span>
                                  ))
                                }
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          {getStatusBadge(report.status)}
                          <div className="text-xs text-gray-500 mt-1">
                            Atualizado: {formatDate(report.updatedAt)}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => copyReportToClipboard(report)}
                            className="inline-flex items-center px-3 py-1 bg-gray-500 hover:bg-gray-600 text-white text-sm font-medium rounded-md transition-colors"
                          >
                            {copySuccess === report.id ? '✅ Copiado!' : '📋 Copiar'}
                          </button>
                          <Link
                            href={`/reports/${report.id}/edit`}
                            className="inline-flex items-center px-3 py-1 bg-yellow-500 hover:bg-yellow-600 text-white text-sm font-medium rounded-md transition-colors"
                          >
                            ✏️ Editar
                          </Link>
                          <Link
                            href={`/reports/${report.id}`}
                            className="inline-flex items-center px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-md transition-colors"
                          >
                            👁️ Ver
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-6 py-12 text-center">
                <div className="text-6xl mb-4">📊</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhum relatório encontrado
                </h3>
                <p className="text-sm text-gray-500 mb-6">
                  {filters.search || filters.category || filters.status
                    ? 'Ajuste os filtros para encontrar relatórios ou crie um novo.'
                    : 'Comece criando seu primeiro relatório da base de conhecimento.'}
                </p>
                <Link
                  href="/reports/new"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors gap-2"
                >
                  <span>➕</span>
                  Novo Relatório
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}