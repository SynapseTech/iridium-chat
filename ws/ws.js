/** @type {Set<WebSocket>} */
const clients = new Set();

/** @param {WebSocketServer} wss */
const socketHandler = (wss) => {
  wss.on('connection', (ws) => {
    ws.on('error', console.error);
    clients.add(ws);
    console.log('ws++');
    ws.on('close', () => {
      console.log('ws--');
      clients.delete(ws);
    });
  });
};


/** @param {any} data @param {string} nonce */
const broadcastMessage = (
  msg,
  nonce,
) => {
  console.log(`[WebSocket Events]`, 'Emitted createMessage event');
  clients.forEach((ws) => {
      ws.send(
        JSON.stringify({
          type: 'createMessage',
          data: msg,
          nonce,
        }),
      );
    }
  );
};
/** @param {string} event @param {any} data */
const broadcastEvent = (
  event,
  data
) => {
  console.log(`[WebSocket Events]`, `Emitted ${event} event`);
  clients.forEach((ws) => ws.send(JSON.stringify({ type: event, data })));
};


module.exports = {
  broadcastMessage,
  broadcastEvent,
  socketHandler,
};
