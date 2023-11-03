import { Metadata, ResolvingMetadata } from 'next';
import { prisma } from '../../../server/db/client';
import ServerHome_Client from './client-side';
import ServerHome_Server from './server-side';

export async function generateMetadata({
  params,
}: {
  params: { serverId: string };
}): Promise<Metadata> {
  const serverId = params.serverId;
  const server = await prisma.server.findUnique({
    where: {
      id: serverId,
    },
  });

  const serverName = server?.name;
  return {
    title: serverName ? `${serverName} | Iridium Chat` : 'Iridium Chat',
  };
}

export default function ServerHome({
  params,
}: {
  params: { serverId: string };
}) {
  return (
    <ServerHome_Client>
      <ServerHome_Server params={params} />
    </ServerHome_Client>
  );
}
