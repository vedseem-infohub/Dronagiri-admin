"use client";

// Real session-based auth for admin panel connecting to customer-style auth on backend

const ADMIN_KEY = "dronagiri_admin_auth";

export async function login(email, password) {
  try {
    const res = await fetch("http://localhost:8000/api/auth/signin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      credentials: "include"
    });

    if (res.ok) {
      const user = await res.json();
      if (user.role !== "admin") {
        await logout();
        return { success: false, message: "Forbidden: Not an admin account" };
      }

      if (typeof window !== "undefined") {
        localStorage.setItem(ADMIN_KEY, JSON.stringify(user));
      }
      return { success: true, user };
    } else {
      let errMsg = "Invalid email or password";
      try {
        const err = await res.json();
        errMsg = err.message || errMsg;
      } catch {}
      return { success: false, message: errMsg };
    }
  } catch (err) {
    console.error("Admin signin error:", err);
    return { success: false, message: "Failed to connect to backend auth server" };
  }
}

export async function logout() {
  try {
    await fetch("http://localhost:8000/api/auth/logout", {
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

export async function adminFetch(url, options = {}) {
  const mergedOptions = {
    ...options,
    credentials: "include"
  };
  const res = await fetch(url, mergedOptions);
  if (res.status === 401 || res.status === 403) {
    if (typeof window !== "undefined") {
      localStorage.removeItem(ADMIN_KEY);
      window.location.href = "/admin/login";
    }
  }
  return res;
}

