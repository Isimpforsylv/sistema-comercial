import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Listar todas as empresas
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || '';

    const empresas = await prisma.empresas.findMany({
      where: search ? {
        OR: [
          { nomeempresa: { contains: search } },
          { codigoempresa: { contains: search } },
        ],
      } : {},
      include: {
        grupo: true,
      },
      orderBy: {
        criadoem: 'desc',
      },
    });

    return NextResponse.json(empresas);
  } catch (error) {
    console.error('Erro ao buscar empresas:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar empresas' },
      { status: 500 }
    );
  }
}

// POST - Criar nova empresa
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { idgrupo, nomeempresa, codigoempresa, cliente, criadopor } = body;

    if (!nomeempresa || !codigoempresa || !criadopor) {
      return NextResponse.json(
        { error: 'Campos obrigatórios faltando' },
        { status: 400 }
      );
    }

    const empresa = await prisma.empresas.create({
      data: {
        idgrupo: idgrupo || null,
        nomeempresa,
        codigoempresa,
        cliente: cliente || false,
        criadopor,
      },
      include: {
        grupo: true,
      },
    });

    return NextResponse.json(empresa, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar empresa:', error);
    return NextResponse.json(
      { error: 'Erro ao criar empresa' },
      { status: 500 }
    );
  }
}
