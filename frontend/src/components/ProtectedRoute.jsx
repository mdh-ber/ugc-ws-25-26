import { Navigate, Outlet } from "react-router-dom";

function ProtectedRoute() {
  const token = sessionStorage.getItem("token");

<<<<<<< HEAD
  console.log('ProtectedRoute check:', { token, currentPath: location.pathname });

  if (!token) {
    console.log('No token found, redirecting to login');
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  console.log('Token found, allowing access');
  return <Outlet />;
}
=======
  return token ? <Outlet /> : <Navigate to="/login" />;
}

export default ProtectedRoute;
>>>>>>> c1d8eb004e3b5ee3df64bd2d5d80b2341121385e
