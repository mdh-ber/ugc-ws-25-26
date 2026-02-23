import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";// adjust path if different

function Login() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setErr("");
    try {
      setLoading(true);
      const res = await api.post("/auth/login", { email, password });
      console.log("Login response:", res);

      sessionStorage.setItem("token", res.data.token);
      sessionStorage.setItem("user", JSON.stringify(res.data.user));

      nav("/profile"); // or "/dashboard"
    } catch (e) {
      setErr(e?.response?.data?.message || "Login failed");
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
          className="w-full bg-primary text-white py-2 rounded-lg disabled:opacity-60"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <button
          onClick={() => {
            console.log('Demo login clicked');
            sessionStorage.setItem("token", "demo-token");
            sessionStorage.setItem("role", "admin");
            console.log('Token set:', sessionStorage.getItem("token"));
            nav("/dashboard");
          }}
          className="w-full bg-gray-500 text-white py-2 rounded-lg mt-2"
        >
          Demo Login (No Backend)
        </button>
      </div>
      <p className="mt-4 text-sm text-gray-600">
        Don’t have an account?{" "}
        <Link to="/register" className="text-blue-600 font-medium hover:underline">
          Register
        </Link>
      </p>
    </div>
  );
}

export default Login;