import { Navigate, Outlet } from "react-router-dom";

function ProtectedRoute() {
  const token = sessionStorage.getItem("token");

  return token ? <Outlet /> : <Navigate to="/login" />;
}

export default ProtectedRoute;