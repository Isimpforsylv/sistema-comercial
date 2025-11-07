import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Criar usuários de exemplo
  const senhaHash = await bcrypt.hash('123456', 10);
  
  const admin = await prisma.usuarios.create({
    data: {
      nome: 'Administrador',
      email: 'admin@ideia2001.com.br',
      senha: senhaHash,
      admin: true,
    },
  });

  const usuario = await prisma.usuarios.create({
    data: {
      nome: 'Usuário Comum',
      email: 'usuario@ideia2001.com.br',
      senha: senhaHash,
      admin: false,
    },
  });

  console.log('Usuários criados:', { admin, usuario });

  // Criar grupos de exemplo
  const grupo1 = await prisma.empresasGrupo.create({
    data: {
      nomegrupo: 'Grupo Tecnologia',
    },
  });

  const grupo2 = await prisma.empresasGrupo.create({
    data: {
      nomegrupo: 'Grupo Varejo',
    },
  });

  const grupo3 = await prisma.empresasGrupo.create({
    data: {
      nomegrupo: 'Grupo Serviços',
    },
  });

  console.log('Grupos criados:', { grupo1, grupo2, grupo3 });

  // Criar empresas de exemplo
  const empresa1 = await prisma.empresas.create({
    data: {
      nomeempresa: 'Tech Solutions',
      codigoempresa: 'TECH001',
      cliente: true,
      criadopor: 'Admin',
      idgrupo: grupo1.id,
    },
  });

  const empresa2 = await prisma.empresas.create({
    data: {
      nomeempresa: 'Varejo Express',
      codigoempresa: 'VAR001',
      cliente: true,
      criadopor: 'Admin',
      idgrupo: grupo2.id,
    },
  });

  console.log('Empresas criadas:', { empresa1, empresa2 });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
