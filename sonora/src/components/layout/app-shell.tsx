"use client";

import { Bell } from "lucide-react";
import { NavRail } from "@/components/layout/nav-rail";
import { VinylRecord } from "@/components/player/vinyl-record";
import { Track, NavSection } from "@/types/track";
import { cn } from "@/lib/utils";

interface AppShellProps {
  activeSection: NavSection;
  onSelectSection: (section: NavSection) => void;
  queueCount: number;
  toastMessage?: string | null;
  isToastError?: boolean;
  isBackendConnected?: boolean;
  currentTrack: Track;
  isPlaying: boolean;
  progress: number;
  currentTime?: number;
  duration?: number;
  vinylSubtitle?: string;
  children: React.ReactNode;
}

export function AppShell({
  activeSection,
  onSelectSection,
  queueCount,
  toastMessage,
  isToastError = false,
  currentTrack,
  isPlaying,
  progress,
  currentTime,
  duration,
  vinylSubtitle,
  children,
}: AppShellProps) {
  return (
    <div className="h-screen max-h-screen xl:h-dvh xl:max-h-dvh w-full bg-background text-foreground flex overflow-hidden font-sans transition-colors duration-150 select-none">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className={cn(
            "fixed top-4 right-20 z-50 flex items-center gap-2 px-3.5 py-2 bg-surface text-xs font-mono rounded-lg shadow-lg animate-in slide-in-from-top-2 duration-150 border-2 max-w-sm",
            isToastError
              ? "border-amber-500 text-amber-600 dark:text-amber-400"
              : "border-accent text-foreground"
          )}
        >
          <Bell
            className={cn(
              "w-3.5 h-3.5 shrink-0",
              isToastError ? "text-amber-500" : "text-accent animate-bounce"
            )}
          />
          <span className="leading-tight">{toastMessage}</span>
        </div>
      )}

      {/* Persistent Vinyl Record */}
      <div className="hidden lg:flex absolute inset-y-0 left-0 w-[27%] xl:w-[28%] max-w-[430px] flex-col justify-between pointer-events-none z-0">
        <VinylRecord
          currentTrack={currentTrack}
          isPlaying={isPlaying}
          progress={progress}
          currentTime={currentTime}
          duration={duration}
          subtitle={vinylSubtitle}
        />
      </div>

      {/* Main Content Workspace (Fills all remaining width to the left of the rail) */}
      <main
        id="main-content"
        tabIndex={-1}
        className="relative z-10 flex-1 min-w-0 h-full overflow-hidden outline-none flex flex-col lg:flex-row gap-3 xl:gap-4 py-2.5 pr-2.5 pl-0 sm:py-3 sm:pr-3 sm:pl-0 xl:py-4 xl:pr-4 xl:pl-0"
      >
        {/* Right Area: Page Workspace */}
        <div className="flex-1 min-w-0 h-full overflow-hidden flex flex-col ml-[27%] xl:ml-[28%]">
          {children}
        </div>
      </main>

      {/* Far Right Vertical Navigation Rail */}
      <NavRail
        activeSection={activeSection}
        onSelectSection={onSelectSection}
        queueCount={queueCount}
      />
    </div>
  );
}
