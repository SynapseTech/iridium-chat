'use client';
import { SessionProvider } from "next-auth/react";
import { getBaseUrl, trpc } from '../utils/_trpc';
import { httpBatchLink, loggerLink } from "@trpc/client";
import SuperJSON from "superjson";
import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WebSocketProvider } from "../contexts/WSProvider";
import { GlobalModalProvider, useGlobalModal } from "../contexts/ModalProvider";

function ClientProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        loggerLink({
          enabled: () => true,
        }),
        httpBatchLink({
          url: `${getBaseUrl()}/api/trpc`,
        }),
      ],
      transformer: SuperJSON,
    }),
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </trpc.Provider>
  );
}

export default function Providers({ children }: { children: React.ReactNode }) {
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
    <ClientProvider>
      <SessionProvider>
        <WebSocketProvider>
          <GlobalModalProvider>
            {children}
          </GlobalModalProvider>
        </WebSocketProvider>
      </SessionProvider>
    </ClientProvider>
  )
}