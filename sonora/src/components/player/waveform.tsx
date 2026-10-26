"use client";

import { useMemo, useRef } from "react";
import { cn } from "@/lib/utils";

interface WaveformProps {
  progress: number; // 0 to 100
  onSeek?: (progress: number) => void;
  trackId?: string;
  className?: string;
  barCount?: number;
  disabled?: boolean;
}

/**
 * Deterministic pseudo-random height generator based on a seed string.
 * Generates an organic audio envelope (natural rise and fall in energy).
 */
function generateDeterministicBars(count: number, seedStr: string): number[] {
  let seed = 0;
  for (let i = 0; i < seedStr.length; i++) {
    seed = (seed * 31 + seedStr.charCodeAt(i)) % 100000;
  }

  const bars: number[] = [];
  for (let i = 0; i < count; i++) {
    seed = (seed * 9301 + 49297) % 233280;
    const rnd = seed / 233280;

    const position = i / count;
    // Organic wave profile with higher energy towards middle
    const envelope = Math.sin(position * Math.PI);
    const height = Math.min(
      95,
      Math.max(12, Math.round((0.15 + 0.85 * envelope * (0.3 + 0.7 * rnd)) * 95))
    );
    bars.push(height);
  }
  return bars;
}

export function Waveform({
  progress,
  onSeek,
  trackId = "default-seed",
  className,
  barCount = 84,
  disabled = false,
}: WaveformProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const bars = useMemo(() => {
    return generateDeterministicBars(barCount, trackId);
  }, [barCount, trackId]);

  const handlePointerAction = (e: React.MouseEvent<HTMLDivElement>) => {
    if (disabled || !onSeek || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newProgress = Math.max(0, Math.min(100, (clickX / rect.width) * 100));
    onSeek(newProgress);
  };

  return (
    <div className={cn("flex flex-col gap-1 w-full select-none", className)}>
      {/* Waveform Bars Container */}
      <div
        ref={containerRef}
        role="slider"
        aria-label="Audio scrubber waveform"
        aria-valuenow={Math.round(progress)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-disabled={disabled}
        tabIndex={disabled ? -1 : 0}
        onClick={handlePointerAction}
        onKeyDown={(e) => {
          if (disabled || !onSeek) return;
          if (e.key === "ArrowLeft") onSeek(Math.max(0, progress - 5));
          if (e.key === "ArrowRight") onSeek(Math.min(100, progress + 5));
        }}
        className={cn(
          "relative h-12 w-full flex items-center justify-between gap-[2px] sm:gap-[2.5px] px-0.5 transition-colors overflow-hidden",
          disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer group"
        )}
      >
        {/* Continuous Horizontal Baseline across the audio bars */}
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[1px] bg-[#DDD8CC] dark:bg-[#33332E] pointer-events-none z-0" />

        {/* Symmetric Vertical Audio Bars */}
        {bars.map((height, idx) => {
          const barProgress = (idx / barCount) * 100;
          const isPlayed = barProgress <= progress;

          return (
            <div
              key={idx}
              className="flex-1 flex items-center justify-center h-full relative z-10"
            >
              <div
                style={{ height: `${Math.max(12, height)}%` }}
                className={cn(
                  "w-[2px] rounded-full transition-all duration-75",
                  isPlayed
                    ? disabled
                      ? "bg-muted-foreground/50"
                      : "bg-accent"
                    : "bg-[#D8D4C9] dark:bg-[#33332E] group-hover:bg-[#CCC7BB] dark:group-hover:bg-[#44443E]"
                )}
              />
            </div>
          );
        })}

        {/* Trail dots at the end */}
        <div className="hidden sm:flex items-center gap-1.5 pl-2 pr-1 shrink-0 pointer-events-none opacity-50 relative z-10">
          <span className="w-1 h-1 rounded-full bg-accent" />
          <span className="w-1 h-1 rounded-full bg-[#C8C4B8]" />
          <span className="w-1 h-1 rounded-full bg-[#C8C4B8]" />
          <span className="w-1 h-1 rounded-full bg-[#C8C4B8]" />
        </div>
      </div>
    </div>
  );
}
