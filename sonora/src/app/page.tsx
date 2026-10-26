"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { MainPlayer } from "@/components/player/main-player";
import { MusicLibrary } from "@/components/library/music-library";
import { QueuePanel } from "@/components/queue/queue-panel";
import { RecentlyPlayed } from "@/components/queue/recently-played";
import { DsaVisualizer } from "@/components/visualizer/dsa-visualizer";
import { AboutProject } from "@/components/about/about-project";
import { useAudioPlayer } from "@/hooks/use-audio-player";
import { SAMPLE_TRACKS } from "@/lib/mock-data";
import { NavSection } from "@/types/track";
import { Layers, Clock, Music } from "lucide-react";

export default function SonoraDashboard() {
  const [activeSection, setActiveSection] = useState<NavSection>("home");
  const [dsaTab, setDsaTab] = useState<"queue" | "linkedlist">("queue");
  const [toast, setToast] = useState<{ message: string; isError?: boolean } | null>(
    null
  );
  const searchInputRef = useRef<HTMLInputElement>(null);

  const showToast = useCallback((message: string, isError = false) => {
    setToast({ message, isError });
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(timer);
  }, [toast]);

  // Favorites state persisted locally
  const [favorites, setFavorites] = useState<Set<string>>(() => {
    return new Set(
      SAMPLE_TRACKS.filter((t) => t.isFavorite).map((t) => t.id)
    );
  });

  const handleToggleFavorite = useCallback(
    (trackId: string) => {
      setFavorites((prev) => {
        const next = new Set(prev);
        if (next.has(trackId)) {
          next.delete(trackId);
          showToast("Removed from favourites");
        } else {
          next.add(trackId);
          showToast("Saved to favourites");
        }
        return next;
      });
    },
    [showToast]
  );

  // Centralized Audio Engine Hook
  const {
    currentTrack,
    isPlaying,
    isLoading,
    currentTime,
    duration,
    progress,
    volume,
    error,
    queue,
    recentlyPlayed,
    isShuffle,
    isRepeat,
    hasAudioSource,
    isBackendConnected,
    togglePlayPause,
    stop,
    seek,
    setVolume,
    playTrack,
    nextTrack,
    prevTrack,
    addToQueue,
    removeFromQueue,
    clearQueue,
    moveQueueItem,
    toggleShuffle,
    toggleRepeat,
    syncWithBackend,
  } = useAudioPlayer(SAMPLE_TRACKS[0], showToast);

  const handleFocusSearch = useCallback(() => {
    if (activeSection !== "home") {
      setActiveSection("home");
    }
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 50);
  }, [activeSection]);

  const vinylSubtitle =
    activeSection === "visualizer" || activeSection === "about"
      ? "LEARN · PLAY · EXPLORE"
      : "MEDIA QUEUE SYSTEM";

  return (
    <AppShell
      activeSection={activeSection}
      onSelectSection={setActiveSection}
      queueCount={queue.length}
      toastMessage={toast?.message}
      isToastError={toast?.isError}
      isBackendConnected={isBackendConnected}
      currentTrack={currentTrack}
      isPlaying={isPlaying}
      progress={progress}
      currentTime={currentTime}
      duration={duration}
      vinylSubtitle={vinylSubtitle}
    >
      {/* 1. Primary Vinyl-First Home Dashboard Matching Reference Layout */}
      {activeSection === "home" && (
        <div className="flex-1 min-w-0 h-full flex flex-col gap-2.5 xl:gap-3 justify-between overflow-hidden">
          {/* Top Row: Current Track Player (Left) + Up Next Card (Right) */}
          <div className="flex flex-col md:flex-row gap-3 xl:gap-4 items-stretch justify-between h-[44%] min-h-[275px] shrink-0">
            <MainPlayer
              currentTrack={currentTrack}
              isPlaying={isPlaying}
              isLoading={isLoading}
              currentTime={currentTime}
              duration={duration}
              progress={progress}
              hasAudioSource={hasAudioSource}
              playbackError={error}
              onPlayPause={togglePlayPause}
              onNext={nextTrack}
              onPrev={prevTrack}
              onStop={stop}
              onSeek={seek}
              volume={Math.round(volume * 100)}
              onVolumeChange={(val) => setVolume(val / 100)}
              isFavorite={favorites.has(currentTrack.id)}
              onToggleFavorite={handleToggleFavorite}
              isShuffle={isShuffle}
              onToggleShuffle={toggleShuffle}
              isRepeat={isRepeat}
              onToggleRepeat={toggleRepeat}
              onFocusSearch={handleFocusSearch}
              className="flex-1 min-w-0"
            />

            <div className="w-full md:w-[320px] xl:w-[350px] shrink-0 h-full">
              <QueuePanel
                currentTrack={currentTrack}
                isPlaying={isPlaying}
                queue={queue}
                onPlayFromQueue={playTrack}
                onRemoveFromQueue={removeFromQueue}
                onClearQueue={clearQueue}
                onMoveQueueItem={moveQueueItem}
              />
            </div>
          </div>

          {/* Bottom Row: Your Library Card Across the Bottom */}
          <div className="flex-1 min-h-0 overflow-hidden">
            <MusicLibrary
              tracks={SAMPLE_TRACKS}
              currentTrack={currentTrack}
              isPlaying={isPlaying}
              onPlayTrack={playTrack}
              onAddToQueue={addToQueue}
              favorites={favorites}
              onToggleFavorite={handleToggleFavorite}
              searchRef={searchInputRef}
              className="h-full"
            />
          </div>
        </div>
      )}

      {/* 2. Library View */}
      {activeSection === "library" && (
        <div className="w-full h-full flex flex-col gap-3 overflow-hidden">
          <div className="p-3 bg-surface border border-border rounded-2xl flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <Music className="w-5 h-5 text-accent" />
              <div>
                <h2 className="text-sm font-bold font-mono text-foreground">
                  FULL LIBRARY CATALOG
                </h2>
                <p className="text-[10px] text-muted font-mono">
                  ALL 8 MASTER AUDIO RELEASES // LOSSLESS AUDIO
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setActiveSection("home")}
              className="px-3 py-1.5 text-xs font-mono bg-surface-alt hover:bg-surface-sunken border border-border rounded-md cursor-pointer"
            >
              ← RETURN TO PLAYER
            </button>
          </div>

          <div className="flex-1 min-h-0 overflow-hidden">
            <MusicLibrary
              tracks={SAMPLE_TRACKS}
              currentTrack={currentTrack}
              isPlaying={isPlaying}
              onPlayTrack={playTrack}
              onAddToQueue={addToQueue}
              favorites={favorites}
              onToggleFavorite={handleToggleFavorite}
              searchRef={searchInputRef}
              className="h-full"
            />
          </div>
        </div>
      )}

      {/* 3. Queue Manager View */}
      {activeSection === "queue" && (
        <div className="w-full h-full flex flex-col gap-3 overflow-hidden">
          <div className="p-3.5 bg-surface border border-border rounded-2xl flex flex-col gap-3 shrink-0">
            <div className="flex items-center justify-between border-b border-border-subtle pb-2">
              <div className="flex items-center gap-3">
                <div className="p-1.5 bg-accent/15 text-accent rounded-sm">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold font-mono text-foreground">
                    PLAYBACK QUEUE MANAGER
                  </h2>
                  <p className="text-[10px] text-muted font-mono">
                    FIFO DISPATCH PIPELINE // CAPACITY: UNLIMITED
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveSection("home")}
                className="px-3 py-1.5 text-xs font-mono bg-surface-alt hover:bg-surface-sunken border border-border rounded-md cursor-pointer"
              >
                ← BACK TO DASHBOARD
              </button>
            </div>
          </div>

          <div className="flex-1 min-h-0 overflow-hidden">
            <QueuePanel
              currentTrack={currentTrack}
              isPlaying={isPlaying}
              queue={queue}
              onPlayFromQueue={playTrack}
              onRemoveFromQueue={removeFromQueue}
              onClearQueue={clearQueue}
              onMoveQueueItem={moveQueueItem}
            />
          </div>
        </div>
      )}

      {/* 4. Recently Played Session Log View */}
      {activeSection === "recent" && (
        <div className="w-full h-full flex flex-col gap-3 overflow-hidden">
          <div className="p-3.5 bg-surface border border-border rounded-2xl flex flex-col gap-3 shrink-0">
            <div className="flex items-center justify-between border-b border-border-subtle pb-2">
              <div className="flex items-center gap-3">
                <div className="p-1.5 bg-accent/15 text-accent rounded-sm">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold font-mono text-foreground">
                    SESSION PLAYBACK LOG
                  </h2>
                  <p className="text-[10px] text-muted font-mono">
                    CHRONOLOGICAL AUDIO PLAYBACK AUDIT
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveSection("home")}
                className="px-3 py-1.5 text-xs font-mono bg-surface-alt hover:bg-surface-sunken border border-border rounded-md cursor-pointer"
              >
                ← BACK TO DASHBOARD
              </button>
            </div>
          </div>

          <div className="flex-1 min-h-0 overflow-hidden">
            <RecentlyPlayed
              tracks={recentlyPlayed}
              currentTrack={currentTrack}
              onPlayTrack={playTrack}
              onAddToQueue={addToQueue}
            />
          </div>
        </div>
      )}

      {/* 5. Deep DSA Visualizer Workbench */}
      {activeSection === "visualizer" && (
        <div className="w-full h-full overflow-hidden">
          <DsaVisualizer
            onReturnToPlayer={() => setActiveSection("home")}
            onPlayTrack={playTrack}
            onQueueModified={syncWithBackend}
            currentTrack={currentTrack}
            initialTab={dsaTab}
          />
        </div>
      )}

      {/* 6. About Project Architecture */}
      {activeSection === "about" && (
        <div className="w-full h-full overflow-hidden">
          <AboutProject
            onExploreQueue={() => {
              setDsaTab("queue");
              setActiveSection("visualizer");
            }}
            onExploreLinkedList={() => {
              setDsaTab("linkedlist");
              setActiveSection("visualizer");
            }}
          />
        </div>
      )}
    </AppShell>
  );
}
