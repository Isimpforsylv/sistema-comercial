import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import bcrypt from 'bcryptjs';

// Update or delete a user (admin only)
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id?: string }> }
) {
  const user = await getCurrentUser();
  console.log('[api/admin/usuarios/[id]] PUT by user:', user?.userId, 'admin=', user?.admin);
  if (!user || !user.admin) {
    console.warn('[api/admin/usuarios/[id]] PUT access forbidden');
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const params = context?.params ? await context.params : undefined;
    const id = params?.id ? Number(params.id) : NaN;
    if (!id) return NextResponse.json({ error: 'ID inválido' }, { status: 400 });

    const body = await request.json();
    const { nome, email, admin, ativo, senha, confirmarSenha } = body as {
      nome?: string;
      email?: string;
      admin?: boolean;
      ativo?: boolean;
      senha?: string;
      confirmarSenha?: string;
    };

    const data: any = {};
    if (nome !== undefined) data.nome = nome;
    if (email !== undefined) data.email = email;
    if (admin !== undefined) data.admin = !!admin;
    if (ativo !== undefined) data.ativo = !!ativo;
    if (senha !== undefined) {
      if (!senha) return NextResponse.json({ error: 'Senha vazia' }, { status: 400 });
      if (confirmarSenha !== undefined && confirmarSenha !== senha) {
        return NextResponse.json({ error: 'Senhas não conferem' }, { status: 400 });
      }
      data.senha = await bcrypt.hash(senha, 10);
    }

    const atualizado = await (prisma as any).usuarios.update({
      where: { id },
      data,
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

    // Se o usuário foi desativado, forçar logout invalidando a sessão
    if (ativo === false) {
      // Limpar o cookie de sessão do usuário desativado
      const response = NextResponse.json(atualizado);
      response.cookies.set('session_invalidated_' + id, Date.now().toString(), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 dias
        path: '/',
      });
      return response;
    }

    return NextResponse.json(atualizado);
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    return NextResponse.json({ error: 'Erro ao atualizar usuário' }, { status: 500 });
  }
}

// DELETE /api/admin/usuarios/[id] -> excluir usuário (admin only)
export async function DELETE(request: NextRequest, context: { params: Promise<{ id?: string }> }) {
  try {
    const user = await getCurrentUser();
    console.log('[api/admin/usuarios/[id]] DELETE by user:', user?.userId, 'admin=', user?.admin);
    if (!user || !user.admin) {
      console.warn('[api/admin/usuarios/[id]] DELETE access forbidden');
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const params = context?.params ? await context.params : undefined;
    const id = params?.id ? Number(params.id) : NaN;
    if (!id) return NextResponse.json({ error: 'ID inválido' }, { status: 400 });

    await (prisma as any).usuarios.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao excluir usuário:', error);
    return NextResponse.json({ error: 'Erro ao excluir usuário' }, { status: 500 });
  }
}
