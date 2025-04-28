"use client";

import { useTheme } from "next-themes";

export function ThemeWrapper({ children }) {
  const { theme } = useTheme();

  return <>{children}</>;
}
