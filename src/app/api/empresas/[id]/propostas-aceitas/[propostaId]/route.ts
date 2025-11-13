import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id?: string; propostaId?: string }> }
) {
  try {
    const params = context?.params ? await context.params : undefined;
    const propostaId = params?.propostaId ? Number(params.propostaId) : NaN;
    
    if (!propostaId) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    const body = await request.json();
    const { nomeproposta, codproposta } = body;

    if (!nomeproposta) {
      return NextResponse.json({ error: 'Nome da proposta é obrigatório' }, { status: 400 });
    }

    const proposta = await (prisma.propostasAceitas as any).update({
      where: { id: propostaId },
      data: {
        nomeproposta,
        codproposta: codproposta || null,
      },
    });

    return NextResponse.json(proposta);
  } catch (error) {
    console.error('Erro ao atualizar proposta:', error);
    return NextResponse.json({ error: 'Erro ao atualizar proposta' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id?: string; propostaId?: string }> }
) {
  try {
    const params = context?.params ? await context.params : undefined;
    const propostaId = params?.propostaId ? Number(params.propostaId) : NaN;
    
    if (!propostaId) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    await prisma.propostasAceitas.delete({
      where: { id: propostaId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao excluir proposta:', error);
    return NextResponse.json({ error: 'Erro ao excluir proposta' }, { status: 500 });
  }
}
