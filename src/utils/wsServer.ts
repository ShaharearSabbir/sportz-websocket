import { WebSocket, WebSocketServer } from "ws";

export const sendJsonWS = (ws: WebSocket, data: any) => {
  if (ws.readyState !== ws.OPEN) return;

  ws.send(JSON.stringify(data));
};

export const broadcastJsonWS = (wss: WebSocketServer, data: any) => {
  wss.clients.forEach((client) => {
    if (client.readyState === client.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
};

export const attachWebSocketServer = (
  server: any,
): { broadcastMatchCreated: (match: any) => void } => {
  const wss = new WebSocketServer({
    server,
    path: "/ws",
    maxPayload: 1024 * 1024,
  }); // 1 MB

  wss.on("connection", (socket) => {
    sendJsonWS(socket, { message: "Welcome to the WebSocket server!" });

    socket.on("error", console.error);
  });

  const broadcastMatchCreated = (match: any) => {
    broadcastJsonWS(wss, { type: "matchCreated", match });
  };

  return { broadcastMatchCreated };
};
