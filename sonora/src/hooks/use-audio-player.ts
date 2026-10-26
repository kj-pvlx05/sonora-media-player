"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Track, QueueItem, HistoryEntry, PlaybackStatus } from "@/types/track";
import { INITIAL_QUEUE, INITIAL_RECENTLY_PLAYED } from "@/lib/mock-data";
import { sonoraApi } from "@/lib/api-client";
import { getAssetPath } from "@/lib/utils";

export interface AudioPlayerState {
  currentTrack: Track;
  playbackStatus: PlaybackStatus;
  isPlaying: boolean;
  isLoading: boolean;
  currentTime: number;
  duration: number;
  progress: number; // 0 to 100
  volume: number; // 0 to 1
  isMuted: boolean;
  error: string | null;
  queue: QueueItem[];
  history: HistoryEntry[];
  recentlyPlayed: Track[];
  isShuffle: boolean;
  isRepeat: boolean;
  hasAudioSource: boolean;
  isBackendConnected: boolean;
}

export interface AudioPlayerActions {
  play: () => Promise<void>;
  pause: () => void;
  togglePlayPause: () => void;
  stop: () => void;
  seek: (progressPercent: number) => void;
  setVolume: (volumeZeroToOne: number) => void;
  toggleMute: () => void;
  playTrack: (track: Track) => Promise<void>;
  nextTrack: () => void;
  prevTrack: () => void;
  addToQueue: (track: Track) => Promise<void>;
  removeFromQueue: (queueId: string) => Promise<void>;
  clearQueue: () => Promise<void>;
  moveQueueItem: (fromIndex: number, toIndex: number) => Promise<void>;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  clearError: () => void;
  syncWithBackend: () => Promise<void>;
}

export type UseAudioPlayerReturn = AudioPlayerState & AudioPlayerActions;

export function useAudioPlayer(
  initialTrack: Track,
  onNotify?: (message: string, isError?: boolean) => void
): UseAudioPlayerReturn {
  // Single HTMLAudioElement ref for entire application lifecycle
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Core playback states matching reference snapshot
  const [currentTrack, setCurrentTrack] = useState<Track>(initialTrack);
  const [playbackStatus, setPlaybackStatus] = useState<PlaybackStatus>("playing");
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(163);
  const [duration, setDuration] = useState<number>(initialTrack.durationSec || 252);
  const [volume, setVolumeState] = useState<number>(0.8);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isBackendConnected, setIsBackendConnected] = useState<boolean>(false);

  // Queue and History state
  const [queue, setQueue] = useState<QueueItem[]>(INITIAL_QUEUE);
  const [history, setHistory] = useState<HistoryEntry[]>(() =>
    INITIAL_RECENTLY_PLAYED.map((t, idx) => ({
      id: `hist-${idx}-${t.id}`,
      track: t,
      playedAt: 1761400000000 - (idx + 1) * 60000,
    }))
  );
  const [isShuffle, setIsShuffle] = useState<boolean>(false);
  const [isRepeat, setIsRepeat] = useState<boolean>(false);

  // Guard flags
  const lastRecordedTrackIdRef = useRef<string | null>(null);
  const isAdvancingRef = useRef<boolean>(false);

  // Ref mirrors to prevent stale closures in event listeners
  const queueRef = useRef<QueueItem[]>(queue);
  const currentTrackRef = useRef<Track>(currentTrack);
  const isRepeatRef = useRef<boolean>(isRepeat);

  useEffect(() => {
    queueRef.current = queue;
  }, [queue]);

  useEffect(() => {
    currentTrackRef.current = currentTrack;
  }, [currentTrack]);

  useEffect(() => {
    isRepeatRef.current = isRepeat;
  }, [isRepeat]);

  const notify = useCallback(
    (msg: string, isErr = false) => {
      if (onNotify) onNotify(msg, isErr);
    },
    [onNotify]
  );

  // Synchronize state with authoritative backend
  const syncWithBackend = useCallback(async () => {
    try {
      const isHealthy = await sonoraApi.checkHealth();
      setIsBackendConnected(isHealthy);
      if (isHealthy) {
        const [backendQueue, backendHistory] = await Promise.all([
          sonoraApi.getQueue(),
          sonoraApi.getPlaybackHistory(),
        ]);

        if (backendQueue) {
          setQueue(backendQueue);
        }
        if (backendHistory && backendHistory.length > 0) {
          setHistory(backendHistory);
        }
      }
    } catch {
      setIsBackendConnected(false);
    }
  }, []);

  // Subscribe to connection state and perform initial sync
  useEffect(() => {
    const unsubscribeConn = sonoraApi.onConnectionChange((online) => {
      setIsBackendConnected(online);
    });

    const timer = setTimeout(() => {
      syncWithBackend();
    }, 0);

    return () => {
      clearTimeout(timer);
      unsubscribeConn();
    };
  }, [syncWithBackend]);

  // Track playback implementation
  const playTrack = useCallback(
    async (track: Track) => {
      setCurrentTrack(track);
      lastRecordedTrackIdRef.current = null;
      setCurrentTime(0);
      setDuration(track.durationSec || 0);

      const audio = audioRef.current;
      if (!audio) return;

      if (!track.audioSrc) {
        audio.pause();
        audio.src = "";
        setIsPlaying(false);
        setPlaybackStatus("idle");
        notify(
          `"${track.title}" by ${track.artist} has no audio file. (Library preview only)`,
          true
        );
        return;
      }

      try {
        setError(null);
        audio.src = getAssetPath(track.audioSrc);
        audio.load();
        await audio.play();
        notify(`Playing: ${track.title}`);
      } catch (err: unknown) {
        const errorObj = err as Error;
        if (errorObj.name === "NotAllowedError") {
          notify("Autoplay prevented by browser. Click Play to start.", true);
        } else if (errorObj.name !== "AbortError") {
          notify(`Cannot play track: ${errorObj.message}`, true);
        }
      }
    },
    [notify]
  );

  // Unified Queue Advancement (used by both next button and track end)
  const advanceQueue = useCallback(
    async (isAutomaticEnd = false) => {
      // Guard against rapid duplicate clicks (debounce 300ms)
      if (isAdvancingRef.current) return;
      isAdvancingRef.current = true;

      try {
        // 1. Authoritative Backend Dequeue
        const dequeued = await sonoraApi.dequeue();
        if (dequeued) {
          setIsBackendConnected(true);
          // Sync fresh queue snapshot from backend
          const updatedQueue = await sonoraApi.getQueue();
          if (updatedQueue) {
            setQueue(updatedQueue);
          } else {
            setQueue((prev) => prev.slice(1));
          }

          await playTrack(dequeued.track);
          return;
        }

        // 2. Local Fallback (if backend returned empty or is offline)
        const currentQueue = queueRef.current;
        if (currentQueue.length > 0) {
          const nextItem = currentQueue[0];
          setQueue((prev) => prev.slice(1));
          await playTrack(nextItem.track);
        } else {
          // Queue is completely empty
          if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
          }
          setIsPlaying(false);
          setCurrentTime(0);
          setPlaybackStatus("idle");
          notify(
            isAutomaticEnd
              ? "Queue finished. No more upcoming tracks."
              : "Queue is empty. No more upcoming tracks."
          );
        }
      } finally {
        setTimeout(() => {
          isAdvancingRef.current = false;
        }, 300);
      }
    },
    [playTrack, notify]
  );

  // Initialize HTMLAudioElement once on client mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    const audio = new Audio();
    audio.preload = "metadata";
    audio.volume = 0.8;
    audioRef.current = audio;

    // Load initial track audio source if available
    if (initialTrack.audioSrc) {
      audio.src = getAssetPath(initialTrack.audioSrc);
    }

    // Register audio event listeners
    const handlePlay = () => {
      setIsPlaying(true);
      setIsLoading(false);
      setPlaybackStatus("playing");
      setError(null);

      // Record track in recently played ONLY AFTER playback actually begins
      const activeTrack = currentTrackRef.current;
      if (activeTrack && lastRecordedTrackIdRef.current !== activeTrack.id) {
        lastRecordedTrackIdRef.current = activeTrack.id;

        // Authoritative server timestamp recording
        sonoraApi.recordPlaybackHistory(activeTrack.id).then((entry) => {
          if (entry) {
            setHistory((prev) => [
              entry,
              ...prev.filter((h) => h.track.id !== activeTrack.id).slice(0, 9),
            ]);
            setIsBackendConnected(true);
          } else {
            // Local fallback with deterministic ordering
            setHistory((prev) => [
              {
                id: `hist-${Date.now()}-${activeTrack.id}`,
                track: activeTrack,
                playedAt: Date.now(),
              },
              ...prev.filter((h) => h.track.id !== activeTrack.id).slice(0, 9),
            ]);
          }
        });
      }
    };

    const handlePause = () => {
      setIsPlaying(false);
      setIsLoading(false);
      setPlaybackStatus((prev) => (prev === "error" ? "error" : "paused"));
    };

    const handleWaiting = () => {
      setIsLoading(true);
      setPlaybackStatus("loading");
    };

    const handleCanPlay = () => {
      setIsLoading(false);
    };

    const handleTimeUpdate = () => {
      if (!audioRef.current) return;
      setCurrentTime(audioRef.current.currentTime);
    };

    const handleLoadedMetadata = () => {
      if (!audioRef.current) return;
      const audioDuration = audioRef.current.duration;
      if (!isNaN(audioDuration) && audioDuration > 0) {
        setDuration(audioDuration);
      }
    };

    const handleDurationChange = () => {
      if (!audioRef.current) return;
      const audioDuration = audioRef.current.duration;
      if (!isNaN(audioDuration) && audioDuration > 0) {
        setDuration(audioDuration);
      }
    };

    const handleVolumeChange = () => {
      if (!audioRef.current) return;
      setVolumeState(audioRef.current.volume);
      setIsMuted(audioRef.current.muted);
    };

    const handleError = () => {
      setIsPlaying(false);
      setIsLoading(false);
      setPlaybackStatus("error");
      const errCode = audio.error?.code;
      let errMsg = "Playback error occurred.";
      if (errCode === 1) errMsg = "Audio playback aborted.";
      else if (errCode === 2) errMsg = "Network error loading audio file.";
      else if (errCode === 3) errMsg = "Audio decoding failed.";
      else if (errCode === 4) errMsg = "Audio format not supported or file not found.";

      setError(errMsg);
      notify(errMsg, true);
    };

    // End-of-track transition policy
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);

      // Repeat mode: repeat active track
      if (isRepeatRef.current && audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
        return;
      }

      // Advance queue through authoritative backend
      advanceQueue(true);
    };

    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("waiting", handleWaiting);
    audio.addEventListener("canplay", handleCanPlay);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("durationchange", handleDurationChange);
    audio.addEventListener("volumechange", handleVolumeChange);
    audio.addEventListener("error", handleError);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("waiting", handleWaiting);
      audio.removeEventListener("canplay", handleCanPlay);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("durationchange", handleDurationChange);
      audio.removeEventListener("volumechange", handleVolumeChange);
      audio.removeEventListener("error", handleError);
      audio.removeEventListener("ended", handleEnded);
      audio.pause();
      audio.src = "";
    };
  }, [initialTrack.audioSrc, advanceQueue, notify]);

  // Play action
  const play = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!currentTrack.audioSrc) {
      notify(
        `"${currentTrack.title}" by ${currentTrack.artist} has no audio file. (Library preview only)`,
        true
      );
      return;
    }

    try {
      setError(null);
      await audio.play();
    } catch (err: unknown) {
      const errorObj = err as Error;
      if (errorObj.name !== "AbortError") {
        notify(`Cannot start playback: ${errorObj.message}`, true);
      }
    }
  }, [currentTrack, notify]);

  // Pause action
  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
  }, []);

  // Toggle Play / Pause
  const togglePlayPause = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, pause, play]);

  // Stop action
  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    setCurrentTime(0);
    setPlaybackStatus("idle");
  }, []);

  // Seek action (0 to 100 percent)
  const seek = useCallback(
    (progressPercent: number) => {
      const audio = audioRef.current;
      if (!audio) return;

      const currentDuration = audio.duration || duration;
      if (isNaN(currentDuration) || currentDuration <= 0) {
        notify("Seek unavailable for current track format.", true);
        return;
      }

      const targetTime = Math.max(
        0,
        Math.min(currentDuration, (progressPercent / 100) * currentDuration)
      );
      audio.currentTime = targetTime;
      setCurrentTime(targetTime);
    },
    [duration, notify]
  );

  // Volume action (0.0 to 1.0)
  const setVolume = useCallback((volumeZeroToOne: number) => {
    const clamped = Math.max(0, Math.min(1, volumeZeroToOne));
    setVolumeState(clamped);
    if (audioRef.current) {
      audioRef.current.volume = clamped;
      if (clamped > 0 && audioRef.current.muted) {
        audioRef.current.muted = false;
        setIsMuted(false);
      }
    }
  }, []);

  // Mute toggle
  const toggleMute = useCallback(() => {
    if (audioRef.current) {
      const newMuted = !audioRef.current.muted;
      audioRef.current.muted = newMuted;
      setIsMuted(newMuted);
    }
  }, []);

  // Next Track: dequeue FIFO or stop
  const nextTrack = useCallback(() => {
    advanceQueue(false);
  }, [advanceQueue]);

  // Previous Track: restart if > 3s, else previous history track
  const prevTrack = useCallback(() => {
    const audio = audioRef.current;
    if (audio && audio.currentTime > 3) {
      audio.currentTime = 0;
      setCurrentTime(0);
      notify("Track restarted");
      return;
    }

    if (history.length > 1) {
      const prevHistoryEntry = history[1]; // Index 0 is current
      playTrack(prevHistoryEntry.track);
    } else if (audio) {
      audio.currentTime = 0;
      setCurrentTime(0);
      notify("Track restarted");
    }
  }, [history, playTrack, notify]);

  // Queue manipulation actions (Java backend owns all mutations with reliable rollback)
  const addToQueue = useCallback(
    async (track: Track) => {
      try {
        const enqueuedItem = await sonoraApi.enqueue(track.id);
        if (enqueuedItem) {
          setQueue((prev) => [...prev, enqueuedItem]);
          setIsBackendConnected(true);
          notify(`Added to Up Next: ${track.title}`);
        } else {
          setIsBackendConnected(false);
          notify(
            `Added locally to Up Next: ${track.title} (Backend :8080 offline)`
          );
          const fallbackItem: QueueItem = {
            queueId: `q-local-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            track,
            addedAt: Date.now(),
          };
          setQueue((prev) => [...prev, fallbackItem]);
        }
      } catch {
        setIsBackendConnected(false);
        notify(
          `Added locally to Up Next: ${track.title} (Backend connection failed)`,
          true
        );
      }
    },
    [notify]
  );

  const removeFromQueue = useCallback(
    async (queueId: string) => {
      const previousQueue = queueRef.current;
      setQueue((prev) => prev.filter((item) => item.queueId !== queueId));

      const ok = await sonoraApi.removeFromQueue(queueId);
      if (ok) {
        notify("Track removed from queue");
        setIsBackendConnected(true);
      } else {
        const isHealthy = await sonoraApi.checkHealth();
        if (isHealthy) {
          // Backend was online but removal failed: rollback!
          setQueue(previousQueue);
          notify("Failed to remove track from backend queue. Rolled back.", true);
        } else {
          setIsBackendConnected(false);
          notify("Track removed from local queue (Backend offline)");
        }
      }
    },
    [notify]
  );

  const clearQueue = useCallback(async () => {
    const previousQueue = queueRef.current;
    setQueue([]);

    const ok = await sonoraApi.clearQueue();
    if (ok) {
      notify("Queue cleared");
      setIsBackendConnected(true);
    } else {
      const isHealthy = await sonoraApi.checkHealth();
      if (isHealthy) {
        setQueue(previousQueue);
        notify("Failed to clear backend queue. Rolled back.", true);
      } else {
        setIsBackendConnected(false);
        notify("Local queue cleared (Backend offline)");
      }
    }
  }, [notify]);

  const moveQueueItem = useCallback(
    async (fromIndex: number, toIndex: number) => {
      const previousQueue = queueRef.current;
      setQueue((prev) => {
        if (
          fromIndex < 0 ||
          fromIndex >= prev.length ||
          toIndex < 0 ||
          toIndex >= prev.length
        ) {
          return prev;
        }
        const updated = [...prev];
        const [moved] = updated.splice(fromIndex, 1);
        updated.splice(toIndex, 0, moved);
        return updated;
      });

      const ok = await sonoraApi.reorderQueue(fromIndex, toIndex);
      if (ok) {
        notify("Queue order updated (modified FIFO)");
        setIsBackendConnected(true);
      } else {
        const isHealthy = await sonoraApi.checkHealth();
        if (isHealthy) {
          setQueue(previousQueue);
          notify("Failed to reorder queue on backend. Rolled back.", true);
        } else {
          setIsBackendConnected(false);
          notify("Queue reordered locally (Backend offline)");
        }
      }
    },
    [notify]
  );

  const toggleShuffle = useCallback(() => {
    setIsShuffle((prev) => {
      const next = !prev;
      notify(next ? "Shuffle mode enabled" : "Shuffle mode disabled");
      return next;
    });
  }, [notify]);

  const toggleRepeat = useCallback(() => {
    setIsRepeat((prev) => {
      const next = !prev;
      notify(next ? "Repeat mode enabled" : "Repeat mode disabled");
      return next;
    });
  }, [notify]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Map history to Track[] for backwards compatibility with RecentlyPlayed component
  const recentlyPlayed = history.map((h) => h.track);
  const hasAudioSource = Boolean(currentTrack.audioSrc);
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return {
    currentTrack,
    playbackStatus,
    isPlaying,
    isLoading,
    currentTime,
    duration,
    progress,
    volume,
    isMuted,
    error,
    queue,
    history,
    recentlyPlayed,
    isShuffle,
    isRepeat,
    hasAudioSource,
    isBackendConnected,
    play,
    pause,
    togglePlayPause,
    stop,
    seek,
    setVolume,
    toggleMute,
    playTrack,
    nextTrack,
    prevTrack,
    addToQueue,
    removeFromQueue,
    clearQueue,
    moveQueueItem,
    toggleShuffle,
    toggleRepeat,
    clearError,
    syncWithBackend,
  };
}
