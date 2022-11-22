import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
    const channelCount = await prisma.textChannel.count();

    if (channelCount === 0) {
        const channel = await prisma.textChannel.create({
            data: {
                name: 'Test Channel',
                ownerId: 'claihaahb0012uhipovl5a2wa',
            },
        });
        console.log(channel.id)
        console.log(channel)
    }
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    });
