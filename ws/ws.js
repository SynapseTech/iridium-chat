let d = false;
/** @type {Set<{id: String, ws: WebSocket, createdAt: Date, isActive: boolean}>} */
const _clients = new Set();
/**
 * @param {WebSocketServer} wss
 * @param {boolean} debug
 */
const socketHandler = (wss, debug) => {
  if (debug) d = true;
  wss.on(
    'connection',
    (
      /** @type {WebSocket} */
      ws,
    ) => {
      ws.on('error', console.error);
      const connectionID = Math.random().toString(36).substr(2, 9);
      if (debug) console.log(connectionID);
      _clients.add({
        id: connectionID,
        ws,
        createdAt: new Date(),
        isActive: true,
      });
      ws.onmessage = (e) => {
        if (e.data === 'handshake') {
          console.log(
            '[Iridium WS - Connection Event]',
            `Client ${connectionID} Handshake Received`,
          );
          ws.send(JSON.stringify({ type: 'connectionID', data: connectionID }));
        }
      };
      console.log(
        '[Iridium WS - Events]',
        'New client connected | ID: ',
        connectionID,
      );
      ws.on('close', () => {
        console.log(
          '[Iridium WS - Events]',
          `Client ${connectionID} Disconnected`,
        );
        [..._clients].find((c) => c.id === connectionID).isActive = false;
      });
    },
  );
};

/** @param {any} data @param {string} nonce */
const broadcastMessage = (msg, nonce) => {
  console.log(`[Iridium WS - Events]`, 'Emitted createMessage event');
  if (d) console.log(`[Iridium WS - Events]`, `Message: `, msg);
  _clients.forEach(({ ws }) => {
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
  console.log(`[Iridium WS - Events]`, `Emitted ${event} event`);
  if (d) console.log(`[Iridium WS - Events]`, `Data: `, data);
  _clients.forEach(({ ws }) => ws.send(JSON.stringify({ type: event, data })));
};

/** @param {string} id */
const deleteClient = (id) => {
  const wsObj = [..._clients].find((c) => c.id === id);
  if (wsObj) {
    _clients.delete(wsObj);
  }
};

module.exports = {
  broadcastMessage,
  broadcastEvent,
  socketHandler,
  deleteClient,
  clients: _clients,
};
