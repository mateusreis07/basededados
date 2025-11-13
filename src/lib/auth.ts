import jwt from 'jsonwebtoken'
import { NextRequest } from 'next/server'
import { prisma } from './prisma'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export interface AuthUser {
  teamId: string
  slug: string
  email: string
}

export async function getAuthUser(request: NextRequest): Promise<AuthUser | null> {
  try {
    const token = request.cookies.get('auth-token')?.value

    if (!token) {
      return null
    }

    const decoded = jwt.verify(token, JWT_SECRET) as AuthUser

    // Verificar se o team ainda existe e está ativo
    const team = await prisma.team.findUnique({
      where: { id: decoded.teamId },
      select: { id: true, isActive: true }
    })

    if (!team || !team.isActive) {
      return null
    }

    return decoded
  } catch (error) {
    return null
  }
}

export async function requireAuth(request: NextRequest): Promise<AuthUser> {
  const user = await getAuthUser(request)

  if (!user) {
    throw new Error('Authentication required')
  }

  return user
}