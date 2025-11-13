import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../../lib/prisma'
import { SectionType } from '@prisma/client'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    // Buscar team pelo slug
    const team = await prisma.team.findUnique({
      where: { slug }
    })

    if (!team) {
      return NextResponse.json({ error: 'Team não encontrado' }, { status: 404 })
    }

    // Buscar tipos de seção do team
    const sectionTypes = await prisma.sectionTypeGroup.findMany({
      where: { teamId: team.id },
      orderBy: [
        { order: 'asc' },
        { name: 'asc' }
      ]
    })

    // Se não houver tipos, criar os padrão para o team
    if (sectionTypes.length === 0) {
      const defaultTypes = [
        {
          name: 'SEÇÕES PRINCIPAIS',
          description: 'Seções principais da base de conhecimento',
          icon: '⭐',
          color: '#3B82F6',
          order: 1,
          active: true,
          sectionFilter: 'MENU' as const,
          teamId: team.id
        },
        {
          name: 'SEÇÕES FIXAS',
          description: 'Seções fixas e permanentes do sistema',
          icon: '📌',
          color: '#10B981',
          order: 2,
          active: true,
          sectionFilter: 'FIXED' as const,
          teamId: team.id
        },
        {
          name: 'SEÇÕES PERSONALIZADAS',
          description: 'Seções criadas pelos usuários conforme necessidade',
          icon: '🎨',
          color: '#8B5CF6',
          order: 3,
          active: true,
          sectionFilter: 'CUSTOM' as const,
          teamId: team.id
        }
      ]

      await prisma.sectionTypeGroup.createMany({
        data: defaultTypes
      })

      // Buscar os tipos criados para retornar
      const newSectionTypes = await prisma.sectionTypeGroup.findMany({
        where: { teamId: team.id },
        orderBy: [
          { order: 'asc' },
          { name: 'asc' }
        ]
      })

      return NextResponse.json(newSectionTypes)
    }

    return NextResponse.json(sectionTypes)
  } catch (error) {
    console.error('Erro ao buscar tipos de seção do team:', error)
    return NextResponse.json({ error: 'Erro ao buscar tipos de seção' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const body = await request.json()
    const { name, description, icon = '📁', color = '#3B82F6', active = true, order } = body

    // Buscar team pelo slug
    const team = await prisma.team.findUnique({
      where: { slug }
    })

    if (!team) {
      return NextResponse.json({ error: 'Team não encontrado' }, { status: 404 })
    }

    if (!name) {
      return NextResponse.json({ error: 'Nome é obrigatório' }, { status: 400 })
    }

    // Se order não foi fornecido, usar o próximo número disponível para o team
    let finalOrder = order
    if (finalOrder === undefined) {
      const lastType = await prisma.sectionTypeGroup.findFirst({
        where: { teamId: team.id },
        orderBy: { order: 'desc' }
      })
      finalOrder = (lastType?.order || 0) + 1
    }

    // Encontrar um sectionFilter único disponível para o team
    const existingFilters = await prisma.sectionTypeGroup.findMany({
      where: { teamId: team.id },
      select: { sectionFilter: true }
    })
    const usedFilters = existingFilters.map(t => t.sectionFilter)

    // Lista de filtros disponíveis (começando por CUSTOM_1 para novos tipos)
    const availableFilters: SectionType[] = ['CUSTOM_1', 'CUSTOM_2', 'CUSTOM_3', 'CUSTOM_4', 'CUSTOM_5']
    const uniqueFilter: SectionType = availableFilters.find(filter => !usedFilters.includes(filter)) || 'CUSTOM'

    const sectionType = await prisma.sectionTypeGroup.create({
      data: {
        name,
        description,
        icon,
        color,
        active,
        sectionFilter: uniqueFilter,
        order: finalOrder,
        teamId: team.id
      }
    })

    return NextResponse.json(sectionType, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar tipo de seção do team:', error)
    return NextResponse.json({ error: 'Erro ao criar tipo de seção' }, { status: 500 })
  }
}