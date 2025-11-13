import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../../../lib/prisma'

export async function GET(
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

    // Buscar seção específica do team com items
    const section = await prisma.section.findFirst({
      where: {
        id: id,
        teamId: team.id
      },
      include: {
        items: {
          include: {
            category: true,
            section: true
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    if (!section) {
      return NextResponse.json({ error: 'Seção não encontrada' }, { status: 404 })
    }

    return NextResponse.json(section)
  } catch (error) {
    console.error('Erro ao buscar seção do team:', error)
    return NextResponse.json({ error: 'Erro ao buscar seção' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; id: string }> }
) {
  try {
    const { slug, id } = await params
    const body = await request.json()
    const { name, description, type, order } = body

    // Buscar team pelo slug
    const team = await prisma.team.findUnique({
      where: { slug }
    })

    if (!team) {
      return NextResponse.json({ error: 'Team não encontrado' }, { status: 404 })
    }

    // Atualizar seção apenas se pertencer ao team
    const section = await prisma.section.updateMany({
      where: {
        id: id,
        teamId: team.id
      },
      data: {
        name,
        description,
        type,
        order
      }
    })

    if (section.count === 0) {
      return NextResponse.json({ error: 'Seção não encontrada' }, { status: 404 })
    }

    // Buscar seção atualizada
    const updatedSection = await prisma.section.findFirst({
      where: {
        id: id,
        teamId: team.id
      }
    })

    return NextResponse.json(updatedSection)
  } catch (error) {
    console.error('Erro ao atualizar seção:', error)
    return NextResponse.json({ error: 'Erro ao atualizar seção' }, { status: 500 })
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

    // Buscar a seção com contagem de itens
    const section = await prisma.section.findFirst({
      where: {
        id: id,
        teamId: team.id
      },
      include: {
        _count: {
          select: {
            items: true
          }
        }
      }
    })

    if (!section) {
      return NextResponse.json({ error: 'Seção não encontrada' }, { status: 404 })
    }

    // Verificar se é uma seção padrão
    const defaultSections = ['Relatórios', 'Informações Gerais', 'Scripts PostgreSQL', 'Erros']
    if (defaultSections.includes(section.name)) {
      return NextResponse.json({ error: 'Seções padrão não podem ser excluídas' }, { status: 400 })
    }

    // Verificar se há itens na seção
    if (section._count.items > 0) {
      return NextResponse.json({
        error: `Não é possível excluir a seção "${section.name}" pois ela contém ${section._count.items} item(s). Remova todos os itens antes de excluir a seção.`
      }, { status: 400 })
    }

    // Deletar seção
    await prisma.section.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Seção excluída com sucesso' })
  } catch (error) {
    console.error('Erro ao deletar seção:', error)
    return NextResponse.json({ error: 'Erro ao deletar seção' }, { status: 500 })
  }
}