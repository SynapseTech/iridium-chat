import WebSocket, { WebSocketServer } from "ws";

const socketHandler = async (wss: WebSocketServer) => {
	wss.on('connection', (ws: WebSocket) => {
		
	});
}

export default SocketHandler;
