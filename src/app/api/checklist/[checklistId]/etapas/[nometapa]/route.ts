import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  context: { params?: { checklistId?: string; nometapa?: string } }
) {
  try {
    // Prefer params; fallback to parsing URL if undefined (dev proxies/basePath safety)
    let nometapa = context?.params?.nometapa ? decodeURIComponent(context.params.nometapa) : undefined as unknown as string;
    let checklistId = context?.params?.checklistId ? Number(context.params.checklistId) : NaN;

    if (!nometapa || !checklistId) {
      const url = new URL(request.url);
      const parts = url.pathname.split('/').filter(Boolean);
      const idxChecklist = parts.indexOf('checklist');
      const idxEtapas = parts.indexOf('etapas');
      if (!checklistId && idxChecklist >= 0 && parts[idxChecklist + 1]) {
        checklistId = Number(parts[idxChecklist + 1]);
      }
      if (!nometapa && idxEtapas >= 0 && parts[idxEtapas + 1]) {
        nometapa = decodeURIComponent(parts[idxEtapas + 1]);
      }
    }

    if (!checklistId || !nometapa) {
      return NextResponse.json({ error: 'Parâmetros inválidos' }, { status: 400 });
    }

    // Busca apenas os campos necessários
    const etapa = await prisma.checklistEtapas.findFirst({
      where: {
        idchecklist: checklistId,
        nometapa,
      },
    }) as any; // Type assertion temporário até Prisma Client sincronizar

    // Retorna apenas os campos que serão usados pelo frontend
    if (etapa) {
      return NextResponse.json({
        id: etapa.id,
        dataenvio: etapa.dataenvio,
        dataretorno: etapa.dataretorno,
        cobrarem: etapa.cobrarem,
        historicodataenvio: etapa.historicodataenvio,
        historicodataretorno: etapa.historicodataretorno,
        finalizada: etapa.finalizada,
        datafim: etapa.datafim,
      });
    }

    return NextResponse.json(null);
  } catch (error) {
    console.error('Erro ao buscar etapa:', error);
    return NextResponse.json({ error: 'Erro ao buscar etapa' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  context: { params?: { checklistId?: string; nometapa?: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });

    // Prefer params; fallback to parsing URL
    let nometapa = context?.params?.nometapa ? decodeURIComponent(context.params.nometapa) : undefined as unknown as string;
    let checklistId = context?.params?.checklistId ? Number(context.params.checklistId) : NaN;
    if (!nometapa || !checklistId) {
      const url = new URL(request.url);
      const parts = url.pathname.split('/').filter(Boolean);
      const idxChecklist = parts.indexOf('checklist');
      const idxEtapas = parts.indexOf('etapas');
      if (!checklistId && idxChecklist >= 0 && parts[idxChecklist + 1]) {
        checklistId = Number(parts[idxChecklist + 1]);
      }
      if (!nometapa && idxEtapas >= 0 && parts[idxEtapas + 1]) {
        nometapa = decodeURIComponent(parts[idxEtapas + 1]);
      }
    }
    const body = await request.json();

    if (!checklistId || !nometapa) {
      return NextResponse.json({ error: 'Parâmetros inválidos' }, { status: 400 });
    }

    // Buscar etapa existente
    let etapa = await prisma.checklistEtapas.findFirst({
      where: {
        idchecklist: checklistId,
        nometapa,
      },
    });

    // Preparar dados do histórico
    const now = new Date().toISOString();
    const updateData: any = {
      atualizadopor: user?.nome || 'Sistema',
    };

    // Se mudou dataenvio, adiciona ao histórico
    if (body.dataenvio !== undefined) {
      const historicoEnvio = etapa?.historicodataenvio ? JSON.parse(etapa.historicodataenvio) : [];
      historicoEnvio.push({
        data: body.dataenvio,
        alteradoPor: user?.nome || 'Sistema',
        alteradoEm: now,
      });
      updateData.dataenvio = body.dataenvio ? new Date(body.dataenvio) : null;
      updateData.historicodataenvio = JSON.stringify(historicoEnvio);
    }

    // Se mudou dataretorno, adiciona ao histórico e atualiza cobrarem
    if (body.dataretorno !== undefined) {
      const historicoRetorno = etapa?.historicodataretorno ? JSON.parse(etapa.historicodataretorno) : [];
      historicoRetorno.push({
        data: body.dataretorno,
        alteradoPor: user?.nome || 'Sistema',
        alteradoEm: now,
      });
      updateData.dataretorno = body.dataretorno ? new Date(body.dataretorno) : null;
      updateData.historicodataretorno = JSON.stringify(historicoRetorno);
      updateData.cobrarem = body.dataretorno ? new Date(body.dataretorno) : null; // Auto-preenche cobrarem
    }

    if (etapa) {
      // Atualizar existente
      etapa = await prisma.checklistEtapas.update({
        where: { id: etapa.id },
        data: updateData,
      });
    } else {
      // Criar nova
      etapa = await prisma.checklistEtapas.create({
        data: {
          idchecklist: checklistId,
          nometapa,
          ...updateData,
          criadopor: user?.nome || 'Sistema',
        },
      });
    }

    return NextResponse.json(etapa);
  } catch (error) {
    console.error('Erro ao atualizar etapa:', error);
    return NextResponse.json({ error: 'Erro ao atualizar etapa' }, { status: 500 });
  }
}
