import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../../../lib/prisma'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; id: string }> }
) {
  try {
    const { slug, id } = await params
    const body = await request.json()
    const { name, description, icon, color, active, order } = body

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

    // Atualizar tipo de seção apenas se pertencer ao team
    const sectionType = await prisma.sectionTypeGroup.updateMany({
      where: {
        id: id,
        teamId: team.id
      },
      data: {
        name,
        description,
        icon,
        color,
        active,
        order
      }
    })

    if (sectionType.count === 0) {
      return NextResponse.json({ error: 'Tipo de seção não encontrado' }, { status: 404 })
    }

    // Buscar tipo atualizado
    const updatedType = await prisma.sectionTypeGroup.findFirst({
      where: {
        id: id,
        teamId: team.id
      }
    })

    return NextResponse.json(updatedType)
  } catch (error) {
    console.error('Erro ao atualizar tipo de seção:', error)
    return NextResponse.json({ error: 'Erro ao atualizar tipo de seção' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; id: string }> }
) {
  try {
    const { slug, id } = await params

    // Buscar team pelo slug
    const team = await prisma.team.findUnique({
      where: { slug }
    })

    if (!team) {
      return NextResponse.json({ error: 'Team não encontrado' }, { status: 404 })
    }

    // Deletar tipo de seção apenas se pertencer ao team
    const sectionType = await prisma.sectionTypeGroup.deleteMany({
      where: {
        id: id,
        teamId: team.id
      }
    })

    if (sectionType.count === 0) {
      return NextResponse.json({ error: 'Tipo de seção não encontrado' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao deletar tipo de seção:', error)
    return NextResponse.json({ error: 'Erro ao deletar tipo de seção' }, { status: 500 })
  }
}