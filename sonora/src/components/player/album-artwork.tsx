"use client";

import { useState } from "react";
import { Track } from "@/types/track";
import { cn } from "@/lib/utils";

interface AlbumArtworkProps {
  track: Track;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
  showTrackNumber?: boolean;
}

export function AlbumArtwork({
  track,
  size = "md",
  className,
  showTrackNumber = false,
}: AlbumArtworkProps) {
  const [imageError, setImageError] = useState(false);
  const palette = track.artworkPalette;

  // Dimensions based on size
  const sizeClasses = {
    xs: "w-7 h-7 text-[8px] rounded-xs",
    sm: "w-11 h-11 text-[9px] rounded-sm",
    md: "w-full aspect-square text-xs rounded-sm",
    lg: "w-44 h-44 sm:w-52 sm:h-52 md:w-56 md:h-56 text-sm rounded-md",
  }[size];

  const hasImage = Boolean(track.coverImage) && !imageError;

  return (
    <div
      className={cn(
        "relative overflow-hidden select-none shrink-0 group border border-border/80 shadow-sm",
        sizeClasses,
        className
      )}
      style={{ backgroundColor: palette.bg }}
    >
      {hasImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={track.coverImage}
          alt={`${track.title} by ${track.artist}`}
          onError={() => setImageError(true)}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <ArtisticArtworkCanvas track={track} size={size} />
      )}

      {/* Hardware Vignette Overlay & Screen Texture */}
      <div
        className="pointer-events-none absolute inset-0 mix-blend-overlay opacity-30"
        style={{
          backgroundImage:
            "radial-gradient(circle at center, transparent 40%, rgba(0,0,0,0.6) 100%)",
        }}
      />

      {/* Subtle Scanline Texture for Retro Audio Feel */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, #000, #000 1px, transparent 1px, transparent 3px)",
        }}
      />

      {/* Corner Track Number Indicator (for main player or large cards) */}
      {showTrackNumber && (
        <div className="absolute top-2 left-2 z-10 px-1.5 py-0.5 font-mono text-[10px] font-semibold tracking-wider uppercase bg-black/75 text-white/90 backdrop-blur-sm border border-white/10 rounded-xs shadow-xs">
          {track.trackNumber}
        </div>
      )}

      {/* High-Fidelity Audio Badge for LG size */}
      {size === "lg" && (
        <div className="absolute bottom-2 right-2 z-10 px-1.5 py-0.5 font-mono text-[9px] tracking-wider uppercase bg-black/80 text-accent font-bold backdrop-blur-sm border border-accent/30 rounded-xs shadow-xs">
          HI-RES AUDIO
        </div>
      )}
    </div>
  );
}

/**
 * Procedural retro-futuristic vector artwork for tracks without raster files.
 * Provides differentiated, high-craft graphic identities per track style.
 */
function ArtisticArtworkCanvas({
  track,
  size,
}: {
  track: Track;
  size: "xs" | "sm" | "md" | "lg";
}) {
  const p = track.artworkPalette;
  const isSmall = size === "xs" || size === "sm";

  switch (track.artworkStyle) {
    case "ambient": // Aurora - C418
      return (
        <svg
          viewBox="0 0 200 200"
          className="w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <radialGradient id="auroraGlow" cx="50%" cy="40%" r="60%">
              <stop offset="0%" stopColor={p.accent} stopOpacity="0.4" />
              <stop offset="100%" stopColor={p.bg} stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="200" height="200" fill={p.bg} />
          <circle cx="100" cy="80" r="90" fill="url(#auroraGlow)" />
          {/* Concentric ambient ripples */}
          <circle
            cx="100"
            cy="110"
            r="70"
            fill="none"
            stroke={p.accent}
            strokeWidth="0.8"
            strokeDasharray="4 6"
            opacity="0.5"
          />
          <circle
            cx="100"
            cy="110"
            r="50"
            fill="none"
            stroke={p.accentSecondary}
            strokeWidth="1"
            opacity="0.6"
          />
          <circle
            cx="100"
            cy="110"
            r="30"
            fill="none"
            stroke={p.accent}
            strokeWidth="1.2"
          />
          <circle cx="100" cy="110" r="8" fill={p.accent} />
          {/* Serene horizon grid */}
          <line
            x1="20"
            y1="160"
            x2="180"
            y2="160"
            stroke={p.accent}
            strokeWidth="0.8"
            opacity="0.4"
          />
          <line
            x1="40"
            y1="175"
            x2="160"
            y2="175"
            stroke={p.accentSecondary}
            strokeWidth="0.6"
            opacity="0.3"
          />
          {!isSmall && (
            <text
              x="20"
              y="32"
              fill={p.fg}
              fontFamily="var(--font-mono)"
              fontSize="10"
              letterSpacing="2"
              opacity="0.85"
            >
              AURORA // ALPHA
            </text>
          )}
        </svg>
      );

    case "pop": // Blush - JVKE
      return (
        <svg
          viewBox="0 0 200 200"
          className="w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect width="200" height="200" fill={p.bg} />
          {/* Soft bloom arcs */}
          <circle
            cx="140"
            cy="60"
            r="80"
            fill={p.accent}
            opacity="0.25"
          />
          <circle
            cx="60"
            cy="140"
            r="70"
            fill={p.accentSecondary}
            opacity="0.2"
          />
          {/* Overlapping chromatic geometric forms */}
          <rect
            x="45"
            y="45"
            width="110"
            height="110"
            fill="none"
            stroke={p.accent}
            strokeWidth="1.5"
            transform="rotate(45 100 100)"
          />
          <rect
            x="60"
            y="60"
            width="80"
            height="80"
            fill={p.accent}
            fillOpacity="0.15"
            stroke={p.accentSecondary}
            strokeWidth="1"
            transform="rotate(45 100 100)"
          />
          <circle cx="100" cy="100" r="16" fill={p.accent} />
          {!isSmall && (
            <text
              x="100"
              y="180"
              textAnchor="middle"
              fill={p.fg}
              fontFamily="var(--font-mono)"
              fontSize="10"
              letterSpacing="3"
              fontWeight="bold"
            >
              BLUSH
            </text>
          )}
        </svg>
      );

    case "acoustic": // Heaven - Niall Horan
      return (
        <svg
          viewBox="0 0 200 200"
          className="w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect width="200" height="200" fill={p.bg} />
          {/* Sun disc / acoustic warmth */}
          <circle
            cx="100"
            cy="90"
            r="45"
            fill="none"
            stroke={p.accent}
            strokeWidth="2"
          />
          <circle
            cx="100"
            cy="90"
            r="40"
            fill={p.accent}
            fillOpacity="0.2"
          />
          {/* Sound chamber concentric rays */}
          {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(
            (deg) => (
              <line
                key={deg}
                x1="100"
                y1="90"
                x2={100 + Math.cos((deg * Math.PI) / 180) * 80}
                y2={90 + Math.sin((deg * Math.PI) / 180) * 80}
                stroke={p.accent}
                strokeWidth="0.6"
                strokeDasharray="2 4"
                opacity="0.35"
              />
            )
          )}
          {/* Base pedestal line */}
          <line
            x1="30"
            y1="160"
            x2="170"
            y2="160"
            stroke={p.accent}
            strokeWidth="1.5"
          />
          {!isSmall && (
            <text
              x="100"
              y="182"
              textAnchor="middle"
              fill={p.fg}
              fontFamily="var(--font-mono)"
              fontSize="9"
              letterSpacing="3"
            >
              THE SHOW // HEAVEN
            </text>
          )}
        </svg>
      );

    case "electronic": // The Nights - Avicii
      return (
        <svg
          viewBox="0 0 200 200"
          className="w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect width="200" height="200" fill={p.bg} />
          {/* Oscilloscope Pulse Wave */}
          <path
            d="M 10 100 L 45 100 L 55 50 L 70 150 L 85 70 L 100 130 L 115 85 L 130 115 L 140 100 L 190 100"
            fill="none"
            stroke={p.accent}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Frequency grids */}
          <line
            x1="10"
            y1="50"
            x2="190"
            y2="50"
            stroke={p.accentSecondary}
            strokeWidth="0.5"
            strokeDasharray="3 3"
            opacity="0.4"
          />
          <line
            x1="10"
            y1="150"
            x2="190"
            y2="150"
            stroke={p.accentSecondary}
            strokeWidth="0.5"
            strokeDasharray="3 3"
            opacity="0.4"
          />
          <line
            x1="100"
            y1="15"
            x2="100"
            y2="185"
            stroke={p.accentSecondary}
            strokeWidth="0.5"
            strokeDasharray="3 3"
            opacity="0.3"
          />
          {!isSmall && (
            <text
              x="18"
              y="32"
              fill={p.fg}
              fontFamily="var(--font-mono)"
              fontSize="9"
              letterSpacing="2"
            >
              AVICII // THE NIGHTS
            </text>
          )}
        </svg>
      );

    case "retro": // Starboy - The Weeknd
      return (
        <svg
          viewBox="0 0 200 200"
          className="w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect width="200" height="200" fill={p.bg} />
          {/* Iconic geometric cross motif */}
          <rect
            x="93"
            y="30"
            width="14"
            height="130"
            fill={p.accent}
            rx="1"
          />
          <rect
            x="45"
            y="65"
            width="110"
            height="14"
            fill={p.accent}
            rx="1"
          />
          {/* Neon back glow rings */}
          <circle
            cx="100"
            cy="72"
            r="42"
            fill="none"
            stroke={p.accentSecondary}
            strokeWidth="1.2"
            strokeDasharray="2 3"
            opacity="0.6"
          />
          <circle
            cx="100"
            cy="72"
            r="65"
            fill="none"
            stroke={p.accent}
            strokeWidth="0.7"
            opacity="0.3"
          />
          {!isSmall && (
            <text
              x="100"
              y="185"
              textAnchor="middle"
              fill={p.fg}
              fontFamily="var(--font-mono)"
              fontSize="10"
              letterSpacing="3"
              fontWeight="bold"
            >
              STARBOY
            </text>
          )}
        </svg>
      );

    case "psychedelic": // Heat Waves - Glass Animals
      return (
        <svg
          viewBox="0 0 200 200"
          className="w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect width="200" height="200" fill={p.bg} />
          {/* Topographic thermal wave curves */}
          {[40, 70, 100, 130, 160].map((y, i) => (
            <path
              key={y}
              d={`M 10 ${y} Q 55 ${y - (i % 2 === 0 ? 25 : -25)} 100 ${y} T 190 ${y}`}
              fill="none"
              stroke={i % 2 === 0 ? p.accent : p.accentSecondary}
              strokeWidth="2"
              opacity={0.8 - i * 0.1}
            />
          ))}
          <circle
            cx="100"
            cy="100"
            r="32"
            fill={p.accent}
            fillOpacity="0.2"
            stroke={p.accentSecondary}
            strokeWidth="1"
          />
          {!isSmall && (
            <text
              x="100"
              y="188"
              textAnchor="middle"
              fill={p.fg}
              fontFamily="var(--font-mono)"
              fontSize="9"
              letterSpacing="2"
            >
              HEAT WAVES
            </text>
          )}
        </svg>
      );

    case "classic": // Somewhere Only We Know - Keane
    default:
      return (
        <svg
          viewBox="0 0 200 200"
          className="w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect width="200" height="200" fill={p.bg} />
          {/* Architectural minimal arcs */}
          <path
            d="M 25 170 A 75 75 0 0 1 175 170"
            fill="none"
            stroke={p.accent}
            strokeWidth="2"
          />
          <path
            d="M 50 170 A 50 50 0 0 1 150 170"
            fill="none"
            stroke={p.accentSecondary}
            strokeWidth="1"
            strokeDasharray="4 4"
          />
          <path
            d="M 75 170 A 25 25 0 0 1 125 170"
            fill={p.accent}
            fillOpacity="0.3"
          />
          {/* North coordinate */}
          <line
            x1="100"
            y1="30"
            x2="100"
            y2="70"
            stroke={p.accent}
            strokeWidth="1.5"
          />
          <polygon points="97,30 103,30 100,20" fill={p.accent} />
          {!isSmall && (
            <text
              x="100"
              y="188"
              textAnchor="middle"
              fill={p.fg}
              fontFamily="var(--font-mono)"
              fontSize="9"
              letterSpacing="2"
            >
              KEANE // HOPES & FEARS
            </text>
          )}
        </svg>
      );
  }
}
