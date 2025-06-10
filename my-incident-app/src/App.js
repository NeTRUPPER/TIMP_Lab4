// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import LoginPage from "./pages/LoginPage";
import IncidentsPage from "./pages/IncidentsPage";
import IncidentFormPage from "./pages/IncidentFormPage";
import IncidentDetailsPage from "./pages/IncidentDetailsPage";
import Layout from "./components/Layout";

const PrivateRoute = ({ children }) => {
  const { user, error, isInitialized } = useAuth();
  console.log('PrivateRoute check - user:', user, 'error:', error, 'isInitialized:', isInitialized);

  // Если еще идет инициализация, показываем загрузку
  if (!isInitialized) {
    return <div>Loading...</div>;
  }

  // Если есть ошибка авторизации или нет пользователя, перенаправляем на страницу входа
  if (error?.code === 401 || !user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const AppRoutes = () => {
  return (
        <Routes>
          <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Layout>
              <IncidentsPage />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/incidents"
        element={
            <PrivateRoute>
            <Layout>
              <IncidentsPage />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/incidents/new"
        element={
          <PrivateRoute>
            <Layout>
              <IncidentFormPage />
            </Layout>
            </PrivateRoute>
        }
      />
      <Route
        path="/incidents/:id"
        element={
            <PrivateRoute>
            <Layout>
              <IncidentDetailsPage />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/incidents/:id/edit"
        element={
          <PrivateRoute>
            <Layout>
              <IncidentFormPage />
            </Layout>
            </PrivateRoute>
        }
      />
        </Routes>
  );
};

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
      </Router>
  );
};

export default App;
