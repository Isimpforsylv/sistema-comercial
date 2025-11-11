import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

// GET - Listar todas as pendências de um checklist
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ checklistId: string }> }
) {
  try {
    const params = await context.params;
    const checklistId = Number(params.checklistId);

    if (!checklistId) {
      return NextResponse.json({ error: 'ID do checklist inválido' }, { status: 400 });
    }

    const pendencias = await (prisma as any).checklistPendencias.findMany({
      where: { idchecklist: checklistId },
      orderBy: { criadoem: 'asc' },
    });

    return NextResponse.json(pendencias);
  } catch (error) {
    console.error('Erro ao buscar pendências:', error);
    return NextResponse.json([], { status: 500 });
  }
}

// POST - Criar nova pendência
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ checklistId: string }> }
) {
  try {
    const user = await getCurrentUser();
    const params = await context.params;
    const checklistId = Number(params.checklistId);
    const body = await request.json();

    if (!checklistId) {
      return NextResponse.json({ error: 'ID do checklist inválido' }, { status: 400 });
    }

    const { descricao, impeditiva } = body;

    const novaPendencia = await (prisma as any).checklistPendencias.create({
      data: {
        idchecklist: checklistId,
        descricao,
        impeditiva: impeditiva || false,
        criadopor: user?.nome || 'Sistema',
      },
    });

    return NextResponse.json(novaPendencia, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar pendência:', error);
    return NextResponse.json({ error: 'Erro ao criar pendência' }, { status: 500 });
  }
}
