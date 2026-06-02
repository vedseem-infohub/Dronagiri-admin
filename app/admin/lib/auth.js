"use client";

// Simple localStorage-based auth for admin panel

const ADMIN_KEY = "dronagiri_admin_auth";

export const ADMIN_CREDENTIALS = {
  email: "admin@dronagiri.com",
  password: "admin123",
};

export function login(email, password) {
  if (
    email === ADMIN_CREDENTIALS.email &&
    password === ADMIN_CREDENTIALS.password
  ) {
    if (typeof window !== "undefined") {
      localStorage.setItem(ADMIN_KEY, JSON.stringify({ email, loggedInAt: Date.now() }));
    }
    return true;
  }
  return false;
}

export function logout() {
  if (typeof window !== "undefined") {
    localStorage.removeItem(ADMIN_KEY);
  }
}

export function isAuthenticated() {
  if (typeof window === "undefined") return false;
  const data = localStorage.getItem(ADMIN_KEY);
  return !!data;
}
