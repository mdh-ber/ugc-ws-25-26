const KEY = "demo_notifications_v1";

export function getNotifications() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

export function addNotification(n) {
  const list = getNotifications();
  const next = [n, ...list].slice(0, 50);
  localStorage.setItem(KEY, JSON.stringify(next));
  // let UI update instantly
  window.dispatchEvent(new Event("notif:changed"));
}

export function markRead(id) {
  const list = getNotifications();
  const next = list.map((x) => (x._id === id ? { ...x, read: true } : x));
  localStorage.setItem(KEY, JSON.stringify(next));
  window.dispatchEvent(new Event("notif:changed"));
}