import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id?: string; propostaId?: string }> }
) {
  try {
    const user = await getCurrentUser();
    const params = context?.params ? await context.params : undefined;
    const propostaId = params?.propostaId ? Number(params.propostaId) : NaN;
    
    if (!propostaId) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    const body = await request.json();
    const { codigoservico, dataenvioproj, dataenviofinanceiro, valores } = body;

    if (!codigoservico || !dataenvioproj || !dataenviofinanceiro) {
      return NextResponse.json({ error: 'Campos obrigatórios faltando' }, { status: 400 });
    }

    // Atualizar proposta
    await (prisma as any).propostasAceitas.update({
      where: { id: propostaId },
      data: {
        codproposta: codigoservico,
        dataenvioproj: new Date(dataenvioproj),
        dataenviofinanceiro: new Date(dataenviofinanceiro),
        finalizado: true,
      },
    });

    // Atualizar valores finais
    if (valores && valores.length > 0) {
      for (const valor of valores) {
        await (prisma as any).valoresPropostasAceitas.update({
          where: { id: valor.id },
          data: {
            valorfinal: valor.valorfinal,
            formafinal: valor.formafinal,
            prazofinal: valor.prazofinal,
            atualizadopor: user?.nome || 'Sistema',
          },
        });

        // Atualizar recursos se existirem
        if (valor.recursos && valor.recursos.length > 0) {
          for (const recurso of valor.recursos) {
            await (prisma as any).recursosValoresPropostasAceitas.update({
              where: { id: recurso.id },
              data: {
                valorfinal: recurso.valorfinal,
                formafinal: recurso.formafinal,
                prazofinal: recurso.prazofinal,
                atualizadopor: user?.nome || 'Sistema',
              },
            });
          }
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao enviar serviço:', error);
    return NextResponse.json({ error: 'Erro ao enviar serviço' }, { status: 500 });
  }
}
