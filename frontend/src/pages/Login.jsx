import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault(); // ✅ Stops the page from flickering/refreshing

    // Here you will call your backend login API and get JWT
    // For now, we can just simulate
    if (email && password) {
      // Example: save fake token
      localStorage.setItem("token", "fake-jwt-token");
      navigate("/dashboard"); // redirect after login
    } else {
      alert("Enter email and password");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow w-96">
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>

        {/* ✅ Wrapped in a form so "Enter" key works and autofill behaves correctly */}
        <form onSubmit={handleLogin}>
          <input
            id="email"       // ✅ Added id
            name="email"     // ✅ Added name
            type="email"
            placeholder="Email"
            className="w-full mb-4 p-2 border rounded-lg"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            id="password"    // ✅ Added id
            name="password"  // ✅ Added name
            type="password"
            placeholder="Password"
            className="w-full mb-6 p-2 border rounded-lg"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            type="submit"    // ✅ Changed to submit
            className="w-full bg-primary text-white py-2 rounded-lg mb-4"
          >
            Login
          </button>
        </form>

        {/* ✅ New User Button */}
        <button
          type="button"      // ✅ Added type="button" so it doesn't accidentally trigger the form
          onClick={() => navigate("/Register")}
          className="w-full border border-blue-600 text-blue-600 py-2 rounded-lg hover:bg-blue-50 transition mb-4"
        >
          New User? Register
        </button>

        <p className="text-sm text-gray-500 text-center">
          Authentication handled by backend
        </p>
      </div>
    </div>
  );
}

export default Login;