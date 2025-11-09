"use client";

import { useState, useEffect } from "react";

interface AccessibilityControlsProps {
  className?: string;
}

export function AccessibilityControls({ className = "" }: AccessibilityControlsProps) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);

  // Load saved preferences on component mount
  useEffect(() => {
    const savedDarkMode = localStorage.getItem("darkMode") === "true";
    const savedZoom = parseFloat(localStorage.getItem("zoomLevel") || "1");

    setIsDarkMode(savedDarkMode);
    setZoomLevel(savedZoom);

    // Apply saved preferences
    if (savedDarkMode) {
      document.documentElement.classList.add("dark");
    }
    document.documentElement.style.zoom = savedZoom.toString();
  }, []);

  // Handle dark mode toggle
  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    localStorage.setItem("darkMode", newDarkMode.toString());

    if (newDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  // Handle zoom in
  const zoomIn = () => {
    const newZoom = Math.min(zoomLevel + 0.1, 2.0); // Max 200%
    setZoomLevel(newZoom);
    localStorage.setItem("zoomLevel", newZoom.toString());
    document.documentElement.style.zoom = newZoom.toString();
  };

  // Handle zoom out
  const zoomOut = () => {
    const newZoom = Math.max(zoomLevel - 0.1, 0.8); // Min 80%
    setZoomLevel(newZoom);
    localStorage.setItem("zoomLevel", newZoom.toString());
    document.documentElement.style.zoom = newZoom.toString();
  };

  return (
    <div className={`fixed bottom-4 left-4 right-4 flex justify-between items-center ${className}`}>
      {/* Zoom Controls */}
      <div className="flex gap-2">
        <button
          onClick={zoomOut}
          disabled={zoomLevel <= 0.8}
          className="w-12 h-12 bg-white dark:bg-purple-dark border-2 border-light-plum dark:border-lighter-plum rounded-full flex items-center justify-center text-light-plum dark:text-lighter-plum font-bold text-xl hover:bg-purple-50 dark:hover:bg-navy-dark hover:border-lighter-plum disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg"
          aria-label="Zoom out"
          title="Zoom out"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 13H5v-2h14v2z"/>
          </svg>
        </button>

        <button
          onClick={zoomIn}
          disabled={zoomLevel >= 2.0}
          className="w-12 h-12 bg-white dark:bg-purple-dark border-2 border-light-plum dark:border-lighter-plum rounded-full flex items-center justify-center text-light-plum dark:text-lighter-plum font-bold text-xl hover:bg-purple-50 dark:hover:bg-navy-dark hover:border-lighter-plum disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg"
          aria-label="Zoom in"
          title="Zoom in"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
          </svg>
        </button>
      </div>

      {/* Dark Mode Toggle */}
      <div className="flex items-center gap-3">
        <span className="text-gray-700 dark:text-gray-300 font-medium">Dark Mode</span>
        <button
          onClick={toggleDarkMode}
          className={`relative inline-flex h-8 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
            isDarkMode ? "bg-purple-600" : "bg-gray-200"
          }`}
          role="switch"
          aria-checked={isDarkMode}
          aria-label="Toggle dark mode"
        >
          <span
            aria-hidden="true"
            className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
              isDarkMode ? "translate-x-6" : "translate-x-0"
            }`}
          />
        </button>
      </div>
    </div>
  );
}