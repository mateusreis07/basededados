import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../lib/prisma'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const sectionType = await prisma.sectionTypeGroup.findUnique({
      where: { id }
    })

    if (!sectionType) {
      return NextResponse.json({ error: 'Tipo de seção não encontrado' }, { status: 404 })
    }

    return NextResponse.json(sectionType)
  } catch (error) {
    console.error('Erro ao buscar tipo de seção:', error)
    return NextResponse.json({ error: 'Erro ao buscar tipo de seção' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, description, icon, color, active, order } = body

    if (!name) {
      return NextResponse.json({ error: 'Nome é obrigatório' }, { status: 400 })
    }

    const sectionType = await prisma.sectionTypeGroup.update({
      where: { id },
      data: {
        name,
        description,
        icon,
        color,
        active,
        order
      }
    })

    return NextResponse.json(sectionType)
  } catch (error) {
    console.error('Erro ao atualizar tipo de seção:', error)
    return NextResponse.json({ error: 'Erro ao atualizar tipo de seção' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    // Verificar se existe
    const sectionType = await prisma.sectionTypeGroup.findUnique({
      where: { id }
    })

    if (!sectionType) {
      return NextResponse.json({ error: 'Tipo de seção não encontrado' }, { status: 404 })
    }

    // Verificar se há seções usando este tipo
    const sectionsCount = await prisma.section.count({
      where: {
        type: sectionType.sectionFilter
      }
    })

    if (sectionsCount > 0) {
      return NextResponse.json({
        error: `Não é possível deletar este tipo. Existem ${sectionsCount} seção(ões) vinculada(s) a ele.`
      }, { status: 400 })
    }

    await prisma.sectionTypeGroup.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Tipo de seção deletado com sucesso' })
  } catch (error) {
    console.error('Erro ao deletar tipo de seção:', error)
    return NextResponse.json({ error: 'Erro ao deletar tipo de seção' }, { status: 500 })
  }
}