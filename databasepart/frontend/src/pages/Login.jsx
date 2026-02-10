function Login() {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="bg-white p-8 rounded-xl shadow w-96">
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>

        <input
          type="email"
          placeholder="Email"
          className="w-full mb-4 p-2 border rounded-lg"
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full mb-6 p-2 border rounded-lg"
        />

        <button className="w-full bg-primary text-white py-2 rounded-lg">
          Login
        </button>

        <p className="text-sm text-gray-500 mt-4 text-center">
          Authentication handled by backend
        </p>
      </div>
    </div>
  );
}

export default Login;
