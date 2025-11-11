import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

// PUT - Atualizar pendência
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ checklistId: string; pendenciaId: string }> }
) {
  try {
    const user = await getCurrentUser();
    const params = await context.params;
    const pendenciaId = Number(params.pendenciaId);
    const body = await request.json();

    if (!pendenciaId) {
      return NextResponse.json({ error: 'ID da pendência inválido' }, { status: 400 });
    }

    const { descricao, finalizada } = body;
    
    const data: any = {};
    
    if (descricao !== undefined) {
      data.descricao = descricao;
    }
    
    if (finalizada !== undefined) {
      data.finalizada = finalizada;
      if (finalizada && !data.finalizadopor) {
        data.finalizadopor = user?.nome || 'Sistema';
      }
      if (!finalizada) {
        data.finalizadopor = null;
      }
    }

    const pendenciaAtualizada = await (prisma as any).checklistPendencias.update({
      where: { id: pendenciaId },
      data,
    });

    return NextResponse.json(pendenciaAtualizada);
  } catch (error) {
    console.error('Erro ao atualizar pendência:', error);
    return NextResponse.json({ error: 'Erro ao atualizar pendência' }, { status: 500 });
  }
}

// DELETE - Remover pendência
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ checklistId: string; pendenciaId: string }> }
) {
  try {
    const params = await context.params;
    const pendenciaId = Number(params.pendenciaId);

    if (!pendenciaId) {
      return NextResponse.json({ error: 'ID da pendência inválido' }, { status: 400 });
    }

    await (prisma as any).checklistPendencias.delete({
      where: { id: pendenciaId },
    });

    return NextResponse.json({ message: 'Pendência removida com sucesso' });
  } catch (error) {
    console.error('Erro ao remover pendência:', error);
    return NextResponse.json({ error: 'Erro ao remover pendência' }, { status: 500 });
  }
}
