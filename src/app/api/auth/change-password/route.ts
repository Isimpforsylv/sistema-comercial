import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const body = await request.json();
    const { senhaAtual, novaSenha } = body;

    if (!senhaAtual || !novaSenha) {
      return NextResponse.json({ error: 'Campos obrigatórios ausentes' }, { status: 400 });
    }

    if (novaSenha.length < 6) {
      return NextResponse.json({ error: 'A nova senha deve ter pelo menos 6 caracteres' }, { status: 400 });
    }

    // Buscar usuário atual
    const usuario = await (prisma as any).usuarios.findUnique({
      where: { id: user.userId },
      select: { id: true, senha: true },
    });

    if (!usuario) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    // Verificar senha atual
    const senhaValida = await bcrypt.compare(senhaAtual, usuario.senha);
    if (!senhaValida) {
      return NextResponse.json({ error: 'Senha atual incorreta' }, { status: 400 });
    }

    // Hash da nova senha
    const hash = await bcrypt.hash(novaSenha, 10);

    // Atualizar senha
    await (prisma as any).usuarios.update({
      where: { id: user.userId },
      data: { senha: hash },
    });

    return NextResponse.json({ success: true, message: 'Senha alterada com sucesso' });
  } catch (error) {
    console.error('Erro ao alterar senha:', error);
    return NextResponse.json({ error: 'Erro ao alterar senha' }, { status: 500 });
  }
}
