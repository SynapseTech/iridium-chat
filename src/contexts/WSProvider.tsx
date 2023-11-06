import React, { createContext, useContext, useEffect, useState } from 'react';
import { trpc } from '../utils/trpc';

type WSContextType = {
  ws: WebSocket | null;
  connecting: boolean;
};

const WSContext = createContext<WSContextType>({ ws: null, connecting: true });

export const useWS = (): WSContextType => useContext(WSContext);

type Props = {
  children?: React.ReactNode;
};

export const WebSocketProvider: React.FC<Props> = ({ children }) => {
  const [ws, setWS] = useState<WebSocket | null>(null);
  const [connecting, setConnecting] = useState<boolean>(true);
  const [webSocketClients, setWebSocketClients] = useState<
    { id: string; userId: string }[]
  >([]);
  const loadWebSocketClients = trpc.server.getWebSockets.useQuery();

  useEffect(() => {
    if (loadWebSocketClients.data)
      setWebSocketClients(loadWebSocketClients.data);
  }, [loadWebSocketClients.data]);

  const reconnect = (connectionID: string) => {
    console.log('[WebSocket] Reconnecting...');
    const newWS = new WebSocket(url + `?id=${connectionID}`);

    setConnecting(true);

    newWS.onopen = () => {
      console.log('[WebSocket] Connection established.');
      setWS(newWS);
      setConnecting(false);
    };

    newWS.onclose = () => {
      console.log('[WebSocket] Connection closed. Attempting to reconnect...');
      setTimeout(() => {
        const validConnectionID = webSocketClients.find(
          (client) => client.id === connectionID,
        );
        if (validConnectionID) {
          console.log(
            `[WebSocket] Valid connection ID found in webSocketClients: ${validConnectionID.id}`,
          );
          reconnect(validConnectionID.id);
        } else {
          console.log(
            '[WebSocket] No valid connection ID found in webSocketClients. Creating new WebSocket connection...',
          );
          const newConnection = new WebSocket(url);
          newConnection.onopen = () => {
            console.log('[WebSocket] Connection established.');
            setWS(newConnection);
            newConnection.send('handshake');
          };

          newConnection.onmessage = (event) => {
            const message = JSON.parse(event.data.toString());
            if (message.type === 'connectionID') {
              // console.log(`Connection ID: ${message.data}`);
              localStorage.setItem('wsConnectionID', message.data);
              console.log('[WebSocket] Client Authenticated.');
              setConnecting(false);
            }
          };

          setWS(newConnection);
        }
      }, 5000);
    };
  };

  const url = 'ws://localhost:8080';

  useEffect(() => {
    const newWS = new WebSocket(url);

    setConnecting(true);

    newWS.onopen = () => {
      console.log('[WebSocket] Connection established.');
      setWS(newWS);
      newWS?.send('handshake');
    };

    newWS.onmessage = (event) => {
      const message = JSON.parse(event.data.toString());
      if (message.type === 'connectionID') {
        // console.log(`Connection ID: ${message.data}`);
        newWS.send(
          JSON.stringify({
            type: 'authenticate',
            data: {
              connectionID: message.data,
              userID: localStorage.getItem('userId'),
            },
          }),
        );
        localStorage.setItem('wsConnectionID', message.data);
        console.log('[WebSocket] Client Authenticated.');
        setConnecting(false);
      }
    };

    newWS.onclose = () => {
      console.log('[WebSocket] Connection closed. Attempting to reconnect...');
      setTimeout(() => {
        const connectionID = localStorage.getItem('wsConnectionID');
        if (connectionID) {
          console.log(
            `[WebSocket] Connection ID found in localStorage: ${connectionID}`,
          );
          reconnect(connectionID);
        } else {
          console.log(
            '[WebSocket] No connection ID found in localStorage. Creating new WebSocket connection...',
          );
          const newConnection = new WebSocket(url);
          newConnection.onopen = () => {
            console.log('[WebSocket] Connection established.');
            newConnection.send('handshake');
          };

          newConnection.onmessage = (event) => {
            const message = JSON.parse(event.data.toString());
            if (message.type === 'connectionID') {
              // console.log(`Connection ID: ${message.data}`);
              localStorage.setItem('wsConnectionID', message.data);
              console.log('[WebSocket] Client Authenticated.');
            }
          };

          setWS(newConnection);
        }
      }, 5000);
    };

    return () => {
      newWS.close();
    };
  }, []);

  return (
    <WSContext.Provider value={{ ws, connecting }}>
      {children}
    </WSContext.Provider>
  );
};
