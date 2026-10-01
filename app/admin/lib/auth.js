"use client";

// Real session-based auth for admin panel connecting to customer-style auth on backend

const ADMIN_KEY = "dronagiri_admin_auth";

export async function login(email, password) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BACKEND_URL || process.env.NEXT_API_BACKEND_URL || "https://dronagiri-backend-e4ja.onrender.com"}/api/auth/signin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      credentials: "include"
    });

    const data = await safeJson(res);

    if (res.ok && data) {
      if (data.role !== "admin") {
        await logout();
        return { success: false, message: "Forbidden: Not an admin account" };
      }

      if (typeof window !== "undefined") {
        localStorage.setItem(ADMIN_KEY, JSON.stringify(data));
      }
      return { success: true, user: data };
    } else {
      return { success: false, message: data?.message || data?.error || "Invalid email or password" };
    }
  } catch (err) {
    console.error("Admin signin error:", err);
    return { success: false, message: "Failed to connect to backend auth server" };
  }
}

export async function logout() {
  try {
    await fetch(`${process.env.NEXT_PUBLIC_API_BACKEND_URL || process.env.NEXT_API_BACKEND_URL || "https://dronagiri-backend-e4ja.onrender.com"}/api/auth/logout`, {
      credentials: "include"
    });
  } catch (err) {
    console.error("Admin signout error:", err);
  }
  if (typeof window !== "undefined") {
    localStorage.removeItem(ADMIN_KEY);
  }
}

export function isAuthenticated() {
  if (typeof window === "undefined") return false;
  const data = localStorage.getItem(ADMIN_KEY);
  return !!data;
}

export async function safeJson(res) {
  if (!res) return { success: false, error: "No response from server" };
  const contentType = res.headers ? (res.headers.get("content-type") || "") : "";
  try {
    if (contentType.includes("application/json")) {
      return await res.json();
    }
    const text = await res.text();
    try {
      return JSON.parse(text);
    } catch {
      return {
        success: false,
        error: res.status ? `Server response error (${res.status}): Non-JSON response.` : "Invalid response from server",
        raw: text.substring(0, 300),
      };
    }
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function adminFetch(url, options = {}) {
  let token = null;
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(ADMIN_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        token = parsed.token || null;
      }
    } catch {}
  }

  const headers = {
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };

  const mergedOptions = {
    ...options,
    headers,
    credentials: "include"
  };
  const res = await fetch(url, mergedOptions);
  if (res.status === 401 || res.status === 403) {
    if (typeof window !== "undefined" && !window.location.pathname.includes("/admin/login")) {
      localStorage.removeItem(ADMIN_KEY);
      window.location.href = "/admin/login";
    }
  }
  return res;
}

