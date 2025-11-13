import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id?: string; propostaId?: string }> }
) {
  try {
    const params = context?.params ? await context.params : undefined;
    const propostaId = params?.propostaId ? Number(params.propostaId) : NaN;
    
    if (!propostaId) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    const proposta = await (prisma as any).propostasAceitas.findUnique({
      where: { id: propostaId },
      select: {
        codproposta: true,
        dataenvioproj: true,
        dataenviofinanceiro: true,
        finalizado: true,
      },
    });

    if (!proposta || !proposta.finalizado) {
      return NextResponse.json({ finalizado: false });
    }

    const valores = await (prisma as any).valoresPropostasAceitas.findMany({
      where: { idproposta: propostaId },
      include: {
        recursos: {
          select: {
            id: true,
            nomerecurso: true,
            valor: true,
            formapagamento: true,
            prazo: true,
            valorfinal: true,
            formafinal: true,
            prazofinal: true,
          },
        },
      },
      orderBy: { criadoem: 'desc' },
    });

    return NextResponse.json({
      ...proposta,
      valores,
    });
  } catch (error) {
    console.error('Erro ao buscar resumo:', error);
    return NextResponse.json({ error: 'Erro ao buscar resumo' }, { status: 500 });
  }
}
