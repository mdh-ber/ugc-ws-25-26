import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="bg-white shadow-md px-6 py-4 flex justify-between items-center">
      <h1 className="text-xl font-bold text-primary">MDH UGC</h1>

      <div className="space-x-6">
        <Link to="/" className="hover:text-primary">Home</Link>
        <Link to="/dashboard" className="hover:text-primary">Dashboard</Link>
        <Link to="/create" className="hover:text-primary">Create</Link>
        <Link to="/profile" className="hover:text-primary">Profile</Link>
<<<<<<< HEAD
                <Link to="/reviews" className="hover:text-primary">Reviews</Link>
=======
>>>>>>> main
        <Link to="/guidelines" className="hover:text-primary">Guidelines</Link>
        <Link to="/login" className="bg-primary text-white px-4 py-2 rounded-lg">
          Login
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;
