import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';

export type WSContext = { ws: WebSocket | undefined; connecting: boolean };

const ws = new WebSocket(
  'wss://rocky43007-reimagined-engine-jjj5gvj577j2qv7j-8080.preview.app.github.dev/',
);
console.log('[WS]', 'Connected');

const wsContext = createContext<WSContext>({ ws, connecting: false });

export const WebSocketProvider = ({ children }: { children: ReactNode }) => {
  const [_ws, setWs] = useState<WebSocket>(ws);
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    const onClose = () => {
      console.log('[WS]', 'Connection Closed');
      setConnecting(true);
      setTimeout(() => {
        setWs(
          new WebSocket(
            'wss://rocky43007-reimagined-engine-jjj5gvj577j2qv7j-8080.preview.app.github.dev/',
          ),
        );
        console.log('[WS]', 'Reconnecting...');
      }, 5000);
    };

    const onOpen = () => {
      setConnecting(false);
      console.log('[WS]', 'Connected');
    };

    _ws.addEventListener('close', onClose);
    _ws.addEventListener('error', () => onClose);
    _ws.addEventListener('open', () => onOpen);

    return () => {
      _ws.removeEventListener('close', onClose);
      _ws.removeEventListener('error', () => onClose);
      _ws.removeEventListener('open', () => onOpen);
    };
  }, [_ws, setWs]);

  return (
    <wsContext.Provider value={{ ws: _ws, connecting }}>
      {children}
    </wsContext.Provider>
  );
};

export const useWS = () => useContext<WSContext>(wsContext);
