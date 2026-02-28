// Layout.jsx
import { useEffect, useMemo, useState } from "react";
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
  Megaphone,
} from "lucide-react";

/**
 * FRONTEND-ONLY notifications (no backend required)
 * - Stores notifications in localStorage
 * - Navbar updates instantly when we dispatch "notif:changed"
 *
 * To push a new notification from ANY page:
 *   window.pushNotif({
 *     category: "certificate" | "reward" | "milestone",
 *     title: "New certificate added",
 *     message: "You added ...",
 *     link: "/certificates"
 *   })
 */

const NOTIF_KEY = "demo_notifications_v1";

function safeReadNotifs() {
  try {
    const list = JSON.parse(localStorage.getItem(NOTIF_KEY) || "[]");
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

function safeWriteNotifs(list) {
  localStorage.setItem(NOTIF_KEY, JSON.stringify(list));
  window.dispatchEvent(new Event("notif:changed"));
}

function Layout() {
  const [isOpen, setIsOpen] = useState(true);

  // Notifications UI
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const location = useLocation();
  const nav = useNavigate();

  const token = sessionStorage.getItem("token") || localStorage.getItem("token");

  // ✅ URL-based mode switch: add ?mode=manager to any URL
  const params = new URLSearchParams(location.search);
  const isMarketingManager = params.get("mode") === "manager";

  const withQuery = (path) => `${path}${location.search || ""}`;

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("role");

    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");

    nav("/login");
  };

  // If not logged in, just render pages (login/register)
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
    { name: "Referral List", path: "/referrals", icon: UserSearch },
    { name: "Rewards", path: "/rewards", icon: Wallet },
    { name: "Certificates", path: "/certificates", icon: Award },
    { name: "Milestones", path: "/milestones", icon: Target },
    { name: "Leaderboard", path: "/leaderboard", icon: BarChart3 },

    ...(isMarketingManager
      ? [
          { name: "Campaigns", path: "/campaigns", icon: Megaphone },
          { name: "Website Analytics", path: "/website-analytics", icon: BarChart3 },
        ]
      : []),
  ];

  // ============================
  // Notifications (localStorage)
  // ============================
  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  function loadNotifsFromStorage() {
    setNotifications(safeReadNotifs());
  }

  function markNotificationRead(id) {
    const list = safeReadNotifs();
    const next = list.map((n) => (n._id === id ? { ...n, read: true } : n));
    safeWriteNotifs(next);
  }

  function clearUI() {
    setNotifications([]);
  }

  function refresh() {
    loadNotifsFromStorage();
  }

  // expose a global helper so any page can push notifications easily
  useEffect(() => {
    window.pushNotif = (n) => {
      const item = {
        _id: n._id || String(Date.now()),
        category: n.category || "general",
        title: n.title || "Update",
        message: n.message || "",
        link: n.link || "",
        read: false,
        createdAt: new Date().toISOString(),
      };
      const list = safeReadNotifs();
      const next = [item, ...list].slice(0, 50);
      safeWriteNotifs(next);
    };

    return () => {
      // cleanup
      try {
        delete window.pushNotif;
      } catch {}
    };
  }, []);

  // keep navbar updated when any page pushes notifs
  useEffect(() => {
    loadNotifsFromStorage();
    const onChanged = () => loadNotifsFromStorage();
    window.addEventListener("notif:changed", onChanged);
    return () => window.removeEventListener("notif:changed", onChanged);
  }, []);

  // close notifications dropdown when clicking outside
  useEffect(() => {
    function onDocClick(e) {
      if (!showNotifications) return;
      const root = document.getElementById("notif-root");
      if (root && !root.contains(e.target)) setShowNotifications(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [showNotifications]);

  const NotificationBell = () => (
    <div id="notif-root" className="relative">
      <button
        onClick={() => setShowNotifications((v) => !v)}
        className="relative p-2 rounded-lg hover:bg-gray-100"
        title="Notifications"
      >
        <Bell size={20} className="text-gray-700" />

        {/* Dynamic unread count */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {showNotifications && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl border z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <div className="font-semibold">Notifications</div>
            <div className="text-xs font-bold text-gray-500">Local demo</div>
          </div>

          <div className="max-h-[420px] overflow-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-6 text-gray-600">
                No notifications yet.
                <div className="text-xs text-gray-400 mt-1">
                  Push one from any page using <b>window.pushNotif(...)</b>
                </div>

                <div className="mt-3 text-xs text-gray-500">
                  Example (open browser console):
                  <pre className="mt-2 p-2 bg-gray-50 border rounded text-[11px] overflow-auto">
{`window.pushNotif({
  category: "certificate",
  title: "New certificate added",
  message: "You added Google Data Analytics",
  link: "/certificates"
})`}
                  </pre>
                </div>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n._id}
                  className={`px-4 py-3 border-b ${n.read ? "bg-white" : "bg-gray-50"}`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs font-extrabold text-gray-700">
                      {prettyCategory(n.category)}
                    </span>
                    <span className="text-[11px] text-gray-400 font-semibold">
                      {formatTime(n.createdAt)}
                    </span>
                  </div>

                  <div className="mt-1 font-semibold text-sm text-gray-900">
                    {n.title || "Update"}
                  </div>
                  <div className="text-sm text-gray-600 mt-0.5">{n.message || ""}</div>

                  <div className="flex items-center justify-between mt-2">
                    {n.link ? (
                      <Link
                        to={withQuery(n.link)}
                        onClick={() => setShowNotifications(false)}
                        className="text-sm font-bold text-blue-600 hover:underline"
                      >
                        View
                      </Link>
                    ) : (
                      <span />
                    )}

                    {!n.read && (
                      <button
                        onClick={() => markNotificationRead(n._id)}
                        className="text-xs font-bold text-gray-700 border px-2 py-1 rounded-lg hover:bg-gray-100"
                      >
                        Mark read
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="flex gap-2 px-4 py-3">
            <button
              onClick={refresh}
              className="w-full text-sm font-bold border px-3 py-2 rounded-lg hover:bg-gray-100"
            >
              Refresh
            </button>
            <button
              onClick={clearUI}
              className="w-full text-sm font-bold border px-3 py-2 rounded-lg hover:bg-gray-100"
            >
              Clear UI
            </button>
          </div>
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
          <button onClick={() => setIsOpen(!isOpen)} className="p-2 rounded hover:bg-gray-100">
            <Menu size={20} />
          </button>
        </div>

        <nav className="p-4 flex flex-col space-y-2">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            const isActive =
              item.path === "/home"
                ? location.pathname === "/home"
                : location.pathname.startsWith(item.path);

            return (
              <Link
                key={index}
                to={withQuery(item.path)}
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

        <button onClick={handleLogout} className="m-4 bg-red-500 text-white p-2 rounded">
          Logout
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        {/* Header */}
        <div className="bg-white shadow p-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h1 className="font-semibold text-xl">UGC Platform</h1>
            <span className="text-sm text-gray-500">MDH University</span>
          </div>

          <div className="flex items-center gap-2">
            {/* ✅ Dynamic notifications (frontend demo) */}
            <NotificationBell />

            <button onClick={handleLogout} className="p-2 rounded-lg hover:bg-gray-100">
              <LogOut size={20} className="text-gray-700" />
            </button>
          </div>
        </div>

        {/* Page Content */}
        <div className="p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default Layout;

function prettyCategory(c) {
  const map = { certificate: "Certificate", reward: "Reward", milestone: "Milestone" };
  return map[c] || c || "General";
}

function formatTime(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString();
}