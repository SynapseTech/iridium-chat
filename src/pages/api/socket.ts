import { NextApiRequest, NextApiResponse } from 'next';
import { WebSocketServer } from 'ws';
import { getServerAuthSession } from '../../server/common/get-server-auth-session';
import socketHandler from '../../server/socket';

const socketBinder = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getServerAuthSession({ req, res });

  if (session) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (res.socket.server.ws) {
      console.log('Socket is already running, not reinitializing.');
    } else {
      console.log('Socket is initializing');
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const wss = new WebSocketServer({ server: res.socket.server });
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      res.socket.server.ws = wss;

      socketHandler(wss);
    }
  } else res.end('This is not a public endpoint.');
};

export default socketBinder;
