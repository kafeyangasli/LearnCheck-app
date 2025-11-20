import express, { Express, Request, Response } from "express";
import helmet from "helmet";
import morgan from "morgan";
import corsMiddleware from "./middleware/cors";
import rateLimiter from "./middleware/rateLimit";
import { errorHandler, notFound } from "./middleware/errorHandler";
import logger from "./config/logger";

// Import routes
import questionRoutes from "./routes/questionRoutes";
import progressRoutes from "./routes/progressRoutes";
import contentRoutes from "./routes/contentRoutes";
import healthRoutes from "./routes/healthRoutes";

const app: Express = express();

// Security middleware
app.use(helmet());

// CORS middleware
app.use(corsMiddleware);

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

// Rate limiting
app.use(rateLimiter);

// Health check (no rate limiting)
app.use("/health", healthRoutes);

// API routes
app.use("/api/questions", questionRoutes);
app.use("/api/answers", questionRoutes); // Same routes for answers
app.use("/api/progress", progressRoutes);
app.use("/api/content", contentRoutes);

// Root route
app.get("/", (_req: Request, res: Response) => {
  res.json({
    status: "success",
    message: "LearnCheck Backend API",
    version: "1.0.0",
    endpoints: {
      health: "/health",
      questions: {
        generate: "POST /api/questions/generate",
      },
      answers: {
        submit: "POST /api/answers/submit",
      },
      progress: {
        get: "GET /api/progress/:user_id/:tutorial_id",
        save: "POST /api/progress/save",
      },
      content: {
        get: "GET /api/content/:tutorial_id",
      },
    },
  });
});

// 404 handler
app.use(notFound);

// Error handler
app.use(errorHandler);

export default app;
