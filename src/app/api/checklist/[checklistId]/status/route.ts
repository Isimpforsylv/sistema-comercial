import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

// GET - Buscar status do checklist
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ checklistId?: string }> }
) {
  try {
    const params = context?.params ? await context.params : undefined;
    let checklistId = params?.checklistId ? Number(params.checklistId) : NaN;
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

    const checklist = await (prisma as any).checklist.findUnique({
      where: { id: checklistId },
      select: {
        id: true,
        status: true,
        dataretorno: true,
      },
    });

    if (!checklist) {
      return NextResponse.json({ error: 'Checklist não encontrado' }, { status: 404 });
    }

    return NextResponse.json(checklist);
  } catch (error) {
    console.error('Erro ao buscar status:', error);
    return NextResponse.json({ error: 'Erro ao buscar status' }, { status: 500 });
  }
}

// PUT - Atualizar status do checklist
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ checklistId?: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    const params = context?.params ? await context.params : undefined;
    let checklistId = params?.checklistId ? Number(params.checklistId) : NaN;
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

    const { status, dataretorno } = body;

    // Validar status
    const statusValidos = ['em_andamento', 'finalizado', 'pausado', 'cancelado', 'desistiu'];
    if (!statusValidos.includes(status)) {
      return NextResponse.json({ error: 'Status inválido' }, { status: 400 });
    }

    // Se for finalizar, validar etapas obrigatórias e pendências impeditivas
    if (status === 'finalizado') {
      const REQUIRED_ETAPAS = [
        'Pre-Checklist',
        'Checklist',
        'Validação de Desenvolvimento',
        'Assinatura do Contrato',
      ];

      const etapasNaoProntas: string[] = [];

      // Para cada etapa obrigatória, verificar se existe e se está finalizada
      for (const nometapa of REQUIRED_ETAPAS) {
        const etapa = await (prisma as any).checklistEtapas.findFirst({
          where: { idchecklist: checklistId, nometapa },
          select: { id: true, finalizada: true },
        });
        if (!etapa || etapa.finalizada !== true) {
          etapasNaoProntas.push(nometapa);
        }
      }

      // Verificar pendências impeditivas não finalizadas
      const pendenciasImpeditivas = await (prisma as any).checklistPendencias.findMany({
        where: {
          idchecklist: checklistId,
          impeditiva: true,
          finalizada: false,
        },
        select: {
          descricao: true,
        },
      });

      if (etapasNaoProntas.length > 0 || pendenciasImpeditivas.length > 0) {
        return NextResponse.json({
          error: 'Não é possível finalizar',
          etapasNaoFinalizadas: etapasNaoProntas,
          pendenciasImpeditivas: pendenciasImpeditivas.map((p: any) => p.descricao),
        }, { status: 400 });
      }
    }

    // Preparar dados para atualização
    const data: any = {
      status,
      atualizadopor: user?.nome || 'Sistema',
    };

    // Se status for pausado, incluir dataretorno
    if (status === 'pausado' && dataretorno) {
      data.dataretorno = new Date(dataretorno);
    } else {
      // Se não for pausado, limpar dataretorno
      data.dataretorno = null;
    }

    const checklistAtualizado = await (prisma as any).checklist.update({
      where: { id: checklistId },
      data,
    });

    return NextResponse.json(checklistAtualizado);
  } catch (error) {
    console.error('Erro ao atualizar status:', error);
    return NextResponse.json({ error: 'Erro ao atualizar status' }, { status: 500 });
  }
}
