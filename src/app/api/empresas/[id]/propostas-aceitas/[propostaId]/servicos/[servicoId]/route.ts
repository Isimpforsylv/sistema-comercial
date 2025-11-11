import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string; propostaId: string; servicoId: string }> }
) {
  try {
    const params = await context.params;
    const servicoId = Number(params.servicoId);
    const body = await request.json();

    if (!servicoId) {
      return NextResponse.json({ error: 'ID do serviço inválido' }, { status: 400 });
    }

    // Atualizar o serviço
    const servico = await prisma.servicosPropostasAceitas.update({
      where: { id: servicoId },
      data: {
        nomedescricao: body.nomedescricao,
        idtiposervico: Number(body.idtiposervico),
        atualizadopor: 'Sistema',
      },
      include: {
        tiposervico: true,
        checklist: true,
        melhoria: true,
      },
    });

    return NextResponse.json(servico);
  } catch (error) {
    console.error('Erro ao atualizar serviço:', error);
    return NextResponse.json({ error: 'Erro ao atualizar serviço' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string; propostaId: string; servicoId: string }> }
) {
  try {
    const params = await context.params;
    const servicoId = Number(params.servicoId);

    if (!servicoId) {
      return NextResponse.json({ error: 'ID do serviço inválido' }, { status: 400 });
    }

    // Busca o serviço para verificar o tipo
    const servico = await prisma.servicosPropostasAceitas.findUnique({
      where: { id: servicoId },
      include: {
        tiposervico: true,
      },
    });

    if (!servico) {
      return NextResponse.json({ error: 'Serviço não encontrado' }, { status: 404 });
    }

    // Se for checklist, deleta o checklist relacionado
    if (servico.tiposervico.nometiposervico === 'Checklist') {
      await prisma.checklist.deleteMany({
        where: { idservico: servicoId },
      });
    }

    // Se for melhoria, deleta a melhoria relacionada
    if (servico.tiposervico.nometiposervico === 'Melhoria') {
      await prisma.melhoria.deleteMany({
        where: { idservico: servicoId },
      });
    }

    // Deleta o serviço
    await prisma.servicosPropostasAceitas.delete({
      where: { id: servicoId },
    });

    return NextResponse.json({ message: 'Serviço removido com sucesso' });
  } catch (error) {
    console.error('Erro ao remover serviço:', error);
    return NextResponse.json({ error: 'Erro ao remover serviço' }, { status: 500 });
  }
}
