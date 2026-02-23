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
  Target,
  LogOut,
  UserSearch,
  BarChart3,
  Megaphone, // ✅ NEW
} from "lucide-react";

function Layout() {
  const [isOpen, setIsOpen] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // ✅ Keep query string (so mode stays when you click menu items)
  const withQuery = (path) => `${path}${location.search || ""}`;

  const menuItems = [
    { name: "Home", path: "/home", icon: Home },
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Trainings & Events", path: "/trainings", icon: BookOpen },
    { name: "Profile", path: "/profile", icon: User },
    { name: "Reviews", path: "/reviews", icon: NotebookPen },
    { name: "User-Overview", path: "/uu-overview", icon: FileText },
    { name: "Rewards", path: "/rewards", icon: Wallet },
    { name: "Certificates", path: "/certificates", icon: Award },
    { name: "Milestones", path: "/milestones", icon: Target },

    // ✅ Only visible when URL has ?mode=manager
    ...(isMarketingManager
      ? [
          {
            name: "Campaigns", // ✅ NEW
            path: "/campaigns",s
            icon: Megaphone,
          },
          {
            name: "Website Analytics",
            path: "/website-analytics",
            icon: BarChart3,
          },
        ]
      : []),
  ];

  // ✅ DEFINE logout INSIDE the component
  const logout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login", { replace: true });
  };

  const NotificationPlaceholder = () => (
    <div className="relative">
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative p-2 rounded-lg hover:bg-gray-100"
      >
        <Bell size={20} className="text-gray-700" />
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
          0
        </span>
      </button>

      {showNotifications && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border py-4 px-6 z-50">
          <h3 className="text-lg font-semibold mb-4">
            Notifications (Coming Soon)
          </h3>
          <p className="text-gray-600">Real-time notifications will appear here.</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={`bg-white shadow-lg transition-all duration-300 ${
          isOpen ? "w-64" : "w-20"
        }`}
      >
        <div className="p-4 flex justify-between items-center border-b">
          {isOpen && <h2 className="font-bold text-blue-600 text-lg">MDH UGC</h2>}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded hover:bg-gray-100"
          >
            <Menu size={20} />
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
                className={`flex items-center space-x-3 p-3 rounded-lg transition ${
                  isActive
                    ? "bg-blue-600 text-white shadow-md"
                    : "hover:bg-gray-100 text-gray-700"
                }`}
              >
                <Icon size={20} />
                {isOpen && <span>{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Logout button */}
        <div className="p-4 border-t">
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600"
          >
            <LogOut size={18} />
            {isOpen && <span>Logout</span>}
          </button>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1">
        <div className="bg-white shadow p-4 flex justify-between items-center">
          <div>
            <h1 className="font-semibold text-xl">UGC Platform</h1>
            <span className="text-sm text-gray-500">MDH University</span>
          </div>
          <NotificationPlaceholder />
        </div>

        <div className="p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default Layout;