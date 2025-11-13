'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Sidebar from '../../../../components/Sidebar'
import ReportTemplateForm from '../../../../components/ReportTemplateForm'

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
  templateData?: any
}

export default function EditReport() {
  const params = useParams()
  const router = useRouter()
  const [report, setReport] = useState<Report | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      fetchReport(params.id as string)
    }
  }, [params.id])

  const fetchReport = async (id: string) => {
    try {
      const response = await fetch(`/api/reports/${id}`)

      if (!response.ok) {
        throw new Error('Erro ao carregar relatório')
      }

      const reportData = await response.json()
      setReport(reportData)
    } catch (error) {
      console.error('Erro ao carregar relatório:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleTemplateSubmit = async (data: any, status: 'DRAFT' | 'PUBLISHED' = 'PUBLISHED') => {
    if (!report) return

    setLoading(true)

    try {
      console.log('Atualizando relatório:', data, 'Status:', status)

      // Atualizar o relatório via API
      const updateData = {
        title: data.title,
        content: data.content,
        status: status,
        category: data.category || 'Operacional',
        tags: data.tags || [],
        template: data.template,
        templateData: data.templateData || {}
      }

      const response = await fetch(`/api/reports/${report.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      })

      if (!response.ok) {
        throw new Error('Erro ao atualizar relatório')
      }

      const updatedReport = await response.json()

      // Mostrar mensagem de sucesso baseada no status
      if (status === 'DRAFT') {
        alert('Relatório salvo como rascunho com sucesso!')
      } else {
        alert('Relatório publicado com sucesso!')
      }

      router.push('/reports')
    } catch (error) {
      console.error('Erro ao atualizar relatório:', error)
      alert('Erro interno do servidor')
    } finally {
      setLoading(false)
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

  if (!report) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <main className="ml-64 flex-1 p-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Relatório não encontrado</h1>
            <p className="text-gray-600 mb-6">O relatório que você está procurando não existe.</p>
            <Link
              href="/reports"
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors gap-2"
            >
              ← Voltar para Relatórios
            </Link>
          </div>
        </main>
      </div>
    )
  }


  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="ml-64 flex-1 p-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Link
              href="/reports"
              className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium transition-colors gap-2"
            >
              ← Voltar para Relatórios
            </Link>
            <div className="flex items-center gap-3">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                report.status === 'DRAFT'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {report.status === 'DRAFT' ? 'Editando Rascunho' : 'Editando Relatório Publicado'}
              </span>
            </div>
          </div>

          <h1 className="text-2xl font-bold text-gray-900">
            Editar Relatório
          </h1>
          <p className="mt-1 text-gray-600">
            Edite o relatório "{report.title}" e publique quando estiver pronto
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <ReportTemplateForm
            onSubmit={handleTemplateSubmit}
            loading={loading}
            initialData={report.templateData}
            isEditMode={true}
          />
        </div>
      </main>
    </div>
  )
}