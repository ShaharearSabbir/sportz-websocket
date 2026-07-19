import { WebSocket, WebSocketServer } from "ws";
import { wsHandshakeLimiter } from "../middleware/rateLimiter";

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
  // 2. intercepted connection handshake via 'noServer: true'
  // This allows us to run the Express middleware BEFORE approving the upgrade
  const wss = new WebSocketServer({
    noServer: true, // Crucial change: do not bind directly to server here
    path: "/ws",
    maxPayload: 1024 * 1024, // 1 MB
  });

  // 3. Intercept the server HTTP upgrade process
  server.on("upgrade", (request: any, socket: any, head: any) => {
    // Check if the URL path matches your WebSocket path
    if (request.url !== "/ws") return;

    // Run the Express handshake limiter manually on the upgrade request
    wsHandshakeLimiter(request, {} as any, () => {
      // Check if Express rate-limit flagged the request as exceeded
      if (
        request.rateLimit &&
        request.rateLimit.used > request.rateLimit.limit
      ) {
        socket.write("HTTP/1.1 429 Too Many Requests\r\n\r\n");
        socket.destroy();
        return;
      }

      // Handshake passes -> Pass control over to ws
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit("connection", ws, request);
      });
    });
  });

  wss.on("connection", (socket) => {
    sendJsonWS(socket, { message: "Welcome to the WebSocket server!" });

    // 4. In-Socket Message Limiter Variables (Tracked per active connection)
    let messageCount = 0;
    let windowStart = Date.now();

    socket.on("message", (data) => {
      const now = Date.now();

      // Reset counting window every 2 seconds
      if (now - windowStart > 2000) {
        messageCount = 0;
        windowStart = now;
      }

      messageCount++;

      // Enforce the message limit (e.g., max 10 messages per 2 seconds)
      if (messageCount > 10) {
        sendJsonWS(socket, { error: "Rate limit exceeded. Slow down." });

        // Highly recommended: Force close abusive connections
        // socket.close(1008, "Rate limit exceeded");
        return;
      }

      // --- YOUR INCOMING MESSAGE HANDLING LOGIC GOES HERE ---
      // console.log("Valid message received:", data.toString());
    });

    socket.on("error", console.error);
  });

  const broadcastMatchCreated = (match: any) => {
    broadcastJsonWS(wss, { type: "matchCreated", match });
  };

  return { broadcastMatchCreated };
};
