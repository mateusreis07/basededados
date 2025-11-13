import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../lib/prisma'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json({ error: 'Email e senha são obrigatórios' }, { status: 400 })
    }

    // Buscar team pelo email
    const team = await prisma.team.findUnique({
      where: { email }
    })

    if (!team) {
      return NextResponse.json({ error: 'Email ou senha incorretos' }, { status: 401 })
    }

    if (!team.password) {
      return NextResponse.json({ error: 'Team não possui senha configurada. Entre em contato com o administrador.' }, { status: 401 })
    }

    if (!team.isActive) {
      return NextResponse.json({ error: 'Team está inativo. Entre em contato com o administrador.' }, { status: 401 })
    }

    // Verificar senha
    const isValidPassword = await bcrypt.compare(password, team.password)

    if (!isValidPassword) {
      return NextResponse.json({ error: 'Email ou senha incorretos' }, { status: 401 })
    }

    // Criar token JWT
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
      }
    })

    // Definir cookie seguro
    console.log('🍪 API Login: Definindo cookie auth-token')
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: false, // Para desenvolvimento local
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 dias
      path: '/'
    })

    console.log('✅ API Login: Cookie definido, respondendo com sucesso')
    return response
  } catch (error) {
    console.error('Erro no login:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}