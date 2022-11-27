/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { TextChannel, TextMessage, User } from '@prisma/client'
import { Add, Hashtag } from 'iconsax-react'
import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult, NextPage } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import React, { useEffect, useRef, useState } from 'react'
import Message from '../../components/message'
import { getServerAuthSession } from '../../server/common/get-server-auth-session'
import { trpc } from '../../utils/trpc'
import { prisma } from '../../server/db/client'
import { useSession } from 'next-auth/react'
import { LoadingMessage } from '../../components/loading';
import MessageBox from '../../components/messageBox'
import CreateChannelModal from '../../components/createChannelModal'
import { useRouter } from 'next/router'

type ChatPageServerSideProps = {
  channel: TextChannel;
};

type ChatPageProps = ChatPageServerSideProps;


const ChatPage: NextPage<ChatPageProps> = ({ channel }) => {
  const { data: session } = useSession();
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement | null>(null)
  const messageContainerRef = useRef<HTMLDivElement | null>(null)
  const wsInstance = useRef<WebSocket | null>(null)
  const [waitingToReconnect, setWaitingToReconnect] = useState<boolean>(false)
  const [wsClient, setClient] = useState<WebSocket | undefined>(undefined)

  const [messages, setMessages] = useState<(TextMessage & { author: User })[]>([]);
  const pendingMessage = useRef<(TextMessage & { author: User }) | null>(null);
  const loadMessagesQuery = trpc.channel.fetchMessages.useQuery({ channelId: channel.id, start: messages.length });
  const createMessageMutation = trpc.channel.createMessage.useMutation();
  const [loading, setLoading] = useState<boolean>(true);
  const [getMore, setGetMore] = useState<boolean>(false);

  const [channels, setChannels] = useState<TextChannel[]>([]);
  const loadChannelsQuery = trpc.channel.getAccessible.useQuery();
  const [createChannelModalOpen, setCreateChannelModalOpen] = useState<boolean>(false);

  /**
   * Load initial messages using tRPC on page load.
   */
  useEffect(() => {
    if (loadMessagesQuery.data) {
      setMessages(loadMessagesQuery.data.concat(messages));
      setLoading(false);
    }
  }, [loadMessagesQuery.data]) // run when data fetch

  /**
   * Load accessible channels using tRPC on page load.
   */
  useEffect(() => {
    if (loadChannelsQuery.data) setChannels(loadChannelsQuery.data);
  }, [loadChannelsQuery.data]) // run when data fetch

  //WebSocket Magic
  useEffect(() => {
    if (waitingToReconnect) return;

    const startSocket = async () => await fetch('/api/socket');

    // Only set up the websocket once
    if (!wsInstance.current) {
      startSocket()
      const client = new WebSocket(`ws${window.location.protocol === 'https:' ? 's' : ''}://${window.location.host}/api/socket`)
      wsInstance.current = client

      scrollToBottom();

      setClient(client)
      client.onerror = (e) => console.error(e)

      client.onopen = () => {
        console.log(`[WebSocket]`, `WebSocket Opened`)
      }

      client.onclose = () => {
        if (wsInstance.current) {
          // Connection failed
          console.log('[WebSocket]', 'WebSocket was closed by Server')
        } else {
          // Cleanup initiated from app side, can return here, to not attempt a reconnect
          console.log(
            '[WebSocket]', 'WebSocket was closed by App Component unmounting',
          )
          return
        }

        if (waitingToReconnect) return

        // Parse event code and log
        console.log('[WebSocket]', 'WebSocket Closed')

        // Setting this will trigger a re-run of the effect,
        // cleaning up the current websocket, but not setting
        // up a new one right away
        setWaitingToReconnect(true);


        // This will trigger another re-run, and because it is false,
        // the socket will be set up again
        setTimeout(() => setWaitingToReconnect(false), 5000)
      }

      return () => {
        console.log('[WebSocket]', 'Cleanup WebSocket Connection')
        // Dereference, so it will set up next time
        wsInstance.current = null
        setClient(undefined)

        client.close()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [waitingToReconnect])

  function scrollToBottom() {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-non-null-asserted-optional-chain
    messageContainerRef.current?.scrollTo(0, messagesEndRef.current?.offsetTop! + 5 * 16)
  }

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
      console.log("on top")
      setLoading(true);
      console.log(loading)
      loadMessagesQuery.refetch();
    }
  }

  return (
    <div>
      <Head>
        <title>Iridium Chat</title>
      </Head>

      <CreateChannelModal open={createChannelModalOpen} onClose={(id?: string) => {
        setCreateChannelModalOpen(false);
        if (id) {
          router.push(`/channels/${id}`);
        }
      }}/>

      <main className="h-screen w-screen bg-gray-50 dark:bg-slate-900 flex">
        <aside className='hs-sidebar w-64 bg-white border-r border-gray-200 pt-8 pb-10 overflow-y-auto scrollbar-y flex-col'>
          <div className='px-6'>
            <Link href='/'>
              <a className="flex-none flex w-auto content-center text-xl font-semibold dark:text-white" aria-label="Iridium">
                <img className="h-8 w-8 inline" alt="iridium logo" src="/iridium_logo.svg" />
                Iridium
              </a>
            </Link>
          </div>
          <nav className='p-6 w-full flex flex-col flex-wrap'>
            <ul className="space-y-1.5">
              {channels.map(({ name, id }) => <li key={`channel_${id}`}>
                <Link href={`/channels/${id}`} >
                  <a
                    className={
                      channel.id === id
                        ? 'flex items-center gap-x-3.5 py-2 px-2.5 bg-gray-100 text-sm text-slate-700 rounded-md hover:bg-gray-100 dark:bg-gray-900 dark:text-white'
                        : 'flex items-center gap-x-3.5 py-2 px-2.5 text-sm text-slate-700 rounded-md hover:bg-gray-100 dark:hover:bg-gray-900 dark:text-slate-400 dark:hover:text-slate-300'
                    }
                  >
                    <Hashtag color='currentColor' className='w-3.5 h-3.5' />
                    {name}
                  </a>
                </Link>
              </li>)}
              <li>
                <button onClick={() => setCreateChannelModalOpen(true)} className='flex items-center gap-x-3.5 py-2 px-2.5 text-sm w-full bg-brand-600 hover:bg-brand-700 text-white rounded-md justify-center'>
                  <Add color='currentColor' className='w-3.5 h-3.5' />
                  Create Channel
                </button>
              </li>
            </ul>
          </nav>
        </aside>
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
