import express, { Express, Request, Response } from "express";
import helmet from "helmet";
import morgan from "morgan";
import cors from "cors";
import { errorHandler, notFound } from "./middleware/errorHandler";
import logger from "./config/logger";

// Import routes
import llmRoutes from "./routes/llmRoutes";
import healthRoutes from "./routes/healthRoutes";

const app: Express = express();

// Security middleware
app.use(helmet());

// CORS middleware
app.use(
  cors({
    origin: "*", // Allow all origins for internal service
    credentials: true,
  }),
);

// Body parser
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Logging middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
} else {
  app.use(
    morgan("combined", {
      stream: {
        write: (message: string) => logger.info(message.trim()),
      },
    }),
  );
}

// Health check
app.use("/health", healthRoutes);

// API routes
app.use("/api/llm", llmRoutes);

// Root route
app.get("/", (_req: Request, res: Response) => {
  res.json({
    status: "success",
    message: "LLM Service API",
    version: "1.0.0",
    endpoints: {
      health: "/health",
      llm: {
        generateQuestions: "POST /api/llm/generate-questions",
        generateFeedback: "POST /api/llm/generate-feedback",
      },
    },
  });
});

// 404 handler
app.use(notFound);

// Error handler
app.use(errorHandler);

export default app;
