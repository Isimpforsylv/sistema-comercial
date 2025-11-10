import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const urlParts = request.url.split('/');
    const propostaId = Number(urlParts[urlParts.length - 2]);

    if (!propostaId) return NextResponse.json([]);

    const valores = await prisma.valoresPropostasAceitas.findMany({
      where: { idproposta: propostaId },
      include: {
        recursos: {
          orderBy: { criadoem: 'asc' },
        },
      },
      orderBy: { criadoem: 'desc' },
    });

    return NextResponse.json(valores);
  } catch (error) {
    console.error('Erro ao buscar valores:', error);
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    const urlParts = request.url.split('/');
    const propostaId = Number(urlParts[urlParts.length - 2]);
    const body = await request.json();

    if (!propostaId) {
      return NextResponse.json({ error: 'ID da proposta inválido' }, { status: 400 });
    }

    const { recursos, ...valorData } = body;

    // Criar o valor principal
    const valor = await prisma.valoresPropostasAceitas.create({
      data: {
        idproposta: propostaId,
        nomevalor: valorData.nomevalor,
        valor: valorData.valor,
        formapagamento: valorData.formapagamento,
        mensalidade: valorData.mensalidade,
        alteracaomensalidade: valorData.alteracaomensalidade || '',
        prazo: valorData.prazo,
        observacao: valorData.observacao || '',
        criadopor: user?.nome || 'Sistema',
        atualizadopor: user?.nome || 'Sistema',
      },
    });

    // Criar os recursos adicionais
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
              criadopor: user?.nome || 'Sistema',
              atualizadopor: user?.nome || 'Sistema',
            },
          })
        )
      );
    }

    return NextResponse.json(valor, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar valor:', error);
    return NextResponse.json({ error: 'Erro ao criar valor' }, { status: 500 });
  }
}
