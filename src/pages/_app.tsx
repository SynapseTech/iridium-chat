/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/_app.tsx
import '../styles/globals.css';
import { SessionProvider } from 'next-auth/react';
import type { AppType } from 'next/dist/shared/lib/utils';
import { trpc } from '../utils/trpc';
import { useEffect, useRef, useState } from 'react';
import { WSProvider } from '../contexts/WSProvider';
import { Modal } from '../components/modal';

const MyApp: AppType = ({ Component, pageProps }) => {
  const [isOpen, setOpen] = useState(true);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    import('preline');
  }, []);

  const wsInstance = useRef<WebSocket | null>(null);
  const [waitingToReconnect, setWaitingToReconnect] = useState<boolean>(false);
  const [wsClient, setClient] = useState<WebSocket | undefined>(undefined);

  //WebSocket Magic
  useEffect(() => {
    if (waitingToReconnect) return;
    const startSocket = async () => await fetch('/api/socket');

    // Only set up the websocket once
    if (!wsInstance.current) {
      startSocket();
      const client = new WebSocket(
        `ws${window.location.protocol === 'https:' ? 's' : ''}://${window.location.host
        }/api/socket`,
      );
      wsInstance.current = client;

      setClient(client);
      client.onerror = (e) => console.error(e);
      client.onopen = () => console.log(`[WebSocket]`, `WebSocket Opened`);
      client.onclose = () => {
        if (wsInstance.current) {
          // Connection failed
          console.log('[WebSocket]', 'WebSocket was closed by Server');
        } else {
          // Cleanup initiated from app side, can return here, to not attempt a reconnect
          console.log(
            '[WebSocket]',
            'WebSocket was closed by App Component unmounting',
          );
          return;
        }

        if (waitingToReconnect) return;
        console.log('[WebSocket]', 'WebSocket Closed');

        // Setting this will trigger a re-run of the effect,
        // cleaning up the current websocket, but not setting
        // up a new one right away
        setWaitingToReconnect(true);

        // This will trigger another re-run, and because it is false,
        // the socket will be set up again
        setTimeout(() => setWaitingToReconnect(false), 5000);
      };

      return () => {
        console.log('[WebSocket]', 'Cleanup WebSocket Connection');
        // Dereference, so it will set up next time
        wsInstance.current = null;
        setClient(undefined);
        client.close();
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [waitingToReconnect]);

  useEffect(() => {
    // if (document) {
    //   document.body.classList.add('dark');
    // }
    if (window.console) {
      console.log(`
  .  . .  .  . .  .  . .  .  . .  .  .  
   .       .       .       .       .   .
     .  .    .  .  %%  . .    . .    .  
 .       .       .%         .     .     
   .  .    .  .  t8   %..  .   .    .  .
  .    .  .    . 888 8X. .       .   .  
    .       .   @888  88;.   . .   .    
  .   . .    . 8888  8888. .     .    . 
    .     .   t88888   X8;  .       .   
  .    .   . .88888   8888. .  .  .    .
     .   .   888888888888@8;        .   
  .    .    .;8888888888888. .  .     . 
    .     .  t888888@888888.      .  .  
  .   .     . t88888888X88;  .  .       
    .   .   . t8888888888:  .      .  . 
  .      .    :t8X888888S.    .  .      
     . .    .  ;X8888888:. .   .    .  .
  .       .   . :888888;.    .    .     
    .  .        ..88%8.   .     .    .  
  .     .   .  . :t8@:  .   . .    .    
    . .   .       :;  .          .    . 
  .          . .  . .    . .  .     .   
     .  . .     .      .       .  .    
Iridium Chat: A Synapse Technologies Product. Check out the code at https://github.com/SynapseTech/iridium-chat/.
		`);
    }
  }, []);

  return (
    <SessionProvider session={(pageProps as any).session}>
      <WSProvider ws={wsClient} connecting={waitingToReconnect}>
        <Component {...pageProps} />
        <div className='absolute top-0 left-0 right-0 bottom-0 !bg-none pointer-events-none z-[1002]'>
          {isOpen && (pageProps as any).mData !== undefined ? (
            <div className='flex justify-center items-center' style={{ margin: '0 auto' }}>
              <div className='fixed top-0 left-0 right-0 bottom-0 bg-black bg-opacity-[0.85] flex items-center justify-center' style={{ pointerEvents: 'all', transform: 'translateZ(0)' }} />
              <Modal onClose={() => setOpen(false)} data={(pageProps as any).mData} />
            </div>
          ) : null}
        </div>
      </WSProvider>
    </SessionProvider >
  );
};

export default trpc.withTRPC(MyApp);
