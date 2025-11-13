import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../../../../lib/prisma'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; id: string }> }
) {
  try {
    const { slug, id } = await params

    // Verificar se o team existe
    const team = await prisma.team.findUnique({
      where: { slug }
    })

    if (!team) {
      return NextResponse.json({ error: 'Team não encontrado' }, { status: 404 })
    }

    // Buscar a seção
    const section = await prisma.section.findFirst({
      where: {
        id,
        teamId: team.id
      }
    })

    if (!section) {
      return NextResponse.json({ error: 'Seção não encontrada' }, { status: 404 })
    }

    // Verificar se é uma seção padrão
    const defaultSections = ['Relatórios', 'Informações Gerais', 'Scripts PostgreSQL', 'Erros']
    if (defaultSections.includes(section.name)) {
      return NextResponse.json({ error: 'Seções padrão não podem ser desativadas' }, { status: 400 })
    }

    // Alternar o status
    const updatedSection = await prisma.section.update({
      where: { id },
      data: {
        isActive: !section.isActive
      }
    })

    return NextResponse.json(updatedSection)
  } catch (error) {
    console.error('Erro ao alterar status da seção:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}