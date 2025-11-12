import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import bcrypt from 'bcryptjs';

// Admin-only: list and create users
export async function GET() {
  const user = await getCurrentUser();
  console.log('[api/admin/usuarios] GET call by user:', user?.userId, 'admin=', user?.admin);
  if (!user || !user.admin) {
    console.warn('[api/admin/usuarios] access forbidden');
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const usuarios = await (prisma as any).usuarios.findMany({
      orderBy: { criadoem: 'desc' },
      select: {
        id: true,
        nome: true,
        email: true,
        admin: true,
        ativo: true,
        criadoem: true,
        atualizadoem: true,
      },
    });

    return NextResponse.json(usuarios);
  } catch (error) {
    console.error('[api/admin/usuarios] GET error:', error);
    return NextResponse.json({ error: 'Erro ao buscar usuários' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  console.log('[api/admin/usuarios] POST call by user:', user?.userId, 'admin=', user?.admin);
  if (!user || !user.admin) {
    console.warn('[api/admin/usuarios] POST access forbidden');
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { nome, email, senha, confirmarSenha, admin = false } = body;

    if (!nome || !email || !senha || !confirmarSenha) {
      return NextResponse.json({ error: 'Campos obrigatórios ausentes' }, { status: 400 });
    }
    if (senha !== confirmarSenha) {
      return NextResponse.json({ error: 'Senhas não conferem' }, { status: 400 });
    }

    const existing = await (prisma as any).usuarios.findUnique({ where: { email }, select: { id: true } });
    if (existing) {
      return NextResponse.json({ error: 'E-mail já cadastrado' }, { status: 409 });
    }

    const hash = await bcrypt.hash(senha, 10);

    const created = await (prisma as any).usuarios.create({
      data: {
        nome,
        email,
        senha: hash,
        admin: !!admin,
        ativo: true,
      },
      select: { id: true, nome: true, email: true, admin: true, ativo: true, criadoem: true, atualizadoem: true },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (e) {
    console.error('Erro ao criar usuário:', e);
    return NextResponse.json({ error: 'Erro ao criar usuário' }, { status: 500 });
  }
}
