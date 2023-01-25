import { useWS } from '../contexts/WSProvider';
import { TextMessage, User } from '@prisma/client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { trpc } from '../utils/trpc';
import { RawEmbed } from '../server/trpc/router/channel';

export type MessageType = TextMessage & { author: User, embeds: RawEmbed[] };

/**
 * Custom hook to handle loading of messages.
 *
 * @param channelId Id of channel to load messages from
 * @param onRecieve Optional callback when message recieved
 *
 * @returns [An array of messages, boolean indicating whether or not messages
 * are loading, function to forcefully load more messages]
 *
 * @author Liz Ainslie
 */
const useMessages = (
  channelId: string,
  onRecieve?: (msg: MessageType, nonce: string) => void,
): [MessageType[], boolean, () => void] => {
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  const loadMessagesQuery = trpc.channel.fetchMessages.useQuery({
    channelId: channelId,
    start: messages.length,
  });

  const wsContext = useWS();
  if (!wsContext) throw new Error('WSContext not found');
  const wsClient = wsContext?.ws;

  /**
   * Reset messages and set loading to true when channel route changes
   */
  useEffect(() => {
    setMessages([]);
    setLoading(true);
  }, [router.asPath]);

  /**
   * Load messages via tRPC
   *
   * Runs whenever the query's data value changes
   */
  useEffect(() => {
    if (loadMessagesQuery.data && loading) {
      setMessages((prev) => loadMessagesQuery.data.concat(prev));
      setLoading(false);

      const latestLoaded = loadMessagesQuery.data.at(-1);
      if (latestLoaded) {
        const el = document.getElementById(`message_${latestLoaded.id}`);
        el?.scrollIntoView(true);
      }
    }
  }, [loadMessagesQuery.data]); // eslint-disable-line react-hooks/exhaustive-deps

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onMessageHandler = useCallback((event: MessageEvent<any>) => {
    const data: { type: string; data: MessageType; nonce: string } = JSON.parse(
      event.data,
    );

    if (data.type === 'createMessage') {
      if (
        data.data.channelId === channelId &&
        !messages.some((msg) => msg.id === data.data.id)
      ) {
        onRecieve?.(data.data, data.nonce);
        setMessages((prevMessages) => prevMessages.concat(data.data));
      }
    }

    if (data.type === 'deleteMessage') {
      setMessages((prev) => {
        const index = prev.findIndex((msg) => msg.id === data.data.id);
        if (index !== -1) {
          prev.splice(index, 1);
          return prev;
        }
        return prev;
      });
    }

    if (data.type === 'editMessage') {
      onRecieve?.(data.data, data.nonce);
      setMessages((prev) => {
        const index = prev.findIndex((msg) => msg.id === data.data.id);
        if (index !== -1) {
          prev[index] = data.data;
          return prev;
        }
        return prev;
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    wsClient?.addEventListener('message', onMessageHandler);

    return () => {
      wsClient?.removeEventListener('message', onMessageHandler);
    };
  }, [wsClient, messages]); // eslint-disable-line react-hooks/exhaustive-deps

  const forceLoadMessages = () => {
    setLoading(true);
    loadMessagesQuery.refetch();
  };

  return [messages, loading, forceLoadMessages];
};

export default useMessages;
