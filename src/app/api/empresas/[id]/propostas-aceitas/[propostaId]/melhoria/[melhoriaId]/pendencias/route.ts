import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

// GET - Listar todas as pendências de uma melhoria
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id?: string; propostaId?: string; melhoriaId?: string }> }
) {
  try {
    const params = context?.params ? await context.params : undefined;
    let melhoriaId = params?.melhoriaId ? Number(params.melhoriaId) : NaN;
    if (!melhoriaId) {
      const url = new URL(request.url);
      const parts = url.pathname.split('/').filter(Boolean);
      const idxMelhoria = parts.indexOf('melhoria');
      if (!melhoriaId && idxMelhoria >= 0 && parts[idxMelhoria + 1]) {
        melhoriaId = Number(parts[idxMelhoria + 1]);
      }
    }

    if (!melhoriaId) {
      return NextResponse.json({ error: 'ID da melhoria inválido' }, { status: 400 });
    }

    const pendencias = await (prisma as any).melhoriaPendencia.findMany({
      where: { idmelhoria: melhoriaId },
      orderBy: { criadoem: 'asc' },
    });

    return NextResponse.json(pendencias);
  } catch (error) {
    console.error('Erro ao buscar pendências:', error);
    return NextResponse.json([], { status: 500 });
  }
}

// POST - Criar nova pendência
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id?: string; propostaId?: string; melhoriaId?: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    const params = context?.params ? await context.params : undefined;
    let melhoriaId = params?.melhoriaId ? Number(params.melhoriaId) : NaN;
    if (!melhoriaId) {
      const url = new URL(request.url);
      const parts = url.pathname.split('/').filter(Boolean);
      const idxMelhoria = parts.indexOf('melhoria');
      if (!melhoriaId && idxMelhoria >= 0 && parts[idxMelhoria + 1]) {
        melhoriaId = Number(parts[idxMelhoria + 1]);
      }
    }
    const body = await request.json();

    if (!melhoriaId) {
      return NextResponse.json({ error: 'ID da melhoria inválido' }, { status: 400 });
    }

    const { descricao, impeditiva } = body;

    const novaPendencia = await (prisma as any).melhoriaPendencia.create({
      data: {
        idmelhoria: melhoriaId,
        descricao,
        impeditiva: impeditiva || false,
        criadopor: user?.nome || 'Sistema',
      },
    });

    return NextResponse.json(novaPendencia, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar pendência:', error);
    return NextResponse.json({ error: 'Erro ao criar pendência' }, { status: 500 });
  }
}
