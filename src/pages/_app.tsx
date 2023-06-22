/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/_app.tsx
import '../styles/globals.css';
import { SessionProvider } from 'next-auth/react';
import type { AppType } from 'next/dist/shared/lib/utils';
import { trpc } from '../utils/trpc';
import { useEffect } from 'react';
import { WebSocketProvider } from '../contexts/WSProvider';
import { GlobalModalProvider, useGlobalModal } from '../contexts/ModalProvider';
import { Modal, ModalData } from '../components/modal';

const MyApp: AppType = ({ Component, pageProps }) => {
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    import('preline');
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (localStorage.getItem('theme') === 'dark') {
        window.document.body.classList.add('dark');
      } else {
        window.document.body.classList.remove('dark');
      }
    }
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
      <WebSocketProvider>
        <GlobalModalProvider>
          <Component {...pageProps} />
          <div className='pointer-events-none absolute bottom-0 left-0 right-0 top-0 z-[1002] !bg-none'>
            <ModalContainer></ModalContainer>
          </div>
        </GlobalModalProvider>
      </WebSocketProvider>
    </SessionProvider>
  );
};

const ModalContainer = () => {
  const { state, setState } = useGlobalModal();
  //console.log('[State]', state)
  if (Object.keys(state).length === 0) return null;
  if (state.state === undefined) return null;
  if (state.state === false) return null;
  return (
    <>
      <head>
        <script src='http://localhost:8097'></script>
      </head>
      <div
        className='flex items-center justify-center'
        style={{ margin: '0 auto' }}
      >
        <div
          className='fixed bottom-0 left-0 right-0 top-0 flex items-center justify-center bg-black bg-opacity-[0.85]'
          style={{ pointerEvents: 'all', transform: 'translateZ(0)' }}
        />
        <Modal
          onClose={() => {
            if (state.type === 'terms') {
              document.cookie = 'terms=1;max-age=31536000';
            }
            setState({ ...state, state: false });
          }}
          data={state as ModalData}
        />
      </div>
    </>
  );
};

export default trpc.withTRPC(MyApp);
