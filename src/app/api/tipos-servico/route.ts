import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const tiposServico = await prisma.tipoServico.findMany({
      orderBy: { nometiposervico: 'asc' },
    });
    return NextResponse.json(tiposServico);
  } catch (error) {
    console.error('Erro ao buscar tipos de serviço:', error);
    return NextResponse.json([], { status: 500 });
  }
}
