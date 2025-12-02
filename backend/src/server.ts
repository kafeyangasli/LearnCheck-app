import app from "./app";
import dotenv from "dotenv";
import logger from "./config/logger";
import { closeRedis } from "./services/redis.service";
import { closeQueueConnection } from "./config/queue";
import { Server } from "http";

dotenv.config();
const PORT = process.env.PORT || 4000;
let server: Server;

async function startServer() {
  server = app.listen(PORT, () => {
    logger.info(`Backend server running on http://localhost:${PORT}`);
    logger.info(`API endpoint: http://localhost:${PORT}/api/v1`);
  });
}

const gracefulShutdown = async (signal: string) => {
  logger.info(`${signal} signal received: closing HTTP server`);

  if (server) {
    server.close(async () => {
      logger.info("HTTP server closed");
      await closeRedis();
      await closeQueueConnection();
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("unhandledRejection", (err: Error) => {
  logger.error("UNHANDLED REJECTION! Shutting down...", err);

  if (server) {
    server.close(() => {
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});
startServer();
