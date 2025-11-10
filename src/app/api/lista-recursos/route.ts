import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const recursos = await prisma.listaRecursos.findMany({
      orderBy: { nomerecurso: 'asc' },
    });
    return NextResponse.json(recursos);
  } catch (error) {
    console.error('Erro ao buscar recursos:', error);
    return NextResponse.json([], { status: 500 });
  }
}
