import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

export type WSContext = { ws: WebSocket | undefined; connecting: boolean };

const ws = new WebSocket('ws://localhost:8080');
console.log(`[${new Date(Date.now()).toLocaleString()} - WebSocket]`, 'Connecting to WS System');

const wsContext = createContext<WSContext>({ ws, connecting: false });

export const WebSocketProvider = ({ children }: { children: ReactNode }) => {
  const [_ws, setWs] = useState<WebSocket>(ws);
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    const onClose = () => {
      console.log(`[${new Date(Date.now()).toLocaleString()} - WebSocket]`, 'closed');
      setConnecting(true);
      setTimeout(() => {
        setWs(new WebSocket('ws://localhost:8080'));
        console.log(`[${new Date(Date.now()).toLocaleString()} - WebSocket]`, 'Reconnecting...');
      }, 5000);
    };

    _ws.addEventListener('close', onClose);

    _ws.addEventListener('error', () => onClose);

    _ws.addEventListener('open', () => {
      setConnecting(false);
      console.log(`[${new Date(Date.now()).toLocaleString()} - WebSocket]`, 'opened');
    });

    return () => {
      _ws.removeEventListener('close', onClose);
      _ws.removeEventListener('error', () => onClose);
      _ws.removeEventListener('open', () => {
        setConnecting(false);
        console.log(`[${new Date(Date.now()).toLocaleString()} - WebSocket]`, 'opened');
      });
    };
  }, [_ws, setWs])

  return (
    <wsContext.Provider value={{ ws: _ws, connecting }}>{children}</wsContext.Provider>
  )
}

export const useWS = () => useContext<WSContext>(wsContext);