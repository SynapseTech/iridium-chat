import { getServerSession } from 'next-auth';
import { authOptions } from '../../../pages/api/auth/[...nextauth]';
import { redirect } from 'next/navigation';
import { prisma } from '../../../server/db/client';
import ApplicationSidebar from '../../../components/appSidebar';
import { MemberList } from '../../../components/memberList';
import React from 'react';

export default async function ServerHome_Server({
  params,
}: {
  params: { serverId: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session || !params) redirect('/');

  const serverId = params.serverId;

  const server = await prisma.server.findUnique({
    where: {
      id: serverId,
    },
  });

  if (!server) return redirect('/server');

  const isServerMember = await prisma.serverMember.findFirst({
    where: {
      serverId: serverId,
      userId: session.user?.id,
    },
  });

  if (!isServerMember) {
    if (server.ownerId !== session.user?.id) return redirect('/server');
  }

  return (
    <>
      <ApplicationSidebar currentServerId={server.id} isServerSelected={true} />
      <div className='flex h-full w-full flex-1 flex-col overflow-hidden'></div>
      <MemberList serverId={server.id} />
    </>
  );
}
