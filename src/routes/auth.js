import express from "express";
import { login, register, refreshToken, logout } from "../controllers/authController.js";

const router = express.Router();

// Публичные маршруты (не требуют аутентификации)
router.post("/login", login);
router.post("/register", register);
router.post("/refresh", refreshToken);
router.post("/logout", logout);

export default router;
