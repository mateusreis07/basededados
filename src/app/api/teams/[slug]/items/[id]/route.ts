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

    // Buscar item específico do team
    const item = await prisma.item.findFirst({
      where: {
        id: id,
        teamId: team.id
      },
      include: {
        category: true,
        section: true
      }
    })

    if (!item) {
      return NextResponse.json({ error: 'Item não encontrado' }, { status: 404 })
    }

    return NextResponse.json(item)
  } catch (error) {
    console.error('Erro ao buscar item do team:', error)
    return NextResponse.json({ error: 'Erro ao buscar item' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; id: string }> }
) {
  try {
    const { slug, id } = await params
    const body = await request.json()
    const { title, content, tags, categoryId } = body

    // Buscar team pelo slug
    const team = await prisma.team.findUnique({
      where: { slug }
    })

    if (!team) {
      return NextResponse.json({ error: 'Team não encontrado' }, { status: 404 })
    }

    // Verificar se a categoria pertence ao team (se fornecida)
    if (categoryId) {
      const category = await prisma.category.findFirst({
        where: {
          id: categoryId,
          teamId: team.id
        }
      })

      if (!category) {
        return NextResponse.json({ error: 'Categoria não encontrada no team' }, { status: 404 })
      }
    }

    // Atualizar item apenas se pertencer ao team
    const updateData: any = {}
    if (title !== undefined) updateData.title = title
    if (content !== undefined) updateData.content = content
    if (tags !== undefined) updateData.tags = tags
    if (categoryId !== undefined) updateData.categoryId = categoryId

    const item = await prisma.item.updateMany({
      where: {
        id: id,
        teamId: team.id
      },
      data: updateData
    })

    if (item.count === 0) {
      return NextResponse.json({ error: 'Item não encontrado' }, { status: 404 })
    }

    // Buscar item atualizado
    const updatedItem = await prisma.item.findFirst({
      where: {
        id: id,
        teamId: team.id
      },
      include: {
        category: true,
        section: true
      }
    })

    return NextResponse.json(updatedItem)
  } catch (error) {
    console.error('Erro ao atualizar item:', error)
    return NextResponse.json({ error: 'Erro ao atualizar item' }, { status: 500 })
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

    // Deletar item apenas se pertencer ao team
    const item = await prisma.item.deleteMany({
      where: {
        id: id,
        teamId: team.id
      }
    })

    if (item.count === 0) {
      return NextResponse.json({ error: 'Item não encontrado' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao deletar item:', error)
    return NextResponse.json({ error: 'Erro ao deletar item' }, { status: 500 })
  }
}