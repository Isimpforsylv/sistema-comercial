import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const SECRET_KEY = process.env.JWT_SECRET || 'sua-chave-secreta-super-segura-aqui-mude-em-producao';
const key = new TextEncoder().encode(SECRET_KEY);

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rotas públicas que não precisam de autenticação
  const publicRoutes = ['/login', '/api/auth/login', '/api/auth/logout'];
  
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Verificar token no cookie
  const token = request.cookies.get('auth-token')?.value;

  // Log temporário para debug
  if (process.env.NODE_ENV === 'development') {
    console.log('🔒 Proxy check:', { 
      pathname, 
      hasToken: !!token,
      tokenPreview: token ? token.substring(0, 20) + '...' : 'none'
    });
  }

  if (!token) {
    // Se for uma rota de API, retorna 401 ao invés de redirecionar
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }
    // Redirecionar para login se não houver token
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    // Verificar se o token é válido
    await jwtVerify(token, key);
    return NextResponse.next();
  } catch (error) {
    console.error('❌ Token inválido:', error);
    // Token inválido ou expirado
    const response = pathname.startsWith('/api/')
      ? NextResponse.json({ error: 'Token inválido' }, { status: 401 })
      : NextResponse.redirect(new URL('/login', request.url));
    
    response.cookies.delete('auth-token');
    return response;
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
