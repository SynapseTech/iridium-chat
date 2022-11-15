import { WebSocketServer } from "ws";

const socketHandler = async (wss: WebSocketServer) => {
	wss.on("connection", (ws) => {
		ws.on("message", (message) => {
			console.log(`Received message => ${message}`);
		});

		ws.send("Hello! Message From Server");
	});
}

export default socketHandler;
