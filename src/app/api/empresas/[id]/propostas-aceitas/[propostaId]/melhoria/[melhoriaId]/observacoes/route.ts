import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

// GET - Observações por melhoria
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

    const observacoes = await (prisma as any).melhoriaObservacao.findMany({
      where: { idmelhoria: melhoriaId },
      select: {
        id: true,
        nometapa: true,
        observacao: true,
        criadopor: true,
        criadoem: true,
      },
      orderBy: { criadoem: 'asc' },
    });

    return NextResponse.json(observacoes);
  } catch (error) {
    console.error('Erro ao buscar observações:', error);
    return NextResponse.json([], { status: 500 });
  }
}

// POST - Criar observação
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

    const { nometapa, observacao } = body;

    const novaObservacao = await (prisma as any).melhoriaObservacao.create({
      data: {
        idmelhoria: melhoriaId,
        nometapa,
        observacao,
        criadopor: user?.nome || 'Sistema',
      },
    });

    return NextResponse.json(novaObservacao, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar observação:', error);
    return NextResponse.json({ error: 'Erro ao criar observação' }, { status: 500 });
  }
}
