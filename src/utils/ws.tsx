import { useRouter } from 'next/router';
import { createContext, useContext, useMemo, useEffect, ReactNode } from 'react';

type WSProviderProps = { children: ReactNode; url: string };

const WSStateContext = createContext<WebSocket | null>(null);

function WSProvider({ children, url }: WSProviderProps): JSX.Element {
  const rt = useRouter()
  const wsInstance = useMemo(
    () => (typeof window != 'undefined' ? new WebSocket(`ws${window.location.protocol === 'https:' ? 's' : ''}://${window.location.host}/${url}`) : null),
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