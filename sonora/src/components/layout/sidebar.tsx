"use client";

import {
  Home,
  Music2,
  ListMusic,
  Clock,
  Share2,
  Info,
} from "lucide-react";
import { NavSection } from "@/types/track";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme/theme-toggle";

interface SidebarProps {
  activeSection: NavSection;
  onSelectSection: (section: NavSection) => void;
  queueCount?: number;
  className?: string;
}

export function Sidebar({
  activeSection,
  onSelectSection,
  className,
}: SidebarProps) {
  const navItems: {
    id: NavSection;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    { id: "home", label: "Home", icon: Home },
    { id: "library", label: "Library", icon: Music2 },
    { id: "queue", label: "Queue", icon: ListMusic },
    { id: "recent", label: "Recently Played", icon: Clock },
    { id: "visualizer", label: "DSA Visualizer", icon: Share2 },
    { id: "about", label: "About Project", icon: Info },
  ];

  return (
    <aside
      aria-label="Application Navigation"
      className={cn(
        "flex flex-col justify-between w-full h-full bg-surface border border-border rounded-2xl p-3 sm:p-3.5 select-none shadow-xs min-h-0",
        className
      )}
    >
      {/* Top Branding Section */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1 pb-1">
          <div className="flex items-center gap-1.5">
            <span className="font-mono font-black text-lg tracking-wider text-foreground">
              SONORA
            </span>
            <span className="w-2 h-2 rounded-full bg-accent inline-block shrink-0 shadow-[0_0_6px_rgba(229,68,56,0.6)]" />
          </div>
          <p className="font-mono text-[9px] uppercase tracking-wider text-muted font-medium">
            MEDIA QUEUE SYSTEM
          </p>
        </div>

        {/* Navigation Items */}
        <nav className="flex flex-col gap-1" aria-label="Main navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectSection(item.id)}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "relative flex items-center justify-between w-full px-2.5 sm:px-3 py-1.5 rounded-md text-xs font-mono transition-all text-left group",
                  isActive
                    ? "bg-surface-alt text-accent font-semibold shadow-xs"
                    : "text-muted hover:text-foreground hover:bg-surface-alt/60"
                )}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={cn(
                      "w-4 h-4 transition-colors",
                      isActive
                        ? "text-accent stroke-[2.2]"
                        : "text-foreground/80 group-hover:text-foreground stroke-[1.8]"
                    )}
                  />
                  <span>{item.label}</span>
                </div>

                {/* Signal-red right dot indicator on active item */}
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Technical Project Card */}
      <div className="flex flex-col gap-1.5 pt-2 border-t border-border-subtle text-[10px] font-mono">
        <div className="p-2 rounded-lg bg-surface-alt/70 border border-border-subtle flex flex-col gap-1">
          <div className="flex items-center justify-between font-bold text-foreground">
            <span className="tracking-wide text-[9.5px]">DSA × OOP PROJECT</span>
            <ThemeToggle />
          </div>
          <div className="text-[9px] text-muted flex items-center justify-between">
            <span>Queue</span>
            <span className="text-border">|</span>
            <span>Linked List</span>
          </div>
          <div className="text-[9px] text-muted flex items-center justify-between">
            <span>Java</span>
            <span className="text-border">|</span>
            <span>Spring Boot</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
