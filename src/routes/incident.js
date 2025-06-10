import express from "express";
import {
  createIncident,
  getAllIncidents,
  getIncidentById,
  updateIncident,
  deleteIncident,
  getIncidents
} from "../controllers/incidentController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authenticateToken, createIncident);
router.get("/", authenticateToken, getAllIncidents);
router.get("/extended", authenticateToken, getIncidents);
router.get("/:id", authenticateToken, getIncidentById);
router.put("/:id", authenticateToken, updateIncident);
router.delete("/:id", authenticateToken, deleteIncident);

export default router;
