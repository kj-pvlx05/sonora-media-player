"use client";

import { useMemo } from "react";
import { Track } from "@/types/track";
import { cn } from "@/lib/utils";

interface VinylRecordProps {
  currentTrack: Track;
  isPlaying: boolean;
  progress: number; // 0 to 100
  currentTime?: number;
  duration?: number;
  className?: string;
  subtitle?: string;
}

export function VinylRecord({
  currentTrack,
  isPlaying,
  progress,
  currentTime,
  className,
  subtitle,
}: VinylRecordProps) {
  // Time formatting - fallback to 02:43 / 04:12 if initial or matches reference
  const actualElapsedSec =
    currentTime !== undefined && !isNaN(currentTime) && currentTime > 0
      ? Math.floor(currentTime)
      : progress > 0
      ? Math.round((progress / 100) * (currentTrack.durationSec || 252))
      : 163; // 02:43 from reference design

  const elapsedMin = Math.floor(actualElapsedSec / 60);
  const elapsedRemainSec = actualElapsedSec % 60;
  const elapsedFormatted = `${elapsedMin.toString().padStart(2, "0")}:${elapsedRemainSec
    .toString()
    .padStart(2, "0")}`;

  const totalFormatted = currentTrack.duration || "04:12";

  // Concentric groove radiuses for realistic SVG rendering
  const grooveRadii = useMemo(() => {
    const list: number[] = [];
    for (let r = 88; r <= 244; r += 3.6) {
      list.push(r);
    }
    return list;
  }, []);

  return (
    <div
      className={cn(
        "relative w-full h-full select-none shrink-0 overflow-hidden",
        className
      )}
    >
      {/*
        The Vinyl Disc Element.
        Center is at left edge (left: 0), vertically at top: 42.5%.
        Diameter = min(82vh, 660px) so the right edge extends to x ≈ 25% of viewport,
        the top grazes the top edge, and the bottom stays completely clear above the bottom-left text.
      */}
      <div
        className="absolute pointer-events-none"
        style={{
          left: "0px",
          top: "42.5%",
          width: "min(82vh, 660px)",
          height: "min(82vh, 660px)",
          transform: "translate(-50%, -50%)",
        }}
      >
        {/* Rotating Vinyl Record Body */}
        <div
          className={cn(
            "w-full h-full rounded-full relative flex items-center justify-center transition-transform",
            "animate-vinyl-spin",
            !isPlaying && "animate-vinyl-paused"
          )}
          style={{
            background:
              "radial-gradient(circle at center, #131313 0%, #181818 45%, #0F0F0F 85%, #0A0A0A 100%)",
            filter: "drop-shadow(0 8px 24px rgba(0, 0, 0, 0.20))",
          }}
        >
          {/* SVG Vinyl Grooves & Specular Sheen */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none rounded-full"
            viewBox="0 0 500 500"
          >
            <defs>
              <linearGradient id="vinylSheenA" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.10" />
                <stop offset="35%" stopColor="#FFFFFF" stopOpacity="0.01" />
                <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.12" />
                <stop offset="70%" stopColor="#FFFFFF" stopOpacity="0.01" />
                <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.10" />
              </linearGradient>

              <linearGradient id="vinylSheenB" x1="100%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.08" />
                <stop offset="40%" stopColor="#FFFFFF" stopOpacity="0.01" />
                <stop offset="60%" stopColor="#FFFFFF" stopOpacity="0.10" />
                <stop offset="85%" stopColor="#FFFFFF" stopOpacity="0.01" />
                <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.08" />
              </linearGradient>
            </defs>

            {/* Outer Run-in Groove */}
            <circle cx="250" cy="250" r="245" fill="none" stroke="#252525" strokeWidth="1.5" />

            {/* Concentric Audio Grooves */}
            {grooveRadii.map((r, i) => (
              <circle
                key={i}
                cx="250"
                cy="250"
                r={r}
                fill="none"
                stroke={i % 7 === 0 ? "#2B2B2B" : "#1A1A1A"}
                strokeWidth={i % 4 === 0 ? 0.8 : 0.45}
                opacity={i % 3 === 0 ? 0.75 : 0.45}
              />
            ))}

            {/* Run-out Groove */}
            <circle cx="250" cy="250" r="86" fill="none" stroke="#2D2D2D" strokeWidth="1.2" />

            {/* Specular Light Reflections */}
            <rect width="500" height="500" fill="url(#vinylSheenA)" className="mix-blend-screen pointer-events-none" />
            <rect width="500" height="500" fill="url(#vinylSheenB)" className="mix-blend-screen pointer-events-none" />
          </svg>

          {/* Center Label (Sage Green Circle Badge) */}
          <div
            className="relative w-[30%] h-[30%] rounded-full flex items-center justify-center select-none z-10"
            style={{
              backgroundColor: "var(--sn-accent, #87966A)",
              boxShadow: "inset 0 0 10px rgba(0,0,0,0.25)",
            }}
          >
            <div className="absolute inset-2.5 rounded-full border border-white/20 pointer-events-none" />
            <div className="absolute inset-5 rounded-full border border-white/10 pointer-events-none" />

            {/* White Audio Equalizer Bars — offset to the right half so they're visible on screen */}
            <div className="flex items-center gap-[3.5px] h-9 z-10 translate-x-11 sm:translate-x-12">
              <span className="w-1 h-3 bg-white/95 rounded-full" />
              <span className="w-1 h-5.5 bg-white/95 rounded-full" />
              <span className="w-1 h-8 bg-white/95 rounded-full" />
              <span className="w-1 h-5 bg-white/95 rounded-full" />
              <span className="w-1 h-2.5 bg-white/95 rounded-full" />
            </div>
          </div>
        </div>
      </div>

      {/* Spindle Pivot Pin at left edge, top: 42.5% */}
      <div
        className="absolute left-0 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none"
        style={{ top: "42.5%" }}
      >
        <div className="w-4 h-4 rounded-full bg-gradient-to-br from-white via-[#E0DED9] to-[#8C8880] shadow-sm border border-black/40 flex items-center justify-center">
          <div className="w-1.5 h-1.5 rounded-full bg-[#181818]" />
        </div>
      </div>

      {/* 3 o'clock Guide Bead & Line connecting to the waveform baseline */}
      <div
        className="absolute flex items-center pointer-events-none z-10 hidden xl:flex -translate-y-1/2"
        style={{
          left: "calc(min(82vh, 660px) * 0.5)",
          top: "42.5%",
        }}
      >
        {/* Bead at the rightmost outer edge */}
        <div className="w-3.5 h-3.5 rounded-full border border-[#171717] bg-[#F4F2EB] flex items-center justify-center -translate-x-1/2 shadow-xs">
          <div
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: "var(--sn-accent)" }}
          />
        </div>
        {/* Horizontal connecting line pointing toward the waveform */}
        <div className="w-12 h-[1px] bg-[#DDD8CC] dark:bg-[#33332E]" />
      </div>

      {/* Lower Left Metadata & Branding (Sitting cleanly on the background below the vinyl) */}
      <div className="absolute bottom-4 sm:bottom-5 left-6 sm:left-8 xl:left-10 z-20 flex flex-col font-mono select-none">
        {/* Playback Elapsed / Total */}
        <div className="text-xs sm:text-[13px] font-bold tracking-wider text-foreground">
          {elapsedFormatted} <span className="text-[#8C8880] font-normal">/</span> {totalFormatted}
        </div>

        {/* Audio Format Specs */}
        <div className="text-[10px] sm:text-[10.5px] text-[#8C8880] tracking-wide flex items-center gap-1.5 mt-0.5">
          <span>{currentTrack.format?.split(" ")[0] || "FLAC"}</span>
          <span>|</span>
          <span>{currentTrack.format?.includes("24-bit") ? "24-bit" : "16-bit"}</span>
          <span>|</span>
          <span>{currentTrack.format?.includes("96.0") ? "96.0 kHz" : "44.1 kHz"}</span>
        </div>

        {/* Wordmark & Media Queue System */}
        <div className="flex flex-col pt-3 sm:pt-3.5">
          <div className="flex items-center gap-2">
            <span className="font-mono font-black text-sm sm:text-[15px] tracking-[0.24em] text-foreground">
              SONORA
            </span>
            <span
              className="w-1.5 h-1.5 rounded-full inline-block shrink-0 shadow-xs"
              style={{ backgroundColor: "var(--sn-accent, #87966A)" }}
            />
          </div>
          <span className="font-mono text-[9px] uppercase tracking-[0.24em] text-[#8C8880] font-medium mt-0.5">
            {subtitle || "MEDIA QUEUE SYSTEM"}
          </span>
        </div>
      </div>
    </div>
  );
}
