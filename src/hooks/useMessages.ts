import { useWS } from "../contexts/WSProvider";
import { TextMessage, User } from "@prisma/client";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { trpc } from '../utils/trpc';

export type MessageType = TextMessage & { author: User };

const useMessages = (channelId: string, onRecieve: (msg: MessageType) => void): [MessageType[], boolean, () => void] => {
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  const loadMessagesQuery = trpc.channel.fetchMessages.useQuery({ channelId: channelId, start: messages.length });

  const wsContext = useWS();
  if (!wsContext) throw new Error('WSContext not found');
  const waitingToReconnect = wsContext?.connecting;
  const wsClient = wsContext?.ws;

  /**
   * Reset Messages and set loading to true when channel route changes
   */
  useEffect(() => {
    setMessages([]);
    setLoading(true);
  }, [router.asPath]);

  useEffect(() => {
    if (loadMessagesQuery.data && loading) {
      setMessages(prev => loadMessagesQuery.data.concat(prev));
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadMessagesQuery.data]) // run when data fetch

  useEffect(() => {
    if (wsClient !== undefined) {
      (wsClient as WebSocket).onmessage = (event) => {
        const data: { type: string, data: MessageType } = JSON.parse(event.data);

        if (data.type === 'message') {
          if (data.data.channelId === channelId && !messages.some(msg => msg.id === data.data.id)) {
            onRecieve(data.data);
            setMessages((prevMessages) => prevMessages.concat(data.data));
          }
        }
      };
    }
  }, [wsClient, messages]) // eslint-disable-line react-hooks/exhaustive-deps

  const forceLoadMessages = () => {
    setLoading(true);
    loadMessagesQuery.refetch();
  }

  return [messages, loading, forceLoadMessages];
};

export default useMessages;