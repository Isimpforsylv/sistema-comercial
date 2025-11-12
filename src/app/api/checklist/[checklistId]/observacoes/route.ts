import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

// GET - Observações por checklist
export async function GET(
  request: NextRequest,
  context: { params?: { checklistId?: string } }
) {
  try {
    let checklistId = context?.params?.checklistId ? Number(context.params.checklistId) : NaN;
    if (!checklistId) {
      const url = new URL(request.url);
      const parts = url.pathname.split('/').filter(Boolean);
      const idxChecklist = parts.indexOf('checklist');
      if (!checklistId && idxChecklist >= 0 && parts[idxChecklist + 1]) {
        checklistId = Number(parts[idxChecklist + 1]);
      }
    }

    if (!checklistId) {
      return NextResponse.json({ error: 'ID do checklist inválido' }, { status: 400 });
    }

    const observacoes = await prisma.checklistObservacoes.findMany({
      where: { idchecklist: checklistId },
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
  context: { params?: { checklistId?: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    let checklistId = context?.params?.checklistId ? Number(context.params.checklistId) : NaN;
    if (!checklistId) {
      const url = new URL(request.url);
      const parts = url.pathname.split('/').filter(Boolean);
      const idxChecklist = parts.indexOf('checklist');
      if (!checklistId && idxChecklist >= 0 && parts[idxChecklist + 1]) {
        checklistId = Number(parts[idxChecklist + 1]);
      }
    }
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
