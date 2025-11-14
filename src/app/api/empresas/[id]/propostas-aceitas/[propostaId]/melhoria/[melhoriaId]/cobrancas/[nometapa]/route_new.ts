import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id?: string; propostaId?: string; melhoriaId?: string; nometapa?: string }> }
) {
  try {
    const params = context?.params ? await context.params : undefined;
    let nometapa = params?.nometapa ? decodeURIComponent(params.nometapa) : undefined as unknown as string;
    let melhoriaId = params?.melhoriaId ? Number(params.melhoriaId) : NaN;
    if (!nometapa || !melhoriaId) {
      const url = new URL(request.url);
      const parts = url.pathname.split('/').filter(Boolean);
      const idxMelhoria = parts.indexOf('melhoria');
      const idxCobrancas = parts.indexOf('cobrancas');
      if (!melhoriaId && idxMelhoria >= 0 && parts[idxMelhoria + 1]) {
        melhoriaId = Number(parts[idxMelhoria + 1]);
      }
      if (!nometapa && idxCobrancas >= 0 && parts[idxCobrancas + 1]) {
        nometapa = decodeURIComponent(parts[idxCobrancas + 1]);
      }
    }

    if (!melhoriaId || !nometapa) {
      return NextResponse.json({ error: 'Parâmetros inválidos' }, { status: 400 });
    }

    // Buscar etapa
    const etapa = await (prisma as any).melhoriaEtapa.findFirst({
      where: {
        idmelhoria: melhoriaId,
        nometapa,
      },
    });

    if (!etapa) {
      return NextResponse.json([], { status: 200 });
    }

    const cobrancas = await (prisma as any).melhoriaCobranca.findMany({
      where: {
        idetapa: etapa.id,
      },
      orderBy: { criadoem: 'desc' },
    });

    return NextResponse.json(cobrancas);
  } catch (error) {
    console.error('Erro ao buscar cobranças:', error);
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id?: string; propostaId?: string; melhoriaId?: string; nometapa?: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    const params = context?.params ? await context.params : undefined;
    let nometapa = params?.nometapa ? decodeURIComponent(params.nometapa) : undefined as unknown as string;
    let melhoriaId = params?.melhoriaId ? Number(params.melhoriaId) : NaN;
    if (!nometapa || !melhoriaId) {
      const url = new URL(request.url);
      const parts = url.pathname.split('/').filter(Boolean);
      const idxMelhoria = parts.indexOf('melhoria');
      const idxCobrancas = parts.indexOf('cobrancas');
      if (!melhoriaId && idxMelhoria >= 0 && parts[idxMelhoria + 1]) {
        melhoriaId = Number(parts[idxMelhoria + 1]);
      }
      if (!nometapa && idxCobrancas >= 0 && parts[idxCobrancas + 1]) {
        nometapa = decodeURIComponent(parts[idxCobrancas + 1]);
      }
    }
    const body = await request.json();

    if (!melhoriaId || !nometapa) {
      return NextResponse.json({ error: 'Parâmetros inválidos' }, { status: 400 });
    }

    const { datacobranca, quandofcobrado, proximacobranca, observacao } = body;

    // Buscar etapa
    const etapa = await (prisma as any).melhoriaEtapa.findFirst({
      where: {
        idmelhoria: melhoriaId,
        nometapa,
      },
    });

    if (!etapa) {
      return NextResponse.json({ error: 'Etapa não encontrada' }, { status: 404 });
    }

    // Salvar cobrança
    const novaCobranca = await (prisma as any).melhoriaCobranca.create({
      data: {
        idetapa: etapa.id,
        datacobranca: new Date(datacobranca),
        quandofcobrado: new Date(quandofcobrado),
        proximacobranca: new Date(proximacobranca),
        observacao: observacao || null,
        criadopor: user?.nome || 'Sistema',
        atualizadopor: user?.nome || 'Sistema',
      },
    });

    // Atualizar campo "cobrar em" da etapa
    await (prisma as any).melhoriaEtapa.updateMany({
      where: {
        idmelhoria: melhoriaId,
        nometapa,
      },
      data: {
        cobrarem: new Date(proximacobranca),
      },
    });

    // Adicionar observação automática na etapa
    const dataCobradoFormatada = new Date(quandofcobrado).toLocaleDateString('pt-BR');
    const obsTexto = `Cliente cobrado em ${dataCobradoFormatada}${observacao ? `: ${observacao}` : ''}`;
    
    await (prisma as any).melhoriaObservacao.create({
      data: {
        idmelhoria: melhoriaId,
        nometapa,
        observacao: obsTexto,
        criadopor: user?.nome || 'Sistema',
      },
    });

    return NextResponse.json(novaCobranca, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar cobrança:', error);
    return NextResponse.json({ error: 'Erro ao criar cobrança' }, { status: 500 });
  }
}
