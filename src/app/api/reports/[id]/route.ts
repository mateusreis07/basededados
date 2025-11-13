import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient, ReportStatus } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/reports/[id] - Buscar relatório por ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const report = await prisma.report.findUnique({
      where: { id }
    })

    if (!report) {
      return NextResponse.json(
        { error: 'Relatório não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(report)
  } catch (error) {
    console.error('Erro ao buscar relatório:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// PUT /api/reports/[id] - Atualizar relatório
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const { title, content, status, category, tags, template, templateData } = body

    // Verificar se o relatório existe
    const existingReport = await prisma.report.findUnique({
      where: { id }
    })

    if (!existingReport) {
      return NextResponse.json(
        { error: 'Relatório não encontrado' },
        { status: 404 }
      )
    }

    // Validações básicas
    if (!title || !content || !category) {
      return NextResponse.json(
        { error: 'Título, conteúdo e categoria são obrigatórios' },
        { status: 400 }
      )
    }

    const updatedReport = await prisma.report.update({
      where: { id },
      data: {
        title,
        content,
        status,
        category,
        tags,
        template,
        templateData,
        updatedAt: new Date()
      }
    })

    return NextResponse.json(updatedReport)
  } catch (error) {
    console.error('Erro ao atualizar relatório:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// DELETE /api/reports/[id] - Excluir relatório
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Verificar se o relatório existe
    const existingReport = await prisma.report.findUnique({
      where: { id }
    })

    if (!existingReport) {
      return NextResponse.json(
        { error: 'Relatório não encontrado' },
        { status: 404 }
      )
    }

    await prisma.report.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Relatório excluído com sucesso' })
  } catch (error) {
    console.error('Erro ao excluir relatório:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}