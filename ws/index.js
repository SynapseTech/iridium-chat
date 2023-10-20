const http = require('http');
const { parse } = require('url');
const { WebSocketServer } = require('ws');
const {
  socketHandler,
  broadcastMessage,
  broadcastEvent,
  clients,
} = require('./ws');
const { startWSConnectionCheckCronJob } = require('./cron');
require('dotenv').config();
debug = false;

/**
 *
 * @param {http.IncomingMessage} req
 * @param {http.ServerResponse} res
 * @returns
 */
const requestListener = function (req, res) {
  if (
    req.url === '/' &&
    req.method === 'POST' &&
    req.headers.authorization === process.env.WS_AUTH_TOKEN
  ) {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString();
    });
    req.on('end', () => {
      /** @type {{type: string, data: any, nonce: string | undefined,}} */
      const { type, data, nonce } = JSON.parse(body);
      if (type == 'createMessage') {
        broadcastMessage(data, nonce);
      } else {
        broadcastEvent(type, data);
      }
    });
    res.writeHead(200);
    res.end();
    return;
  }
  if (
    req.url === '/getClients' &&
    req.method === 'GET' &&
    req.headers.authorization === process.env.WS_AUTH_TOKEN
  ) {
    res.setHeader('Content-Type', 'application/json');
    res.writeHead(200);
    res.end(
      JSON.stringify(
        [...clients]
          .filter((c) => c.isActive)
          .map((c) => ({ id: c.id, userId: c.userId })),
      ),
    );
    return;
  }
  if (
    req.url === 'getClients' &&
    req.method === 'GET' &&
    req.headers.authorization === process.env.WS_AUTH_TOKEN
  ) {
    res.setHeader('Content-Type', 'application/json');
    res.writeHead(200);
    res.end(
      JSON.stringify(
        [...clients]
          .filter((c) => c.isActive)
          .map((c) => ({ id: c.id, userId: c.userId })),
      ),
    );
    return;
  }
  if (req.url === '/stats') {
    if (debug === false) {
      res.writeHead(403);
      res.end();
      return;
    }
    res.setHeader('Content-Type', 'application/json');
    res.writeHead(200);
    res.end(
      JSON.stringify({ clients: wss.clients.size, clientsList: [...clients] }),
    );
    return;
  }
  res.writeHead(200);
  res.end();
};
const server = http.createServer(requestListener);

// eslint-disable-next-line @typescript-eslint/naming-convention
const wss = new WebSocketServer({ noServer: true, perMessageDeflate: false });
/** @type {Set<{id: String, ws: WebSocket, createdAt: Date}>} */

server.on('upgrade', function upgrade(request, socket, head) {
  const { pathname, query } = parse(request.url);

  if (query) {
    const [type, data] = query.split('=');

    if (debug) console.log(type, data);
    if (type === 'id') {
      if (debug) console.log('Trying reconnection event');
      if (clients === undefined) return;
      if (debug) console.log(clients);
      const ws = [...clients].find((c) => c.id === data);
      if (ws) {
        ws.isActive = true;
        wss.handleUpgrade(request, socket, head, function done(ws) {
          wss.emit('connection', ws, request);
          console.log(
            '[Iridium WS - WebSocket Status] Upgraded WebSocket and emitted reconnection event',
          );
        });
      } else {
        socket.destroy();
      }
      return;
    }
    return;
  }
  if (pathname === '/') {
    wss.handleUpgrade(request, socket, head, function done(ws) {
      wss.emit('connection', ws, request);
      console.log(
        '[Iridium WS - Events] Upgraded WebSocket and emitted connection event',
      );
    });
  } else {
    socket.destroy();
  }
});

// Websocket Server
/** @param {WebSocketServer} wss */
function startWS(wss) {
  console.log('[Iridium WS - Info] Started WebSocket Server');
  if (process.argv.includes('--debug')) {
    console.log('[Iridium WS - Info] Debug mode enabled');
    debug = true;
  }

  socketHandler(wss, debug);
  startWSConnectionCheckCronJob();
}

startWS(wss);
const port = 8080;
server.listen(port, () => {
  console.log(`[Iridium WS - Info] WebSocket Server listening on port ${port}`);
});
