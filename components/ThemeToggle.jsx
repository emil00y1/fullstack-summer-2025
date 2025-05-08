"use client";

import { useTheme } from "next-themes";
import { Switch } from "@/components/ui/switch";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";
  
  const handleToggle = () => {
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <div className="flex items-center justify-between w-full px-2 py-1.5" onClick={(e) => e.stopPropagation()}>
      <div className="flex items-center gap-2">
        {isDark ? 
          <Moon className="h-4 w-4" /> : 
          <Sun className="h-4 w-4" />
        }
        <span className="text-sm">{isDark ? "Dark" : "Light"} Mode</span>
      </div>
      <Switch 
        checked={isDark}
        onCheckedChange={handleToggle}
        aria-label="Toggle theme"
      />
    </div>
  );
}