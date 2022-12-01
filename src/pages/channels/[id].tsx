/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { TextChannel, TextMessage, User } from '@prisma/client'
import { Hashtag } from 'iconsax-react'
import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult, NextPage } from 'next'
import Head from 'next/head';
import React, { useEffect, useRef, useState } from 'react'
import Message from '../../components/message'
import { getServerAuthSession } from '../../server/common/get-server-auth-session'
import { trpc } from '../../utils/trpc'
import { prisma } from '../../server/db/client'
import { useSession } from 'next-auth/react'
import { LoadingMessage } from '../../components/loading';
import MessageBox from '../../components/messageBox';
import { useRouter } from 'next/router';
import ApplicationSidebar from '../../components/appSidebar';
import { useWS } from '../../contexts/WSProvider';

type ChatPageServerSideProps = {
  channel: TextChannel;
};

type ChatPageProps = ChatPageServerSideProps;

const ChatPage: NextPage<ChatPageProps> = ({ channel }) => {
  const { data: session } = useSession();
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  const wsContext = useWS();
  if (!wsContext) throw new Error('WSContext not found');
  const waitingToReconnect = wsContext?.connecting;
  const wsClient = wsContext?.ws;


  const [messages, setMessages] = useState<(TextMessage & { author: User })[]>([]);
  const pendingMessage = useRef<(TextMessage & { author: User }) | null>(null);
  const loadMessagesQuery = trpc.channel.fetchMessages.useQuery({ channelId: channel.id, start: messages.length });
  const createMessageMutation = trpc.channel.createMessage.useMutation();
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  /**
   * Reset Messages and set loading to true when channel route changes
   */
  useEffect(() => {
    setMessages([]);
    setLoading(true);
  }, [router.asPath]);

  /**
   * Load initial messages using tRPC on page load.
   */
  useEffect(() => {
    if (loadMessagesQuery.data && loading) {
      setMessages(prev => loadMessagesQuery.data.concat(prev));
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadMessagesQuery.data]) // run when data fetch


  function sendMessage(msg: string) {
    if (msg.trim() === '') return;
    pendingMessage.current = {
      createdTimestamp: new Date(),
      content: msg.trim(),
      id: '',
      channelId: channel.id,
      authorId: session!.user!.id,
      author: {
        id: session!.user!.id,
        name: session!.user!.name!,
        email: '',
        emailVerified: new Date(),
        image: session!.user!.image!,
      }
    };
    console.log('send', pendingMessage)
    createMessageMutation.mutate({ channelId: channel.id, content: msg });
    return {
      sent: true,
    }
  }

  useEffect(() => {
    if (wsClient !== undefined) {
      (wsClient as WebSocket).onmessage = (event) => {
        const data: { type: string, data: TextMessage & { author: User } } = JSON.parse(event.data);

        if (data.type === 'message') {
          if (data.data.channelId === channel.id && !messages.some(msg => msg.id === data.data.id)) {
            if (
              pendingMessage.current &&
              data.data.authorId === pendingMessage.current.authorId &&
              data.data.content === pendingMessage.current.content
            ) {
              pendingMessage.current = null;
            }
            setMessages((prevMessages) => prevMessages.concat(data.data));
          }
        }
      };
    }
  }, [wsClient, messages]) // eslint-disable-line react-hooks/exhaustive-deps

  function handleScroll(e: React.UIEvent<HTMLElement>) {
    if (e.currentTarget.scrollHeight + e.currentTarget.scrollTop === e.currentTarget.clientHeight) {
      setLoading(true);
      loadMessagesQuery.refetch();
    }
  }

  return (
    <div>
      <Head>
        <title>Iridium Chat</title>
      </Head>

      <main className="h-screen w-screen bg-gray-50 dark:bg-slate-900 flex">
        <ApplicationSidebar currentChannelId={channel.id} />
        <div className='flex-grow flex flex-col'>
          <div className='px-6 py-4 border-b border-gray-200 bg-white flex gap-x-4 content-center'>
            <Hashtag color='currentColor' className='w-7 h-7 opacity-50' />
            <div className='text-xl font-semibold dark:text-white'>
              {channel.name}
            </div>
          </div>
          <div className='flex-grow relative'>
            <div className={`${messages.length === 0 ? "overflow-y-hidden" : "overflow-y-auto"} flex flex-col-reverse absolute top-0 bottom-0 w-full`} onScroll={handleScroll}>
              <div className="grid grid-cols-1 gap-3 justify-end items-stretch">
                {loading ?
                  <LoadingMessage /> : ""
                }
                {messages.map((message, idx) => <Message key={idx} message={message} />)}
                {pendingMessage.current && <Message pending message={pendingMessage.current} />}
              </div>
              <div ref={messagesEndRef} />
            </div>
          </div>
          <div className='border-t border-gray-200 px-6 py-4 bg-white'>
            <MessageBox connecting={waitingToReconnect} channelName={`#${channel.name}`} onSend={sendMessage} />
          </div>
        </div >
      </main >
    </div >
  )
}

export const getServerSideProps: GetServerSideProps = async ({ req, res, params }: GetServerSidePropsContext): Promise<GetServerSidePropsResult<ChatPageServerSideProps>> => {
  const session = await getServerAuthSession({ req, res });

  if (!session || !params) return {
    redirect: {
      destination: '/',
      permanent: false,
    },
  };

  const channelId = params['id'] as string;
  const channel = await prisma.textChannel.findUnique({
    where: {
      id: channelId,
    },
  });

  if (!channel) return {
    notFound: true,
  };

  return {
    props: {
      channel: JSON.parse(JSON.stringify(channel)), // dumbshit
    },
  };
}


export default ChatPage
