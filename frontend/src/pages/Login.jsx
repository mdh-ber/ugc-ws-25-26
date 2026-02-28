<<<<<<< HEAD
import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import api from "../services/api";

function Login() {
  const nav = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setErr("");

    const cleanEmail = (email || "").trim().toLowerCase();
    const cleanPassword = password || "";

    if (!cleanEmail || !cleanPassword) {
      setErr("Please enter email and password.");
      return;
    }

    try {
      setLoading(true);

      // IMPORTANT: This must match your backend mount: app.use("/api/auth", authRoutes)
      // Your api baseURL should already include "/api" (common), so "/auth/login" is correct.
      const res = await api.post("/auth/login", {
        email: cleanEmail,
        password: cleanPassword,
      });

      // Save auth data for the whole app (Layout uses these)
      sessionStorage.setItem("token", res.data.token);
      sessionStorage.setItem("user", JSON.stringify(res.data.user));
      sessionStorage.setItem("role", res.data.user.role);

      // OPTIONAL: If you want managers/admin to land on analytics automatically
      const role = res.data?.user?.role;
      if (role === "admin" || role === "marketing_manager") {
        nav("/dashboard"); // keep dashboard as default landing
        // If you prefer to land directly on analytics, use:
        // nav("/website-analytics");
        return;
      }

      // Normal users (content creators)
      nav("/dashboard");
    } catch (e) {
      const message =
        e?.response?.data?.message ||
        e?.response?.data?.error ||
        "Login failed. Please check your credentials.";
      setErr(message);
    } finally {
      setLoading(false);
    }
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter") handleLogin();
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

=======
function Login() {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="bg-white p-8 rounded-xl shadow w-96">
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>

>>>>>>> 5c3591f6d6d1bedf79fbc2183dff9203be7d51d1
        <input
          type="email"
          placeholder="Email"
          className="w-full mb-4 p-2 border rounded-lg"
<<<<<<< HEAD
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={onKeyDown}
          autoComplete="email"
=======
>>>>>>> 5c3591f6d6d1bedf79fbc2183dff9203be7d51d1
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full mb-6 p-2 border rounded-lg"
<<<<<<< HEAD
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={onKeyDown}
          autoComplete="current-password"
        />

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded-lg disabled:opacity-60"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className="mt-4 text-sm text-gray-600 text-center">
          Don’t have an account?{" "}
          <Link to="/register" className="text-blue-600 font-medium hover:underline">
            Register
          </Link>
=======
        />

        <button className="w-full bg-primary text-white py-2 rounded-lg">
          Login
        </button>

        <p className="text-sm text-gray-500 mt-4 text-center">
          Authentication handled by backend
>>>>>>> 5c3591f6d6d1bedf79fbc2183dff9203be7d51d1
        </p>
      </div>
    </div>
  );
}

<<<<<<< HEAD
export default Login;
=======
export default Login;
>>>>>>> 5c3591f6d6d1bedf79fbc2183dff9203be7d51d1
