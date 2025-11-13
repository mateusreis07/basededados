import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function setupDefaultSections(teamId: string) {
  try {
    console.log('🏗️ Criando seções padrão para o team...')

    const defaultSections = [
      {
        name: 'Relatórios',
        description: 'Relatórios e análises do sistema',
        type: 'MENU' as const,
        order: 1
      },
      {
        name: 'Informações Gerais',
        description: 'Informações importantes e documentação geral',
        type: 'MENU' as const,
        order: 2
      },
      {
        name: 'Scripts PostgreSQL',
        description: 'Scripts SQL úteis',
        type: 'MENU' as const,
        order: 3
      },
      {
        name: 'Erros',
        description: 'Troubleshooting e soluções',
        type: 'MENU' as const,
        order: 4
      }
    ]

    // Criar seções padrão
    for (const section of defaultSections) {
      await prisma.section.create({
        data: {
          ...section,
          teamId
        }
      })
    }

    // Criar tipos de seção padrão
    const defaultSectionTypes = [
      {
        name: 'Menu Principal',
        description: 'Itens do menu principal',
        icon: '📋',
        color: '#3B82F6',
        order: 1,
        active: true,
        sectionFilter: 'MENU' as const
      },
      {
        name: 'Seções Fixas',
        description: 'Seções fixas do sistema',
        icon: '📌',
        color: '#10B981',
        order: 2,
        active: true,
        sectionFilter: 'FIXED' as const
      },
      {
        name: 'Personalizada',
        description: 'Seções personalizadas',
        icon: '📁',
        color: '#8B5CF6',
        order: 3,
        active: true,
        sectionFilter: 'CUSTOM' as const
      }
    ]

    // Criar tipos de seção padrão
    for (const sectionType of defaultSectionTypes) {
      await prisma.sectionTypeGroup.create({
        data: {
          ...sectionType,
          teamId
        }
      })
    }

    console.log('✅ Seções padrão criadas com sucesso!')

  } catch (error) {
    console.error('❌ Erro ao criar seções padrão:', error)
    throw error
  }
}