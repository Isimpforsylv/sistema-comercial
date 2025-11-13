import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { prisma } from './prisma';

const SECRET_KEY = process.env.JWT_SECRET || 'sua-chave-secreta-super-segura-aqui-mude-em-producao';
const key = new TextEncoder().encode(SECRET_KEY);

export interface TokenPayload {
  userId: number;
  email: string;
  nome: string;
  admin: boolean;
}

export async function createToken(payload: TokenPayload): Promise<string> {
  return await new SignJWT({ ...payload } as any)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('10d') // 10 dias
    .sign(key);
}

export async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const verified = await jwtVerify(token, key);
    return verified.payload as unknown as TokenPayload;
  } catch (error) {
    return null;
  }
}

export async function setAuthCookie(token: string) {
  const cookieStore = await cookies();
  console.log('🍪 Setando cookie auth-token');
  cookieStore.set('auth-token', token, {
    httpOnly: true,
    secure: false, // Desabilitado para desenvolvimento local
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 10, // 10 dias em segundos
    path: '/',
  });
  console.log('✅ Cookie setado com sucesso');
}

export async function getAuthCookie(): Promise<string | null> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get('auth-token');
  console.log('🔍 Buscando cookie:', cookie ? 'ENCONTRADO' : 'NÃO ENCONTRADO');
  return cookie?.value || null;
}

export async function removeAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete('auth-token');
}

export async function getCurrentUser(): Promise<TokenPayload | null> {
  const token = await getAuthCookie();
  if (!token) return null;
  
  const payload = await verifyToken(token);
  if (!payload) return null;
  
  // Verificar se o usuário ainda está ativo no banco
  try {
    const user = await (prisma as any).usuarios.findUnique({
      where: { id: payload.userId },
      select: { ativo: true },
    });
    
    // Se o usuário foi desativado, invalidar sessão
    if (!user || !user.ativo) {
      await removeAuthCookie();
      return null;
    }
    
    // Verificar cookie de invalidação manual
    const cookieStore = await cookies();
    const invalidationCookie = cookieStore.get('session_invalidated_' + payload.userId);
    if (invalidationCookie) {
      await removeAuthCookie();
      return null;
    }
  } catch (error) {
    console.error('Erro ao verificar status do usuário:', error);
  }
  
  return payload;
}
