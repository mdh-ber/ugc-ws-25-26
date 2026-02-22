import { Navigate, Outlet, useLocation } from "react-router-dom";

export default function ProtectedRoute() {
  const location = useLocation();
  const token = sessionStorage.getItem("token") || localStorage.getItem("token");

  console.log('ProtectedRoute check:', { token, currentPath: location.pathname });

  if (!token) {
    console.log('No token found, redirecting to login');
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  console.log('Token found, allowing access');
  return <Outlet />;
}