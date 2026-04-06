import { prisma } from './app/lib/prisma';

async function main() {
  try {
    const users = await prisma.user.findMany();
    console.log('Users found:', users.length);
    console.log('Users:', users);
  } catch (error) {
    console.error('Database error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 