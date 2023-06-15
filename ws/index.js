const http = require('http');
const { parse } = require('url');
const { WebSocketServer } = require('ws');
const { socketHandler, broadcastMessage, broadcastEvent } = require('./ws');
require('dotenv').config();

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
  if (req.url === '/stats') {
    res.writeHead(200);
    res.end(JSON.stringify({ clients: wss.clients.size }));
    return;
  }
  res.writeHead(200);
  res.end();
};
const server = http.createServer(requestListener);

// eslint-disable-next-line @typescript-eslint/naming-convention
const wss = new WebSocketServer({ noServer: true, perMessageDeflate: false });
/** @type {Set<WebSocket>} */
const clients = new Set();

server.on('upgrade', function upgrade(request, socket, head) {
  const { pathname } = parse(request.url);

  if (pathname === '/') {
    wss.handleUpgrade(request, socket, head, function done(ws) {
      wss.emit('connection', ws, request);
      console.log(
        '[Iridium WS] Upgraded WebSocket and emitted connection event',
      );
    });
  } else {
    socket.destroy();
  }
});

// Websocket Server
/** @param {WebSocketServer} wss */
function startWS(wss) {
  console.log('[Iridium WS] Started WebSocket Server');
  if (process.argv.includes('--debug'))
    console.log('[Iridium WS] Debug mode enabled');
  socketHandler(wss, process.argv.includes('--debug') ? true : false);
}

startWS(wss, clients);
const port = 8080;
server.listen(port, () => {
  console.log(`[Iridium WS] WebSocket Server listening on port ${port}`);
});
