import "dotenv/config";
import express from "express";
import { PrismaClient } from "./generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import { matchRouter } from "./modules/match/match.route.js";
import { globalErrorHandler } from "./middleware/globalErrorHandler.js";
import http from "http";
import { hostname } from "zod";
import { attachWebSocketServer } from "./utils/wsServer.js";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

const PORT = Number(process.env.PORT) || 8000;
const HOST = process.env.HOST || "0.0.0.0";

const app = express();

const server = http.createServer(app);

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello from sportz!");
});

app.use("/matches", matchRouter);

// Global error handler
app.use(globalErrorHandler);

const { broadcastMatchCreated } = attachWebSocketServer(server);

app.locals.broadcastMatchCreated = broadcastMatchCreated;

server.listen(PORT, HOST, () => {
  const baseURL =
    HOST === "0.0.0.0" ? `http://localhost:${PORT}` : `http://${HOST}:${PORT}`;
  console.log(`Server running at ${baseURL}`);
  console.log(`Websocket runnding on ${baseURL.replace("http", "ws")}/ws`);
});
