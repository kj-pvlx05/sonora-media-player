"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ReactNode } from "react";
import { AccentProvider } from "./accent-provider";

interface ThemeProviderProps {
  children: ReactNode;
}

/**
 * SONORA Theme Provider
 *
 * Wraps next-themes to provide light/dark theme switching and
 * AccentProvider to provide dynamic, persistent accent colour switching.
 */
export function ThemeProvider({ children }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="data-theme"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      storageKey="sonora-theme"
    >
      <AccentProvider>{children}</AccentProvider>
    </NextThemesProvider>
  );
}
