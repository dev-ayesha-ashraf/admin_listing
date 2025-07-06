// src/ProtectedRoute.jsx or .tsx
import { Navigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

const ProtectedRoute = ({ children, fallback = "/" }) => {
  const location = useLocation();
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);
    setIsAuthChecked(true); // Only check once to avoid re-renders
  }, []);

  if (!isAuthChecked) return null; // Prevent render until check is done

  if (!isAuthenticated) {
    return <Navigate to={fallback} replace state={{ from: location }} />;
  }

  return children;
};

export default ProtectedRoute;
