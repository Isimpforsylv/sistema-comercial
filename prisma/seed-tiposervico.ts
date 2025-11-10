import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const tiposServico = ['Melhoria', 'Checklist'];

  console.log('Populando tipos de serviço...');

  for (const tipo of tiposServico) {
    await prisma.tipoServico.upsert({
      where: { id: tiposServico.indexOf(tipo) + 1 },
      update: {},
      create: {
        nometiposervico: tipo,
      },
    });
  }

  console.log('✅ Tipos de serviço populados com sucesso!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
