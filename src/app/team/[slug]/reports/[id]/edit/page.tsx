'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Sidebar from '../../../../../../components/Sidebar'
import ReportTemplateForm from '../../../../../../components/ReportTemplateForm'

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
  template?: string
  templateData?: any
}

export default function EditReport() {
  const params = useParams()
  const router = useRouter()
  const teamSlug = params.slug as string
  const reportId = params.id as string

  const [report, setReport] = useState<Report | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

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

  const handleTemplateSubmit = async (data: any, status: 'DRAFT' | 'PUBLISHED' = 'PUBLISHED') => {
    setSaving(true)

    try {
      console.log('Atualizando relatório com template para team:', teamSlug, data, 'Status:', status)

      // Atualizar relatório via API do team
      const reportData = {
        title: data.title,
        content: data.content,
        status: status,
        category: data.category || 'Operacional',
        tags: data.tags || [],
        author: report?.author || 'Sistema',
        template: data.template,
        templateData: data.templateData || {}
      }

      const response = await fetch(`/api/teams/${teamSlug}/reports/${reportId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reportData),
      })

      if (!response.ok) {
        throw new Error('Erro ao atualizar relatório')
      }

      const result = await response.json()

      // Mostrar mensagem de sucesso baseada no status
      if (status === 'DRAFT') {
        alert('Relatório salvo como rascunho com sucesso!')
      } else {
        alert('Relatório atualizado com sucesso!')
      }

      router.push(`/team/${teamSlug}/reports/${reportId}`)
    } catch (error) {
      console.error('Erro ao atualizar relatório:', error)
      alert('Erro interno do servidor')
    } finally {
      setSaving(false)
    }
  }

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    const formData = new FormData(e.target as HTMLFormElement)
    const data = {
      title: formData.get('title') as string,
      content: formData.get('content') as string,
      category: formData.get('category') as string,
      status: formData.get('status') as string || 'PUBLISHED'
    }

    try {
      console.log('Atualizando relatório manual para team:', teamSlug, data)

      const reportData = {
        title: data.title,
        content: data.content,
        status: data.status as 'DRAFT' | 'PUBLISHED',
        category: data.category,
        tags: ['manual'],
        author: report?.author || 'Sistema'
      }

      const response = await fetch(`/api/teams/${teamSlug}/reports/${reportId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reportData),
      })

      if (!response.ok) {
        throw new Error('Erro ao atualizar relatório')
      }

      const result = await response.json()
      alert('Relatório atualizado com sucesso!')
      router.push(`/team/${teamSlug}/reports/${reportId}`)
    } catch (error) {
      console.error('Erro ao atualizar relatório:', error)
      alert('Erro interno do servidor')
    } finally {
      setSaving(false)
    }
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
              <div className="bg-gray-200 rounded-lg h-96"></div>
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
          <div className="max-w-6xl mx-auto text-center py-8">
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

  // Determinar se é um relatório criado com template
  const isTemplateReport = report.template && report.templateData

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="ml-64 flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <a
                href={`/team/${teamSlug}/reports/${reportId}`}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                ← Voltar para Relatório
              </a>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Editar Relatório: {report.title}
            </h1>
            <p className="text-gray-600">
              Edite o relatório do team {teamSlug}
            </p>
            <div className="mt-2 text-sm text-blue-600 font-medium">
              Team: {teamSlug} | Tipo: {isTemplateReport ? 'Template' : 'Manual'}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            {isTemplateReport ? (
              <ReportTemplateForm
                onSubmit={handleTemplateSubmit}
                loading={saving}
                initialData={report.templateData}
                isEditMode={true}
                teamSlug={teamSlug}
              />
            ) : (
              <form onSubmit={handleManualSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                      Título do Relatório *
                    </label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      required
                      defaultValue={report.title}
                      className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-sm placeholder-gray-400 bg-white hover:border-gray-400"
                      placeholder="Ex: Relatório Diário - Suporte TI"
                    />
                  </div>

                  <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                      Categoria *
                    </label>
                    <select
                      id="category"
                      name="category"
                      required
                      defaultValue={report.category}
                      className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-sm bg-white hover:border-gray-400 cursor-pointer"
                    >
                      <option value="">Selecione uma categoria</option>
                      <option value="Operacional">Operacional</option>
                      <option value="Performance">Performance</option>
                      <option value="Uso">Uso</option>
                      <option value="Análise">Análise</option>
                      <option value="Segurança">Segurança</option>
                      <option value="Manutenção">Manutenção</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                      Status *
                    </label>
                    <select
                      id="status"
                      name="status"
                      required
                      defaultValue={report.status}
                      className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-sm bg-white hover:border-gray-400 cursor-pointer"
                    >
                      <option value="DRAFT">Rascunho</option>
                      <option value="PUBLISHED">Publicado</option>
                      <option value="ARCHIVED">Arquivado</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                    Conteúdo do Relatório *
                  </label>
                  <textarea
                    id="content"
                    name="content"
                    required
                    rows={12}
                    defaultValue={report.content}
                    className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-sm placeholder-gray-400 resize-y min-h-[100px] bg-white hover:border-gray-400"
                    placeholder="Descreva o relatório diário da equipe. Inclua métricas, atividades realizadas, problemas encontrados, etc."
                  />
                  <p className="mt-2 text-sm text-gray-500">
                    💡 Dica: A IA irá analisar automaticamente este conteúdo e extrair KPIs, gerar resumos e identificar alertas.
                  </p>
                </div>

                <div className="flex items-center justify-end space-x-4">
                  <a
                    href={`/team/${teamSlug}/reports/${reportId}`}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cancelar
                  </a>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? 'Atualizando...' : 'Atualizar Relatório'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}