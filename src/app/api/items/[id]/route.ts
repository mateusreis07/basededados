import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const item = await prisma.item.findUnique({
      where: { id },
      include: {
        section: true,
        category: true
      }
    })

    if (!item) {
      return NextResponse.json({ error: 'Item não encontrado' }, { status: 404 })
    }

    return NextResponse.json(item)
  } catch (error) {
    console.error('Erro ao buscar item:', error)
    return NextResponse.json({ error: 'Erro ao buscar item' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    console.log('Dados recebidos para atualização:', body)

    const { title, content, tags, categoryId } = body

    // Validar se o item existe
    const existingItem = await prisma.item.findUnique({
      where: { id }
    })

    if (!existingItem) {
      return NextResponse.json({ error: 'Item não encontrado' }, { status: 404 })
    }

    console.log('Item existente:', existingItem)

    const updateData: any = {
      title: title !== undefined ? title : existingItem.title,
      content: content !== undefined ? content : existingItem.content,
      tags: tags !== undefined ? tags : existingItem.tags
    }

    // Validar categoryId se fornecido
    if (categoryId !== undefined) {
      console.log('CategoryId fornecido:', categoryId, 'tipo:', typeof categoryId)

      // Tratar como null se for string vazia ou null
      if (categoryId === null || categoryId === '' || categoryId === 'null') {
        updateData.categoryId = null
        console.log('CategoryId definido como null')
      } else {
        // Verificar se a categoria existe
        console.log('Verificando se categoria existe:', categoryId)
        try {
          const categoryExists = await prisma.category.findUnique({
            where: { id: categoryId }
          })

          if (!categoryExists) {
            console.log('Categoria não encontrada:', categoryId)
            return NextResponse.json({ error: `Categoria com ID ${categoryId} não encontrada` }, { status: 400 })
          }

          updateData.categoryId = categoryId
          console.log('CategoryId válido definido:', categoryId)
        } catch (error) {
          console.log('Erro ao verificar categoria:', error)
          return NextResponse.json({ error: 'Erro ao verificar categoria' }, { status: 400 })
        }
      }
    } else {
      console.log('CategoryId não fornecido, mantendo valor existente')
    }

    console.log('Dados finais para update:', updateData)

    const item = await prisma.item.update({
      where: { id },
      data: updateData,
      include: {
        section: true,
        category: true
      }
    })

    return NextResponse.json(item)
  } catch (error) {
    console.error('Erro ao atualizar item:', error)
    return NextResponse.json({ error: 'Erro ao atualizar item' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await prisma.item.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Item deletado com sucesso' })
  } catch (error) {
    console.error('Erro ao deletar item:', error)
    return NextResponse.json({ error: 'Erro ao deletar item' }, { status: 500 })
  }
}