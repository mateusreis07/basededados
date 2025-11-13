'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Sidebar from '../../../components/Sidebar'

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

export default function ReportDetail() {
  const params = useParams()
  const router = useRouter()
  const [report, setReport] = useState<Report | null>(null)
  const [loading, setLoading] = useState(true)
  const [copySuccess, setCopySuccess] = useState(false)

  useEffect(() => {
    if (params.id) {
      fetchReport(params.id as string)
    }
  }, [params.id])

  const fetchReport = async (id: string) => {
    try {
      // Carregar relatórios do localStorage
      const savedReports = JSON.parse(localStorage.getItem('reports') || '[]')

      // Procurar o relatório específico
      let foundReport = savedReports.find((report: Report) => report.id === id)

      // Se não encontrou nos salvos, usar dados mock para relatórios de demonstração
      if (!foundReport) {
        // Dados de demonstração padrão para IDs específicos
        if (['1', '2', '3'].includes(id)) {
          foundReport = {
            id: id,
            title: id === '1'
              ? 'Relatório de Performance do Sistema'
              : id === '2'
              ? 'Relatório de Uso da Base de Conhecimento'
              : 'Relatório de Itens Mais Acessados',
            content: `# ${id === '1'
              ? 'Análise de Performance do Sistema'
              : id === '2'
              ? 'Estatísticas de Uso da Base de Conhecimento'
              : 'Análise dos Itens Mais Acessados'}

## Resumo Executivo
Este relatório apresenta uma análise detalhada dos dados coletados durante o período analisado.

## Dados Principais
- **Total de acessos**: 1.234 visualizações
- **Usuários únicos**: 567 usuários
- **Tempo médio de sessão**: 5 minutos e 30 segundos
- **Taxa de bounce**: 15%

## Análise Detalhada

### Seções Mais Acessadas
1. Scripts SQL - 45% dos acessos
2. Informações Gerais - 30% dos acessos
3. Erros e Soluções - 25% dos acessos

### Itens Mais Visualizados
- Query de performance de processos
- Consulta de intimações vencidas
- Scripts de monitoramento diário

## Conclusões
O sistema está funcionando dentro dos parâmetros esperados, com boa adesão dos usuários e performance satisfatória.

## Recomendações
1. Expandir a seção de Scripts SQL
2. Criar mais conteúdo na seção de Erros
3. Implementar sistema de favoritos`,
            status: id === '2' ? 'DRAFT' : 'PUBLISHED',
            category: id === '1' ? 'Performance' : id === '2' ? 'Uso' : 'Análise',
            tags: id === '1'
              ? ['performance', 'sistema', 'análise']
              : id === '2'
              ? ['uso', 'estatísticas', 'acesso']
              : ['análise', 'itens', 'visualizações'],
            createdAt: '2024-11-0' + id + 'T10:00:00Z',
            updatedAt: '2024-11-0' + id + 'T10:00:00Z',
            author: 'Sistema'
          }
        }
      }

      setReport(foundReport)
    } catch (error) {
      console.error('Erro ao carregar relatório:', error)
    } finally {
      setLoading(false)
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
    return new Date(dateString).toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const copyReportToClipboard = async () => {
    if (!report) return

    try {
      await navigator.clipboard.writeText(report.content)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    } catch (error) {
      console.error('Erro ao copiar texto:', error)
      // Fallback para navegadores que não suportam clipboard API
      const textArea = document.createElement('textarea')
      textArea.value = report.content
      document.body.appendChild(textArea)
      textArea.select()
      try {
        document.execCommand('copy')
        setCopySuccess(true)
        setTimeout(() => setCopySuccess(false), 2000)
      } catch (err) {
        console.error('Fallback copy failed:', err)
      }
      document.body.removeChild(textArea)
    }
  }

  const formatContent = (content: string) => {
    return content.split('\n').map((line, index) => {
      // Handle markdown headers
      if (line.startsWith('# ')) {
        return <h1 key={index} className="text-2xl font-bold text-gray-900 mb-4 mt-6">{line.substring(2)}</h1>
      } else if (line.startsWith('## ')) {
        return <h2 key={index} className="text-xl font-semibold text-gray-900 mb-3 mt-5">{line.substring(3)}</h2>
      } else if (line.startsWith('### ')) {
        return <h3 key={index} className="text-lg font-medium text-gray-900 mb-2 mt-4">{line.substring(4)}</h3>
      }
      // Handle markdown lists
      else if (line.startsWith('- ')) {
        return <li key={index} className="text-gray-700 ml-4 mb-1">{line.substring(2)}</li>
      } else if (line.match(/^\d+\. /)) {
        return <li key={index} className="text-gray-700 ml-4 mb-1">{line}</li>
      }
      // Handle bold text
      else if (line.includes('**')) {
        const formattedLine = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        return <p key={index} className="text-gray-700 mb-2" dangerouslySetInnerHTML={{ __html: formattedLine }}></p>
      }
      // Handle operational report format with emojis
      else if (line.match(/^[🔸🔹📊🏃‍♂📬👨🏽‍💻👩🏻‍💻🏢🏠🪴💰]/)) {
        return <p key={index} className="text-gray-700 mb-2 font-medium">{line}</p>
      }
      // Handle lines starting with * (analyst names)
      else if (line.startsWith('* ')) {
        return <p key={index} className="text-gray-600 ml-4 mb-1">{line}</p>
      }
      // Handle regular text
      else if (line.trim()) {
        return <p key={index} className="text-gray-700 mb-2">{line}</p>
      }
      // Handle empty lines
      else {
        return <br key={index} />
      }
    })
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
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <Link
                href="/reports"
                className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium transition-colors gap-2"
              >
                ← Voltar para Relatórios
              </Link>

              <div className="flex items-center gap-3">
                {getStatusBadge(report.status)}
                <button
                  onClick={copyReportToClipboard}
                  className="inline-flex items-center px-3 py-1 bg-gray-500 hover:bg-gray-600 text-white text-sm font-medium rounded-md transition-colors gap-1"
                >
                  {copySuccess ? '✅ Copiado!' : '📋 Copiar'}
                </button>
                <Link
                  href={`/reports/${report.id}/edit`}
                  className="inline-flex items-center px-3 py-1 bg-yellow-500 hover:bg-yellow-600 text-white text-sm font-medium rounded-md transition-colors gap-1"
                >
                  ✏️ Editar
                </Link>
              </div>
            </div>

            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">📊</span>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{report.title}</h1>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                  <span>📂 {report.category}</span>
                  <span>👤 {report.author}</span>
                  <span>📅 Criado em {formatDate(report.createdAt)}</span>
                  {report.updatedAt !== report.createdAt && (
                    <span>🔄 Atualizado em {formatDate(report.updatedAt)}</span>
                  )}
                </div>
              </div>
            </div>

            {report.tags.filter(tag =>
              tag !== 'relatorio-operacional' &&
              tag !== 'published' &&
              tag !== 'draft'
            ).length > 0 && (
              <div className="flex flex-wrap gap-2">
                {report.tags
                  .filter(tag =>
                    tag !== 'relatorio-operacional' &&
                    tag !== 'published' &&
                    tag !== 'draft'
                  )
                  .map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                    >
                      {tag}
                    </span>
                  ))
                }
              </div>
            )}
          </div>

          {/* Content */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="prose prose-lg max-w-none">
              {formatContent(report.content)}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="mt-8 flex justify-between items-center">
            <Link
              href="/reports"
              className="inline-flex items-center px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-lg transition-colors gap-2"
            >
              ← Voltar
            </Link>

            <div className="flex gap-3">
              <button className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors gap-2">
                📤 Exportar PDF
              </button>
              <button className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors gap-2">
                📧 Compartilhar
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}