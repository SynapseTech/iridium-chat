/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { TextChannel, TextMessage, User } from '@prisma/client'
import { Hashtag } from 'iconsax-react'
import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult, NextPage } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'
import Message from '../../components/message'
import { getServerAuthSession } from '../../server/common/get-server-auth-session'
import { trpc } from '../../utils/trpc'
import { prisma } from '../../server/db/client'
import { useSession } from 'next-auth/react'
import { createEditor, Text } from 'slate';
import { Slate, Editable, withReact } from 'slate-react';
import { BaseEditor, Descendant, Transforms, Editor } from 'slate'
import { ReactEditor } from 'slate-react';
import Prism from 'prismjs';

Prism.languages.markdown = Prism.languages.extend("markup", {});
Prism.languages.insertBefore("markdown", "prolog", {
  // blockquote: {
  //   pattern: /^>(?:[\t ]*>)*/m, alias: "punctuation"
  // },
  code: [
    { pattern: /^(?: {4}|\t).+/m, alias: "keyword" },
    { pattern: /``.+?``|`[^`\n]+`/, alias: "keyword" }
  ],
  // title: [
  //   {
  //     pattern: /\w+.*(?:\r?\n|\r)(?:==+|--+)/,
  //     alias: "important",
  //     inside: { punctuation: /==+$|--+$/ }
  //   },
  //   {
  //     pattern: /(^\s*)#+.+/m,
  //     lookbehind: !0,
  //     alias: "important",
  //     inside: { punctuation: /^#+|#+$/ }
  //   }
  // ],
  // hr: {
  //   pattern: /(^\s*)([*-])([\t ]*\2){2,}(?=\s*$)/m,
  //   lookbehind: !0,
  //   alias: "punctuation"
  // },
  // list: {
  //   pattern: /(^\s*)(?:[*+-]|\d+\.)(?=[\t ].)/m,
  //   lookbehind: !0, alias: "punctuation"
  // },
  // "url-reference": {
  //   pattern: /!?\[[^\]]+\]:[\t ]+(?:\S+|<(?:\\.|[^>\\])+>)(?:[\t ]+(?:"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\((?:\\.|[^)\\])*\)))?/,
  //   inside: {
  //     variable: {
  //       pattern: /^(!?\[)[^\]]+/,
  //       lookbehind: !0
  //     },
  //     string: /(?:"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\((?:\\.|[^)\\])*\))$/,
  //     punctuation: /^[\[\]!:]|[<>]/
  //   },
  //   alias: "url"
  // },
  bold: {
    pattern: /(^|[^\\])(\*\*|__)(?:(?:\r?\n|\r)(?!\r?\n|\r)|.)+?\2/,
    lookbehind: !0,
    inside: { punctuation: /^\*\*|^__|\*\*$|__$/ }
  },
  italic: {
    pattern: /(^|[^\\])([*_])(?:(?:\r?\n|\r)(?!\r?\n|\r)|.)+?\2/,
    lookbehind: !0,
    inside: { punctuation: /^[*_]|[*_]$/ }
  },
  // url: {
  //   pattern: /!?\[[^\]]+\](?:\([^\s)]+(?:[\t ]+"(?:\\.|[^"\\])*")?\)| ?\[[^\]\n]*\])/,
  //   inside: {
  //     variable: {
  //       pattern: /(!?\[)[^\]]+(?=\]$)/,
  //       lookbehind: !0
  //     },
  //     string: { pattern: /"(?:\\.|[^"\\])*"(?=\)$)/ }
  //   }
  // }
});

(Prism.languages.markdown as any).bold.inside.url = Prism.util.clone(Prism.languages.markdown.url);
(Prism.languages.markdown as any).italic.inside.url = Prism.util.clone(Prism.languages.markdown.url);
(Prism.languages.markdown as any).bold.inside.italic = Prism.util.clone((Prism.languages.markdown as any).italic);
(Prism.languages.markdown as any).italic.inside.bold = Prism.util.clone((Prism.languages.markdown as any).bold); // prettier-ignore

const markdownLang = Prism.languages.markdown;

type CustomElement = { type: 'paragraph'; children: CustomText[] }
type CustomText = { text: string }

declare module 'slate' {
  interface CustomTypes {
    Editor: BaseEditor & ReactEditor
    Element: CustomElement
    Text: CustomText
  }
}

type ChatPageServerSideProps = {
  channel: TextChannel;
};

type ChatPageProps = ChatPageServerSideProps;

const ChatPage: NextPage<ChatPageProps> = ({ channel }) => {
  const { data: session } = useSession();

  const messagesEndRef = useRef<HTMLDivElement | null>(null)
  const messageContainerRef = useRef<HTMLDivElement | null>(null)
  const [editor] = useState(() => withReact(createEditor()))
  const decorate = useCallback(([node, path]: any[]) => {
    const ranges: any[] = []

    if (!Text.isText(node)) {
      return ranges
    }

    const getLength = (token: any) => {
      if (typeof token === 'string') {
        return token.length
      } else if (typeof token.content === 'string') {
        return token.content.length
      } else {
        return token.content.reduce((l: any, t: any) => l + getLength(t), 0)
      }
    }

    const tokens = Prism.tokenize(node.text, markdownLang)
    let start = 0

    for (const token of tokens) {
      const length = getLength(token)
      const end = start + length

      if (typeof token !== 'string') {
        ranges.push({
          [token.type]: true,
          anchor: { path, offset: start },
          focus: { path, offset: end },
        })
      }

      start = end
    }

    return ranges
  }, []);

  const renderLeaf = useCallback((props: any) => <Leaf {...props} />, [])

  const wsInstance = useRef<WebSocket | null>(null)
  const [waitingToReconnect, setWaitingToReconnect] = useState<boolean>(false)
  const [wsClient, setClient] = useState<WebSocket | undefined>(undefined)

  const [messages, setMessages] = useState<(TextMessage & { author: User })[]>([]);
  const pendingMessage = useRef<(TextMessage & { author: User }) | null>(null);
  const loadMessagesQuery = trpc.channel.fetchMessages.useQuery({ channelId: channel.id });
  const createMessageMutation = trpc.channel.createMessage.useMutation();

  const [channels, setChannels] = useState<TextChannel[]>([]);
  // const createChannelMutation = trpc.channel.create.useMutation();
  const loadChannelsQuery = trpc.channel.getAccessible.useQuery();

  /**
   * Load initial messages using tRPC on page load.
   */
  useEffect(() => {
    if (loadMessagesQuery.data) setMessages(loadMessagesQuery.data);
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
        console.log(`[WebSocket] WebSocket Opened`)
      }

      client.onclose = () => {
        if (wsInstance.current) {
          // Connection failed
          console.log('[WebSocket] WebSocket was closed by Server')
        } else {
          // Cleanup initiated from app side, can return here, to not attempt a reconnect
          console.log(
            '[WebSocket] WebSocket was closed by App Component unmounting',
          )
          return
        }

        if (waitingToReconnect) return

        // Parse event code and log
        console.log('[WebSocket] WebSocket Closed')

        // Setting this will trigger a re-run of the effect,
        // cleaning up the current websocket, but not setting
        // up a new one right away
        setWaitingToReconnect(true);
        //(document.getElementById('textInput') as HTMLInputElement).value = "";


        // This will trigger another re-run, and because it is false,
        // the socket will be set up again
        setTimeout(() => setWaitingToReconnect(false), 5000)
      }

      return () => {
        console.log('[WebSocket] Cleanup WebSocket Connection')
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

  const initialValue: Descendant[] = [
    {
      type: 'paragraph',
      children: [{ text: '' }],
    }
  ];

  return (
    <div>
      <Head>
        <title>Iridium Chat</title>
      </Head>

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
                <Link href={`/channels/${id}`}>
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
            <div className="overflow-y-auto flex flex-col-reverse absolute top-0 bottom-0 w-full">
              <div className="grid grid-cols-1 gap-3 justify-end items-stretch">
                {messages.map((message, idx) => <Message key={idx} message={message} />)}
                {pendingMessage.current && <Message pending message={pendingMessage.current} />}
              </div>
              <div ref={messagesEndRef} />
            </div>
          </div>
          <div className='border-t border-gray-200 px-6 py-4 bg-white flex items-center'>
            <Slate editor={editor} value={initialValue}>
              <Editable
                decorate={decorate}
                renderLeaf={renderLeaf}
                className='py-3 px-4 block w-full border-gray-200 rounded-md text-sm focus:outline-none focus:border-brand-600 focus:ring-brand-600 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400'
                id="editor"
                placeholder={waitingToReconnect ? "WebSocket is Connecting. Please Hold..." : `Message #${channel.name}`}
                onKeyDown={e => {
                  if (e.shiftKey && e.key === 'Enter') {
                    e.preventDefault();
                    editor.insertText('\n');
                    return;
                  }
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if ((e.target as HTMLDivElement).outerText.includes(`Message #${channel.name}`)) return;
                    const sendingMsg = sendMessage((e.target as HTMLDivElement).outerText);
                    if (sendingMsg?.sent) {
                      Transforms.delete(editor, {
                        at: {
                          anchor: Editor.start(editor, []),
                          focus: Editor.end(editor, []),
                        },
                      });
                    }
                    return;
                  }
                }}
                readOnly={waitingToReconnect}
              />
            </Slate>
            <button type="submit" className="py-3 px-4 inline-flex justify-center items-center gap-2 rounded-md bg-brand-100 border border-transparent font-semibold text-brand-600 hover:text-white hover:bg-brand-600 focus:outline-none focus:ring-2 ring-offset-white focus:ring-brand-600 focus:text-white focus:bg-brand-600 focus:ring-offset-2 transition-all text-sm dark:focus:ring-offset-gray-800" disabled={waitingToReconnect} onClick={() => {
              if ((editor.children[0] as any)?.children[0].text.length === 0) return;
              const sendingMsg = sendMessage((editor.children[0] as any)?.children[0].text);
              if (sendingMsg?.sent) {
                Transforms.delete(editor, {
                  at: {
                    anchor: Editor.start(editor, []),
                    focus: Editor.end(editor, []),
                  },
                });
              }
            }}>
              Send
            </button>
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

const Leaf = ({ attributes, children, leaf }: any) => {
  return (
    <span
      {...attributes}
      className={`${leaf.bold && 'font-bold'} ${leaf.italic && 'italic'} ${leaf.underlined && 'underline'} ${leaf.title && 'text-2xl font-bold my-4'} ${leaf.list && 'pl-4 text-xl'} ${leaf.hr && 'block text-center border-b-2 border-gray-300'} ${leaf.blockquote && 'pl-4 text-gray-400 italic'} ${leaf.code && 'font-mono bg-gray-100 p-1'}`}
    >
      {children}
    </span>
  )
}


export default ChatPage
