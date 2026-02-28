<<<<<<< HEAD
// Layout.jsx
import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";
import api from "../services/api";
=======
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
>>>>>>> 5c3591f6d6d1bedf79fbc2183dff9203be7d51d1
import {
  Menu,
  Home,
  LayoutDashboard,
  User,
  BookOpen,
<<<<<<< HEAD
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
  const nav = useNavigate();

  const token = sessionStorage.getItem("token") || localStorage.getItem("token");
  const user = JSON.parse(sessionStorage.getItem("user") || localStorage.getItem("user") || "{}");
  const isMarketingManager = user.role === "marketing_manager";

  // ----------------------
  // Logout Function
  // ----------------------
  const handleLogout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("role");
  };

  // ✅ Keep query string
  const withQuery = (path) => `${path}${location.search || ""}`;

  // If no token, allow rendering login/outlet pages
  if (!token) return <Outlet />;

  // ----------------------
  // Menu Items
  // ----------------------
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

    // ✅ Visible only in manager mode
    ...(isMarketingManager
      ? [
          {
            name: "Campaigns", // ✅ NEW
            path: "/campaigns",
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

  // ----------------------
  // Notifications Component
  // ----------------------
  const NotificationComponent = () => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
      const fetchNotifications = async () => {
        try {
          const response = await api.get("/notifications");
          setNotifications(response.data);
          const unread = response.data.filter(n => !n.isRead).length;
          setUnreadCount(unread);
        } catch (error) {
          console.error("Failed to fetch notifications:", error);
        }
      };

      fetchNotifications();
    }, []);

    const getNotificationIcon = (type) => {
      switch (type) {
        case "reward":
          return <Award size={16} className="text-green-500" />;
        case "info":
          return <Bell size={16} className="text-blue-500" />;
        case "warning":
          return <Target size={16} className="text-yellow-500" />;
        default:
          return <Bell size={16} className="text-gray-500" />;
      }
    };

    return (
      <div className="relative">
        <button
          onClick={() => setShowNotifications(!showNotifications)}
          className="relative p-2 rounded-lg hover:bg-gray-100"
        >
          <Bell size={20} className="text-gray-700" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
              {unreadCount}
            </span>
          )}
        </button>

        {showNotifications && (
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border py-4 px-6 z-50 max-h-96 overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">
              Notifications ({notifications.length})
            </h3>
            
            {notifications.length === 0 ? (
              <p className="text-gray-600">No notifications yet</p>
            ) : (
              <div className="space-y-3">
                {notifications.map((notification) => (
                  <div
                    key={notification._id}
                    className={`p-3 rounded-lg border ${
                      notification.isRead ? "bg-gray-50 border-gray-200" : "bg-blue-50 border-blue-200"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm">{notification.title}</h4>
                        <p className="text-gray-600 text-sm mt-1">{notification.message}</p>
                        {notification.actionUrl && (
                          <a
                            href={notification.actionUrl}
                            className="text-blue-600 text-sm hover:underline mt-2 inline-block"
                          >
                            View Details →
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
=======
  Book,
  FileText,
  Star,
  Bell,
  NotebookPen,
  Wallet
} from "lucide-react";

function Layout({ children }) {
  const [isOpen, setIsOpen] = useState(true);
  const location = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);

  // --- MVP Menu Items ---
  const menuItems = [
    { name: "Home", path: "/", icon: Home },
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Trainings & Events", path: "/trainings", icon: BookOpen },
    { name: "Profile", path: "/profile", icon: User },

    // { name: "Guidelines", path: "/ui_guidelines", icon: FileText },

    { name: "Reviews", path: "/reviews", icon: NotebookPen },
    { name: "User-Overview", path: "/uu-overview", icon: FileText },

    // ✅ NEW REWARDS PAGE
    { name: "Rewards", path: "/rewards", icon: Wallet },
  ];
  
  // --- Notification Placeholder Component ---
  const NotificationPlaceholder = () => (
    <div className="relative">
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative p-2 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary ring-offset-1"
        aria-label="Notifications (coming soon)"
      >
        <Bell size={20} className="text-gray-700" />
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
          0
        </span>
      </button>

      {showNotifications && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 py-4 px-6 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
            <span className="text-sm text-gray-500 font-medium">Coming soon</span>
          </div>
          
          <div className="text-center py-8 space-y-3">
            <div className="w-16 h-16 mx-auto bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center">
              <Bell size={24} className="text-white" />
            </div>
            <div>
              <h4 className="text-xl font-semibold text-gray-900 mb-1">
                Engagement alerts coming soon!
              </h4>
              <p className="text-gray-600 max-w-sm mx-auto">
                Real-time notifications for likes, comments, new followers, and content approvals will appear here.
              </p>
            </div>
            <Link
              to="/profile"
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium rounded-xl hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
              onClick={() => setShowNotifications(false)}
            >
              <User size={16} className="mr-2" />
              Complete your profile first
            </Link>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* --- Sidebar --- */}
>>>>>>> 5c3591f6d6d1bedf79fbc2183dff9203be7d51d1
      <div
        className={`bg-white shadow-lg transition-all duration-300 ${
          isOpen ? "w-64" : "w-20"
        }`}
      >
        <div className="p-4 flex justify-between items-center border-b">
          {isOpen && (
<<<<<<< HEAD
            <h2 className="font-bold text-blue-600 text-lg">MDH UGC</h2>
=======
            <h2 className="font-bold text-primary text-lg">MDH UGC</h2>
>>>>>>> 5c3591f6d6d1bedf79fbc2183dff9203be7d51d1
          )}
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
<<<<<<< HEAD
            const isActive =
              item.path === "/home"
                ? location.pathname === "/home"
                : location.pathname.startsWith(item.path);
=======
            const isActive = location.pathname === item.path;
>>>>>>> 5c3591f6d6d1bedf79fbc2183dff9203be7d51d1

            return (
              <Link
                key={index}
<<<<<<< HEAD
                to={withQuery(item.path)}   // ✅ keeps ?mode=manager
                className={`flex items-center space-x-3 p-3 rounded-lg transition ${
                  isActive
                    ? "bg-blue-600 text-white shadow-md"
                    : "hover:bg-gray-100 text-gray-700"
=======
                to={item.path}
                className={`flex items-center space-x-3 p-3 rounded-lg transition ${
                  isActive
                    ? "bg-primary text-white"
                    : "hover:bg-gray-100"
>>>>>>> 5c3591f6d6d1bedf79fbc2183dff9203be7d51d1
                }`}
              >
                <Icon size={20} />
                {isOpen && <span>{item.name}</span>}
              </Link>
            );
          })}
        </nav>
<<<<<<< HEAD

        {/* Sidebar Logout Button */}
        <button
          onClick={handleLogout}
          className="m-4 bg-red-500 text-white p-2 rounded flex items-center justify-center gap-2"
        >
          <LogOut size={18} /> {isOpen && "Logout"}
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        {/* Header */}
        <div className="bg-white shadow p-4 flex justify-between items-center">
          <div>
            <h1 className="font-semibold text-xl">UGC Platform</h1>
            <span className="text-sm text-gray-500">MDH University</span>
          </div>

          <div className="flex items-center gap-2">
            <NotificationComponent />

            {/* Top-right Logout */}
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg hover:bg-gray-100"
              title="Logout"
              aria-label="Logout"
            >
              <LogOut size={20} className="text-gray-700" />
            </button>
          </div>
        </div>

        {/* Page Content */}
        <div className="p-6">
          <Outlet />
        </div>
=======
      </div>

      {/* --- Main Content --- */}
      <div className="flex-1">
        <div className="bg-white shadow p-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h1 className="font-semibold text-xl">UGC Platform</h1>
            <span className="text-sm text-gray-500">
              MDH University
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <NotificationPlaceholder />
          </div>
        </div>

        <div className="p-6">{children}</div>
>>>>>>> 5c3591f6d6d1bedf79fbc2183dff9203be7d51d1
      </div>
    </div>
  );
}

<<<<<<< HEAD
export default Layout;
=======
export default Layout;
>>>>>>> 5c3591f6d6d1bedf79fbc2183dff9203be7d51d1
