import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

// GET - Buscar melhoria por ID
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id?: string; propostaId?: string; melhoriaId?: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const params = context?.params ? await context.params : undefined;
    const melhoriaId = params?.melhoriaId ? Number(params.melhoriaId) : NaN;

    if (!melhoriaId) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    const melhoria = await (prisma as any).melhoria.findUnique({
      where: { id: melhoriaId },
      include: {
        etapas: true,
      },
    });

    if (!melhoria) {
      return NextResponse.json({ error: 'Melhoria não encontrada' }, { status: 404 });
    }

    return NextResponse.json(melhoria);
  } catch (error) {
    console.error('Erro ao buscar melhoria:', error);
    return NextResponse.json({ error: 'Erro ao buscar melhoria' }, { status: 500 });
  }
}

// PUT - Atualizar melhoria
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id?: string; propostaId?: string; melhoriaId?: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const params = context?.params ? await context.params : undefined;
    const melhoriaId = params?.melhoriaId ? Number(params.melhoriaId) : NaN;
    const body = await request.json();

    if (!melhoriaId) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    const { codigoespecificacao } = body;

    const melhoria = await (prisma as any).melhoria.update({
      where: { id: melhoriaId },
      data: {
        codigoespecificacao,
      },
    });

    return NextResponse.json(melhoria);
  } catch (error) {
    console.error('Erro ao atualizar melhoria:', error);
    return NextResponse.json({ error: 'Erro ao atualizar melhoria' }, { status: 500 });
  }
}
