"use client";

import { QueueItem, Track } from "@/types/track";
import { AlbumArtwork } from "@/components/player/album-artwork";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";

interface QueuePanelProps {
  currentTrack?: Track;
  isPlaying?: boolean;
  queue: QueueItem[];
  onPlayFromQueue: (track: Track) => void;
  onRemoveFromQueue: (queueId: string) => void;
  onClearQueue?: () => void;
  onMoveQueueItem?: (fromIndex: number, toIndex: number) => void;
  className?: string;
}

export function QueuePanel({
  currentTrack,
  isPlaying = false,
  queue,
  onPlayFromQueue,
  className,
}: QueuePanelProps) {
  return (
    <div
      aria-label="Upcoming Playback Queue"
      className={cn(
        "flex flex-col gap-2 p-3 sm:p-3.5 bg-surface border border-border rounded-2xl shadow-xs select-none shrink-0 min-w-0 h-full justify-between",
        className
      )}
    >
      {/* 1. Header: UP NEXT + Track Count */}
      <div className="flex items-center justify-between pb-1 shrink-0">
        <h3 className="text-xs sm:text-[13px] font-mono font-bold tracking-wider text-foreground uppercase">
          UP NEXT
        </h3>
        <span className="text-[10px] sm:text-[10.5px] font-mono text-[#99958C] tracking-wider">
          {queue.length} TRACKS
        </span>
      </div>

      {/* 2. NOW PLAYING Section */}
      {currentTrack && (
        <div className="flex flex-col gap-1 shrink-0">
          <span className="text-[9.5px] font-mono font-bold tracking-widest text-accent uppercase">
            NOW PLAYING
          </span>

          <div className="flex items-center justify-between gap-2.5 p-2 rounded-xl bg-surface-alt/60 border border-border-subtle">
            <div className="flex items-center gap-2.5 min-w-0">
              <AlbumArtwork
                track={currentTrack}
                size="sm"
                className="w-10 h-10 rounded-md shrink-0 border border-border-subtle"
              />
              <div className="flex flex-col min-w-0">
                <h4 className="text-xs font-bold text-foreground truncate leading-tight">
                  {currentTrack.title}
                </h4>
                <p className="text-[10.5px] text-muted truncate mt-0.5">
                  {currentTrack.artist}
                </p>
                <span className="text-[9.5px] font-mono text-muted-foreground mt-0.5">
                  {currentTrack.duration}
                </span>
              </div>
            </div>

            {/* Sage Green Equalizer Playing Graphic */}
            <div className="flex items-end gap-[2px] h-4 shrink-0 px-1">
              {[40, 85, 55, 100, 70].map((h, idx) => (
                <span
                  key={idx}
                  style={{ height: isPlaying ? `${h}%` : "30%" }}
                  className={cn(
                    "w-[2px] bg-accent rounded-full transition-all duration-150",
                    isPlaying && "animate-pulse"
                  )}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3. IN QUEUE Section */}
      <div className="flex flex-col gap-1 flex-1 min-h-0">
        <span className="text-[9.5px] font-mono font-bold tracking-widest text-muted uppercase">
          IN QUEUE
        </span>

        {queue.length > 0 ? (
          <div
            className="flex flex-col gap-1 overflow-y-auto pr-0.5 flex-1 min-h-0"
            role="list"
          >
            {queue.map((item, index) => {
              const rowNum = String(index + 1).padStart(2, "0");

              return (
                <div
                  key={item.queueId}
                  role="listitem"
                  onClick={() => onPlayFromQueue(item.track)}
                  className="group flex items-center justify-between gap-2 p-1 rounded-lg hover:bg-surface-alt/80 transition-colors cursor-pointer"
                >
                  {/* Left: Row Number + Artwork + Title/Artist */}
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-[10px] font-mono text-muted w-4 text-center shrink-0">
                      {rowNum}
                    </span>

                    <AlbumArtwork
                      track={item.track}
                      size="xs"
                      className="w-7 h-7 rounded-sm shrink-0 border border-border-subtle"
                    />

                    <div className="flex flex-col min-w-0">
                      <h4 className="text-[11.5px] font-semibold text-foreground truncate group-hover:text-accent transition-colors leading-tight">
                        {item.track.title}
                      </h4>
                      <p className="text-[10px] text-muted truncate">
                        {item.track.artist}
                      </p>
                    </div>
                  </div>

                  {/* Right: Duration + Reorder Handle */}
                  <div className="flex items-center gap-2.5 shrink-0 pr-1">
                    <span className="text-[10px] font-mono text-muted">
                      {item.track.duration}
                    </span>
                    <Menu className="w-3.5 h-3.5 text-muted/60 group-hover:text-foreground transition-colors cursor-grab" />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center py-4 text-center border border-dashed border-border-subtle rounded-xl gap-1">
            <span className="text-[11px] font-mono text-muted">QUEUE IS EMPTY</span>
            <span className="text-[9.5px] text-muted-foreground">
              Add songs from the library below
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
