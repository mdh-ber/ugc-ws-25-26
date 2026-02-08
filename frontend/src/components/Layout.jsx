import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Menu,
  Home,
  LayoutDashboard,
  User,
  BookOpen,
  Book,
  FileText,
  Star,
  Bell
} from "lucide-react";

function Layout({ children }) {
  const [isOpen, setIsOpen] = useState(true);
  const location = useLocation();

  // --- MVP Menu Items ---
  const menuItems = [
    { name: "Home", path: "/", icon: Home },
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Trainings", path: "/trainings", icon: BookOpen },
    { name: "Profile", path: "/profile", icon: User },

   
  ];

  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* --- Sidebar --- */}
      <div
        className={`bg-white shadow-lg transition-all duration-300 ${
          isOpen ? "w-64" : "w-20"
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-4 flex justify-between items-center border-b">
          {isOpen && (
            <h2 className="font-bold text-primary text-lg">MDH UGC</h2>
          )}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded hover:bg-gray-100"
          >
            <Menu size={20} />
          </button>
        </div>

        {/* Sidebar Navigation */}
        <nav className="p-4 flex flex-col space-y-2">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={index}
                to={item.path}
                className={`flex items-center space-x-3 p-3 rounded-lg transition ${
                  isActive
                    ? "bg-primary text-white"
                    : "hover:bg-gray-100"
                }`}
              >
                <Icon size={20} />
                {isOpen && <span>{item.name}</span>}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* --- Main Content --- */}
      <div className="flex-1">
        {/* Top Bar */}
        <div className="bg-white shadow p-4 flex justify-between items-center">
          <h1 className="font-semibold">UGC Platform</h1>
          <span className="text-sm text-gray-500">
            MDH University
          </span>
        </div>

        {/* Page Content */}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}

export default Layout;
