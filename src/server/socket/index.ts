import WebSocket, { WebSocketServer } from "ws";

interface IMessage {
	content: string,
	timestamp: number,
	user: string,
}
const messages: IMessage[] = [];

const socketHandler = async (wss: WebSocketServer) => {
	const clients: Set<WebSocket> = new Set();
	wss.on("connection", (ws: WebSocket) => {
		clients.add(ws);
		ws.on("close", () => clients.delete(ws))
		ws.on("message", (message: WebSocket.RawData) => {
			const msg: IMessage = JSON.parse(message.toString());
			messages.push(msg);
			clients.forEach(ws => ws.send(JSON.stringify({
				type: 'message',
				data: msg
			})));
		});

		ws.send(JSON.stringify({ type: 'init', data: messages }));
	});
}

export default socketHandler;
