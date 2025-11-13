import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { prisma } from '../../../../../lib/prisma'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value

    console.log('🔍 API /auth/me: Verificando token...', token ? 'presente' : 'ausente')

    if (!token) {
      console.log('❌ API /auth/me: Token não encontrado')
      return NextResponse.json({ error: 'Token não encontrado' }, { status: 401 })
    }

    // Verificar token com validação rigorosa
    const decoded = jwt.verify(token, JWT_SECRET) as any
    console.log('✅ API /auth/me: Token decodificado para team:', decoded.slug)

    // Verificar se o token não expirou (validação extra)
    if (decoded.exp && Date.now() >= decoded.exp * 1000) {
      console.log('❌ API /auth/me: Token expirado')
      return NextResponse.json({ error: 'Token expirado' }, { status: 401 })
    }

    // Buscar team no banco
    const team = await prisma.team.findUnique({
      where: { id: decoded.teamId },
      select: {
        id: true,
        name: true,
        slug: true,
        email: true,
        isActive: true
      }
    })

    if (!team || !team.isActive) {
      console.log('❌ API /auth/me: Team não encontrado ou inativo')
      return NextResponse.json({ error: 'Team não encontrado ou inativo' }, { status: 401 })
    }

    console.log('✅ API /auth/me: Retornando team válido:', team.slug)
    return NextResponse.json({ team })
  } catch (error) {
    console.error('❌ API /auth/me: Erro ao verificar autenticação:', error)
    return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
  }
}