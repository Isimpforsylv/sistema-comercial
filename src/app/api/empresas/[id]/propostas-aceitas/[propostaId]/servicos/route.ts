import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const urlParts = request.url.split('/');
    const propostaId = Number(urlParts[urlParts.length - 2]);

    if (!propostaId) return NextResponse.json([]);

    const servicos = await prisma.servicosPropostasAceitas.findMany({
      where: { idproposta: propostaId },
      include: {
        tiposervico: true,
        checklist: {
          select: { 
            id: true,
            status: true,
          } as any, // Type assertion para campo recém adicionado
        },
        melhoria: {
          select: { id: true },
        },
      },
      orderBy: { criadoem: 'desc' },
    });

    return NextResponse.json(servicos);
  } catch (error) {
    console.error('Erro ao buscar serviços:', error);
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

    const { nomedescricao, idtiposervico } = body;

    // Criar o serviço
    const servico = await prisma.servicosPropostasAceitas.create({
      data: {
        idproposta: propostaId,
        idtiposervico: Number(idtiposervico),
        nomedescricao,
        criadopor: user?.nome || 'Sistema',
        atualizadopor: user?.nome || 'Sistema',
      },
      include: {
        tiposervico: true,
      },
    });

    // Criar checklist ou melhoria baseado no tipo
    if (servico.tiposervico.nometiposervico === 'Checklist') {
      // Cria o checklist
      const checklist = await prisma.checklist.create({
        data: {
          idservico: servico.id,
          criadopor: user?.nome || 'Sistema',
          atualizadopor: user?.nome || 'Sistema',
        },
      });

      // Cria etapas padrão (inclusive 'Pendências' para padronizar a visão), todas como não finalizadas
      const REQUIRED_ETAPAS = [
        'Pre-Checklist',
        'Checklist',
        'Validação de Desenvolvimento',
        'Assinatura do Contrato',
        'Pendências',
      ];

      await prisma.checklistEtapas.createMany({
        data: REQUIRED_ETAPAS.map((nometapa) => ({
          idchecklist: checklist.id,
          nometapa,
          criadopor: user?.nome || 'Sistema',
          atualizadopor: user?.nome || 'Sistema',
        })),
      });
    } else if (servico.tiposervico.nometiposervico === 'Melhoria') {
      await prisma.melhoria.create({
        data: {
          idservico: servico.id,
          criadopor: user?.nome || 'Sistema',
          atualizadopor: user?.nome || 'Sistema',
        },
      });
    }

    return NextResponse.json(servico, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar serviço:', error);
    return NextResponse.json({ error: 'Erro ao criar serviço' }, { status: 500 });
  }
}
