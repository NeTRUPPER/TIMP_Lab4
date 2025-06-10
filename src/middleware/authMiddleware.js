import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";
const REFRESH_SECRET = process.env.REFRESH_SECRET || "your_refresh_secret";

export const authenticateToken = async (req, res, next) => {
  const accessToken = req.cookies.accessToken;
  const refreshToken = req.cookies.refreshToken;

  if (!accessToken) {
    return res.status(401).json({ error: "Требуется авторизация" });
  }

  try {
    const decoded = jwt.verify(accessToken, JWT_SECRET);
    req.user = decoded.userId;
    next();
  } catch (error) {
    // Если access token истек, пробуем обновить его
    if (error.name === 'TokenExpiredError' && refreshToken) {
      try {
        const decoded = jwt.verify(refreshToken, REFRESH_SECRET);
        const newAccessToken = jwt.sign({ userId: decoded.userId }, JWT_SECRET, { expiresIn: '1h' });
        
        // Устанавливаем новый access token
        res.cookie('accessToken', newAccessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 60 * 60 * 1000 // 1 час
        });

        req.user = decoded.userId;
        next();
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        return res.status(401).json({ error: "Сессия истекла" });
      }
    } else {
      console.error('Token verification failed:', error);
    return res.status(401).json({ error: "Неверный токен" });
    }
  }
};

export default authenticateToken;