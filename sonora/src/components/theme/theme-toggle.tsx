"use client";

import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";
import { Sun, Moon } from "lucide-react";

type ThemeOption = "light" | "dark";

const themeOptions: { value: ThemeOption; icon: typeof Sun; label: string }[] = [
  { value: "light", icon: Sun, label: "Light" },
  { value: "dark", icon: Moon, label: "Dark" },
];

/**
 * Hydration-safe mounted check using useSyncExternalStore.
 * Returns false on the server, true after hydration on the client.
 */
function useIsMounted(): boolean {
  return useSyncExternalStore(
    // subscribe: no-op because mounted state never changes after initial render
    () => () => {},
    // getSnapshot (client): always true
    () => true,
    // getServerSnapshot: always false
    () => false,
  );
}

/**
 * Theme toggle button that cycles through light → dark → system.
 * Renders a placeholder on the server to avoid hydration mismatch.
 */
export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const mounted = useIsMounted();

  if (!mounted) {
    return (
      <div
        className="h-8 w-8"
        style={{ borderRadius: "var(--sn-radius-sm)" }}
        aria-hidden
      />
    );
  }

  const matchedIndex = themeOptions.findIndex((opt) => opt.value === theme);
  const currentIndex = matchedIndex >= 0 ? matchedIndex : 0;
  const current = themeOptions[currentIndex] || themeOptions[0];
  const Icon = current.icon;

  function cycleTheme() {
    const nextIndex = (currentIndex + 1) % themeOptions.length;
    setTheme(themeOptions[nextIndex].value);
  }

  return (
    <button
      onClick={cycleTheme}
      className="inline-flex h-8 w-8 items-center justify-center transition-colors hover:bg-surface-alt"
      style={{ borderRadius: "var(--sn-radius-sm)" }}
      title={`Theme: ${current.label}`}
      aria-label={`Current theme: ${current.label}. Click to change.`}
    >
      <Icon size={16} strokeWidth={1.5} />
    </button>
  );
}
