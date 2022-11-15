import { NextPage } from 'next'
import Head from 'next/head'
import { useEffect, useRef, useState } from 'react'

const ChatPage: NextPage = () => {
  const wsInstance: any = useRef(null)
  const [waitingToReconnect, setWaitingToReconnect] = useState(false)
  const [wsClient, setClient]: any = useState(null)
  //WebSocket Magic
  useEffect(() => {
    if (waitingToReconnect) {
      return
    }

    const startSocket = async () => {
      await fetch('/api/socket')
    }
    // Only set up the websocket once
    if (!wsInstance.current) {
      startSocket()
      const client = new WebSocket(`ws://localhost:3000`)
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

        if (waitingToReconnect) {
          return
        }

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
        setClient(null)

        client.close()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [waitingToReconnect])

  useEffect(() => {
    if (wsClient !== null) {
      wsClient.addEventListener('message', function (event: any) {
        const data = event.data
        console.log(data)
      })
    }
  }, [wsClient])

  return (
    <div>
      <Head>
        <title>Iridium Chat</title>
      </Head>

      <main className="h-screen w-screen bg-gray-50 dark:bg-slate-900"></main>
    </div>
  )
}

export default ChatPage
