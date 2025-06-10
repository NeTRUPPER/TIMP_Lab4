// src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { authApi } from "../api/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const clearAuthState = useCallback(() => {
    setUser(null);
    setError(null);
    setIsInitialized(false);
  }, []);

  const checkAuth = useCallback(async () => {
    // Пропускаем проверку на странице входа или если уже идет аутентификация
    if (location.pathname === '/login' || isAuthenticating) {
      console.log('Skipping auth check - on login page or authenticating');
      setIsInitialized(true);
      return;
    }

    try {
      console.log('Checking auth on mount...');
      const response = await authApi.refresh();
      console.log('Auth check response:', response);
      if (response.user) {
        setUser(response.user);
        setError(null);
      } else {
        clearAuthState();
        if (location.pathname !== '/login') {
          navigate("/login", { replace: true });
        }
      }
    } catch (err) {
      console.log('Auth check failed:', err);
      clearAuthState();
      if (location.pathname !== '/login') {
        navigate("/login", { replace: true });
      }
    } finally {
      setIsInitialized(true);
    }
  }, [navigate, location, isAuthenticating, clearAuthState]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = useCallback(async (userData) => {
    if (!userData) {
      throw new Error('Данные пользователя не предоставлены');
    }

    try {
      console.log('Setting user in context:', userData);
      setIsAuthenticating(true);
      setUser(userData);
      setError(null);
      navigate('/incidents', { replace: true });
    } catch (err) {
      console.error('Error in login:', err);
      setError({
        code: "AUTH_ERROR",
        message: err.message || "Ошибка при входе в систему"
      });
      throw err; // Пробрасываем ошибку дальше
    } finally {
      setIsAuthenticating(false);
      setIsInitialized(true);
    }
  }, [navigate]);

  const logout = async () => {
    try {
      console.log('Logging out...');
      setIsAuthenticating(true);
      await authApi.logout();
      clearAuthState();
      navigate("/login", { replace: true });
    } catch (err) {
      console.error('Error in logout:', err);
      setError({
        code: "AUTH_ERROR",
        message: "Ошибка при выходе из системы"
      });
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleAuthError = useCallback((error) => {
    console.log('Handling auth error:', error);
    if (error.code === 401) {
      setError({
        code: 401,
        message: "Сессия истекла. Пожалуйста, войдите снова."
      });
      clearAuthState();
      navigate("/login", { replace: true });
    } else {
      setError(error);
    }
  }, [clearAuthState, navigate]);

  console.log('Current auth state:', { user, error, isInitialized, isAuthenticating });

  return (
    <AuthContext.Provider value={{ 
      user, 
      error, 
      isInitialized,
      login, 
      logout, 
      handleAuthError 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
