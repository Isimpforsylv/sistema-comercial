import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Busca o maior código numérico existente
    const ultimaProposta = await (prisma as any).propostasAceitas.findFirst({
      where: {
        codproposta: {
          not: null,
        },
      },
      orderBy: {
        codproposta: 'desc',
      },
      select: {
        codproposta: true,
      },
    });

    let novoCodigo = '001';
    
    if (ultimaProposta?.codproposta) {
      // Extrai o número do código (assumindo formato numérico ou com prefixo)
      const match = ultimaProposta.codproposta.match(/\d+$/);
      if (match) {
        const numero = parseInt(match[0]);
        novoCodigo = String(numero + 1).padStart(3, '0');
      }
    }

    return NextResponse.json({ codigo: novoCodigo });
  } catch (error) {
    console.error('Erro ao gerar código:', error);
    return NextResponse.json({ error: 'Erro ao gerar código' }, { status: 500 });
  }
}
