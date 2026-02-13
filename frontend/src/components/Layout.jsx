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
  const [showNotifications, setShowNotifications] = useState(false);

  // --- MVP Menu Items ---
  const menuItems = [
    { name: "Home", path: "/", icon: Home },
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Trainings", path: "/trainings", icon: BookOpen },
    { name: "Profile", path: "/profile", icon: User },
    { name: "Guidelines", path: "/ui_guidelines", icon: FileText },

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
        {/* Static badge - 0 notifications */}
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
          0
        </span>
      </button>

      {/* Dropdown Placeholder */}
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
        {/* Top Bar - YOUR NOTIFICATION GOES HERE */}
        <div className="bg-white shadow p-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h1 className="font-semibold text-xl">UGC Platform</h1>
            <span className="text-sm text-gray-500">
              MDH University
            </span>
          </div>
          
          {/* NOTIFICATION PLACEHOLDER - RIGHT SIDE */}
          <div className="flex items-center space-x-2">
            <NotificationPlaceholder />
          </div>
        </div>

        {/* Page Content */}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

export default Layout;
