"use client";

import { useMemo } from "react";
import { Track } from "@/types/track";
import { Waveform } from "./waveform";
import {
  Shuffle,
  Repeat,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MainPlayerProps {
  currentTrack: Track;
  isPlaying: boolean;
  isLoading?: boolean;
  currentTime?: number;
  duration?: number;
  progress: number;
  hasAudioSource?: boolean;
  playbackError?: string | null;
  onPlayPause: () => void;
  onNext: () => void;
  onPrev: () => void;
  onStop: () => void;
  onSeek: (progress: number) => void;
  volume: number;
  onVolumeChange: (vol: number) => void;
  isFavorite: boolean;
  onToggleFavorite: (trackId: string) => void;
  isShuffle: boolean;
  onToggleShuffle: () => void;
  isRepeat: boolean;
  onToggleRepeat: () => void;
  onFocusSearch?: () => void;
  className?: string;
}

export function MainPlayer({
  currentTrack,
  isPlaying,
  isLoading = false,
  progress,
  hasAudioSource = true,
  onPlayPause,
  onNext,
  onPrev,
  onSeek,
  volume,
  onVolumeChange,
  isShuffle,
  onToggleShuffle,
  isRepeat,
  onToggleRepeat,
  className,
}: MainPlayerProps) {
  // Split title if it has multiple words for stacked display like reference "NIGHT DRIVE"
  const titleWords = useMemo(() => {
    return currentTrack.title.toUpperCase().split(" ");
  }, [currentTrack.title]);

  // Track index string (e.g. "01 / 08")
  const trackIndexStr = currentTrack.trackNumber
    ? currentTrack.trackNumber.replace("TRK ", "").replace("/", " / ")
    : "01 / 08";

  return (
    <div
      aria-label="Current Track Player"
      className={cn(
        "flex flex-col justify-between py-1 select-none min-w-0 shrink-0",
        className
      )}
    >
      {/* Top Header Row: NOW PLAYING label + Track Index */}
      <div className="flex items-center justify-between pb-1">
        <div className="flex items-center gap-2">
          {/* Sage green vertical bar */}
          <span
            className="w-[3px] h-3.5 rounded-full inline-block"
            style={{ backgroundColor: "var(--sn-accent, #87966A)" }}
          />
          <span className="font-mono text-[10.5px] font-bold tracking-[0.22em] text-[#555] dark:text-[#AAA] uppercase">
            NOW PLAYING
          </span>
        </div>

        {/* Track Index (e.g. 01 / 08) */}
        <span className="font-mono text-xs text-[#99958C] tracking-widest font-medium">
          {trackIndexStr}
        </span>
      </div>

      {/* Editorial Track Title & Artist / Album */}
      <div className="flex flex-col my-auto py-1">
        {/* Massive Editorial Track Title */}
        <h1 className="font-black text-5xl sm:text-6xl lg:text-[62px] xl:text-[66px] tracking-[-0.03em] leading-[0.88] text-foreground uppercase">
          {titleWords.length > 1 ? (
            <>
              <div>{titleWords[0]}</div>
              <div>{titleWords.slice(1).join(" ")}</div>
            </>
          ) : (
            <div>{currentTrack.title.toUpperCase()}</div>
          )}
        </h1>

        {/* Artist Name */}
        <p className="font-mono font-bold text-xs sm:text-[13px] tracking-[0.24em] text-foreground uppercase mt-2.5">
          {currentTrack.artist}
        </p>

        {/* Album Name */}
        <p className="font-mono text-[10px] sm:text-[11px] tracking-[0.26em] text-[#8C8880] uppercase mt-0.5">
          {currentTrack.album}
        </p>
      </div>

      {/* Bottom Controls Area: Waveform + Control Buttons */}
      <div className="flex flex-col gap-2.5 pt-2">
        {/* Waveform Scrubber */}
        <Waveform
          progress={progress}
          onSeek={onSeek}
          trackId={currentTrack.id}
          disabled={!hasAudioSource}
        />

        {/* Playback Controls Row */}
        <div className="flex items-center gap-4 sm:gap-6 pt-0.5">
          {/* Shuffle Button */}
          <button
            type="button"
            onClick={onToggleShuffle}
            title={isShuffle ? "Disable Shuffle" : "Enable Shuffle"}
            aria-label="Toggle shuffle"
            className={cn(
              "p-1.5 transition-colors text-[#8C8880] hover:text-foreground cursor-pointer",
              isShuffle && "text-accent"
            )}
          >
            <Shuffle className="w-4 h-4" />
          </button>

          {/* Previous Track Button */}
          <button
            type="button"
            onClick={onPrev}
            title="Previous Track"
            aria-label="Previous track"
            className="p-1.5 transition-colors text-foreground hover:text-accent active:scale-95 cursor-pointer"
          >
            <SkipBack className="w-4 h-4 fill-current stroke-none" />
          </button>

          {/* Main Large Play/Pause Button */}
          <button
            type="button"
            onClick={onPlayPause}
            title={
              isLoading
                ? "Buffering..."
                : isPlaying
                ? "Pause"
                : !hasAudioSource
                ? "Audio unavailable"
                : "Play"
            }
            aria-label={isPlaying ? "Pause track" : "Play track"}
            className={cn(
              "relative w-12 h-12 rounded-full flex items-center justify-center transition-all active:scale-95 cursor-pointer",
              "border-2 border-accent bg-transparent hover:bg-accent/10 text-foreground"
            )}
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin text-accent" />
            ) : isPlaying ? (
              <Pause className="w-5 h-5 fill-current stroke-none" />
            ) : (
              <Play className="w-5 h-5 fill-current stroke-none ml-0.5" />
            )}
          </button>

          {/* Next Track Button */}
          <button
            type="button"
            onClick={onNext}
            title="Next Track"
            aria-label="Next track"
            className="p-1.5 transition-colors text-foreground hover:text-accent active:scale-95 cursor-pointer"
          >
            <SkipForward className="w-4 h-4 fill-current stroke-none" />
          </button>

          {/* Repeat Button */}
          <button
            type="button"
            onClick={onToggleRepeat}
            title={isRepeat ? "Disable Repeat" : "Enable Repeat"}
            aria-label="Toggle repeat"
            className={cn(
              "p-1.5 transition-colors text-[#8C8880] hover:text-foreground cursor-pointer",
              isRepeat && "text-accent"
            )}
          >
            <Repeat className="w-4 h-4" />
          </button>

          {/* Volume Control Cluster */}
          <div className="flex items-center gap-2.5 pl-2 sm:pl-4">
            <button
              type="button"
              onClick={() => onVolumeChange(volume > 0 ? 0 : 75)}
              title={volume === 0 ? "Unmute" : "Mute"}
              aria-label="Toggle mute"
              className="text-foreground/80 hover:text-foreground transition-colors p-1 cursor-pointer"
            >
              {volume === 0 ? (
                <VolumeX className="w-4 h-4 text-muted" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>

            {/* Sleek Horizontal Volume Slider */}
            <div className="relative w-18 sm:w-24 h-4 flex items-center">
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={(e) => onVolumeChange(Number(e.target.value))}
                aria-label="Volume slider"
                className="volume-slider w-full h-[2px] bg-[#DDD8CC] dark:bg-[#33332E] rounded-full appearance-none cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
