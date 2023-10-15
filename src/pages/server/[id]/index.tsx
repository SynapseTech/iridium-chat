/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Server, TextChannel } from '@prisma/client';
import { Hashtag } from 'iconsax-react';
import {
  GetServerSideProps,
  GetServerSidePropsContext,
  GetServerSidePropsResult,
  NextPage,
} from 'next';
import Head from 'next/head';
import React, { useRef } from 'react';
import Message from '../../../components/message';
import { getServerAuthSession } from '../../../server/common/get-server-auth-session';
import { trpc } from '../../../utils/trpc';
import { prisma } from '../../../server/db/client';
import { useSession } from 'next-auth/react';
import { LoadingMessage } from '../../../components/loading';
import MessageBox from '../../../components/messageBox';
import ApplicationSidebar from '../../../components/appSidebar';
import { useWS } from '../../../contexts/WSProvider';
import useMessages, { MessageType } from '../../../hooks/useMessages';
import { MemberList } from '../../../components/memberList';

type ChatPageServerSideProps = {
  server: Server;
  messageLink: string | null;
};

type ChatPageProps = ChatPageServerSideProps;

const ChatPage: NextPage<ChatPageProps> = ({ server }) => {
  return (
    <>
      <Head>
        <title>Iridium Chat</title>
      </Head>

      <main
        className='flex h-screen w-screen bg-white dark:bg-slate-900'
        onContextMenu={(e) => {
          e.preventDefault();
        }}
      >
        <ApplicationSidebar
          currentServerId={server.id}
          isServerSelected={true}
        />

        <div className='flex h-full w-full flex-1 flex-col overflow-hidden'></div>
        <MemberList serverId={server.id} />
      </main>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async ({
  req,
  res,
  params,
}: GetServerSidePropsContext): Promise<
  GetServerSidePropsResult<ChatPageServerSideProps>
> => {
  const session = await getServerAuthSession({ req, res });

  if (!session || !params)
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };

  const serverId = params['id'] as string;
  const server = await prisma.server.findUnique({
    where: {
      id: serverId,
    },
  });

  if (!server)
    return {
      notFound: true,
    };

  const isServerMember = await prisma.serverMember.findFirst({
    where: {
      serverId: serverId,
      userId: session.user?.id,
    },
  });

  if (!isServerMember) {
    if (server.ownerId !== session.user?.id)
      return {
        redirect: {
          destination: '/server',
          permanent: false,
        },
      };
  }

  return {
    props: {
      server: JSON.parse(JSON.stringify(server)), // dumbshit
      messageLink: null,
    },
  };
};

export default ChatPage;
