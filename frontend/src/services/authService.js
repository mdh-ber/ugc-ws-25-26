export const login = async (email, password) => {
  // Dummy credentials
  if (email === "manager@demo.com" && password === "demo123") {
    localStorage.setItem("isAuthenticated", "true");
    return { success: true };
  } else {
    throw new Error("Invalid credentials");
  }
};

export const logout = () => {
  localStorage.removeItem("isAuthenticated");
};

export const isAuthenticated = () => {
  return localStorage.getItem("isAuthenticated") === "true";
};