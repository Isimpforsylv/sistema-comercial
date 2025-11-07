import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Listar todos os grupos
export async function GET() {
  try {
    const grupos = await prisma.empresasGrupo.findMany({
      orderBy: {
        nomegrupo: 'asc',
      },
    });

    return NextResponse.json(grupos);
  } catch (error) {
    console.error('Erro ao buscar grupos:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar grupos' },
      { status: 500 }
    );
  }
}

// POST - Criar novo grupo
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nomegrupo } = body;

    if (!nomegrupo) {
      return NextResponse.json(
        { error: 'Nome do grupo é obrigatório' },
        { status: 400 }
      );
    }

    const grupo = await prisma.empresasGrupo.create({
      data: { nomegrupo },
    });

    return NextResponse.json(grupo, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar grupo:', error);
    return NextResponse.json(
      { error: 'Erro ao criar grupo' },
      { status: 500 }
    );
  }
}
