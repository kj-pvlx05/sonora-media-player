"use client";

import { useState } from "react";
import { Track } from "@/types/track";
import { AlbumArtwork } from "@/components/player/album-artwork";
import { Play, Plus, Check, MoreVertical, Heart } from "lucide-react";
import { cn } from "@/lib/utils";

interface TrackCardProps {
  track: Track;
  isCurrentlyPlaying: boolean;
  isPlaying: boolean;
  onPlay: (track: Track) => void;
  onAddToQueue: (track: Track) => void;
  isFavorite: boolean;
  onToggleFavorite: (trackId: string) => void;
}

export function TrackCard({
  track,
  isCurrentlyPlaying,
  isPlaying,
  onPlay,
  onAddToQueue,
  isFavorite,
  onToggleFavorite,
}: TrackCardProps) {
  const [justAdded, setJustAdded] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToQueue(track);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1400);
  };

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite(track.id);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onPlay(track)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onPlay(track);
        }
      }}
      className={cn(
        "group relative flex flex-col p-3 rounded-md border text-left cursor-pointer transition-all duration-200 select-none",
        isCurrentlyPlaying
          ? "bg-surface-alt border-accent/70 shadow-sm"
          : "bg-surface hover:bg-surface-elevated border-border-subtle hover:border-border-strong shadow-xs"
      )}
    >
      {/* Top Artwork with Overlay Play Trigger */}
      <div className="relative w-full aspect-square mb-2.5 rounded-sm overflow-hidden bg-surface-sunken">
        <AlbumArtwork track={track} size="md" />

        {/* Hover / Playing Overlay */}
        <div
          className={cn(
            "absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center transition-opacity",
            isCurrentlyPlaying
              ? "opacity-100"
              : "opacity-0 group-hover:opacity-100"
          )}
        >
          <div
            className={cn(
              "w-11 h-11 rounded-full flex items-center justify-center shadow-md transition-transform group-hover:scale-105 active:scale-95",
              isCurrentlyPlaying && isPlaying
                ? "bg-accent text-white animate-pulse"
                : "bg-surface text-foreground hover:bg-accent hover:text-white"
            )}
          >
            <Play className="w-5 h-5 fill-current ml-0.5" />
          </div>
        </div>

        {/* Floating Quick Action Buttons */}
        <div className="absolute top-1.5 right-1.5 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          {/* Favorite Button */}
          <button
            type="button"
            onClick={handleFavorite}
            title={isFavorite ? "Remove favorite" : "Add to favorites"}
            aria-label="Toggle favorite"
            className="p-1.5 rounded-full bg-black/60 backdrop-blur-sm text-white hover:text-accent transition-colors"
          >
            <Heart
              className={cn(
                "w-3.5 h-3.5",
                isFavorite ? "fill-accent text-accent" : "text-white"
              )}
            />
          </button>
        </div>

        {/* Format Badge & Audio Status */}
        <div className="absolute bottom-1.5 left-1.5 flex items-center gap-1">
          <span className="px-1 py-0.5 rounded-xs bg-black/75 text-white/90 text-[8px] font-mono tracking-wider uppercase border border-white/10">
            {track.duration}
          </span>
          {track.audioSrc ? (
            <span className="px-1 py-0.5 rounded-xs bg-emerald-600/90 text-white text-[7px] font-mono font-bold tracking-wider uppercase border border-emerald-400/30">
              AUDIO
            </span>
          ) : (
            <span className="px-1 py-0.5 rounded-xs bg-black/60 text-white/60 text-[7px] font-mono tracking-wider uppercase border border-white/10">
              PREVIEW
            </span>
          )}
        </div>
      </div>

      {/* Track Metadata */}
      <div className="flex flex-col gap-0.5 mb-2">
        <div className="flex items-center justify-between gap-1">
          <h3
            className={cn(
              "font-medium text-sm truncate",
              isCurrentlyPlaying ? "text-accent font-semibold" : "text-foreground"
            )}
          >
            {track.title}
          </h3>
          {isCurrentlyPlaying && (
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-ping shrink-0" />
          )}
        </div>
        <p className="text-xs text-muted truncate">{track.artist}</p>
        <p className="text-[10px] font-mono text-muted-foreground/80 truncate">
          {track.album}
        </p>
      </div>

      {/* Bottom Action Footer */}
      <div className="mt-auto pt-2 border-t border-border-subtle flex items-center justify-between gap-2">
        {/* Add to Queue Button */}
        <button
          type="button"
          onClick={handleAdd}
          title="Add to Up Next Queue"
          aria-label={`Add ${track.title} to queue`}
          className={cn(
            "flex-1 flex items-center justify-center gap-1 py-1 px-2 rounded-xs border text-[11px] font-mono uppercase tracking-wider transition-all",
            justAdded
              ? "bg-accent text-white border-accent font-bold"
              : "bg-surface-alt hover:bg-surface-sunken border-border-subtle hover:border-border text-foreground active:scale-95"
          )}
        >
          {justAdded ? (
            <>
              <Check className="w-3 h-3 stroke-[2.5]" />
              <span>ADDED</span>
            </>
          ) : (
            <>
              <Plus className="w-3 h-3" />
              <span>+ QUEUE</span>
            </>
          )}
        </button>

        {/* More Options Menu Toggle */}
        <div className="relative">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            title="More Options"
            aria-label="More options"
            aria-expanded={showMenu}
            className="p-1 rounded-xs border border-border-subtle hover:border-border bg-surface-alt text-muted hover:text-foreground transition-colors"
          >
            <MoreVertical className="w-3.5 h-3.5" />
          </button>

          {/* Quick Dropdown Popover */}
          {showMenu && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="absolute bottom-full right-0 mb-1 w-36 bg-surface-elevated border border-border rounded-sm shadow-md py-1 z-30 text-[11px] font-mono"
            >
              <button
                type="button"
                onClick={(e) => {
                  handleAdd(e);
                  setShowMenu(false);
                }}
                className="w-full text-left px-2.5 py-1.5 hover:bg-surface-alt text-foreground"
              >
                Play Next
              </button>
              <button
                type="button"
                onClick={(e) => {
                  handleFavorite(e);
                  setShowMenu(false);
                }}
                className="w-full text-left px-2.5 py-1.5 hover:bg-surface-alt text-foreground"
              >
                {isFavorite ? "Unfavorite" : "Favorite"}
              </button>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard?.writeText(
                    `${track.title} - ${track.artist} (${track.album})`
                  );
                  setShowMenu(false);
                }}
                className="w-full text-left px-2.5 py-1.5 hover:bg-surface-alt text-muted"
              >
                Copy Info
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
