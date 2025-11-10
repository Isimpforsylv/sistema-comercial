import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const recursos = [
    'Idioma Inglês',
    'Idioma Português',
    'Idioma Espanhol',
    'Idioma Francês',
    'Onde encontrar Geolocalização',
    'Catálogo por Mercado',
    'Outro',
  ];

  console.log('Populando lista de recursos...');

  for (const recurso of recursos) {
    await prisma.listaRecursos.upsert({
      where: { id: recursos.indexOf(recurso) + 1 },
      update: {},
      create: {
        nomerecurso: recurso,
      },
    });
  }

  console.log('✅ Lista de recursos populada com sucesso!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
