import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

// GET - Buscar status da melhoria
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
      select: { status: true },
    });

    if (!melhoria) {
      return NextResponse.json({ error: 'Melhoria não encontrada' }, { status: 404 });
    }

    return NextResponse.json({ status: melhoria.status });
  } catch (error) {
    console.error('Erro ao buscar status:', error);
    return NextResponse.json({ error: 'Erro ao buscar status' }, { status: 500 });
  }
}

// PUT - Atualizar status da melhoria
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

    const { status, dataretorno } = body;

    // Se estiver tentando finalizar, validar pendências e etapas
    if (status === 'finalizado') {
      // Verificar pendências impeditivas não finalizadas
      const pendenciasImpeditivas = await (prisma as any).melhoriaPendencia.findMany({
        where: {
          idmelhoria: melhoriaId,
          impeditiva: true,
          finalizada: false,
        },
        select: {
          descricao: true,
        },
      });

      if (pendenciasImpeditivas.length > 0) {
        return NextResponse.json(
          {
            error: 'Não é possível finalizar com pendências impeditivas em aberto',
            pendenciasImpeditivas: pendenciasImpeditivas.map((p: any) => p.descricao),
          },
          { status: 400 }
        );
      }

      // Verificar etapas não finalizadas
      const etapasNaoFinalizadas = await (prisma as any).melhoriaEtapa.findMany({
        where: {
          idmelhoria: melhoriaId,
          finalizada: false,
        },
        select: {
          nometapa: true,
        },
      });

      if (etapasNaoFinalizadas.length > 0) {
        return NextResponse.json(
          {
            error: 'Não é possível finalizar com etapas não finalizadas',
            etapasNaoFinalizadas: etapasNaoFinalizadas.map((e: any) => e.nometapa),
          },
          { status: 400 }
        );
      }
    }

    const melhoria = await (prisma as any).melhoria.update({
      where: { id: melhoriaId },
      data: {
        status,
        dataretorno: dataretorno ? new Date(dataretorno) : null,
      },
    });

    return NextResponse.json({ status: melhoria.status });
  } catch (error) {
    console.error('Erro ao atualizar status:', error);
    return NextResponse.json({ error: 'Erro ao atualizar status' }, { status: 500 });
  }
}
