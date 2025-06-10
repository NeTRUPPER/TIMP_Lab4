import express from "express";
import { createReport, getAllReports } from "../controllers/reportController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, createReport); // POST /api/reports
router.get("/", authMiddleware, getAllReports);

export default router;
