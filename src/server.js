import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import { authenticateToken } from "./middleware/authMiddleware.js";
import { logError } from './utils/logger.js';

import incidentRoutes from "./routes/incident.js";
import authRoutes from "./routes/auth.js";
import reportRoutes from "./routes/report.js";
import flightRoutes from "./routes/flight.js";

dotenv.config();

const app = express();
const prisma = new PrismaClient();

// Настройка CORS
app.use(cors({
  origin: 'http://localhost:3000', // URL вашего React приложения
  credentials: true, // Разрешаем передачу учетных данных
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware
app.use(express.json());
app.use(cookieParser());

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Auth routes
app.use("/api/auth", authRoutes);

// Incident routes
app.use("/api/incidents", authenticateToken, incidentRoutes);

// Report routes
app.use("/api/reports", authenticateToken, reportRoutes);

// Flight routes
app.use("/api/flights", authenticateToken, flightRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  // Логируем ошибку
  logError(err, {
    path: req.path,
    method: req.method,
    body: req.body,
    user: req.user,
    ip: req.ip
  });
  
  const statusCode = err.status || 500;
  res.status(statusCode).json({
    error: {
      code: statusCode,
      message: err.message || "Что-то пошло не так!"
    }
  });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});
