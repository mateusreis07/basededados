import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../../lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    // Buscar team pelo slug
    const team = await prisma.team.findUnique({
      where: { slug }
    })

    if (!team) {
      return NextResponse.json({ error: 'Team não encontrado' }, { status: 404 })
    }

    // Buscar seções do team com contagem de items
    const sections = await prisma.section.findMany({
      where: { teamId: team.id },
      include: {
        _count: {
          select: {
            items: true
          }
        }
      },
      orderBy: { order: 'asc' }
    })

    return NextResponse.json(sections)
  } catch (error) {
    console.error('Erro ao buscar seções do team:', error)
    return NextResponse.json({ error: 'Erro ao buscar seções' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const body = await request.json()
    const { name, description, type, order } = body

    if (!name) {
      return NextResponse.json({ error: 'Nome da seção é obrigatório' }, { status: 400 })
    }

    // Buscar team pelo slug
    const team = await prisma.team.findUnique({
      where: { slug }
    })

    if (!team) {
      return NextResponse.json({ error: 'Team não encontrado' }, { status: 404 })
    }

    // Função para normalizar o nome da seção para ID
    function normalizeForId(name: string) {
      return name
        .toLowerCase()
        .normalize('NFD')                    // Decompor caracteres acentuados
        .replace(/[\u0300-\u036f]/g, '')     // Remover acentos
        .replace(/[^a-z0-9\s-]/g, '')        // Manter apenas letras, números, espaços e hífens
        .replace(/\s+/g, '-')                // Substituir espaços por hífen
        .replace(/--+/g, '-')                // Remover hífens duplos
        .trim()
    }

    // Criar ID único para a seção baseado no team e nome da seção
    const sectionId = `${team.slug}-${normalizeForId(name)}`

    // Verificar se já existe uma seção com este ID
    const existingSection = await prisma.section.findUnique({
      where: { id: sectionId }
    })

    if (existingSection) {
      return NextResponse.json({
        error: 'Já existe uma seção com este nome neste team'
      }, { status: 409 })
    }

    // Se order não foi fornecido, usar o próximo número disponível para o team
    let finalOrder = order
    if (finalOrder === undefined) {
      const lastSection = await prisma.section.findFirst({
        where: { teamId: team.id },
        orderBy: { order: 'desc' }
      })
      finalOrder = (lastSection?.order || 0) + 1
    }

    const section = await prisma.section.create({
      data: {
        id: sectionId,
        name,
        description,
        type: type || 'CUSTOM',
        order: finalOrder,
        teamId: team.id
      },
      include: {
        _count: {
          select: {
            items: true
          }
        }
      }
    })

    return NextResponse.json(section, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar seção:', error)
    return NextResponse.json({ error: 'Erro ao criar seção' }, { status: 500 })
  }
}