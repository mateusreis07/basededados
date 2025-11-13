import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../../../lib/prisma'
import { ReportStatus } from '@prisma/client'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; id: string }> }
) {
  try {
    const { slug, id } = await params

    // Buscar team pelo slug
    const team = await prisma.team.findUnique({
      where: { slug }
    })

    if (!team) {
      return NextResponse.json({ error: 'Team não encontrado' }, { status: 404 })
    }

    // Buscar relatório específico do team
    const report = await prisma.report.findFirst({
      where: {
        id: id,
        teamId: team.id
      }
    })

    if (!report) {
      return NextResponse.json({ error: 'Relatório não encontrado' }, { status: 404 })
    }

    return NextResponse.json(report)
  } catch (error) {
    console.error('Erro ao buscar relatório do team:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; id: string }> }
) {
  try {
    const { slug, id } = await params
    const body = await request.json()
    const { title, content, status, category, tags, author, template, templateData } = body

    // Buscar team pelo slug
    const team = await prisma.team.findUnique({
      where: { slug }
    })

    if (!team) {
      return NextResponse.json({ error: 'Team não encontrado' }, { status: 404 })
    }

    // Validações básicas
    if (!title || !content || !category) {
      return NextResponse.json(
        { error: 'Título, conteúdo e categoria são obrigatórios' },
        { status: 400 }
      )
    }

    // Atualizar relatório apenas se pertencer ao team
    const updatedReport = await prisma.report.updateMany({
      where: {
        id: id,
        teamId: team.id
      },
      data: {
        title,
        content,
        status: status || ReportStatus.PUBLISHED,
        category,
        tags: tags || [],
        author: author || 'Sistema',
        template,
        templateData
      }
    })

    if (updatedReport.count === 0) {
      return NextResponse.json({ error: 'Relatório não encontrado' }, { status: 404 })
    }

    // Buscar relatório atualizado
    const report = await prisma.report.findFirst({
      where: {
        id: id,
        teamId: team.id
      }
    })

    return NextResponse.json(report)
  } catch (error) {
    console.error('Erro ao atualizar relatório do team:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; id: string }> }
) {
  try {
    const { slug, id } = await params

    // Buscar team pelo slug
    const team = await prisma.team.findUnique({
      where: { slug }
    })

    if (!team) {
      return NextResponse.json({ error: 'Team não encontrado' }, { status: 404 })
    }

    // Deletar relatório apenas se pertencer ao team
    const deletedReport = await prisma.report.deleteMany({
      where: {
        id: id,
        teamId: team.id
      }
    })

    if (deletedReport.count === 0) {
      return NextResponse.json({ error: 'Relatório não encontrado' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao deletar relatório do team:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}