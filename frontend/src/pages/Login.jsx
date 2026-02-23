import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import api from "../services/api";  

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setErr("");
    
    if (!email || !password) {
      setErr("Enter email and password");
      return;
    }

    try {
      setLoading(true);
      
      // Call the hardcoded route in your server.js
      const res = await api.post("/auth/login", {
        email: email,
        password: password
      });

      // Save the token and user data returned by your server.js
      sessionStorage.setItem("token", res.data.token);
      sessionStorage.setItem("user", JSON.stringify(res.data.user));
      sessionStorage.setItem("role", res.data.user.role);

      // Redirect to the dashboard!
      navigate("/dashboard");

    } catch (error) {
      // If the backend returns a 401 (Invalid credentials)
      const message = error.response?.data?.message || "Login failed.";
      setErr(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow w-96">
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>

        {err && (
          <div className="mb-4 p-2 rounded bg-red-50 border border-red-200 text-red-700 text-sm">
            {err}
          </div>
        )}

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
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded-lg mb-4 disabled:opacity-50"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        {/* New User Button */}
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