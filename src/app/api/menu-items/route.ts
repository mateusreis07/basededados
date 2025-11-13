import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'

export async function GET() {
  try {
    const menuItems = await prisma.menuItem.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' }
    })
    return NextResponse.json(menuItems)
  } catch (error) {
    console.error('Erro ao buscar menu items:', error)
    return NextResponse.json({ error: 'Erro ao buscar menu items' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, href, icon, order = 0, teamId } = body

    if (!name || !href || !teamId) {
      return NextResponse.json({ error: 'Nome, href e teamId são obrigatórios' }, { status: 400 })
    }

    const menuItem = await prisma.menuItem.create({
      data: {
        name,
        href,
        icon: icon || '📄',
        order,
        teamId
      }
    })

    return NextResponse.json(menuItem, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar menu item:', error)
    return NextResponse.json({ error: 'Erro ao criar menu item' }, { status: 500 })
  }
}