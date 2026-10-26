"use client";

import { Track } from "@/types/track";
import { AlbumArtwork } from "@/components/player/album-artwork";
import { History, Play, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface RecentlyPlayedProps {
  tracks: Track[];
  currentTrack: Track;
  onPlayTrack: (track: Track) => void;
  onAddToQueue: (track: Track) => void;
  className?: string;
}

export function RecentlyPlayed({
  tracks,
  currentTrack,
  onPlayTrack,
  onAddToQueue,
  className,
}: RecentlyPlayedProps) {
  // Show up to 5 tracks per spec
  const recentTracks = tracks.slice(0, 5);

  return (
    <div
      className={cn(
        "flex flex-col gap-2.5 p-4 bg-surface border border-border rounded-lg shadow-xs",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border-subtle pb-2.5">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-accent" />
          <h3 className="text-xs font-mono font-bold tracking-wider text-foreground uppercase">
            RECENTLY PLAYED
          </h3>
        </div>
        <span className="text-[10px] font-mono text-muted uppercase">
          LAST 5 SESSIONS
        </span>
      </div>

      {/* 5 Compact Rows with subtle separators */}
      <div className="flex flex-col divide-y divide-border-subtle" role="list">
        {recentTracks.map((track) => {
          const isPlaying = currentTrack.id === track.id;

          return (
            <div
              key={track.id}
              role="listitem"
              className={cn(
                "group flex items-center justify-between gap-2.5 py-2 px-1 rounded-sm hover:bg-surface-alt/70 transition-colors select-none",
                isPlaying && "bg-surface-alt/50"
              )}
            >
              {/* Artwork Thumbnail */}
              <div
                className="relative cursor-pointer shrink-0"
                onClick={() => onPlayTrack(track)}
              >
                <AlbumArtwork track={track} size="sm" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-sm transition-opacity">
                  <Play className="w-3 h-3 text-white fill-current" />
                </div>
              </div>

              {/* Title & Artist */}
              <div
                className="flex-1 min-w-0 cursor-pointer"
                onClick={() => onPlayTrack(track)}
                title={`Play ${track.title}`}
              >
                <h4
                  className={cn(
                    "text-xs truncate transition-colors",
                    isPlaying
                      ? "text-accent font-semibold"
                      : "text-foreground group-hover:text-foreground font-medium"
                  )}
                >
                  {track.title}
                </h4>
                <p className="text-[11px] text-muted truncate">{track.artist}</p>
              </div>

              {/* Actions & Duration */}
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-[10px] font-mono text-muted">
                  {track.duration}
                </span>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddToQueue(track);
                  }}
                  title="Add to Up Next Queue"
                  aria-label={`Add ${track.title} to queue`}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded-xs border border-border-subtle hover:border-accent hover:text-accent text-muted bg-surface transition-all"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
