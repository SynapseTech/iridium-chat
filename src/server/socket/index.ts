import { TextMessage, User } from '@prisma/client';
import WebSocket, { WebSocketServer } from 'ws';
import { GlobalRef } from '../../utils/globals';
import { MessageType } from '../../hooks/useMessages';

export const socketClients = new GlobalRef<Set<WebSocket>>('socketClients');

const socketHandler = async (wss: WebSocketServer) => {
  if (!socketClients.value) socketClients.value = new Set();
  wss.on('connection', (ws: WebSocket) => {
    socketClients.value?.add(ws);
    console.log('ws++');
    ws.on('close', () => {
      console.log('ws--');
      socketClients.value?.delete(ws);
    });
  });
};

export const broadcastMessage = (
  msg: MessageType,
  nonce: string,
) => {
  // console.log(msg);
  // console.log(socketClients.value?.size);
  socketClients.value?.forEach((ws) =>
    ws.send(
      JSON.stringify({
        type: 'createMessage',
        data: msg,
        nonce,
      }),
    ),
  );
};
export const broadcastEvent = (
  event: string,
  data: any,
) => {
  socketClients.value?.forEach((ws) => ws.send(JSON.stringify({ type: event, data })));
};

export default socketHandler;
