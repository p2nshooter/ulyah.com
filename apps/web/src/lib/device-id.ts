// Stable anonymous device token — a random id kept only in localStorage, NOT a
// fingerprint and never any personal data. Shared by the install tracker and
// the pageview beacon so "this device installed the app" and "this device
// visited today" refer to the same phone. Same key the install flow uses.
const DEVICE_KEY = "ulyah_device_id";

export function getDeviceId(): string | null {
  try {
    if (typeof window === "undefined") return null;
    let id = window.localStorage.getItem(DEVICE_KEY);
    if (!id) {
      id = (crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2) + Date.now().toString(36)).replace(/-/g, "");
      window.localStorage.setItem(DEVICE_KEY, id);
    }
    return id;
  } catch {
    return null;
  }
}
