import express, { Request, Response } from "express";
import { isConnected } from "../config/redis";

const router = express.Router();

// GET /health
router.get("/", (_req: Request, res: Response) => {
  const redisStatus = isConnected() ? "connected" : "disconnected";

  res.status(200).json({
    status: "success",
    message: "LLM Service is running",
    timestamp: new Date().toISOString(),
    services: {
      redis: redisStatus,
      gemini: "operational",
    },
  });
});

export default router;
