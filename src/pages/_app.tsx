// src/pages/_app.tsx
import "../styles/globals.css";
import { SessionProvider } from "next-auth/react";
import type { AppType } from "next/dist/shared/lib/utils";
import { trpc } from "../utils/trpc";
import { useEffect } from 'react';

const MyApp: AppType = ({ Component, pageProps }) => {
	useEffect(() => {
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		import('preline');
	}, []);

	useEffect(() => {
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
		`)
		}
	}, []);

	return (
		<SessionProvider session={pageProps.session}>
			<Component {...pageProps} />
		</SessionProvider>
	);
};

export default trpc.withTRPC(MyApp);
