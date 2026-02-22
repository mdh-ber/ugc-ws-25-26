import { useState } from "react";
import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";
import {
  Menu,
  Home,
  LayoutDashboard,
  User,
  BookOpen,
  FileText,
  Bell,
  NotebookPen,
  Wallet,
  Award,
  Target
} from "lucide-react";

function Layout() {
  const [isOpen, setIsOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { name: "Home", path: "/home", icon: Home },
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Trainings & Events", path: "/trainings", icon: BookOpen },
    { name: "Profile", path: "/profile", icon: User },
    { name: "Reviews", path: "/reviews", icon: NotebookPen },
    { name: "User-Overview", path: "/uu-overview", icon: FileText },
    { name: "Rewards", path: "/rewards", icon: Wallet },
    { name: "Certificates", path: "/certificates", icon: Award },
    { name: "Milestones", path: "/milestones", icon: Target }
  ];

  const logout = () => {
    sessionStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`bg-white shadow ${isOpen ? "w-64" : "w-20"}`}>
        <div className="p-4 flex justify-between">
          {isOpen && <h2 className="font-bold text-blue-600">MDH UGC</h2>}
          <button onClick={() => setIsOpen(!isOpen)}>
            <Menu />
          </button>
        </div>

        <nav className="p-4 flex flex-col space-y-2">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);

            return (
              <Link
                key={index}
                to={item.path}
                className={`flex items-center space-x-3 p-3 rounded ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "hover:bg-gray-100 text-gray-700"
                }`}
              >
                <Icon size={20} />
                {isOpen && <span>{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        <button
          onClick={logout}
          className="m-4 bg-red-500 text-white p-2 rounded"
        >
          Logout
        </button>
      </div>

      {/* Main */}
      <div className="flex-1">
        <div className="bg-white p-4 shadow">UGC Platform</div>

        <div className="p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default Layout;