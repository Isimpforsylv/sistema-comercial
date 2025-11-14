import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id?: string; propostaId?: string; melhoriaId?: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });

    // Prefer params; fallback to parsing URL
    const params = context?.params ? await context.params : undefined;
    const nometapa = 'Pendências'; // Nome fixo da etapa
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
      return NextResponse.json({ error: 'Parâmetros inválidos' }, { status: 400 });
    }

    const { datafim, desfinalizar } = body;

    // Se desfinalizar = true, volta ao estado ativo
    if (desfinalizar) {
      await (prisma as any).melhoriaEtapa.updateMany({
        where: {
          idmelhoria: melhoriaId,
          nometapa,
        },
        data: {
          finalizada: false,
          datafim: null,
          atualizadopor: user?.nome || 'Sistema',
        },
      });

      // Atualiza status da melhoria de volta para "em_andamento"
      await (prisma as any).melhoria.update({
        where: { id: melhoriaId },
        data: { status: 'em_andamento' },
      });
    } else {
      // Verificar se há pendências impeditivas não finalizadas
      const pendenciasImpeditivas = await (prisma as any).melhoriaPendencia.findMany({
        where: {
          idmelhoria: melhoriaId,
          impeditiva: true,
          finalizada: false,
        },
      });

      if (pendenciasImpeditivas.length > 0) {
        return NextResponse.json(
          { 
            error: 'Não é possível finalizar com pendências impeditivas em aberto',
            pendenciasImpeditivas: pendenciasImpeditivas.map((p: any) => p.descricao)
          },
          { status: 400 }
        );
      }

      // Finaliza a etapa
      await (prisma as any).melhoriaEtapa.updateMany({
        where: {
          idmelhoria: melhoriaId,
          nometapa,
        },
        data: {
          finalizada: true,
          datafim: new Date(datafim),
          atualizadopor: user?.nome || 'Sistema',
        },
      });

      // Atualiza status da melhoria para "finalizado"
      await (prisma as any).melhoria.update({
        where: { id: melhoriaId },
        data: { status: 'finalizado' },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao finalizar/desfinalizar etapa:', error);
    return NextResponse.json({ error: 'Erro ao finalizar/desfinalizar etapa' }, { status: 500 });
  }
}
