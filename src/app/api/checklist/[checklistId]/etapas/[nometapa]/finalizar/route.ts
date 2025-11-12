import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

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

    const { datafim, desfinalizar } = body;

    // Se desfinalizar = true, volta ao estado ativo
    if (desfinalizar) {
      await prisma.checklistEtapas.updateMany({
        where: {
          idchecklist: checklistId,
          nometapa,
        },
        data: {
          finalizada: false,
          datafim: null,
        } as any, // Type assertion: campo existe no DB mas TypeScript não reconhece
      });
    } else {
      // Finaliza a etapa
      await prisma.checklistEtapas.updateMany({
        where: {
          idchecklist: checklistId,
          nometapa,
        },
        data: {
          finalizada: true,
          datafim: new Date(datafim),
        } as any, // Type assertion: campo existe no DB mas TypeScript não reconhece
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao finalizar/desfinalizar etapa:', error);
    return NextResponse.json({ error: 'Erro ao finalizar/desfinalizar etapa' }, { status: 500 });
  }
}
