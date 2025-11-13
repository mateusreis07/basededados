import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const team = await prisma.team.findUnique({
      where: { slug }
    })

    if (!team) {
      return NextResponse.json({ error: 'Team não encontrado' }, { status: 404 })
    }

    return NextResponse.json(team)
  } catch (error) {
    console.error('Erro ao buscar team:', error)
    return NextResponse.json({ error: 'Erro ao buscar team' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const body = await request.json()
    const { name, description, domain, settings } = body

    const team = await prisma.team.update({
      where: { slug },
      data: {
        name,
        description,
        domain,
        settings
      }
    })

    return NextResponse.json(team)
  } catch (error) {
    console.error('Erro ao atualizar team:', error)
    return NextResponse.json({ error: 'Erro ao atualizar team' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    await prisma.team.delete({
      where: { slug }
    })

    return NextResponse.json({ message: 'Team deletado com sucesso' })
  } catch (error) {
    console.error('Erro ao deletar team:', error)
    return NextResponse.json({ error: 'Erro ao deletar team' }, { status: 500 })
  }
}