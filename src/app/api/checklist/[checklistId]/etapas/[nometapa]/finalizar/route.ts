import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(request: NextRequest) {
  try {
    const urlParts = request.url.split('/');
    const nometapa = decodeURIComponent(urlParts[urlParts.length - 2]);
    const checklistId = Number(urlParts[urlParts.length - 4]);
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
