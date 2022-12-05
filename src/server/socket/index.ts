import { TextMessage, User } from '@prisma/client';
import WebSocket, { WebSocketServer } from 'ws';
import { GlobalRef } from '../../utils/globals';

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

export const broadcastMessage = (msg: TextMessage & { author: User }) => {
  // console.log(msg);
  // console.log(socketClients.value?.size);
  socketClients.value?.forEach((ws) =>
    ws.send(
      JSON.stringify({
        type: 'message',
        data: msg,
      }),
    ),
  );
};

export default socketHandler;
