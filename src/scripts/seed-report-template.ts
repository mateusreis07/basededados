// Script para criar template de relatório baseado no modelo WhatsApp
// TEMPORARIAMENTE DESABILITADO - reportTemplate não existe no schema

async function seedReportTemplate() {
  console.log('🌱 Criando template de relatório... (DESABILITADO)')
  console.log('❌ Template de relatório desabilitado - modelo não existe no schema')
  return

  /*
  try {
    // Importação dinâmica do Prisma
    const { PrismaClient } = await import('@prisma/client')
    const prisma = new PrismaClient()
    try {
      // Template baseado no modelo WhatsApp fornecido
      const templateStructure = {
        title: "OPERAÇÃO MPPA - {{date}}",
        sections: [
          {
            type: "header",
            content: "OPERAÇÃO MPPA - {{date}} 🗓"
          },
          {
            type: "fields",
            title: "Informações Operacionais",
            fields: [
              {
                name: "Integrações",
                key: "integracoes",
                type: "textarea",
                icon: "🔹",
                placeholder: "Status das integrações..."
              },
              {
                name: "Performance",
                key: "performance",
                type: "textarea",
                icon: "🔹",
                placeholder: "Métricas de performance..."
              },
              {
                name: "Incidentes Impeditivos",
                key: "incidentes",
                type: "textarea",
                icon: "🔹",
                placeholder: "Incidentes que impedem operações..."
              },
              {
                name: "Relacional",
                key: "relacional",
                type: "textarea",
                icon: "🔹",
                placeholder: "Questões relacionais..."
              },
              {
                name: "Repasse",
                key: "repasse",
                type: "textarea",
                icon: "🔹",
                placeholder: "Informações de repasse..."
              }
            ]
          },
          {
            type: "metrics",
            title: "Métricas do Dia",
            fields: [
              {
                name: "Chamados",
                key: "chamados",
                type: "number",
                icon: "📊",
                placeholder: "0"
              },
              {
                name: "Atendimentos Presenciais",
                key: "atendimentos_presenciais",
                type: "number",
                icon: "🏃‍♂️",
                placeholder: "0"
              }
            ]
          },
          {
            type: "incidents",
            title: "SCCD",
            fields: [
              {
                name: "Quantidade SCCD",
                key: "sccd_count",
                type: "number",
                icon: "📬",
                placeholder: "0"
              },
              {
                name: "Detalhes SCCD",
                key: "sccd_details",
                type: "textarea",
                icon: "📬",
                placeholder: "Número do chamado - Descrição"
              }
            ]
          },
          {
            type: "availability",
            title: "Disponibilidade Analistas - {{tomorrow}} 👨🏽‍💻👩🏻‍💻",
            fields: [
              {
                name: "Disponibilidade da Equipe",
                key: "availability",
                type: "analyst_selector",
                icon: "👥",
                placeholder: "Selecione os analistas e sua disponibilidade"
              }
            ]
          }
        ],
        outputFormat: {
          whatsapp: true,
          useEmojis: true,
          showDate: true
        }
      }

      // Verificar se já existe um template com este nome
      const existingTemplate = await prisma.reportTemplate.findFirst({
        where: { name: "Operação MPPA" }
      })

      if (existingTemplate) {
        console.log('⚠️  Template já existe, atualizando...')
        await prisma.reportTemplate.update({
          where: { id: existingTemplate.id },
          data: {
            structure: JSON.stringify(templateStructure),
            updatedAt: new Date()
          }
        })
        console.log('✅ Template atualizado com sucesso!')
      } else {
        const template = await prisma.reportTemplate.create({
          data: {
            name: "Operação MPPA",
            description: "Template baseado no modelo de relatório enviado via WhatsApp para gestores",
            structure: JSON.stringify(templateStructure),
            isDefault: true
          }
        })

        console.log(`✅ Template criado com ID: ${template.id}`)
      }

      // Criar mais alguns templates exemplo
      const templates = [
        {
          name: "Relatório Semanal",
          description: "Template para relatórios semanais de equipe",
          structure: {
            title: "Relatório Semanal - {{date}}",
            sections: [
              {
                type: "fields",
                title: "Resumo da Semana",
                fields: [
                  { name: "Principais Conquistas", key: "conquistas", type: "textarea", icon: "🎯" },
                  { name: "Desafios Enfrentados", key: "desafios", type: "textarea", icon: "⚡" },
                  { name: "Próximos Passos", key: "proximos_passos", type: "textarea", icon: "📋" }
                ]
              },
              {
                type: "metrics",
                title: "Indicadores",
                fields: [
                  { name: "Meta Alcançada (%)", key: "meta", type: "number", icon: "📈" },
                  { name: "Tarefas Concluídas", key: "tarefas", type: "number", icon: "✅" }
                ]
              }
            ]
          }
        },
        {
          name: "Relatório de Incidente",
          description: "Template para relatórios de incidentes críticos",
          structure: {
            title: "Relatório de Incidente - {{date}}",
            sections: [
              {
                type: "fields",
                title: "Detalhes do Incidente",
                fields: [
                  { name: "Descrição", key: "descricao", type: "textarea", icon: "🚨" },
                  { name: "Causa Raiz", key: "causa_raiz", type: "textarea", icon: "🔍" },
                  { name: "Ações Tomadas", key: "acoes", type: "textarea", icon: "🛠️" },
                  { name: "Prevenção", key: "prevencao", type: "textarea", icon: "🛡️" }
                ]
              },
              {
                type: "metrics",
                title: "Impacto",
                fields: [
                  { name: "Duração (min)", key: "duracao", type: "number", icon: "⏱️" },
                  { name: "Usuários Afetados", key: "usuarios", type: "number", icon: "👥" }
                ]
              }
            ]
          }
        }
      ]

      for (const templateData of templates) {
        const existing = await prisma.reportTemplate.findFirst({
          where: { name: templateData.name }
        })

        if (!existing) {
          await prisma.reportTemplate.create({
            data: {
              name: templateData.name,
              description: templateData.description,
              structure: JSON.stringify(templateData.structure)
            }
          })
          console.log(`✅ Template "${templateData.name}" criado`)
        }
      }

      console.log('\n🎉 Templates criados com sucesso!')

    } finally {
      await prisma.$disconnect()
    }

  } catch (error) {
    console.error('❌ Erro ao criar templates:', error)
  }
  */
}

seedReportTemplate()