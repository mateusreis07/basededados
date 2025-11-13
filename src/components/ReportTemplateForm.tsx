'use client'

import { useState, useEffect } from 'react'

interface TeamMember {
  id: string
  name: string
  email: string
  position?: string
  isActive: boolean
}

interface ReportTemplateFormProps {
  onSubmit: (data: any, status?: 'DRAFT' | 'PUBLISHED') => void
  loading: boolean
  initialData?: any
  isEditMode?: boolean
  teamSlug?: string
}

interface TemplateData {
  title: string
  description: string
  fields: {
    name: string
    label: string
    type: 'text' | 'textarea' | 'select' | 'date' | 'number' | 'checkbox'
    required: boolean
    options?: string[]
    placeholder?: string
  }[]
}

const templates: Record<string, TemplateData> = {
  'relatorio-operacional': {
    title: 'Relatório Operacional Diário',
    description: 'Template para relatórios operacionais diários com informações de equipe, métricas e SCCD',
    fields: [
      {
        name: 'operation_name',
        label: 'Nome da Operação',
        type: 'text',
        required: true,
        placeholder: 'Ex. MPPA'
      },
      {
        name: 'date',
        label: 'Data do Relatório',
        type: 'date',
        required: true
      },
      // Informações Operacionais
      {
        name: 'integracoes',
        label: 'Integrações',
        type: 'textarea',
        required: false,
        placeholder: 'Status das integrações...'
      },
      {
        name: 'performance',
        label: 'Performance',
        type: 'textarea',
        required: false,
        placeholder: 'Métricas de performance...'
      },
      {
        name: 'incidentes_impeditivos',
        label: 'Incidentes Impeditivos',
        type: 'textarea',
        required: false,
        placeholder: 'Incidentes que impedem operações...'
      },
      {
        name: 'relacional',
        label: 'Relacional',
        type: 'textarea',
        required: false,
        placeholder: 'Questões relacionais...'
      },
      {
        name: 'repasse',
        label: 'Repasse',
        type: 'textarea',
        required: false,
        placeholder: 'Informações de repasse...'
      },
      // Métricas do Dia
      {
        name: 'chamados',
        label: 'Chamados',
        type: 'number',
        required: false,
        placeholder: '0'
      },
      {
        name: 'atendimentos_presenciais',
        label: 'Atendimentos Presenciais',
        type: 'number',
        required: false,
        placeholder: '0'
      },
      // SCCD
      {
        name: 'quantidade_sccd',
        label: 'Quantidade SCCD',
        type: 'number',
        required: false,
        placeholder: '0'
      },
      {
        name: 'detalhes_sccd',
        label: 'Detalhes SCCD',
        type: 'textarea',
        required: false,
        placeholder: 'Número do chamado - Descrição'
      },
      // Disponibilidade Analistas - Presencial
      {
        name: 'presencial_mateus',
        label: 'Mateus Reis (Analista) - Presencial',
        type: 'checkbox',
        required: false
      },
      {
        name: 'presencial_fabricio',
        label: 'Fabrício (Analista) - Presencial',
        type: 'checkbox',
        required: false
      },
      {
        name: 'presencial_thiago',
        label: 'Thiago (Analista) - Presencial',
        type: 'checkbox',
        required: false
      },
      {
        name: 'presencial_bruna',
        label: 'Bruna (Analista) - Presencial',
        type: 'checkbox',
        required: false
      },
      {
        name: 'presencial_jan',
        label: 'Jan (Analista) - Presencial',
        type: 'checkbox',
        required: false
      },
      {
        name: 'presencial_administrador',
        label: 'Administrador - Presencial',
        type: 'checkbox',
        required: false
      },
      // Disponibilidade Analistas - Home Office
      {
        name: 'homeoffice_mateus',
        label: 'Mateus Reis (Analista) - Home Office',
        type: 'checkbox',
        required: false
      },
      {
        name: 'homeoffice_fabricio',
        label: 'Fabrício (Analista) - Home Office',
        type: 'checkbox',
        required: false
      },
      {
        name: 'homeoffice_thiago',
        label: 'Thiago (Analista) - Home Office',
        type: 'checkbox',
        required: false
      },
      {
        name: 'homeoffice_bruna',
        label: 'Bruna (Analista) - Home Office',
        type: 'checkbox',
        required: false
      },
      {
        name: 'homeoffice_jan',
        label: 'Jan (Analista) - Home Office',
        type: 'checkbox',
        required: false
      },
      {
        name: 'homeoffice_administrador',
        label: 'Administrador - Home Office',
        type: 'checkbox',
        required: false
      },
      // Data da Disponibilidade Analistas
      {
        name: 'disponibilidade_date',
        label: 'Data da Disponibilidade',
        type: 'date',
        required: false
      },
      // Plantão
      {
        name: 'plantao_mateus',
        label: 'Mateus Reis (Analista) - Plantão',
        type: 'checkbox',
        required: false
      },
      {
        name: 'plantao_bruna',
        label: 'Bruna (Analista) - Plantão',
        type: 'checkbox',
        required: false
      },
      {
        name: 'plantao_fabricio',
        label: 'Fabrício (Analista) - Plantão',
        type: 'checkbox',
        required: false
      },
      {
        name: 'plantao_jan',
        label: 'Jan (Analista) - Plantão',
        type: 'checkbox',
        required: false
      },
      {
        name: 'plantao_thiago',
        label: 'Thiago (Analista) - Plantão',
        type: 'checkbox',
        required: false
      },
      {
        name: 'plantao_administrador',
        label: 'Administrador - Plantão',
        type: 'checkbox',
        required: false
      },
      {
        name: 'plantao_date',
        label: 'Data do Plantão',
        type: 'date',
        required: false
      }
    ]
  }
}

export default function ReportTemplateForm({ onSubmit, loading, initialData, isEditMode, teamSlug }: ReportTemplateFormProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('relatorio-operacional')
  const [members, setMembers] = useState<TeamMember[]>([])
  const [loadingMembers, setLoadingMembers] = useState(false)
  const [formData, setFormData] = useState<Record<string, string | boolean>>(() => {
    if (initialData && isEditMode) {
      return initialData
    }
    return {
      operation_name: '', // Leave empty so user must fill it
      date: new Date().toISOString().split('T')[0] // Initialize with today's date in YYYY-MM-DD format
    }
  })

  // Carregar membros do team
  useEffect(() => {
    if (teamSlug) {
      loadTeamMembers()
    }
  }, [teamSlug])

  const loadTeamMembers = async () => {
    if (!teamSlug) return

    setLoadingMembers(true)
    try {
      const response = await fetch(`/api/teams/${teamSlug}/members`)
      if (response.ok) {
        const data = await response.json()
        // Filtrar apenas membros ativos
        const activeMembers = data.filter((member: TeamMember) => member.isActive)
        setMembers(activeMembers)
      } else {
        console.error('Erro ao carregar membros')
      }
    } catch (error) {
      console.error('Erro ao carregar membros:', error)
    } finally {
      setLoadingMembers(false)
    }
  }

  // Gerar template dinâmico baseado nos membros
  const getDynamicTemplate = () => {
    const baseTemplate = templates[selectedTemplate]
    if (!members.length) return baseTemplate

    // Criar campos dinâmicos baseados nos membros reais
    const dynamicFields = [...baseTemplate.fields]

    // Encontrar índice onde começam os campos de disponibilidade
    const plantaoDateIndex = dynamicFields.findIndex(field => field.name === 'plantao_date')

    // Remover campos hardcoded de membros (presencial, home office, plantão)
    const filteredFields = dynamicFields.filter(field =>
      !field.name.startsWith('presencial_') &&
      !field.name.startsWith('homeoffice_') &&
      !field.name.startsWith('plantao_') &&
      field.name !== 'plantao_date'
    )

    // Adicionar campos dinâmicos para cada membro
    members.forEach(member => {
      const memberName = member.name.toLowerCase().replace(/\s+/g, '_')

      // Presencial
      filteredFields.push({
        name: `presencial_${member.id}`,
        label: `${member.name}${member.position ? ` (${member.position})` : ''} - Presencial`,
        type: 'checkbox' as const,
        required: false
      })

      // Home Office
      filteredFields.push({
        name: `homeoffice_${member.id}`,
        label: `${member.name}${member.position ? ` (${member.position})` : ''} - Home Office`,
        type: 'checkbox' as const,
        required: false
      })

      // Plantão
      filteredFields.push({
        name: `plantao_${member.id}`,
        label: `${member.name}${member.position ? ` (${member.position})` : ''} - Plantão`,
        type: 'checkbox' as const,
        required: false
      })
    })

    // Adicionar data do plantão no final
    filteredFields.push({
      name: 'plantao_date',
      label: 'Data do Plantão',
      type: 'date' as const,
      required: false
    })

    return {
      ...baseTemplate,
      fields: filteredFields
    }
  }

  const currentTemplate = getDynamicTemplate()

  const handleInputChange = (name: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const formatDateForDisplay = (dateStr: string | boolean): string => {
    if (dateStr && dateStr !== '') {
      // Convert YYYY-MM-DD format to DD/MM/YYYY for display
      const parts = (dateStr as string).split('-')
      if (parts.length === 3) {
        const [year, month, day] = parts
        return `${day}/${month}/${year}`
      }
    }
    // Fallback to current date in Brazilian format
    return new Date().toLocaleDateString('pt-BR')
  }

  const handleSubmit = (e: React.FormEvent, status: 'DRAFT' | 'PUBLISHED' = 'PUBLISHED') => {
    e.preventDefault()

    // For draft, don't validate required fields
    if (status === 'PUBLISHED') {
      // Validate required fields only for published reports
      const missingFields = currentTemplate.fields
        .filter(field => field.required && !formData[field.name])
        .map(field => field.label)

      if (missingFields.length > 0) {
        alert(`Por favor, preencha os campos obrigatórios: ${missingFields.join(', ')}`)
        return
      }
    }

    // Generate report content based on template
    const reportContent = generateReportContent(currentTemplate, formData)

    let reportTitle = currentTemplate.title
    if (selectedTemplate === 'relatorio-operacional') {
      const reportDate = formatDateForDisplay(formData.date)
      const operationName = formData.operation_name || '[Nome da Operação]'
      reportTitle = `OPERAÇÃO ${operationName} - ${reportDate} 🗓${status === 'DRAFT' ? ' (Rascunho)' : ''}`
    }

    const reportData = {
      title: reportTitle,
      content: reportContent,
      category: 'Operacional',
      status: status,
      template: selectedTemplate,
      templateData: formData
    }

    onSubmit(reportData, status)
  }

  const handleSaveAsDraft = (e: React.FormEvent) => {
    handleSubmit(e, 'DRAFT')
  }

  const generateReportContent = (template: TemplateData, data: Record<string, string | boolean>): string => {
    // Use the exact same date formatting logic as in handleSubmit
    const reportDate = formatDateForDisplay(data.date)
    const operationName = data.operation_name || '[Nome da Operação]'
    let content = `OPERAÇÃO ${operationName} - ${reportDate} 🗓\n \n`

    // Informações Operacionais
    content += `🔹 Integrações: ${data.integracoes || ''}\n`
    content += `🔹 Performance: ${data.performance || ''}\n`
    content += `🔹 Incidentes Impeditivos: ${data.incidentes_impeditivos || ''}\n`
    content += `🔹 Relacional: ${data.relacional || ''}\n`
    content += `🔹 Repasse: ${data.repasse || ''}\n`

    content += `\n`

    // Métricas do Dia
    if (data.chamados) content += `📊 Chamados: ${data.chamados}\n`
    if (data.atendimentos_presenciais) content += `🏃‍♂ Atendimentos Presenciais: ${data.atendimentos_presenciais}\n`

    content += `\n`

    // SCCD
    if (data.quantidade_sccd) {
      content += `📬 SCCD: ${data.quantidade_sccd}\n`
      if (data.detalhes_sccd) {
        content += `\n${data.detalhes_sccd}\n`
      }
      content += `\n`
    }

    // Disponibilidade Analistas - Dinâmica baseada nos membros reais
    const presencial: string[] = []
    const homeoffice: string[] = []

    // Iterar pelos membros e verificar se estão selecionados
    members.forEach(member => {
      if (data[`presencial_${member.id}`]) {
        presencial.push(`* ${member.name}`)
      }
      if (data[`homeoffice_${member.id}`]) {
        homeoffice.push(`* ${member.name}`)
      }
    })

    if (presencial.length > 0 || homeoffice.length > 0) {
      // Use the specific date field for disponibilidade, or fallback to report date + 5 days
      let availabilityDateStr = ''
      if (data.disponibilidade_date && data.disponibilidade_date !== '') {
        availabilityDateStr = formatDateForDisplay(data.disponibilidade_date)
      } else {
        const availabilityDate = data.date ? new Date(data.date as string) : new Date()
        availabilityDate.setDate(availabilityDate.getDate() + 5)
        availabilityDateStr = availabilityDate.toLocaleDateString('pt-BR')
      }

      content += `👨🏽‍💻 Disponibilidade Analistas - ${availabilityDateStr} 👩🏻‍💻\n\n`

      if (presencial.length > 0) {
        content += `🏢 Presencial:\n${presencial.join('\n')}\n\n`
      }

      if (homeoffice.length > 0) {
        content += `🏠 Home:\n${homeoffice.join('\n')}\n\n`
      }
    }

    // Plantão - Dinâmico baseado nos membros reais
    const plantao: string[] = []
    members.forEach(member => {
      if (data[`plantao_${member.id}`]) {
        plantao.push(member.name)
      }
    })

    if (plantao.length > 0) {
      content += `🪴 Plantão 💰\n`
      let plantaoDate = ''
      if (data.plantao_date && data.plantao_date !== '') {
        // Convert YYYY-MM-DD format to DD/MM format for display
        const fullDate = formatDateForDisplay(data.plantao_date)
        plantaoDate = fullDate.substring(0, 5) // Extract DD/MM from DD/MM/YYYY
      } else {
        plantaoDate = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
      }
      content += `* ${plantao.join(' - ')} ${plantaoDate}\n`
    }

    return content
  }

  const renderField = (field: any) => {
    const value = field.type === 'checkbox' ? formData[field.name] || false : (formData[field.name] || '')

    switch (field.type) {
      case 'text':
        return (
          <input
            type="text"
            id={field.name}
            value={value as string}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-sm placeholder-gray-400 bg-white hover:border-gray-400"
            placeholder={field.placeholder}
            required={field.required}
          />
        )

      case 'textarea':
        return (
          <textarea
            id={field.name}
            value={value as string}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            rows={4}
            className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-sm placeholder-gray-400 resize-y min-h-[100px] bg-white hover:border-gray-400"
            placeholder={field.placeholder}
            required={field.required}
          />
        )

      case 'select':
        return (
          <select
            id={field.name}
            value={value as string}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-sm bg-white hover:border-gray-400 cursor-pointer"
            required={field.required}
          >
            <option value="">Selecione uma opção</option>
            {field.options?.map((option: string) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        )

      case 'date':
        return (
          <input
            type="date"
            id={field.name}
            value={value as string}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-sm bg-white hover:border-gray-400 cursor-pointer"
            required={field.required}
          />
        )

      case 'number':
        return (
          <input
            type="number"
            id={field.name}
            value={value as string}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-sm placeholder-gray-400 bg-white hover:border-gray-400"
            placeholder={field.placeholder}
            required={field.required}
          />
        )

      case 'checkbox':
        const getCleanLabel = (label: string) => {
          if (label.includes(' - Presencial')) return label.replace(' - Presencial', '')
          if (label.includes(' - Home Office')) return label.replace(' - Home Office', '')
          if (label.includes(' - Plantão')) return label.replace(' - Plantão', '')
          return label
        }

        return (
          <div className="flex items-center mt-2">
            <input
              type="checkbox"
              id={field.name}
              checked={value as boolean}
              onChange={(e) => handleInputChange(field.name, e.target.checked)}
              className="h-5 w-5 text-blue-600 focus:ring-2 focus:ring-blue-500 border-gray-300 rounded transition-colors duration-200 cursor-pointer"
              required={field.required}
            />
            <label htmlFor={field.name} className="ml-3 text-sm text-gray-700 cursor-pointer select-none">
              {getCleanLabel(field.label)}
            </label>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="space-y-8">
      {/* Template Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100 shadow-sm">
            <h4 className="text-lg font-semibold text-gray-900 mb-3">
              📋 {currentTemplate.title}
            </h4>
            <p className="text-sm text-gray-600 mb-6">{currentTemplate.description}</p>

            <div className="space-y-10">
              {/* Informações Básicas */}
              <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                <h5 className="text-lg font-semibold text-gray-900 mb-6 border-b border-gray-200 pb-3">📝 Informações Básicas</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Nome da Operação */}
                  <div className="md:col-span-2">
                    <label htmlFor="operation_name" className="block text-sm font-semibold text-gray-700 mb-2">
                      Nome da Operação <span className="text-red-500">*</span>
                    </label>
                    {renderField(currentTemplate.fields.find(f => f.name === 'operation_name')!)}
                    <p className="text-xs text-gray-500 mt-2">💡 O nome aparecerá como "OPERAÇÃO [Nome]" no título do relatório</p>
                  </div>

                  {/* Data */}
                  <div>
                    <label htmlFor="date" className="block text-sm font-semibold text-gray-700 mb-2">
                      Data do Relatório <span className="text-red-500">*</span>
                    </label>
                    {renderField(currentTemplate.fields.find(f => f.name === 'date')!)}
                  </div>
                </div>
              </div>

              {/* Informações Operacionais */}
              <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                <h5 className="text-lg font-semibold text-gray-900 mb-6 border-b border-gray-200 pb-3">🔸 Informações Operacionais</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {['integracoes', 'performance', 'incidentes_impeditivos', 'relacional', 'repasse'].map(fieldName => {
                    const field = currentTemplate.fields.find(f => f.name === fieldName)!
                    return (
                      <div key={field.name} className="md:col-span-2">
                        <label htmlFor={field.name} className="block text-sm font-semibold text-gray-700 mb-2">
                          🔹 {field.label}
                        </label>
                        {renderField(field)}
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Métricas do Dia */}
              <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                <h5 className="text-lg font-semibold text-gray-900 mb-6 border-b border-gray-200 pb-3">📊 Métricas do Dia</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {['chamados', 'atendimentos_presenciais'].map(fieldName => {
                    const field = currentTemplate.fields.find(f => f.name === fieldName)!
                    return (
                      <div key={field.name}>
                        <label htmlFor={field.name} className="block text-sm font-semibold text-gray-700 mb-2">
                          {field.name === 'chamados' ? '📊' : '🏃‍♂'} {field.label}
                        </label>
                        {renderField(field)}
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* SCCD */}
              <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                <h5 className="text-lg font-semibold text-gray-900 mb-6 border-b border-gray-200 pb-3">📬 SCCD</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {['quantidade_sccd', 'detalhes_sccd'].map(fieldName => {
                    const field = currentTemplate.fields.find(f => f.name === fieldName)!
                    return (
                      <div key={field.name} className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
                        <label htmlFor={field.name} className="block text-sm font-semibold text-gray-700 mb-2">
                          📬 {field.label}
                        </label>
                        {renderField(field)}
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Disponibilidade Analistas */}
              <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                <h5 className="text-lg font-semibold text-gray-900 mb-6 border-b border-gray-200 pb-3">👨🏽‍💻 Disponibilidade Analistas 👩🏻‍💻</h5>

                {/* Data da Disponibilidade */}
                <div className="mb-6">
                  <label htmlFor="disponibilidade_date" className="block text-sm font-semibold text-gray-700 mb-2">
                    📅 Data da Disponibilidade
                  </label>
                  <div className="w-60">
                    {renderField(currentTemplate.fields.find(f => f.name === 'disponibilidade_date')!)}
                  </div>
                </div>

                {/* Presencial */}
                <div className="mb-6 bg-gradient-to-r from-blue-50 to-blue-100 p-5 rounded-lg border border-blue-200">
                  <h6 className="font-semibold text-gray-900 mb-4">🏢 Presencial</h6>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {loadingMembers ? (
                      <div className="col-span-full text-center py-4 text-gray-500">
                        Carregando membros...
                      </div>
                    ) : members.length === 0 ? (
                      <div className="col-span-full text-center py-4 text-gray-500">
                        Nenhum membro ativo encontrado. Adicione membros na administração do team.
                      </div>
                    ) : (
                      members.map(member => {
                        const fieldName = `presencial_${member.id}`
                        const field = currentTemplate.fields.find(f => f.name === fieldName)
                        if (!field) return null
                        return (
                          <div key={fieldName} className="bg-white p-3 rounded-lg">
                            {renderField(field)}
                          </div>
                        )
                      })
                    )}
                  </div>
                </div>

                {/* Home Office */}
                <div className="mb-6 bg-gradient-to-r from-green-50 to-green-100 p-5 rounded-lg border border-green-200">
                  <h6 className="font-semibold text-gray-900 mb-4">🏠 Home Office</h6>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {loadingMembers ? (
                      <div className="col-span-full text-center py-4 text-gray-500">
                        Carregando membros...
                      </div>
                    ) : members.length === 0 ? (
                      <div className="col-span-full text-center py-4 text-gray-500">
                        Nenhum membro ativo encontrado. Adicione membros na administração do team.
                      </div>
                    ) : (
                      members.map(member => {
                        const fieldName = `homeoffice_${member.id}`
                        const field = currentTemplate.fields.find(f => f.name === fieldName)
                        if (!field) return null
                        return (
                          <div key={fieldName} className="bg-white p-3 rounded-lg">
                            {renderField(field)}
                          </div>
                        )
                      })
                    )}
                  </div>
                </div>
              </div>

              {/* Plantão */}
              <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                <h5 className="text-lg font-semibold text-gray-900 mb-6 border-b border-gray-200 pb-3">🪴 Plantão</h5>
                <div className="bg-gradient-to-r from-orange-50 to-yellow-50 p-5 rounded-lg border border-orange-200">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                    {loadingMembers ? (
                      <div className="col-span-full text-center py-4 text-gray-500">
                        Carregando membros...
                      </div>
                    ) : members.length === 0 ? (
                      <div className="col-span-full text-center py-4 text-gray-500">
                        Nenhum membro ativo encontrado. Adicione membros na administração do team.
                      </div>
                    ) : (
                      members.map(member => {
                        const fieldName = `plantao_${member.id}`
                        const field = currentTemplate.fields.find(f => f.name === fieldName)
                        if (!field) return null
                        return (
                          <div key={fieldName} className="bg-white p-3 rounded-lg">
                            {renderField(field)}
                          </div>
                        )
                      })
                    )}
                  </div>
                  <div className="mt-4">
                    <label htmlFor="plantao_date" className="block text-sm font-semibold text-gray-700 mb-2">
                      📅 Data do Plantão
                    </label>
                    <div className="w-60">
                      {renderField(currentTemplate.fields.find(f => f.name === 'plantao_date')!)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-6 shadow-sm">
            <h4 className="text-lg font-semibold text-gray-900 mb-4 border-b border-purple-200 pb-3">📄 Preview do Relatório</h4>
            <div className="bg-white rounded-lg p-4 max-h-80 overflow-y-auto border border-gray-200 shadow-inner">
              <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono leading-relaxed">
                {generateReportContent(currentTemplate, formData)}
              </pre>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleSaveAsDraft}
              disabled={loading}
              className="px-8 py-3 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-md"
            >
              {loading ? 'Salvando...' : '📄 Salvar como Rascunho'}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-md"
            >
              {loading ? 'Publicando...' : '📊 Publicar Relatório'}
            </button>
          </div>
        </form>
    </div>
  )
}
