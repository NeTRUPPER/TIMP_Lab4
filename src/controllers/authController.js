import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { logError } from '../utils/logger.js';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";
const REFRESH_SECRET = process.env.REFRESH_SECRET || "your_refresh_secret";

// Настройки для cookies
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production', // true в production
  sameSite: 'strict',
  maxAge: 24 * 60 * 60 * 1000 // 24 часа
};

export const register = async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const existingUser = await prisma.users.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ 
        error: {
          code: 400,
          message: "Email уже используется"
        }
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.users.create({
      data: {
        username,
        email,
        password_hash: hashedPassword,
      },
    });

    return res.status(201).json({ message: "Пользователь зарегистрирован", user: { id: user.id, email: user.email } });
  } catch (error) {
    console.error("Ошибка при регистрации:", error);
    res.status(500).json({ 
      error: {
        code: 500,
        message: "Ошибка сервера"
      }
    });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ 
      error: {
        code: 400,
        message: "Email и пароль обязательны"
      },
      details: { email: !email, password: !password }
    });
  }

  try {
    const user = await prisma.users.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({ 
        error: {
          code: 401,
          message: "Неверный email или пароль"
        }
      });
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);
    
    if (!validPassword) {
      return res.status(401).json({ 
        error: {
          code: 401,
          message: "Неверный email или пароль"
        }
      });
    }

    // Создаем access и refresh токены
    const accessToken = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1h' });
    const refreshToken = jwt.sign({ userId: user.id }, REFRESH_SECRET, { expiresIn: '7d' });

    // Сохраняем refresh токен в базе
    await prisma.users.update({
      where: { id: user.id },
      data: { refresh_token: refreshToken }
    });

    // Устанавливаем cookies
    res.cookie('accessToken', accessToken, COOKIE_OPTIONS);
    res.cookie('refreshToken', refreshToken, {
      ...COOKIE_OPTIONS,
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 дней
    });

    res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    logError(error, { email });
    res.status(500).json({ 
      error: {
        code: 500,
        message: "Ошибка сервера"
      }
    });
  }
};

export const refreshToken = async (req, res) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    return res.status(401).json({ error: "Неверный пароль или email" });
  }

  try {
    const decoded = jwt.verify(refreshToken, REFRESH_SECRET);
    const user = await prisma.users.findUnique({
      where: { id: decoded.userId }
    });

    if (!user || user.refresh_token !== refreshToken) {
      return res.status(401).json({ error: "Недействительный refresh token" });
    }

    // Создаем новые токены
    const newAccessToken = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1h' });
    const newRefreshToken = jwt.sign({ userId: user.id }, REFRESH_SECRET, { expiresIn: '7d' });

    // Обновляем refresh token в базе
    await prisma.users.update({
      where: { id: user.id },
      data: { refresh_token: newRefreshToken }
    });

    // Устанавливаем новые cookies
    res.cookie('accessToken', newAccessToken, COOKIE_OPTIONS);
    res.cookie('refreshToken', newRefreshToken, {
      ...COOKIE_OPTIONS,
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    // Возвращаем данные пользователя
    res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error("Ошибка при обновлении токена:", error);
    res.status(401).json({ error: "Недействительный refresh token" });
  }
};

export const logout = async (req, res) => {
  const { refreshToken } = req.cookies;
  const userId = req.user;

  try {
    // Очищаем refresh token в базе
    if (userId) {
      await prisma.users.update({
        where: { id: userId },
        data: { refresh_token: null }
      });
    }

    // Очищаем cookies
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    res.json({ message: "Выход выполнен успешно" });
  } catch (error) {
    console.error("Ошибка при выходе:", error);
    res.status(500).json({ error: "Ошибка сервера" });
  }
};
