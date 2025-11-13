'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Sidebar from '../../../../../components/Sidebar'

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

export default function ViewReport() {
  const params = useParams()
  const teamSlug = params.slug as string
  const reportId = params.id as string

  const [report, setReport] = useState<Report | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (teamSlug && reportId) {
      fetchReport()
    }
  }, [teamSlug, reportId])

  const fetchReport = async () => {
    try {
      const response = await fetch(`/api/teams/${teamSlug}/reports/${reportId}`)
      if (response.ok) {
        const data = await response.json()
        setReport(data)
      } else {
        console.error('Erro ao carregar relatório')
      }
    } catch (error) {
      console.error('Erro ao carregar relatório:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <main className="ml-64 flex-1 p-8">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-8"></div>
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (!report) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <main className="ml-64 flex-1 p-8">
          <div className="max-w-4xl mx-auto text-center py-8">
            <div className="text-4xl mb-4">❌</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Relatório não encontrado</h1>
            <p className="text-gray-600 mb-4">O relatório solicitado não existe ou não está acessível.</p>
            <a
              href={`/team/${teamSlug}/reports`}
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
            >
              ← Voltar para Relatórios
            </a>
          </div>
        </main>
      </div>
    )
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">Rascunho</span>
      case 'PUBLISHED':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">Publicado</span>
      case 'ARCHIVED':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">Arquivado</span>
      default:
        return null
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="ml-64 flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <a
                href={`/team/${teamSlug}/reports`}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                ← Voltar para Relatórios
              </a>
            </div>

            <div className="flex items-center justify-between mb-4">
              <h1 className="text-3xl font-bold text-gray-900">
                {report.title}
              </h1>
              <div className="flex items-center gap-3">
                {getStatusBadge(report.status)}
                <a
                  href={`/team/${teamSlug}/reports/${reportId}/edit`}
                  className="inline-flex items-center px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white font-medium rounded-lg transition-colors"
                >
                  ✏️ Editar
                </a>
              </div>
            </div>

            <div className="flex items-center gap-6 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <span className="font-medium">Categoria:</span>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-xs">
                  {report.category}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span className="font-medium">Autor:</span>
                <span>{report.author}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="font-medium">Criado:</span>
                <span>{new Date(report.createdAt).toLocaleDateString('pt-BR')}</span>
              </div>
              {report.updatedAt !== report.createdAt && (
                <div className="flex items-center gap-1">
                  <span className="font-medium">Atualizado:</span>
                  <span>{new Date(report.updatedAt).toLocaleDateString('pt-BR')}</span>
                </div>
              )}
            </div>

            {report.tags.length > 0 && (
              <div className="mt-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500 font-medium">Tags:</span>
                  <div className="flex gap-1">
                    {report.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-8">
              <div className="prose prose-gray max-w-none">
                <pre className="whitespace-pre-wrap font-sans text-gray-700 leading-relaxed">
                  {report.content}
                </pre>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="mt-6 flex items-center justify-between">
            <a
              href={`/team/${teamSlug}/reports`}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              ← Voltar para Lista
            </a>

            <div className="flex items-center gap-3">
              <button
                onClick={() => window.print()}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                🖨️ Imprimir
              </button>
              <a
                href={`/team/${teamSlug}/reports/${reportId}/edit`}
                className="inline-flex items-center px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white font-medium rounded-md transition-colors"
              >
                ✏️ Editar Relatório
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}