import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest
) {
  try {
    const urlParts = request.url.split('/');
    const idempresa = Number(urlParts[urlParts.length - 2]);
    if (!idempresa) return NextResponse.json([]);
    const propostas = await prisma.propostasAceitas.findMany({
      where: { idempresa },
      orderBy: { criadoem: 'desc' },
    });
    return NextResponse.json(propostas);
  } catch (error) {
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(
  request: NextRequest
) {
  try {
    const urlParts = request.url.split('/');
    const idempresa = Number(urlParts[urlParts.length - 2]);
    const body = await request.json();
    const { nomeproposta } = body;
    if (!idempresa || !nomeproposta) {
      return NextResponse.json({ error: 'Dados obrigatórios faltando' }, { status: 400 });
    }
    const proposta = await prisma.propostasAceitas.create({
      data: {
        idempresa,
        nomeproposta,
      },
    });
    return NextResponse.json(proposta, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao criar proposta' }, { status: 500 });
  }
}
