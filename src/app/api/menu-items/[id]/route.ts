import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../lib/prisma'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, href, icon, order, isActive } = body

    const updateData: any = {}
    if (name !== undefined) updateData.name = name
    if (href !== undefined) updateData.href = href
    if (icon !== undefined) updateData.icon = icon
    if (order !== undefined) updateData.order = order
    if (isActive !== undefined) updateData.isActive = isActive

    const menuItem = await prisma.menuItem.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json(menuItem)
  } catch (error) {
    console.error('Erro ao atualizar menu item:', error)
    return NextResponse.json({ error: 'Erro ao atualizar menu item' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Em vez de deletar, apenas desativar
    await prisma.menuItem.update({
      where: { id },
      data: { isActive: false }
    })

    return NextResponse.json({ message: 'Menu item desativado com sucesso' })
  } catch (error) {
    console.error('Erro ao desativar menu item:', error)
    return NextResponse.json({ error: 'Erro ao desativar menu item' }, { status: 500 })
  }
}