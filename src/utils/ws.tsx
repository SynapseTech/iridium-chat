import { createContext, useContext, useMemo, useEffect, ReactNode } from 'react';

type WSProviderProps = { children: ReactNode; url: string };

const WSStateContext = createContext<WebSocket | null>(null);

function WSProvider({ children, url }: WSProviderProps): JSX.Element {
  const wsInstance = useMemo(
    () => (typeof window != 'undefined' ? new WebSocket(`ws://127.0.0.1:8001/ws${url}`) : null),
    []
  );

  useEffect(() => {
    return () => {
      wsInstance?.close();
    };
  }, []);

  return <WSStateContext.Provider value={wsInstance}>{children}</WSStateContext.Provider>;
}

function useWS(): WebSocket {
  const context = useContext(WSStateContext);

  if (context == undefined) {
    throw new Error('useWS must be used within a WSProvider');
  }

  return context;
}

export { WSProvider, useWS };import { createContext, useContext, useMemo, useEffect, ReactNode } from 'react';

type WSProviderProps = { children: ReactNode; url: string };

const WSStateContext = createContext<WebSocket | null>(null);

function WSProvider({ children, url }: WSProviderProps): JSX.Element {
  const wsInstance = useMemo(
    () => (typeof window != 'undefined' ? new WebSocket(`ws://127.0.0.1:8001/ws${url}`) : null),
    []
  );

  useEffect(() => {
    return () => {
      wsInstance?.close();
    };
  }, []);

  return <WSStateContext.Provider value={wsInstance}>{children}</WSStateContext.Provider>;
}

function useWS(): WebSocket {
  const context = useContext(WSStateContext);

  if (context == undefined) {
    throw new Error('useWS must be used within a WSProvider');
  }

  return context;
}

export { WSProvider, useWS };