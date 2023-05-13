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
      <WebSocketProvider>
        <GlobalModalProvider>
          <Component {...pageProps} />
          <div className='absolute top-0 left-0 right-0 bottom-0 !bg-none pointer-events-none z-[1002]'>
            <ModalContainer></ModalContainer>
          </div>
        </GlobalModalProvider>
      </WebSocketProvider>
    </SessionProvider >
  );
};

const ModalContainer = () => {
  const { state, setState } = useGlobalModal();
  //console.log('[State]', state)
  if (Object.keys(state).length === 0) return null;
  if (state.state === undefined) return null;
  if (state.state === false) return null;
  return (
    <div className='flex justify-center items-center' style={{ margin: '0 auto' }}>
      <div className='fixed top-0 left-0 right-0 bottom-0 bg-black bg-opacity-[0.85] flex items-center justify-center' style={{ pointerEvents: 'all', transform: 'translateZ(0)' }} />
      <Modal onClose={() => {
        if (state.type === 'terms') {
          document.cookie = 'terms=1;max-age=31536000';
        }
        setState({ ...state, state: false })
      }} data={state as ModalData} />
    </div>
  )
}


export default trpc.withTRPC(MyApp);
