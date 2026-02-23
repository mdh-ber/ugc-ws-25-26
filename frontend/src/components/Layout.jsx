// Layout.jsx
import { useEffect, useMemo, useRef, useState } from "react";
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
  BarChart3,
  Megaphone,
  CheckCheck,
  Trash2,
  Check,
  RefreshCcw,
  MessageSquare,
} from "lucide-react";

const API_BASE = "http://localhost:5000/api";

// ----------------------
// Demo notifications fallback
// ----------------------
const DEMO_NOTIFICATIONS = [
  {
    id: "n1",
    type: "comment",
    title: "New comment",
    message: "Someone commented on your latest post.",
    createdAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    read: false,
    link: "/reviews",
  },
  {
    id: "n2",
    type: "like",
    title: "New like",
    message: "Your content just received a new like.",
    createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    read: false,
    link: "/dashboard",
  },
  {
    id: "n3",
    type: "milestone",
    title: "Milestone unlocked",
    message: "Congrats! You reached 1,000 views this week.",
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    read: true,
    link: "/milestones",
  },
];

// ----------------------
// Demo feedback fallback
// ----------------------
const DEMO_FEEDBACKS = [
  {
    _id: "f1",
    userName: "Anonymous",
    message: "Nice platform! But please improve loading speed.",
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    resolved: false,
  },
  {
    _id: "f2",
    userName: "Rohit",
    message: "Can we get notifications for new reviews?",
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    resolved: true,
  },
];

function timeAgo(iso) {
  const t = new Date(iso).getTime();
  const diff = Date.now() - t;
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const d = Math.floor(hr / 24);
  return `${d}d ago`;
}

function typeBadge(type) {
  switch (type) {
    case "like":
      return { label: "Like", cls: "bg-blue-50 text-blue-700" };
    case "comment":
      return { label: "Comment", cls: "bg-green-50 text-green-700" };
    case "follow":
      return { label: "Follow", cls: "bg-purple-50 text-purple-700" };
    case "reward":
      return { label: "Reward", cls: "bg-yellow-50 text-yellow-800" };
    case "milestone":
      return { label: "Milestone", cls: "bg-pink-50 text-pink-700" };
    default:
      return { label: "System", cls: "bg-gray-100 text-gray-700" };
  }
}

export default function Layout() {
  const [isOpen, setIsOpen] = useState(true);
  const [showPanel, setShowPanel] = useState(false);

  // Tabs: "notifications" | "feedbacks"
  const [activeTab, setActiveTab] = useState("notifications");

  // notifications state
  const [notifs, setNotifs] = useState([]);
  const [loadingNotifs, setLoadingNotifs] = useState(false);

  // feedbacks state
  const [feedbacks, setFeedbacks] = useState([]);
  const [loadingFeedbacks, setLoadingFeedbacks] = useState(false);

  const panelRef = useRef(null);

  const location = useLocation();
  const nav = useNavigate();

  const token = sessionStorage.getItem("token") || localStorage.getItem("token");

  const withQuery = (path) => `${path}${location.search || ""}`;

  const params = new URLSearchParams(location.search);
  const isMarketingManager = params.get("mode") === "manager";

  // ----------------------
  // Logout
  // ----------------------
  const handleLogout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("role");

    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");

    nav("/login");
  };

  if (!token) return <Outlet />;

  // ----------------------
  // Menu
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

    ...(isMarketingManager
      ? [
          { name: "Campaigns", path: "/campaigns", icon: Megaphone },
          { name: "Website Analytics", path: "/website-analytics", icon: BarChart3 },
        ]
      : []),
  ];

  // ----------------------
  // Counts
  // ----------------------
  const unreadNotifs = useMemo(() => notifs.filter((n) => !n.read).length, [notifs]);
  const openFeedbackCount = useMemo(
    () => feedbacks.filter((f) => !f.resolved).length,
    [feedbacks]
  );

  // ----------------------
  // Fetch Notifications
  // ----------------------
  const fetchNotifications = async ({ silent = false } = {}) => {
    try {
      if (!silent) setLoadingNotifs(true);

      const res = await fetch(`${API_BASE}/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("No notifications API yet");
      const data = await res.json();

      setNotifs(Array.isArray(data?.items) ? data.items : []);
    } catch {
      if (!silent) setNotifs(DEMO_NOTIFICATIONS);
    } finally {
      if (!silent) setLoadingNotifs(false);
    }
  };

  const markOneRead = async (id) => {
    setNotifs((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    try {
      await fetch(`${API_BASE}/notifications/${id}/read`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {}
  };

  const markAllRead = async () => {
    setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
    try {
      await fetch(`${API_BASE}/notifications/read-all`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {}
  };

  const clearAllNotifs = async () => {
    setNotifs([]);
    try {
      await fetch(`${API_BASE}/notifications`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {}
  };

  const openNotification = async (n) => {
    if (!n.read) await markOneRead(n.id);
    if (n.link) nav(withQuery(n.link));
    setShowPanel(false);
  };

  // ----------------------
  // Fetch Feedbacks
  // ----------------------
  const fetchFeedbacks = async ({ silent = false } = {}) => {
    try {
      if (!silent) setLoadingFeedbacks(true);

      // ✅ adjust if your feedback endpoint differs
      const res = await fetch(`${API_BASE}/feedback?resolved=all&limit=10&page=1`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("No feedback API yet");
      const data = await res.json();

      // expected: { items: [...] }
      setFeedbacks(Array.isArray(data?.items) ? data.items : []);
    } catch {
      if (!silent) setFeedbacks(DEMO_FEEDBACKS);
    } finally {
      if (!silent) setLoadingFeedbacks(false);
    }
  };

  // ----------------------
  // Effects
  // ----------------------
  useEffect(() => {
    if (!token) return;
    fetchNotifications();
    fetchFeedbacks();
  }, [token]);

  useEffect(() => {
    if (!token) return;

    const t = setInterval(() => {
      fetchNotifications({ silent: true });
      fetchFeedbacks({ silent: true });
    }, 15000);

    return () => clearInterval(t);
  }, [token]);

  useEffect(() => {
    const onClick = (e) => {
      if (!showPanel) return;
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setShowPanel(false);
      }
    };

    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [showPanel]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") setShowPanel(false);
    };

    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // ----------------------
  // UI: Panel (Notifications + Feedbacks)
  // ----------------------
  const Panel = () => (
    <div
      ref={panelRef}
      className="absolute right-0 mt-2 w-[440px] bg-white rounded-2xl shadow-2xl border z-50 overflow-hidden"
    >
      {/* Header */}
      <div className="px-5 py-4 border-b flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Updates</h3>
          <p className="text-xs text-gray-500">Notifications & feedback at a glance</p>
        </div>

        <button
          onClick={() => {
            if (activeTab === "notifications") fetchNotifications();
            else fetchFeedbacks();
          }}
          className="p-2 rounded-lg hover:bg-gray-100"
          title="Refresh"
          aria-label="Refresh"
        >
          <RefreshCcw size={18} className="text-gray-700" />
        </button>
      </div>

      {/* Tabs */}
      <div className="px-3 pt-3">
        <div className="bg-gray-100 p-1 rounded-xl flex gap-1">
          <button
            onClick={() => setActiveTab("notifications")}
            className={`flex-1 px-3 py-2 rounded-lg text-sm font-semibold ${
              activeTab === "notifications" ? "bg-white shadow" : "text-gray-600"
            }`}
          >
            Notifications{" "}
            <span className="ml-1 text-xs font-bold">
              {unreadNotifs > 0 ? `(${unreadNotifs})` : ""}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("feedbacks")}
            className={`flex-1 px-3 py-2 rounded-lg text-sm font-semibold ${
              activeTab === "feedbacks" ? "bg-white shadow" : "text-gray-600"
            }`}
          >
            Feedbacks{" "}
            <span className="ml-1 text-xs font-bold">
              {openFeedbackCount > 0 ? `(${openFeedbackCount})` : ""}
            </span>
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="max-h-[440px] overflow-auto mt-3">
        {activeTab === "notifications" ? (
          <>
            <div className="px-5 pb-3 flex items-center justify-end gap-2">
              <button
                onClick={markAllRead}
                className="text-xs font-semibold px-3 py-2 rounded-lg hover:bg-gray-100 flex items-center gap-2"
                title="Mark all as read"
              >
                <CheckCheck size={16} /> Mark all read
              </button>

              <button
                onClick={clearAllNotifs}
                className="text-xs font-semibold px-3 py-2 rounded-lg hover:bg-gray-100 flex items-center gap-2"
                title="Clear all"
              >
                <Trash2 size={16} /> Clear
              </button>
            </div>

            {loadingNotifs && (
              <div className="px-5 py-4 text-sm text-gray-600">Loading…</div>
            )}

            {!loadingNotifs && notifs.length === 0 && (
              <div className="px-5 py-10 text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                  <Bell size={20} className="text-gray-600" />
                </div>
                <h4 className="mt-3 font-semibold">No notifications</h4>
                <p className="text-sm text-gray-500 mt-1">
                  You’re all caught up. New engagement alerts will appear here.
                </p>
              </div>
            )}

            {!loadingNotifs &&
              notifs.map((n) => {
                const badge = typeBadge(n.type);
                return (
                  <div
                    key={n.id}
                    className={`px-5 py-4 border-b cursor-pointer hover:bg-gray-50 ${
                      !n.read ? "bg-blue-50/30" : ""
                    }`}
                    onClick={() => openNotification(n)}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${badge.cls}`}>
                            {badge.label}
                          </span>
                          {!n.read && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-600 text-white">
                              New
                            </span>
                          )}
                        </div>

                        <p className="mt-2 font-semibold text-sm text-gray-900 truncate">
                          {n.title}
                        </p>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {n.message}
                        </p>

                        <div className="mt-2 text-xs text-gray-500">{timeAgo(n.createdAt)}</div>
                      </div>

                      {!n.read && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            markOneRead(n.id);
                          }}
                          className="p-2 rounded-lg hover:bg-white border bg-white/80"
                          title="Mark as read"
                          aria-label="Mark as read"
                        >
                          <Check size={16} className="text-gray-700" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
          </>
        ) : (
          <>
            {loadingFeedbacks && (
              <div className="px-5 py-4 text-sm text-gray-600">Loading…</div>
            )}

            {!loadingFeedbacks && feedbacks.length === 0 && (
              <div className="px-5 py-10 text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                  <MessageSquare size={20} className="text-gray-600" />
                </div>
                <h4 className="mt-3 font-semibold">No feedbacks</h4>
                <p className="text-sm text-gray-500 mt-1">
                  Feedback submitted by users will show here.
                </p>
              </div>
            )}

            {!loadingFeedbacks &&
              feedbacks.map((f) => (
                <div key={f._id} className="px-5 py-4 border-b hover:bg-gray-50">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            f.resolved ? "bg-gray-100 text-gray-700" : "bg-orange-50 text-orange-700"
                          }`}
                        >
                          {f.resolved ? "Resolved" : "Open"}
                        </span>

                        {!f.resolved && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-orange-600 text-white">
                            New
                          </span>
                        )}
                      </div>

                      <p className="mt-2 font-semibold text-sm text-gray-900 truncate">
                        {f.userName || "Anonymous"}
                      </p>

                      <p className="text-sm text-gray-600 mt-1 line-clamp-3">
                        {f.message || f.review || "Feedback"}
                      </p>

                      <div className="mt-2 text-xs text-gray-500">{timeAgo(f.createdAt)}</div>
                    </div>

                    <button
                      onClick={() => nav(withQuery("/admin-feedback"))}
                      className="text-xs font-semibold text-blue-600 hover:underline whitespace-nowrap"
                      title="Open admin feedback page"
                    >
                      Open
                    </button>
                  </div>
                </div>
              ))}
          </>
        )}
      </div>

      {/* Footer */}
      <div className="px-5 py-3 bg-gray-50 flex items-center justify-between">
        {activeTab === "notifications" ? (
          <>
            <span className="text-xs text-gray-600">
              Unread: <span className="font-semibold">{unreadNotifs}</span>
            </span>
            <button
              onClick={() => nav(withQuery("/dashboard"))}
              className="text-xs font-semibold text-blue-600 hover:underline"
            >
              View engagement
            </button>
          </>
        ) : (
          <>
            <span className="text-xs text-gray-600">
              Open: <span className="font-semibold">{openFeedbackCount}</span>
            </span>
            <button
              onClick={() => nav(withQuery("/admin-feedback"))}
              className="text-xs font-semibold text-blue-600 hover:underline"
            >
              Manage feedbacks
            </button>
          </>
        )}
      </div>
    </div>
  );

  const BellButton = () => (
    <div className="relative">
      <button
        onClick={() => setShowPanel((v) => !v)}
        className="relative p-2 rounded-lg hover:bg-gray-100"
        title="Notifications & Feedbacks"
        aria-label="Notifications & Feedbacks"
      >
        <Bell size={20} className="text-gray-700" />
        {(unreadNotifs + openFeedbackCount) > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold">
            {(unreadNotifs + openFeedbackCount) > 99 ? "99+" : (unreadNotifs + openFeedbackCount)}
          </span>
        )}
      </button>

      {showPanel && <Panel />}
    </div>
  );

  // ----------------------
  // Render
  // ----------------------
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

            const isActive =
              item.path === "/home"
                ? location.pathname === "/home"
                : location.pathname.startsWith(item.path);

            return (
              <Link
                key={index}
                to={withQuery(item.path)}
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

        <button
          onClick={handleLogout}
          className="m-4 bg-red-500 text-white p-2 rounded flex items-center justify-center gap-2"
        >
          <LogOut size={18} /> {isOpen && "Logout"}
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        <div className="bg-white shadow p-4 flex justify-between items-center">
          <div>
            <h1 className="font-semibold text-xl">UGC Platform</h1>
            <span className="text-sm text-gray-500">MDH University</span>
          </div>

          <div className="flex items-center gap-2">
            <BellButton />

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

        <div className="p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
}