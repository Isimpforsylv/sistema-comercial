import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ checklistId?: string; nometapa?: string }> }
) {
  try {
    const params = context?.params ? await context.params : undefined;
    let nometapa = params?.nometapa ? decodeURIComponent(params.nometapa) : undefined as unknown as string;
    let checklistId = params?.checklistId ? Number(params.checklistId) : NaN;
    if (!nometapa || !checklistId) {
      const url = new URL(request.url);
      const parts = url.pathname.split('/').filter(Boolean);
      const idxChecklist = parts.indexOf('checklist');
      const idxCobrancas = parts.indexOf('cobrancas');
      if (!checklistId && idxChecklist >= 0 && parts[idxChecklist + 1]) {
        checklistId = Number(parts[idxChecklist + 1]);
      }
      if (!nometapa && idxCobrancas >= 0 && parts[idxCobrancas + 1]) {
        nometapa = decodeURIComponent(parts[idxCobrancas + 1]);
      }
    }

    if (!checklistId || !nometapa) {
      return NextResponse.json({ error: 'Parâmetros inválidos' }, { status: 400 });
    }

    const cobrancas = await (prisma as any).checklistCobrancas.findMany({
      where: {
        idchecklist: checklistId,
        nometapa,
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
  context: { params: Promise<{ checklistId?: string; nometapa?: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    const params = context?.params ? await context.params : undefined;
    let nometapa = params?.nometapa ? decodeURIComponent(params.nometapa) : undefined as unknown as string;
    let checklistId = params?.checklistId ? Number(params.checklistId) : NaN;
    if (!nometapa || !checklistId) {
      const url = new URL(request.url);
      const parts = url.pathname.split('/').filter(Boolean);
      const idxChecklist = parts.indexOf('checklist');
      const idxCobrancas = parts.indexOf('cobrancas');
      if (!checklistId && idxChecklist >= 0 && parts[idxChecklist + 1]) {
        checklistId = Number(parts[idxChecklist + 1]);
      }
      if (!nometapa && idxCobrancas >= 0 && parts[idxCobrancas + 1]) {
        nometapa = decodeURIComponent(parts[idxCobrancas + 1]);
      }
    }
    const body = await request.json();

    if (!checklistId || !nometapa) {
      return NextResponse.json({ error: 'Parâmetros inválidos' }, { status: 400 });
    }

    const { datacobranca, quandofcobrado, proximacobranca, observacao } = body;

    // Salvar cobrança
    const novaCobranca = await (prisma as any).checklistCobrancas.create({
      data: {
        idchecklist: checklistId,
        nometapa,
        datacobranca: new Date(datacobranca),
        quandofcobrado: new Date(quandofcobrado),
        proximacobranca: new Date(proximacobranca),
        observacao: observacao || null,
        criadopor: user?.nome || 'Sistema',
        atualizadopor: user?.nome || 'Sistema',
      },
    });

    // Atualizar campo "cobrar em" da etapa
    await prisma.checklistEtapas.updateMany({
      where: {
        idchecklist: checklistId,
        nometapa,
      },
      data: {
        cobrarem: new Date(proximacobranca),
      },
    });

    // Adicionar observação automática na etapa
    const dataCobradoFormatada = new Date(quandofcobrado).toLocaleDateString('pt-BR');
    const obsTexto = `Cliente cobrado em ${dataCobradoFormatada}${observacao ? `: ${observacao}` : ''}`;
    
    await prisma.checklistObservacoes.create({
      data: {
        idchecklist: checklistId,
        nometapa,
        observacao: obsTexto,
        criadopor: user?.nome || 'Sistema',
        atualizadopor: user?.nome || 'Sistema',
      },
    });

    return NextResponse.json(novaCobranca, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar cobrança:', error);
    return NextResponse.json({ error: 'Erro ao criar cobrança' }, { status: 500 });
  }
}
