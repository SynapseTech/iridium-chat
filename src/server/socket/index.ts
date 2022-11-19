import WebSocket, { WebSocketServer } from "ws";

type IMessage = { content: string, timestamp: number };
const messages: IMessage[] = [];

const socketHandler = async (wss: WebSocketServer) => {
	const clients: Set<WebSocket> = new Set();
	wss.on("connection", (ws: WebSocket) => {
		clients.add(ws);
		ws.on("close", () => clients.delete(ws))
		ws.on("message", (message) => {
			const msg: { content: string, timestamp: number } = JSON.parse(message.toString());
			messages.push(msg);
			clients.forEach(ws => ws.send(JSON.stringify({
				type: 'message',
				data: msg
			})));
		});

		ws.send("Hello! Message From Server");
	});
}

export default socketHandler;
