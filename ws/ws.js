/** @type {Set<WebSocket>} */
const clients = new Set();
let d = false;

/**
 * @param {WebSocketServer} wss
 * @param {boolean} debug
 */
const socketHandler = (wss, debug) => {
  if (debug) d = true;
  wss.on('connection', (ws) => {
    ws.on('error', console.error);
    clients.add(ws);
    console.log('[Websocket Events]', 'New client connected');
    ws.on('close', () => {
      console.log('[Websocket Events]', 'Client Disconnected');
      clients.delete(ws);
    });
  });
};

/** @param {any} data @param {string} nonce */
const broadcastMessage = (msg, nonce) => {
  console.log(`[WebSocket Events]`, 'Emitted createMessage event');
  if (d) console.log(`[WebSocket Events]`, `Message: `, msg);
  clients.forEach((ws) => {
    ws.send(
      JSON.stringify({
        type: 'createMessage',
        data: msg,
        nonce,
      }),
    );
  });
};
/** @param {string} event @param {any} data */
const broadcastEvent = (event, data) => {
  console.log(`[WebSocket Events]`, `Emitted ${event} event`);
  if (d) console.log(`[WebSocket Events]`, `Data: `, data);
  clients.forEach((ws) => ws.send(JSON.stringify({ type: event, data })));
};

module.exports = {
  broadcastMessage,
  broadcastEvent,
  socketHandler,
};
