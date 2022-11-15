import { NextPage } from "next";
import Head from "next/head";
import { WSProvider, useWS } from "../utils/ws";}

const ChatPage: NextPage = () => {
	return (
		<WSProvider url="/api/socket">
			<Head>
				<title>Iridium Chat</title>
			</Head>

			<main className="h-screen w-screen bg-gray-50 dark:bg-slate-900">
			</main>
		</WSProvider>
	);
}

export default ChatPage;