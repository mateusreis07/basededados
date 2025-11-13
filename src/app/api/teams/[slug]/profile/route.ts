import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../../lib/prisma'
import bcrypt from 'bcryptjs'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const body = await request.json()
    const { name, description, email, currentPassword, newPassword } = body

    // Validações básicas
    if (!name || !email) {
      return NextResponse.json({ error: 'Nome e email são obrigatórios' }, { status: 400 })
    }

    // Buscar o team atual
    const team = await prisma.team.findUnique({
      where: { slug }
    })

    if (!team) {
      return NextResponse.json({ error: 'Team não encontrado' }, { status: 404 })
    }

    // Verificar se email já está em uso por outro team
    if (email !== team.email) {
      const existingTeam = await prisma.team.findFirst({
        where: {
          email,
          id: { not: team.id }
        }
      })

      if (existingTeam) {
        return NextResponse.json({ error: 'Este email já está em uso por outro team' }, { status: 409 })
      }
    }

    // Preparar dados para atualização
    const updateData: any = {
      name,
      description,
      email
    }

    // Se foi fornecida senha atual e nova senha, verificar e atualizar
    if (currentPassword && newPassword) {
      // Verificar senha atual
      if (!team.password) {
        return NextResponse.json({ error: 'Team não tem senha configurada' }, { status: 400 })
      }

      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, team.password)
      if (!isCurrentPasswordValid) {
        return NextResponse.json({ error: 'Senha atual incorreta' }, { status: 400 })
      }

      // Validar nova senha
      if (newPassword.length < 6) {
        return NextResponse.json({ error: 'Nova senha deve ter pelo menos 6 caracteres' }, { status: 400 })
      }

      // Hash da nova senha
      const saltRounds = 10
      const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds)
      updateData.password = hashedNewPassword
    }

    // Atualizar team
    const updatedTeam = await prisma.team.update({
      where: { slug },
      data: updateData,
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        email: true,
        createdAt: true,
        updatedAt: true
      }
    })

    return NextResponse.json(updatedTeam)
  } catch (error) {
    console.error('Erro ao atualizar perfil do team:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}