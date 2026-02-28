<<<<<<< HEAD
import { Link, useNavigate } from "react-router-dom";
import { useMemo } from "react";

function Navbar() {
  const nav = useNavigate();

  const token = useMemo(
    () => sessionStorage.getItem("token") || localStorage.getItem("token"),
    []
  );

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    nav("/login");
  };

=======
import { Link } from "react-router-dom";

function Navbar() {
>>>>>>> 5c3591f6d6d1bedf79fbc2183dff9203be7d51d1
  return (
    <nav className="bg-white shadow-md px-6 py-4 flex justify-between items-center">
      <h1 className="text-xl font-bold text-primary">MDH UGC</h1>

      <div className="space-x-6">
        <Link to="/" className="hover:text-primary">Home</Link>
        <Link to="/dashboard" className="hover:text-primary">Dashboard</Link>
        <Link to="/create" className="hover:text-primary">Create</Link>
        <Link to="/profile" className="hover:text-primary">Profile</Link>
        <Link to="/reviews" className="hover:text-primary">Reviews</Link>
        <Link to="/guidelines" className="hover:text-primary">Guidelines</Link>
<<<<<<< HEAD

        {!token ? (
          <Link to="/login" className="bg-primary text-white px-4 py-2 rounded-lg">
            Login
          </Link>
        ) : (
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-4 py-2 rounded-lg"
          >
            Logout
          </button>
        )}
=======
        <Link to="/login" className="bg-primary text-white px-4 py-2 rounded-lg">
          Login
        </Link>
>>>>>>> 5c3591f6d6d1bedf79fbc2183dff9203be7d51d1
      </div>
    </nav>
  );
}

<<<<<<< HEAD
export default Navbar;
=======
export default Navbar;
>>>>>>> 5c3591f6d6d1bedf79fbc2183dff9203be7d51d1
