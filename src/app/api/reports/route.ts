import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient, ReportStatus } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/reports - Listar todos os relatórios
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const category = searchParams.get('category')
    const status = searchParams.get('status')
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')

    let whereClause: any = {}

    // Filtros
    if (search) {
      whereClause.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (category) {
      whereClause.category = category
    }

    if (status && Object.values(ReportStatus).includes(status as ReportStatus)) {
      whereClause.status = status as ReportStatus
    }

    if (dateFrom || dateTo) {
      whereClause.createdAt = {}
      if (dateFrom) {
        whereClause.createdAt.gte = new Date(dateFrom)
      }
      if (dateTo) {
        whereClause.createdAt.lte = new Date(dateTo)
      }
    }

    const reports = await prisma.report.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(reports)
  } catch (error) {
    console.error('Erro ao buscar relatórios:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST /api/reports - Criar novo relatório
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, content, status, category, tags, author, template, templateData, teamId } = body

    // Validações básicas
    if (!title || !content || !category || !teamId) {
      return NextResponse.json(
        { error: 'Título, conteúdo, categoria e teamId são obrigatórios' },
        { status: 400 }
      )
    }

    const newReport = await prisma.report.create({
      data: {
        title,
        content,
        status: status || ReportStatus.PUBLISHED,
        category,
        tags: tags || [],
        author: author || 'Sistema',
        template,
        templateData,
        teamId
      }
    })

    return NextResponse.json(newReport, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar relatório:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}