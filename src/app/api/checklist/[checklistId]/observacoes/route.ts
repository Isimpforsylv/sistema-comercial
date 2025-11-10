import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const urlParts = request.url.split('/');
    const checklistId = Number(urlParts[urlParts.length - 2]);

    if (!checklistId) {
      return NextResponse.json({ error: 'ID do checklist inválido' }, { status: 400 });
    }

    const observacoes = await prisma.checklistObservacoes.findMany({
      where: { idchecklist: checklistId },
      orderBy: { criadoem: 'desc' },
    });

    return NextResponse.json(observacoes);
  } catch (error) {
    console.error('Erro ao buscar observações:', error);
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    const urlParts = request.url.split('/');
    const checklistId = Number(urlParts[urlParts.length - 2]);
    const body = await request.json();

    if (!checklistId) {
      return NextResponse.json({ error: 'ID do checklist inválido' }, { status: 400 });
    }

    const { nometapa, observacao } = body;

    const novaObservacao = await prisma.checklistObservacoes.create({
      data: {
        idchecklist: checklistId,
        nometapa,
        observacao,
        criadopor: user?.nome || 'Sistema',
        atualizadopor: user?.nome || 'Sistema',
      },
    });

    return NextResponse.json(novaObservacao, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar observação:', error);
    return NextResponse.json({ error: 'Erro ao criar observação' }, { status: 500 });
  }
}
