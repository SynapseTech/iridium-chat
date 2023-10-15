import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';

export type WSContext = { ws: WebSocket | null; connecting: boolean };

const wsContext = createContext<WSContext>({ ws: null, connecting: false });

export const useWebSocket = () => {
  const [ws, setWs] = useState<WebSocket | null>(null);

  useEffect(() => {
    const newWs = new WebSocket('ws://localhost:8080');
    setWs(newWs);

    return () => {
      newWs.close();
    };
  }, []);

  return {
    ws,
    setWs,
  };
};

export const WebSocketProvider = ({ children }: { children: ReactNode }) => {
  const { ws, setWs } = useWebSocket();
  const [connecting, setConnecting] = useState(false);
  const [sentHandshake, setSentHandshake] = useState(false);

  useEffect(() => {
    const onClose = () => {
      console.log('[WebSocket] Connection closed. Attempting to reconnect...');
      setConnecting(true);
      setTimeout(() => {
        const connectionID = window.localStorage.getItem('wsConnectionID');
        const reconnectionURL = `localhost:8080/?id=${connectionID}`;
        console.log('[WebSocket] Reconnecting to', reconnectionURL);
        const newWs = new WebSocket(`ws://${reconnectionURL}`);
        setWs(newWs);
      }, 5000);
    };

    const onOpen = () => {
      setConnecting(false);
      console.log('[WebSocket] Connected to server.');
      if (!sentHandshake) {
        setSentHandshake(true);
        ws?.send('handshake');
      }
    };

    const onMessage = (event: MessageEvent) => {
      const message = JSON.parse(event.data);
      // console.log('[WebSocket] Received message:', message);
      if (message.type === 'connectionID') {
        setSentHandshake(true);
        const connectionID = message.data;
        // console.log('[WebSocket] Connection ID:', connectionID);
        window.localStorage.setItem('wsConnectionID', connectionID);
      }
    };

    if (ws) {
      ws.addEventListener('close', onClose);
      ws.addEventListener('error', onClose);
      ws.addEventListener('open', onOpen);
      ws.addEventListener('message', onMessage);
    }

    return () => {
      if (ws) {
        ws.removeEventListener('close', onClose);
        ws.removeEventListener('error', onClose);
        ws.removeEventListener('open', onOpen);
        ws.removeEventListener('message', onMessage);
      }
    };
  }, [ws, sentHandshake]);

  return (
    <wsContext.Provider value={{ ws, connecting }}>
      {children}
    </wsContext.Provider>
  );
};

export const useWS = () => useContext<WSContext>(wsContext);
