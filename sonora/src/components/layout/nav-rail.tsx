"use client";

import { useState, useRef, useEffect, useCallback, useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import {
  Home,
  Music2,
  ListMusic,
  Clock,
  Share2,
  Info,
  Sun,
  Moon,
  Check,
} from "lucide-react";
import { NavSection } from "@/types/track";
import { useAccent, AccentPreset } from "@/components/theme/accent-provider";
import { cn } from "@/lib/utils";

function useIsMounted(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

interface NavRailProps {
  activeSection: NavSection;
  onSelectSection: (section: NavSection) => void;
  queueCount?: number;
  className?: string;
}

export function NavRail({
  activeSection,
  onSelectSection,
  className,
}: NavRailProps) {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const mounted = useIsMounted();
  const { currentAccent, setAccent, presets } = useAccent();

  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const paletteRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const navItems: {
    id: NavSection;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    { id: "home", label: "Home", icon: Home },
    { id: "library", label: "Library", icon: Music2 },
    { id: "queue", label: "Queue", icon: ListMusic },
    { id: "recent", label: "Recent", icon: Clock },
    { id: "visualizer", label: "DSA", icon: Share2 },
    { id: "about", label: "About", icon: Info },
  ];

  const isDark = mounted && (theme === "dark" || resolvedTheme === "dark");

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark");
  };

  // Close palette on click outside
  useEffect(() => {
    if (!isPaletteOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        paletteRef.current &&
        !paletteRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsPaletteOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsPaletteOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isPaletteOpen]);

  const handleSelectAccent = useCallback(
    (preset: AccentPreset) => {
      setAccent(preset);
      setIsPaletteOpen(false);
      triggerRef.current?.focus();
    },
    [setAccent]
  );

  return (
    <aside
      aria-label="Primary Navigation Rail"
      className={cn(
        "relative flex flex-col items-center justify-between w-20 lg:w-[92px] h-full bg-background border-l border-border/80 py-5 select-none shrink-0 z-20",
        className
      )}
    >
      {/* ──────────────────────────────────────────────────────────
          Top: Circular Accent Indicator & Palette Trigger
          ────────────────────────────────────────────────────────── */}
      <div className="relative flex flex-col items-center shrink-0">
        <button
          ref={triggerRef}
          type="button"
          onClick={() => setIsPaletteOpen((prev) => !prev)}
          title="Customize accent colour"
          aria-label="Customize accent colour"
          aria-haspopup="dialog"
          aria-expanded={isPaletteOpen}
          className={cn(
            "w-[28px] h-[28px] rounded-full border border-border-strong/70 dark:border-border flex items-center justify-center transition-all cursor-pointer",
            "hover:border-foreground/50 hover:scale-105 active:scale-95",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
            isPaletteOpen && "ring-2 ring-accent border-accent"
          )}
        >
          <div className="w-[14px] h-[14px] rounded-full border border-border-strong/40 flex items-center justify-center">
            <span
              className="w-2 h-2 rounded-full inline-block transition-colors"
              style={{ backgroundColor: currentAccent.hex }}
            />
          </div>
        </button>

        {/* ── Accent Colour Popover ── */}
        {isPaletteOpen && (
          <div
            ref={paletteRef}
            role="dialog"
            aria-label="Accent colour palette"
            className={cn(
              "absolute right-full top-0 mr-3.5 z-50 w-64 p-3.5 bg-surface border border-border rounded-2xl shadow-xl font-sans",
              "animate-in fade-in-0 zoom-in-95 duration-150"
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-2 border-b border-border-subtle/70">
              <span className="text-[10px] font-mono font-bold tracking-widest text-muted-foreground uppercase">
                ACCENT COLOUR
              </span>
              <span
                className="text-[10.5px] font-mono font-bold tracking-wide"
                style={{ color: currentAccent.hex }}
              >
                {currentAccent.name}
              </span>
            </div>

            {/* 8 Preset Swatches (4 columns × 2 rows) */}
            <div
              role="radiogroup"
              aria-label="Accent colour choices"
              className="grid grid-cols-4 gap-2.5 pt-3"
            >
              {presets.map((preset) => {
                const isSelected = preset.id === currentAccent.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    aria-label={preset.name}
                    title={preset.name}
                    onClick={() => handleSelectAccent(preset)}
                    className={cn(
                      "w-10 h-10 rounded-full relative flex items-center justify-center transition-all cursor-pointer",
                      "hover:scale-108 active:scale-95 hover:shadow-sm focus-visible:outline-none",
                      isSelected
                        ? "ring-2 ring-offset-2 ring-offset-surface ring-foreground/70 scale-105"
                        : "border border-black/10 dark:border-white/10"
                    )}
                    style={{ backgroundColor: preset.hex }}
                  >
                    {isSelected && (
                      <Check className="w-4 h-4 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)] stroke-[3]" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ──────────────────────────────────────────────────────────
          Center: Vertical Navigation Item Stack
          ────────────────────────────────────────────────────────── */}
      <nav
        className="flex flex-col items-center gap-3.5 my-auto"
        aria-label="Navigation"
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectSection(item.id)}
              aria-current={isActive ? "page" : undefined}
              title={item.label}
              className={cn(
                "flex flex-col items-center justify-center w-[68px] h-[60px] rounded-2xl transition-all cursor-pointer group",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                isActive
                  ? "font-semibold shadow-2xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-surface-alt/70"
              )}
              style={
                isActive
                  ? {
                      backgroundColor: "var(--sn-accent-muted)",
                      color: "var(--sn-accent)",
                    }
                  : undefined
              }
            >
              <Icon
                className={cn(
                  "w-5 h-5 transition-colors mb-1",
                  isActive
                    ? "stroke-[2.1]"
                    : "text-muted-foreground group-hover:text-foreground stroke-[1.8]"
                )}
              />
              <span className="text-[11px] font-sans font-medium tracking-tight">
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* ──────────────────────────────────────────────────────────
          Bottom: Sun / Moon Theme Toggle
          ────────────────────────────────────────────────────────── */}
      <div className="flex flex-col items-center pt-2 shrink-0">
        <button
          type="button"
          onClick={toggleTheme}
          title={isDark ? "Switch to Light Theme" : "Switch to Dark Theme"}
          aria-label="Toggle visual theme"
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-muted hover:text-foreground transition-colors rounded-lg cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <Sun
            className={cn(
              "w-4 h-4 transition-colors",
              !isDark
                ? "text-foreground opacity-100 stroke-[2.2]"
                : "text-muted-foreground/40 stroke-[1.6]"
            )}
          />
          <span className="text-[10px] text-muted-foreground/30 font-mono">|</span>
          <Moon
            className={cn(
              "w-4 h-4 transition-colors",
              isDark
                ? "text-foreground opacity-100 stroke-[2.2]"
                : "text-muted-foreground/40 stroke-[1.6]"
            )}
          />
        </button>
      </div>
    </aside>
  );
}
