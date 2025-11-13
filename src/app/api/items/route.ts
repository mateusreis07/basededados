import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sectionId = searchParams.get('sectionId')
    const categoryId = searchParams.get('categoryId')
    const search = searchParams.get('search')

    let where: any = {}

    if (sectionId) {
      where.sectionId = sectionId
    }

    if (categoryId) {
      where.categoryId = categoryId
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
        { tags: { hasSome: [search] } }
      ]
    }

    const items = await prisma.item.findMany({
      where,
      include: {
        section: true,
        category: true
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(items)
  } catch (error) {
    console.error('Erro ao buscar itens:', error)
    return NextResponse.json({ error: 'Erro ao buscar itens' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, content, tags, sectionId, categoryId } = body

    if (!title || !content || !sectionId) {
      return NextResponse.json({ error: 'Título, conteúdo e seção são obrigatórios' }, { status: 400 })
    }

    const item = await prisma.item.create({
      data: {
        title,
        content,
        tags: tags || [],
        sectionId,
        categoryId: categoryId || null
      },
      include: {
        section: true,
        category: true
      }
    })

    return NextResponse.json(item, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar item:', error)
    return NextResponse.json({ error: 'Erro ao criar item' }, { status: 500 })
  }
}