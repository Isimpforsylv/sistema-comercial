import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const urlParts = request.url.split('/');
    const propostaId = Number(urlParts[urlParts.length - 2]);
    
    if (!propostaId) return NextResponse.json(null);

    const informacoes = await prisma.informacoesPropostasAceitas.findUnique({
      where: { idproposta: propostaId },
      select: {
        id: true,
        empresa: true,
        pais: true,
        estado: true,
        cidade: true,
        endereco: true,
        contato: true,
        email: true,
        telefone: true,
        linkwiki: true,
        caminhopasta: true,
        dataaceite: true,
        atualizadopor: true,
      },
    });

    return NextResponse.json(informacoes);
  } catch (error) {
    console.error('Erro ao buscar informações:', error);
    return NextResponse.json(null, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    const urlParts = request.url.split('/');
    const propostaId = Number(urlParts[urlParts.length - 2]);
    const body = await request.json();

    if (!propostaId) {
      return NextResponse.json({ error: 'ID da proposta inválido' }, { status: 400 });
    }

    // Buscar o nome da empresa através da proposta (com select otimizado)
    const proposta = await prisma.propostasAceitas.findUnique({
      where: { id: propostaId },
      select: {
        empresa: {
          select: {
            nomeempresa: true,
          },
        },
      },
    });

    if (!proposta) {
      return NextResponse.json({ error: 'Proposta não encontrada' }, { status: 404 });
    }

    const informacoes = await prisma.informacoesPropostasAceitas.create({
      data: {
        idproposta: propostaId,
        empresa: proposta.empresa.nomeempresa, // Pega automaticamente do banco
        pais: body.pais,
        estado: body.estado,
        cidade: body.cidade,
        endereco: body.endereco,
        contato: body.contato,
        email: body.email,
        telefone: body.telefone,
        linkwiki: body.linkwiki || '',
        caminhopasta: body.caminhopasta,
        dataaceite: new Date(body.dataaceite),
        criadopor: user?.nome || 'Sistema',
        atualizadopor: user?.nome || 'Sistema',
      },
    });

    return NextResponse.json(informacoes, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar informações:', error);
    return NextResponse.json({ error: 'Erro ao criar informações' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    const urlParts = request.url.split('/');
    const propostaId = Number(urlParts[urlParts.length - 2]);
    const body = await request.json();

    if (!propostaId) {
      return NextResponse.json({ error: 'ID da proposta inválido' }, { status: 400 });
    }

    const informacoes = await prisma.informacoesPropostasAceitas.update({
      where: { idproposta: propostaId },
      data: {
        pais: body.pais,
        estado: body.estado,
        cidade: body.cidade,
        endereco: body.endereco,
        contato: body.contato,
        email: body.email,
        telefone: body.telefone,
        linkwiki: body.linkwiki || '',
        caminhopasta: body.caminhopasta,
        dataaceite: new Date(body.dataaceite),
        atualizadopor: user?.nome || 'Sistema',
      },
      select: {
        id: true,
        empresa: true,
        pais: true,
        estado: true,
        cidade: true,
        endereco: true,
        contato: true,
        email: true,
        telefone: true,
        linkwiki: true,
        caminhopasta: true,
        dataaceite: true,
        atualizadopor: true,
      },
    });

    return NextResponse.json(informacoes);
  } catch (error) {
    console.error('Erro ao atualizar informações:', error);
    return NextResponse.json({ error: 'Erro ao atualizar informações' }, { status: 500 });
  }
}
