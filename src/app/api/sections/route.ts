import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'

export async function GET() {
  try {
    const sections = await prisma.section.findMany({
      include: {
        _count: {
          select: { items: true }
        }
      },
      orderBy: [
        { type: 'desc' }, // FIXED primeiro, depois CUSTOM
        { order: 'asc' },
        { name: 'asc' }
      ]
    })
    return NextResponse.json(sections)
  } catch (error) {
    console.error('Erro ao buscar seções:', error)
    return NextResponse.json({ error: 'Erro ao buscar seções' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, type = 'CUSTOM', order = 0 } = body

    if (!name) {
      return NextResponse.json({ error: 'Nome é obrigatório' }, { status: 400 })
    }

    const section = await prisma.section.create({
      data: {
        name,
        description,
        type: type as 'FIXED' | 'CUSTOM',
        order
      },
      include: {
        _count: {
          select: { items: true }
        }
      }
    })

    return NextResponse.json(section, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar seção:', error)
    return NextResponse.json({ error: 'Erro ao criar seção' }, { status: 500 })
  }
}