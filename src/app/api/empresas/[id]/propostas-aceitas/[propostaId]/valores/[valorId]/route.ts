import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(request: NextRequest) {
  try {
    const urlParts = request.url.split('/');
    const valorId = Number(urlParts[urlParts.length - 1]);
    const body = await request.json();

    if (!valorId) {
      return NextResponse.json({ error: 'ID do valor inválido' }, { status: 400 });
    }

    const { recursos, ...valorData } = body;

    // Atualizar o valor principal
    const valor = await prisma.valoresPropostasAceitas.update({
      where: { id: valorId },
      data: {
        nomevalor: valorData.nomevalor,
        valor: valorData.valor,
        formapagamento: valorData.formapagamento,
        mensalidade: valorData.mensalidade,
        alteracaomensalidade: valorData.alteracaomensalidade || '',
        prazo: valorData.prazo,
        observacao: valorData.observacao || '',
        atualizadopor: 'Sistema',
      },
    });

    // Deletar recursos antigos
    await prisma.recursosValoresPropostasAceitas.deleteMany({
      where: { idvalor: valorId },
    });

    // Criar novos recursos
    if (recursos && recursos.length > 0) {
      await Promise.all(
        recursos.map((recurso: any) =>
          prisma.recursosValoresPropostasAceitas.create({
            data: {
              idvalor: valor.id,
              nomerecurso: recurso.nomerecurso === 'Outro' ? recurso.outrorecurso : recurso.nomerecurso,
              valor: recurso.valor,
              formapagamento: recurso.formapagamento,
              prazo: recurso.prazo,
              criadopor: 'Sistema',
              atualizadopor: 'Sistema',
            },
          })
        )
      );
    }

    // Retorna o valor com os recursos incluídos
    const valorCompleto = await prisma.valoresPropostasAceitas.findUnique({
      where: { id: valor.id },
      include: {
        recursos: true,
      },
    });

    return NextResponse.json(valorCompleto);
  } catch (error) {
    console.error('Erro ao atualizar valor:', error);
    return NextResponse.json({ error: 'Erro ao atualizar valor' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const urlParts = request.url.split('/');
    const valorId = Number(urlParts[urlParts.length - 1]);

    if (!valorId) {
      return NextResponse.json({ error: 'ID do valor inválido' }, { status: 400 });
    }

    // Deletar o valor (os recursos são deletados automaticamente via CASCADE)
    await prisma.valoresPropostasAceitas.delete({
      where: { id: valorId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao deletar valor:', error);
    return NextResponse.json({ error: 'Erro ao deletar valor' }, { status: 500 });
  }
}
