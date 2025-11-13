import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { localStorageTypes, teamId } = body

    if (!localStorageTypes || !Array.isArray(localStorageTypes)) {
      return NextResponse.json({ error: 'Dados do localStorage inválidos' }, { status: 400 })
    }

    if (!teamId) {
      return NextResponse.json({ error: 'TeamId é obrigatório' }, { status: 400 })
    }

    // Verificar se já existem tipos no banco para este team
    const existingTypes = await prisma.sectionTypeGroup.findMany({
      where: { teamId }
    })

    if (existingTypes.length > 0) {
      return NextResponse.json({
        message: 'Migração já realizada',
        existing: existingTypes.length
      })
    }

    // Migrar dados do localStorage para o banco
    const migrationData = localStorageTypes.map((type: any) => ({
      name: type.name,
      description: type.description || '',
      icon: type.icon || '📁',
      color: type.color || '#3B82F6',
      order: type.order || 0,
      active: type.active !== undefined ? type.active : true,
      sectionFilter: type.sectionFilter || 'CUSTOM',
      teamId
    }))

    const result = await prisma.sectionTypeGroup.createMany({
      data: migrationData
    })

    // Buscar os tipos criados para retornar
    const createdTypes = await prisma.sectionTypeGroup.findMany({
      where: { teamId },
      orderBy: [
        { order: 'asc' },
        { name: 'asc' }
      ]
    })

    return NextResponse.json({
      message: 'Migração realizada com sucesso',
      migrated: result.count,
      types: createdTypes
    })
  } catch (error) {
    console.error('Erro ao migrar tipos de seção:', error)
    return NextResponse.json({ error: 'Erro ao migrar tipos de seção' }, { status: 500 })
  }
}