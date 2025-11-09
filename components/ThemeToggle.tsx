"use client";

import { useTheme } from "@/contexts/ThemeContext";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="fixed top-4 right-4 z-50 p-3 rounded-full transition-all duration-300 hover:scale-110"
      style={{
        background: theme === "light"
          ? "linear-gradient(135deg, #6A1B9A 0%, #7E26AD 100%)"
          : "linear-gradient(135deg, #9C27B0 0%, #BA68C8 100%)",
        color: "#ffffff",
        boxShadow: theme === "light"
          ? "0 4px 12px rgba(106, 27, 154, 0.35)"
          : "0 4px 12px rgba(156, 39, 176, 0.5)"
      }}
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
      title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
    >
      {theme === "light" ? (
        <span className="text-2xl">🌙</span>
      ) : (
        <span className="text-2xl">☀️</span>
      )}
    </button>
  );
}
