import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../../lib/prisma'

// GET - Listar todos os membros do team
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    // Buscar o team
    const team = await prisma.team.findUnique({
      where: { slug }
    })

    if (!team) {
      return NextResponse.json({ error: 'Team não encontrado' }, { status: 404 })
    }

    // Buscar membros do team
    const members = await prisma.teamMember.findMany({
      where: { teamId: team.id },
      orderBy: [
        { isActive: 'desc' },
        { name: 'asc' }
      ]
    })

    return NextResponse.json(members)
  } catch (error) {
    console.error('Erro ao buscar membros:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

// POST - Criar novo membro
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const body = await request.json()
    const { name, email, position, department, phone, notes } = body

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

    // Verificar se email já existe no team
    const existingMember = await prisma.teamMember.findUnique({
      where: {
        email_teamId: {
          email,
          teamId: team.id
        }
      }
    })

    if (existingMember) {
      return NextResponse.json({ error: 'Email já está em uso neste team' }, { status: 400 })
    }

    // Criar membro
    const member = await prisma.teamMember.create({
      data: {
        name,
        email,
        position: position || null,
        department: department || null,
        phone: phone || null,
        notes: notes || null,
        teamId: team.id
      }
    })

    return NextResponse.json(member, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar membro:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}