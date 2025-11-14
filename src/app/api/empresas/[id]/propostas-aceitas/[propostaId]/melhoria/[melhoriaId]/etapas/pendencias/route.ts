import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id?: string; propostaId?: string; melhoriaId?: string }> }
) {
  try {
    // Prefer params; fallback to parsing URL if undefined (dev proxies/basePath safety)
    const params = context?.params ? await context.params : undefined;
    const nometapa = 'Pendências'; // Nome fixo da etapa
    let melhoriaId = params?.melhoriaId ? Number(params.melhoriaId) : NaN;

    if (!melhoriaId) {
      const url = new URL(request.url);
      const parts = url.pathname.split('/').filter(Boolean);
      const idxMelhoria = parts.indexOf('melhoria');
      if (!melhoriaId && idxMelhoria >= 0 && parts[idxMelhoria + 1]) {
        melhoriaId = Number(parts[idxMelhoria + 1]);
      }
    }

    if (!melhoriaId) {
      return NextResponse.json({ error: 'Parâmetros inválidos' }, { status: 400 });
    }

    // Busca apenas os campos necessários
    const etapa = await (prisma as any).melhoriaEtapa.findFirst({
      where: {
        idmelhoria: melhoriaId,
        nometapa,
      },
    });

    console.log('Etapa encontrada:', etapa);

    // Retorna apenas os campos que serão usados pelo frontend
    if (etapa) {
      const response = {
        id: etapa.id,
        dataenvio: etapa.dataenvio,
        dataretorno: etapa.dataretorno,
        cobrarem: etapa.cobrarem,
        historicodataenvio: etapa.historicodataenvio,
        historicodataretorno: etapa.historicodataretorno,
        finalizada: etapa.finalizada,
        datafim: etapa.datafim,
      };
      console.log('Resposta enviada:', response);
      return NextResponse.json(response);
    }

    console.log('Etapa não encontrada, retornando estrutura vazia');
    // Retorna estrutura vazia se não existir
    return NextResponse.json({
      id: null,
      dataenvio: null,
      dataretorno: null,
      cobrarem: null,
      historicodataenvio: null,
      historicodataretorno: null,
      finalizada: false,
      datafim: null,
    });
  } catch (error) {
    console.error('Erro ao buscar etapa:', error);
    return NextResponse.json({ error: 'Erro ao buscar etapa' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id?: string; propostaId?: string; melhoriaId?: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });

    // Prefer params; fallback to parsing URL
    const params = context?.params ? await context.params : undefined;
    const nometapa = 'Pendências'; // Nome fixo da etapa
    let melhoriaId = params?.melhoriaId ? Number(params.melhoriaId) : NaN;
    if (!melhoriaId) {
      const url = new URL(request.url);
      const parts = url.pathname.split('/').filter(Boolean);
      const idxMelhoria = parts.indexOf('melhoria');
      if (!melhoriaId && idxMelhoria >= 0 && parts[idxMelhoria + 1]) {
        melhoriaId = Number(parts[idxMelhoria + 1]);
      }
    }
    const body = await request.json();

    if (!melhoriaId) {
      return NextResponse.json({ error: 'Parâmetros inválidos' }, { status: 400 });
    }

    // Buscar etapa existente
    let etapa = await (prisma as any).melhoriaEtapa.findFirst({
      where: {
        idmelhoria: melhoriaId,
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
      etapa = await (prisma as any).melhoriaEtapa.update({
        where: { id: etapa.id },
        data: updateData,
      });
    } else {
      // Criar nova
      etapa = await (prisma as any).melhoriaEtapa.create({
        data: {
          idmelhoria: melhoriaId,
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
