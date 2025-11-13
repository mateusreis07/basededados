'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useTeam } from '../../../../../contexts/TeamContext'
import Sidebar from '../../../../../components/Sidebar'
import ReportTemplateForm from '../../../../../components/ReportTemplateForm'

export default function TeamNewReport() {
  const router = useRouter()
  const params = useParams()
  const teamSlug = params.slug as string
  const { currentTeam } = useTeam()
  const [loading, setLoading] = useState(false)
  const [useTemplate, setUseTemplate] = useState(true)

  const handleTemplateSubmit = async (data: any, status: 'DRAFT' | 'PUBLISHED' = 'PUBLISHED') => {
    setLoading(true)

    try {
      console.log('Criando relatório com template para team:', teamSlug, data, 'Status:', status)

      // Criar um novo relatório via API do team
      const reportData = {
        title: data.title,
        content: data.content,
        status: status,
        category: data.category || 'Operacional',
        tags: data.tags || [],
        author: 'Sistema',
        template: data.template,
        templateData: data.templateData || {}
      }

      const response = await fetch(`/api/teams/${teamSlug}/reports`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reportData),
      })

      if (!response.ok) {
        throw new Error('Erro ao criar relatório')
      }

      const result = await response.json()

      // Mostrar mensagem de sucesso baseada no status
      if (status === 'DRAFT') {
        alert('Relatório salvo como rascunho com sucesso!')
      } else {
        alert('Relatório publicado com sucesso!')
      }

      router.push(`/team/${teamSlug}/reports`)
    } catch (error) {
      console.error('Erro ao criar relatório:', error)
      alert('Erro interno do servidor')
    } finally {
      setLoading(false)
    }
  }

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.target as HTMLFormElement)
    const data = {
      title: formData.get('title') as string,
      content: formData.get('content') as string,
      category: formData.get('category') as string,
      date: formData.get('date') as string
    }

    try {
      console.log('Criando relatório manual para team:', teamSlug, data)

      // Criar um novo relatório via API do team
      const reportData = {
        title: data.title,
        content: data.content,
        status: 'PUBLISHED' as const,
        category: data.category,
        tags: ['manual'],
        author: 'Sistema'
      }

      const response = await fetch(`/api/teams/${teamSlug}/reports`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reportData),
      })

      if (!response.ok) {
        throw new Error('Erro ao criar relatório')
      }

      const result = await response.json()
      alert('Relatório criado com sucesso!')
      router.push(`/team/${teamSlug}/reports`)
    } catch (error) {
      console.error('Erro ao criar relatório:', error)
      alert('Erro interno do servidor')
    } finally {
      setLoading(false)
    }
  }

  const getCurrentDate = () => {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="ml-64 flex-1 p-8">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <a
              href={`/team/${teamSlug}/reports`}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              ← Voltar para Relatórios do Team
            </a>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            Novo Relatório - {currentTeam?.name || teamSlug}
          </h1>
          <p className="mt-1 text-gray-600">
            Crie um novo relatório para o team {currentTeam?.name || teamSlug} usando templates ou de forma manual
          </p>
          <div className="mt-2 text-sm text-blue-600 font-medium">
            Team: {teamSlug}
          </div>
        </div>

        <div className="mb-6">
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={() => setUseTemplate(true)}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                useTemplate
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              📋 Usar Template
            </button>
            <button
              type="button"
              onClick={() => setUseTemplate(false)}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                !useTemplate
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              ✏️ Criar Manual
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {useTemplate ? (
            <ReportTemplateForm
              onSubmit={handleTemplateSubmit}
              loading={loading}
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
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Ex: Relatório Diário - Suporte TI"
                    defaultValue=""
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
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    defaultValue=""
                  >
                    <option value="">Selecione uma categoria</option>
                    <option value="Performance">Performance</option>
                    <option value="Uso">Uso</option>
                    <option value="Análise">Análise</option>
                    <option value="Segurança">Segurança</option>
                    <option value="Manutenção">Manutenção</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                    Data do Relatório *
                  </label>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    required
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    defaultValue={getCurrentDate()}
                  />
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
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Descreva o relatório diário da equipe. Inclua métricas, atividades realizadas, problemas encontrados, etc."
                  defaultValue=""
                />
                <p className="mt-2 text-sm text-gray-500">
                  💡 Dica: A IA irá analisar automaticamente este conteúdo e extrair KPIs, gerar resumos e identificar alertas.
                </p>
              </div>

              <div className="flex items-center justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Criando...' : 'Criar Relatório'}
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  )
}