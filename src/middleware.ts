import { NextRequest, NextResponse } from 'next/server'
import { isValidJWTFormat, decodeJWTPayload, isTokenExpired } from './lib/middleware-auth'

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Permitir APIs, assets, página de login e registro
  if (pathname.startsWith('/api/') ||
      pathname.startsWith('/_next/') ||
      pathname.startsWith('/favicon.ico') ||
      pathname === '/login' ||
      pathname === '/register') {
    return NextResponse.next()
  }

  // Verificar autenticação para todas as outras rotas
  const token = request.cookies.get('auth-token')?.value

  console.log('🔍 Middleware: Verificando token...', token ? 'presente' : 'ausente')

  if (!token) {
    console.log('❌ Middleware: Token não encontrado, redirecionando para login')
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Validação básica do formato JWT (compatível com Edge Runtime)
  if (!isValidJWTFormat(token)) {
    console.log('❌ Middleware: Token com formato inválido')
    return NextResponse.redirect(new URL('/login', request.url))
  }

  try {
    const payload = decodeJWTPayload(token)

    if (!payload) {
      console.log('❌ Middleware: Não foi possível decodificar o payload')
      return NextResponse.redirect(new URL('/login', request.url))
    }

    if (isTokenExpired(payload)) {
      console.log('❌ Middleware: Token expirado')
      return NextResponse.redirect(new URL('/login', request.url))
    }

    const userSlug = payload.slug

    if (!userSlug) {
      console.log('❌ Middleware: Slug não encontrado no token')
      return NextResponse.redirect(new URL('/login', request.url))
    }

    console.log('✅ Middleware: Token decodificado para team:', userSlug)

    // Se está tentando acessar um team específico
    if (pathname.startsWith('/team/')) {
      const requestedSlug = pathname.split('/')[2]

      // Verificar se o usuário tem acesso ao team solicitado
      if (requestedSlug && requestedSlug !== userSlug) {
        // Redirecionar para o team correto do usuário
        const newPath = pathname.replace(`/team/${requestedSlug}`, `/team/${userSlug}`)
        return NextResponse.redirect(new URL(newPath, request.url))
      }

      return NextResponse.next()
    }

    // Redirecionar rotas antigas para o team do usuário autenticado
    if (pathname === '/' || pathname.startsWith('/section/') || pathname.startsWith('/admin/')) {
      const newUrl = new URL(`/team/${userSlug}${pathname === '/' ? '' : pathname}`, request.url)
      return NextResponse.redirect(newUrl)
    }

    // Para qualquer outra rota, redirecionar para o team do usuário
    return NextResponse.redirect(new URL(`/team/${userSlug}`, request.url))

  } catch (error) {
    // Token malformado ou inválido, redirecionar para login
    console.log('❌ Middleware: Erro ao processar token:', error)
    return NextResponse.redirect(new URL('/login', request.url))
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}