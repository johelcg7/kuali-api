import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('admin123', 10);
  await prisma.users.upsert({
    where: { email: 'admin@kuali.com' },
    update: {},
    create: {
      email: 'admin@kuali.com',
      name: 'Administrador',
      password,
      unique_code: 'admin',
      role: 'admin',
    },
  });
  console.log('Usuario administrador creado o actualizado');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
