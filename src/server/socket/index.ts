import WebSocket, { WebSocketServer } from "ws";

const socketHandler = async (wss: WebSocketServer) => {
	wss.on('connection', (ws: WebSocket) => {
		// todo
	});
}

export default socketHandler;
