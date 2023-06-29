import { PrismaClient } from '@prisma/client';
import { randomBytes } from 'crypto';
const prisma = new PrismaClient();

async function main() {
  const serverCount = await prisma.server.count();

  if (serverCount === 0) {
    const server = await prisma.server.create({
      data: {
        name: 'Test Server',
        ownerId: 'cljfyzm9o0000i17zvtulqnll',
        inviteLink: randomBytes(6).toString('hex'),
      },
    });
    console.log(server.id);
    console.log(server);
  }
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
