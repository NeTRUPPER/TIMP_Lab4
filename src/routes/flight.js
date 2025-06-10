import express from "express";
import { getAllFlights } from "../controllers/flightController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", authenticateToken, getAllFlights);

export default router; 