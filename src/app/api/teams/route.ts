import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'

export async function GET() {
  try {
    const teams = await prisma.team.findMany({
      orderBy: { name: 'asc' }
    })
    return NextResponse.json(teams)
  } catch (error) {
    console.error('Erro ao buscar teams:', error)
    return NextResponse.json({ error: 'Erro ao buscar teams' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, domain, settings } = body

    // Gerar slug baseado no nome
    const slug = name.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim()

    const team = await prisma.team.create({
      data: {
        name,
        slug,
        description,
        domain,
        settings
      }
    })

    return NextResponse.json(team)
  } catch (error) {
    console.error('Erro ao criar team:', error)
    return NextResponse.json({ error: 'Erro ao criar team' }, { status: 500 })
  }
}