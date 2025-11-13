import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../../../lib/prisma'

// PUT - Atualizar membro
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; id: string }> }
) {
  try {
    const { slug, id } = await params
    const body = await request.json()
    const { name, email, position, department, phone, notes, isActive } = body

    // Validações
    if (!name || !email) {
      return NextResponse.json({ error: 'Nome e email são obrigatórios' }, { status: 400 })
    }

    // Buscar o team
    const team = await prisma.team.findUnique({
      where: { slug }
    })

    if (!team) {
      return NextResponse.json({ error: 'Team não encontrado' }, { status: 404 })
    }

    // Verificar se o membro existe e pertence ao team
    const existingMember = await prisma.teamMember.findFirst({
      where: {
        id,
        teamId: team.id
      }
    })

    if (!existingMember) {
      return NextResponse.json({ error: 'Membro não encontrado' }, { status: 404 })
    }

    // Verificar se email já existe em outro membro do team
    const emailConflict = await prisma.teamMember.findFirst({
      where: {
        email,
        teamId: team.id,
        id: { not: id } // Excluir o próprio membro da verificação
      }
    })

    if (emailConflict) {
      return NextResponse.json({ error: 'Email já está em uso por outro membro deste team' }, { status: 400 })
    }

    // Atualizar membro
    const updatedMember = await prisma.teamMember.update({
      where: { id },
      data: {
        name,
        email,
        position: position || null,
        department: department || null,
        phone: phone || null,
        notes: notes || null,
        isActive: isActive ?? true
      }
    })

    return NextResponse.json(updatedMember)
  } catch (error) {
    console.error('Erro ao atualizar membro:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

// DELETE - Excluir membro
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; id: string }> }
) {
  try {
    const { slug, id } = await params

    // Buscar o team
    const team = await prisma.team.findUnique({
      where: { slug }
    })

    if (!team) {
      return NextResponse.json({ error: 'Team não encontrado' }, { status: 404 })
    }

    // Verificar se o membro existe e pertence ao team
    const existingMember = await prisma.teamMember.findFirst({
      where: {
        id,
        teamId: team.id
      }
    })

    if (!existingMember) {
      return NextResponse.json({ error: 'Membro não encontrado' }, { status: 404 })
    }

    // Deletar membro
    await prisma.teamMember.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Membro excluído com sucesso' })
  } catch (error) {
    console.error('Erro ao excluir membro:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}