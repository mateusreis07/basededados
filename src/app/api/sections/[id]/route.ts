import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../lib/prisma'

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, description, type, order } = body

    if (!name) {
      return NextResponse.json({ error: 'Nome é obrigatório' }, { status: 400 })
    }

    const section = await prisma.section.update({
      where: { id },
      data: {
        name,
        description,
        type: type as 'FIXED' | 'CUSTOM' | 'MENU',
        order
      },
      include: {
        _count: {
          select: { items: true }
        }
      }
    })

    return NextResponse.json(section)
  } catch (error) {
    console.error('Erro ao atualizar seção:', error)
    return NextResponse.json({ error: 'Erro ao atualizar seção' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    // Primeiro, deletar todos os itens da seção
    await prisma.item.deleteMany({
      where: { sectionId: id }
    })

    // Depois, deletar a seção
    await prisma.section.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Seção excluída com sucesso' })
  } catch (error) {
    console.error('Erro ao excluir seção:', error)
    return NextResponse.json({ error: 'Erro ao excluir seção' }, { status: 500 })
  }
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const section = await prisma.section.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            category: true
          },
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: { items: true }
        }
      }
    })

    if (!section) {
      return NextResponse.json({ error: 'Seção não encontrada' }, { status: 404 })
    }

    return NextResponse.json(section)
  } catch (error) {
    console.error('Erro ao buscar seção:', error)
    return NextResponse.json({ error: 'Erro ao buscar seção' }, { status: 500 })
  }
}