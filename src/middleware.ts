import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const SECRET_KEY = process.env.JWT_SECRET || 'sua-chave-secreta-super-segura-aqui-mude-em-producao';
const key = new TextEncoder().encode(SECRET_KEY);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rotas públicas que não precisam de autenticação
  const publicRoutes = ['/login', '/api/auth/login'];
  
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Verificar token no cookie
  const token = request.cookies.get('auth-token')?.value;

  if (!token) {
    // Redirecionar para login se não houver token
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    // Verificar se o token é válido
    await jwtVerify(token, key);
    return NextResponse.next();
  } catch (error) {
    // Token inválido ou expirado, redirecionar para login
    const response = NextResponse.redirect(new URL('/login', request.url));
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
