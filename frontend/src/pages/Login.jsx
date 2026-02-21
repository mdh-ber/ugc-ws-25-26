import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
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

        <input
          type="email"
          placeholder="Email"
          className="w-full mb-4 p-2 border rounded-lg"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full mb-6 p-2 border rounded-lg"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleLogin}
          className="w-full bg-primary text-white py-2 rounded-lg mb-4"
        >
          Login
        </button>

        {/* ✅ New User Button */}
        <button
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