import { Metadata } from 'next';
import { prisma } from '../../../../../server/db/client';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../../pages/api/auth/[...nextauth]';
import ChatPage_Client from './client-side';

export async function generateMetadata({
  params,
}: {
  params: { channelId: string };
}): Promise<Metadata> {
  const channelId = params.channelId;
  const channel = await prisma.textChannel.findUnique({
    where: {
      id: channelId,
    },
  });

  const channelName = channel?.name;

  return {
    title: channelName ? `#${channelName} | Iridium Chat` : 'Iridium Chat',
  };
}

export default async function ChatPage_Combined({
  params,
}: {
  params: { serverId: string; channelId: string };
}) {
  const session = await getServerSession(authOptions);

  if (!session || !params) return redirect('/');

  const channelId = params['channelId'] as string;
  const serverId = params['serverId'] as string;
  const channel = await prisma.textChannel.findUnique({
    where: {
      id: channelId,
    },
  });

  if (!channel) return redirect(`/server/${serverId}`);

  const isServerMember = await prisma.serverMember.findFirst({
    where: {
      serverId: channel.serverId,
      userId: session.user?.id,
    },
  });

  if (!isServerMember) {
    const server = await prisma.server.findUnique({
      where: {
        id: channel.serverId,
      },
    });
    if (server?.ownerId !== session.user?.id)
      return {
        redirect: {
          destination: '/server',
          permanent: false,
        },
      };
  }
  return <ChatPage_Client channel={channel} serverId={serverId} />;
}
