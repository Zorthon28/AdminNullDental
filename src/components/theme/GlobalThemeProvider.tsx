"use client";

import React, { useState, useEffect } from "react";
import { ThemeProvider } from "./ThemeProvider";

interface GlobalThemeProviderProps {
  children: React.ReactNode;
}

export function GlobalThemeProvider({ children }: GlobalThemeProviderProps) {
  const [globalTheme, setGlobalTheme] = useState<"light" | "dark" | "system">(
    "system"
  );

  useEffect(() => {
    // Load theme from global settings
    const loadGlobalTheme = async () => {
      try {
        const response = await fetch("/api/global-settings");
        if (response.ok) {
          const settings = await response.json();
          const themeSetting = settings.find((s: any) => s.key === "theme");
          if (
            themeSetting &&
            ["light", "dark", "system"].includes(themeSetting.value)
          ) {
            setGlobalTheme(themeSetting.value);
          }
        }
      } catch (error) {
        console.warn("Failed to load global theme:", error);
      }
    };

    loadGlobalTheme();
  }, []);

  const handleThemeChange = async (theme: "light" | "dark" | "system") => {
    setGlobalTheme(theme);

    // Save to global settings
    try {
      await fetch("/api/global-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "theme", value: theme }),
      });
    } catch (error) {
      console.warn("Failed to save global theme:", error);
    }
  };

  return (
    <ThemeProvider
      defaultTheme="system"
      storageKey="nulldental-theme"
      globalTheme={globalTheme}
      onThemeChange={handleThemeChange}
    >
      {children}
    </ThemeProvider>
  );
}
