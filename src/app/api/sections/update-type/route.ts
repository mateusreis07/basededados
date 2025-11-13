import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../lib/prisma'

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { oldType, newType } = body

    if (!oldType || !newType) {
      return NextResponse.json({ error: 'oldType e newType são obrigatórios' }, { status: 400 })
    }

    // Validar tipos
    const validTypes = ['MENU', 'FIXED', 'CUSTOM']
    if (!validTypes.includes(oldType) || !validTypes.includes(newType)) {
      return NextResponse.json({ error: 'Tipos inválidos' }, { status: 400 })
    }

    // Atualizar todas as seções do tipo antigo para o novo tipo
    const updateResult = await prisma.section.updateMany({
      where: {
        type: oldType as 'MENU' | 'FIXED' | 'CUSTOM'
      },
      data: {
        type: newType as 'MENU' | 'FIXED' | 'CUSTOM'
      }
    })

    return NextResponse.json({
      message: 'Seções atualizadas com sucesso',
      updatedCount: updateResult.count
    })
  } catch (error) {
    console.error('Erro ao atualizar tipo das seções:', error)
    return NextResponse.json({ error: 'Erro ao atualizar tipo das seções' }, { status: 500 })
  }
}