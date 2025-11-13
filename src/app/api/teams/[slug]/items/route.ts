import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../../lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const { searchParams } = new URL(request.url)
    const sectionId = searchParams.get('sectionId')

    // Buscar team pelo slug
    const team = await prisma.team.findUnique({
      where: { slug }
    })

    if (!team) {
      return NextResponse.json({ error: 'Team não encontrado' }, { status: 404 })
    }

    // Construir where clause
    const whereClause: any = {
      teamId: team.id
    }

    if (sectionId) {
      whereClause.sectionId = sectionId
    }

    // Buscar items do team
    const items = await prisma.item.findMany({
      where: whereClause,
      include: {
        category: true,
        section: true
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(items)
  } catch (error) {
    console.error('Erro ao buscar items do team:', error)
    return NextResponse.json({ error: 'Erro ao buscar items' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const body = await request.json()
    const { title, content, tags, sectionId, categoryId } = body

    // Buscar team pelo slug
    const team = await prisma.team.findUnique({
      where: { slug }
    })

    if (!team) {
      return NextResponse.json({ error: 'Team não encontrado' }, { status: 404 })
    }

    // Verificar se a seção pertence ao team
    if (sectionId) {
      const section = await prisma.section.findFirst({
        where: {
          id: sectionId,
          teamId: team.id
        }
      })

      if (!section) {
        return NextResponse.json({ error: 'Seção não encontrada no team' }, { status: 404 })
      }
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

    const item = await prisma.item.create({
      data: {
        title,
        content,
        tags: tags || [],
        sectionId,
        categoryId: categoryId || null,
        teamId: team.id
      },
      include: {
        category: true,
        section: true
      }
    })

    return NextResponse.json(item)
  } catch (error) {
    console.error('Erro ao criar item:', error)
    return NextResponse.json({ error: 'Erro ao criar item' }, { status: 500 })
  }
}