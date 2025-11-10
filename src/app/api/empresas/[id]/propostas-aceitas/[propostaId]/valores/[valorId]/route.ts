import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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
