// src/ProtectedRoute.jsx
import { Navigate, useLocation } from "react-router-dom";

const ProtectedRoute = ({ children, fallback = "/" }) => {
  const token = localStorage.getItem("token");
  const location = useLocation();

  if (!token) {
    // Redirect to fallback route or homepage
    return <Navigate to={fallback} replace state={{ from: location }} />;
  }

  return children;
};

export default ProtectedRoute;
