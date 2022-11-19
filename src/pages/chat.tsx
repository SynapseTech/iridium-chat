import { Hashtag } from 'iconsax-react'
import { NextPage } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import { FormEvent, useEffect, useRef, useState } from 'react'

const ChatPage: NextPage = () => {
  const wsInstance = useRef<WebSocket | null>(null)
  const messagesEndRef = useRef<HTMLDivElement| null>(null)
  const messageContainerRef = useRef<HTMLDivElement| null>(null)
  const [waitingToReconnect, setWaitingToReconnect] = useState<boolean>(false)
  const [wsClient, setClient] = useState<WebSocket | undefined>(undefined)
  const [message, setMessage] = useState<string>('')
  const [messages, setMessages] = useState<{ content: string, timestamp: number }[]>([]);

  //WebSocket Magic
  useEffect(() => {
    if (waitingToReconnect) return;

    const startSocket = async () => await fetch('/api/socket');

    // Only set up the websocket once
    if (!wsInstance.current) {
      startSocket()
      const client = new WebSocket(`ws${window.location.protocol === 'https:' ? 's' : ''}://${window.location.host}`)
      wsInstance.current = client

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
        setWaitingToReconnect(true)

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
    messageContainerRef.current?.scrollTo(0, messagesEndRef.current?.offsetTop!! + 5*16)
    // messagesEndRef.current?.scrollIntoView({ 
    //   behavior: "smooth",
    //   block: "end",
    //   inline: "end",
    // });
  }

  function sendMessage(e: FormEvent) {
	  e.preventDefault();
    if (message.trim() === '') return;
    wsClient?.send(JSON.stringify({ content: message.trim(), timestamp: Date.now() }))
    scrollToBottom();
	  setMessage('');
  }

  useEffect(() => {
    if (wsClient !== undefined) {
      (wsClient as WebSocket).addEventListener('message', (event) => {
        let data: { type: string, data: { content: string; timestamp: number } } & string;
        try {
          data = JSON.parse(event.data);
        } catch (e) {
          data = event.data;
        }

        console.log(data);

        if (data.type === 'message') {
          const mutatedMessages = [...messages];
          mutatedMessages.push(data.data);
          setMessages(mutatedMessages);
        }
      });
    }
  }, [wsClient, messages])

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
              <li>
                <a className='flex items-center gap-x-3.5 py-2 px-2.5 bg-gray-100 text-sm text-slate-700 rounded-md hover:bg-gray-100 dark:bg-gray-900 dark:text-white' href='#'>
                  <Hashtag color='currentColor' className='w-3.5 h-3.5'/>
                  Current Channel
                </a>
              </li>
              <li>
                <a className='flex items-center gap-x-3.5 py-2 px-2.5 text-sm text-slate-700 rounded-md hover:bg-gray-100 dark:hover:bg-gray-900 dark:text-slate-400 dark:hover:text-slate-300' href='#'>
                  <Hashtag color='currentColor' className='w-3.5 h-3.5'/>
                  Other Channel
                </a>
              </li>
            </ul>
          </nav>
        </aside>
        <div className='flex-grow flex flex-col'>
          <div className='px-6 py-4 border-b border-gray-200 bg-white flex gap-x-4 content-center'>
            <Hashtag color='currentColor' className='w-7 h-7 opacity-50'/>
            <div className='text-xl font-semibold dark:text-white'>
              Chat
            </div>
          </div>
          <div className='flex-grow relative'>
            <div ref={messageContainerRef} className='absolute top-0 bottom-0 left-0 right-0 min-h-0 overflow-x-hidden overflow-y-scroll'>
              <div className='justify-end flex flex-col items-stretch min-h-full relative'>
                {messages.map(({ content, timestamp }, idx) => {
                  return (
                    <div key={idx} className="py-4 transform-[translateY(-5rem)]">
                      <p>{content}</p>
                      <p>{new Date(timestamp).toLocaleString()}</p>
                    </div>
                  )
                })}
              </div>
              <div ref={messagesEndRef} />
            </div>
          </div>
          <form onSubmit={sendMessage} className="flex items-center border-t border-gray-200 px-6 py-4 bg-white gap-4">
            <input
              className='py-3 px-4 block w-full border-gray-200 rounded-md text-sm focus:outline-none focus:border-brand-600 focus:ring-brand-600 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400'
              type='text'
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder='Write a message...'
            />
            <button type="submit" className="py-3 px-4 inline-flex justify-center items-center gap-2 rounded-md bg-brand-100 border border-transparent font-semibold text-brand-600 hover:text-white hover:bg-brand-600 focus:outline-none focus:ring-2 ring-offset-white focus:ring-brand-600 focus:text-white focus:bg-brand-600 focus:ring-offset-2 transition-all text-sm dark:focus:ring-offset-gray-800">
              Send
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}

export default ChatPage
