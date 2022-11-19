import { WebSocketServer } from "ws";

type IMessage = { content: string, timestamp: number };
const messages: IMessage[] = [];

const socketHandler = async (wss: WebSocketServer) => {
	wss.on("connection", (ws) => {
		ws.on("message", (message) => {
			const msg: { content: string, timestamp: number } = JSON.parse(message.toString());
			messages.push(msg);
			ws.send(JSON.stringify({
				type: 'message',
				data: msg
			}));
		});

		ws.send("Hello! Message From Server");
	});
}

export default socketHandler;
