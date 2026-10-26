"use client";

import {
  Play,
  Pause,
  ChevronUp,
  ChevronDown,
  ChevronsLeft,
  ChevronsRight,
  Square,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PlaybackControlsProps {
  isPlaying: boolean;
  isLoading?: boolean;
  hasAudioSource?: boolean;
  onPlayPause: () => void;
  onNext: () => void;
  onPrev: () => void;
  onStop: () => void;
  volume: number;
  onVolumeChange: (vol: number) => void;
  onCuePause?: () => void;
  className?: string;
}

export function PlaybackControls({
  isPlaying,
  isLoading = false,
  hasAudioSource = true,
  onPlayPause,
  onNext,
  onPrev,
  onStop,
  volume,
  onVolumeChange,
  onCuePause,
  className,
}: PlaybackControlsProps) {
  const handleVolumeUp = () => {
    onVolumeChange(Math.min(100, volume + 5));
  };

  const handleVolumeDown = () => {
    onVolumeChange(Math.max(0, volume - 5));
  };

  return (
    <div
      className={cn(
        "flex items-center gap-2 sm:gap-3 select-none shrink-0",
        className
      )}
    >
      {/* Physical Directional Jog Dial */}
      <div className="relative w-24 h-24 sm:w-26 sm:h-26 rounded-full bg-[#EAE6E1] dark:bg-[#252422] border-2 border-[#1C1A17] dark:border-[#3E3C38] flex items-center justify-center shadow-md">
        {/* Outer Beveled Tactile Inset Ring */}
        <div className="absolute inset-1 rounded-full border border-black/10 dark:border-white/10 pointer-events-none" />

        {/* Top Directional Arrow (Volume Up) */}
        <button
          type="button"
          onClick={handleVolumeUp}
          title="Volume Up"
          aria-label="Volume up"
          className="absolute top-1 flex items-center justify-center w-5 h-4 text-foreground/80 hover:text-foreground active:scale-90 transition-transform"
        >
          <ChevronUp className="w-3.5 h-3.5 stroke-[2.5]" />
        </button>

        {/* Bottom Directional Arrow (Volume Down) */}
        <button
          type="button"
          onClick={handleVolumeDown}
          title="Volume Down"
          aria-label="Volume down"
          className="absolute bottom-1 flex items-center justify-center w-5 h-4 text-foreground/80 hover:text-foreground active:scale-90 transition-transform"
        >
          <ChevronDown className="w-3.5 h-3.5 stroke-[2.5]" />
        </button>

        {/* Left Directional Arrow (Previous Track) */}
        <button
          type="button"
          onClick={onPrev}
          title="Previous Track"
          aria-label="Previous track"
          className="absolute left-1 flex items-center justify-center w-5 h-5 text-foreground/80 hover:text-foreground active:scale-90 transition-transform"
        >
          <ChevronsLeft className="w-3.5 h-3.5 stroke-[2.5]" />
        </button>

        {/* Right Directional Arrow (Next Track) */}
        <button
          type="button"
          onClick={onNext}
          title="Next Track"
          aria-label="Next track"
          className="absolute right-1 flex items-center justify-center w-5 h-5 text-foreground/80 hover:text-foreground active:scale-90 transition-transform"
        >
          <ChevronsRight className="w-3.5 h-3.5 stroke-[2.5]" />
        </button>

        {/* Center Main Play / Pause Button */}
        <button
          type="button"
          onClick={onPlayPause}
          title={
            isLoading
              ? "Buffering Audio..."
              : isPlaying
              ? "Pause Playback"
              : !hasAudioSource
              ? "Audio unavailable (Click to preview notice)"
              : "Start Playback"
          }
          aria-label={
            isLoading
              ? "Loading audio"
              : isPlaying
              ? "Pause track"
              : "Play track"
          }
          className={cn(
            "relative w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center rounded-full border-2 transition-all shadow-md active:scale-95 group",
            "bg-[#F3EFE9] dark:bg-[#1A1918] border-[#1C1A17] dark:border-[#42403B] text-foreground hover:border-accent hover:text-accent",
            !hasAudioSource && !isPlaying && "opacity-80"
          )}
        >
          {/* Subtle concentric groove */}
          <div className="absolute inset-0.5 rounded-full border border-black/5 dark:border-white/5 pointer-events-none" />

          {isLoading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-accent" />
          ) : isPlaying ? (
            <Pause className="w-3.5 h-3.5 fill-current stroke-current" />
          ) : (
            <Play className="w-3.5 h-3.5 fill-current stroke-current ml-0.5" />
          )}
        </button>
      </div>

      {/* Stacked Circular Hardware Buttons: STOP & REC/PAUSE */}
      <div className="flex flex-col items-center gap-1.5">
        {/* STOP Button */}
        <div className="flex flex-col items-center gap-0.5">
          <button
            type="button"
            onClick={onStop}
            title="Stop Playback"
            aria-label="Stop playback"
            className="w-8.5 h-8.5 sm:w-9 sm:h-9 rounded-full bg-[#EAE6E1] dark:bg-[#252422] border-2 border-[#1C1A17] dark:border-[#3E3C38] flex items-center justify-center shadow-xs hover:border-accent hover:text-accent active:scale-95 transition-all text-foreground"
          >
            <Square className="w-3 h-3 fill-current stroke-current" />
          </button>
          <span className="text-[7.5px] sm:text-[8px] font-mono tracking-wider font-bold text-muted uppercase">
            STOP
          </span>
        </div>

        {/* REC/PAUSE Button */}
        <div className="flex flex-col items-center gap-0.5">
          <button
            type="button"
            onClick={() => {
              if (onCuePause) {
                onCuePause();
              } else if (isPlaying) {
                onPlayPause();
              }
            }}
            title="Cue Monitor / Pause mode"
            aria-label="Record / Pause mode"
            className="w-8.5 h-8.5 sm:w-9 sm:h-9 rounded-full bg-[#EAE6E1] dark:bg-[#252422] border-2 border-[#1C1A17] dark:border-[#3E3C38] flex items-center justify-center shadow-xs hover:border-accent active:scale-95 transition-all"
          >
            <span className="w-3 h-3 rounded-full bg-accent inline-block shadow-[0_0_6px_rgba(229,68,56,0.6)]" />
          </button>
          <span className="text-[7.5px] sm:text-[8px] font-mono tracking-wider font-bold text-muted uppercase">
            REC/PAUSE
          </span>
        </div>
      </div>
    </div>
  );
}
