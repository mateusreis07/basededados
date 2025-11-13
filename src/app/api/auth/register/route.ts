import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../lib/prisma'
import { setupDefaultSections } from '../../../../lib/setup-default-sections'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

// Função para gerar slug único
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove caracteres especiais
    .replace(/\s+/g, '-') // Substitui espaços por hífens
    .replace(/-+/g, '-') // Remove hífens duplicados
    .trim()
}

// Função para garantir slug único
async function ensureUniqueSlug(baseSlug: string): Promise<string> {
  let slug = baseSlug
  let counter = 1

  while (true) {
    const existing = await prisma.team.findUnique({
      where: { slug }
    })

    if (!existing) {
      return slug
    }

    slug = `${baseSlug}-${counter}`
    counter++
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, email, password } = body

    // Validações
    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Nome, email e senha são obrigatórios' }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Senha deve ter pelo menos 6 caracteres' }, { status: 400 })
    }

    // Verificar se email já existe
    const existingTeam = await prisma.team.findUnique({
      where: { email }
    })

    if (existingTeam) {
      return NextResponse.json({ error: 'Email já está em uso por outro team' }, { status: 400 })
    }

    // Gerar slug único
    const baseSlug = generateSlug(name)
    const uniqueSlug = await ensureUniqueSlug(baseSlug)

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10)

    // Criar o team
    const team = await prisma.team.create({
      data: {
        name,
        slug: uniqueSlug,
        description: description || null,
        email,
        password: hashedPassword,
        isActive: true
      }
    })

    console.log('✅ Novo team criado:', team.name, `(${team.slug})`)

    // Configurar seções padrão para o novo team
    await setupDefaultSections(team.id)

    // Criar token JWT para login automático
    const token = jwt.sign(
      {
        teamId: team.id,
        slug: team.slug,
        email: team.email
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    // Criar resposta com cookie
    const response = NextResponse.json({
      success: true,
      team: {
        id: team.id,
        name: team.name,
        slug: team.slug,
        email: team.email
      },
      message: 'Team criado com sucesso!'
    })

    // Definir cookie para login automático
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: false, // Para desenvolvimento local
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 dias
      path: '/'
    })

    return response
  } catch (error) {
    console.error('Erro ao criar team:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}