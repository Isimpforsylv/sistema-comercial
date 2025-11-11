import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const urlParts = request.url.split('/');
    const nometapa = decodeURIComponent(urlParts[urlParts.length - 1]);
    const checklistId = Number(urlParts[urlParts.length - 3]);

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

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    const urlParts = request.url.split('/');
    const nometapa = decodeURIComponent(urlParts[urlParts.length - 1]);
    const checklistId = Number(urlParts[urlParts.length - 3]);
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
