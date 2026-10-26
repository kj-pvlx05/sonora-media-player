"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  ListOrdered,
  Network,
  ArrowRight,
  ArrowLeft,
  ArrowLeftRight,
  ArrowDown,
  ArrowUp,
  Clock,
  Plus,
  MinusCircle,
  Eye,
  Trash2,
  Cloud,
  RefreshCw,
  ChevronDown,
  Box,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Track, QueueItem } from "@/types/track";
import { sonoraApi, DsaVisualizerState } from "@/lib/api-client";
import { SAMPLE_TRACKS } from "@/lib/mock-data";
import { AlbumArtwork } from "@/components/player/album-artwork";

interface DsaVisualizerProps {
  onReturnToPlayer: () => void;
  onPlayTrack?: (track: Track) => void;
  onQueueModified?: () => void;
  currentTrack?: Track;
  initialTab?: "queue" | "linkedlist";
}

interface OperationResult {
  operation: string;
  message: string;
  timestamp: string;
  status: "success" | "empty" | "error" | "info";
}

interface HistoryItem {
  id: string;
  operation: string;
  trackTitle?: string;
  artist?: string;
  artworkUrl?: string | null;
  track?: Track;
  timestamp: string;
  detail: string;
}

export function DsaVisualizer({
  onReturnToPlayer,
  onPlayTrack,
  onQueueModified,
  currentTrack: activePlayerTrack,
  initialTab = "queue",
}: DsaVisualizerProps) {
  // Structure selector tab: "queue" | "linkedlist"
  const [activeTab, setActiveTab] = useState<"queue" | "linkedlist">(initialTab);
  const [prevInitialTab, setPrevInitialTab] = useState(initialTab);
  if (initialTab !== prevInitialTab) {
    setPrevInitialTab(initialTab);
    setActiveTab(initialTab);
  }

  // Live DSA state synchronized with Spring Boot backend
  const [dsaState, setDsaState] = useState<DsaVisualizerState | null>(null);
  const [isBackendLive, setIsBackendLive] = useState<boolean>(true);
  const [isFetching, setIsFetching] = useState<boolean>(false);

  // Selected track for Enqueue dropdown
  const [selectedCatalogId, setSelectedCatalogId] = useState<string>("trk-01");

  // History collapse toggle
  const [isHistoryExpanded, setIsHistoryExpanded] = useState<boolean>(true);

  // Operation Results for Queue and Linked List
  const [queueResult, setQueueResult] = useState<OperationResult>({
    operation: "READY",
    message: 'Select a track and click "+ Enqueue" or inspect front with Peek/Dequeue.',
    timestamp: "10:24:31 AM",
    status: "info",
  });

  const [listResult, setListResult] = useState<OperationResult>({
    operation: "READY",
    message: 'Traverse playlist nodes in O(1) time using "Previous" and "Next".',
    timestamp: "10:24:15 AM",
    status: "info",
  });

  // Dedicated operation histories
  const [queueHistory, setQueueHistory] = useState<HistoryItem[]>([
    {
      id: "q-seed-1",
      operation: "Enqueue",
      trackTitle: "Blush",
      artist: "JVKE",
      track: SAMPLE_TRACKS[2],
      timestamp: "10:24:31 AM",
      detail: "Added to rear",
    },
    {
      id: "q-seed-2",
      operation: "Enqueue",
      trackTitle: "Aurora",
      artist: "C418",
      track: SAMPLE_TRACKS[1],
      timestamp: "10:23:12 AM",
      detail: "Added to rear",
    },
    {
      id: "q-seed-3",
      operation: "Enqueue",
      trackTitle: "Night Drive",
      artist: "The Midnight",
      track: SAMPLE_TRACKS[0],
      timestamp: "10:22:08 AM",
      detail: "Added to rear",
    },
    {
      id: "q-seed-4",
      operation: "Peek",
      trackTitle: "Night Drive",
      artist: "The Midnight",
      track: SAMPLE_TRACKS[0],
      timestamp: "10:21:55 AM",
      detail: "Front track",
    },
    {
      id: "q-seed-5",
      operation: "Dequeue",
      trackTitle: "Starboy",
      artist: "The Weeknd",
      track: SAMPLE_TRACKS[5],
      timestamp: "10:20:11 AM",
      detail: "Removed from front",
    },
  ]);

  const [listHistory, setListHistory] = useState<HistoryItem[]>([
    {
      id: "ll-seed-1",
      operation: "Next",
      trackTitle: "Aurora",
      artist: "C418",
      track: SAMPLE_TRACKS[1],
      timestamp: "10:24:15 AM",
      detail: 'Moved to "Aurora"',
    },
    {
      id: "ll-seed-2",
      operation: "Next",
      trackTitle: "Blush",
      artist: "JVKE",
      track: SAMPLE_TRACKS[2],
      timestamp: "10:24:08 AM",
      detail: 'Moved to "Blush"',
    },
    {
      id: "ll-seed-3",
      operation: "Previous",
      trackTitle: "Aurora",
      artist: "C418",
      track: SAMPLE_TRACKS[1],
      timestamp: "10:23:52 AM",
      detail: 'Moved to "Aurora"',
    },
    {
      id: "ll-seed-4",
      operation: "Next",
      trackTitle: "Starboy",
      artist: "The Weeknd",
      track: SAMPLE_TRACKS[5],
      timestamp: "10:22:41 AM",
      detail: 'Moved to "Starboy"',
    },
  ]);

  // Helper to format live timestamps
  const getCurrentTime = () => {
    return new Date().toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  };

  // Synchronize state with Spring Boot backend
  const fetchState = useCallback(async () => {
    setIsFetching(true);
    try {
      const state = await sonoraApi.getDsaState();
      if (state) {
        setDsaState(state);
        setIsBackendLive(true);
      } else {
        setIsBackendLive(false);
      }
    } catch {
      setIsBackendLive(false);
    } finally {
      setIsFetching(false);
    }
  }, []);

  // Poll state on mount and recurring
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchState();
    }, 0);
    const interval = setInterval(fetchState, 3500);
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [fetchState]);

  // Track catalog lookup
  const selectedTrack = useMemo(() => {
    return (
      SAMPLE_TRACKS.find((t) => t.id === selectedCatalogId) || SAMPLE_TRACKS[0]
    );
  }, [selectedCatalogId]);

  // Queue items from authoritative state or catalog fallback
  const queueItems: QueueItem[] = useMemo(() => {
    return dsaState?.queueItems || [];
  }, [dsaState]);

  // Playlist items from authoritative Doubly Linked List state
  const playlistItems: Track[] = useMemo(() => {
    if (dsaState?.playlistItems && dsaState.playlistItems.length > 0) {
      return dsaState.playlistItems;
    }
    return SAMPLE_TRACKS;
  }, [dsaState]);

  // Active cursor track
  const currentCursorTrack: Track = useMemo(() => {
    if (dsaState?.currentTrack) {
      return dsaState.currentTrack;
    }
    return activePlayerTrack || playlistItems[0];
  }, [dsaState, activePlayerTrack, playlistItems]);

  // Linked list cursor positional metrics
  const cursorIndex = useMemo(() => {
    const idx = playlistItems.findIndex((t) => t.id === currentCursorTrack.id);
    return idx >= 0 ? idx : 0;
  }, [playlistItems, currentCursorTrack]);

  const prevNode = cursorIndex > 0 ? playlistItems[cursorIndex - 1] : null;
  const nextNode =
    cursorIndex < playlistItems.length - 1 ? playlistItems[cursorIndex + 1] : null;

  // Auto-scroll the active cursor node into view within the horizontal linked list container
  const activeNodeRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (activeTab === "linkedlist" && activeNodeRef.current) {
      activeNodeRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }, [currentCursorTrack.id, activeTab]);

  // ==========================================
  // PLAYBACK QUEUE (FIFO) HANDLERS
  // ==========================================

  const handleEnqueue = async () => {
    if (!selectedCatalogId) return;
    const track = selectedTrack;
    const timeStr = getCurrentTime();

    try {
      const res = await sonoraApi.enqueue(selectedCatalogId);
      if (res) {
        setQueueResult({
          operation: "Enqueue",
          message: `Added "${track.title}" to the rear of the queue.`,
          timestamp: timeStr,
          status: "success",
        });

        setQueueHistory((prev) => [
          {
            id: `q-${Date.now()}`,
            operation: "Enqueue",
            trackTitle: track.title,
            artist: track.artist,
            track,
            timestamp: timeStr,
            detail: "Added to rear",
          },
          ...prev,
        ]);

        await fetchState();
        onQueueModified?.();
      }
    } catch {
      setQueueResult({
        operation: "Enqueue",
        message: `Failed to enqueue "${track.title}". Backend unreachable.`,
        timestamp: timeStr,
        status: "error",
      });
    }
  };

  const handleDequeue = async () => {
    const timeStr = getCurrentTime();
    try {
      const dequeued = await sonoraApi.dequeue();
      if (dequeued) {
        setQueueResult({
          operation: "Dequeue",
          message: `Removed "${dequeued.track.title}" from the front of the queue.`,
          timestamp: timeStr,
          status: "success",
        });

        setQueueHistory((prev) => [
          {
            id: `q-${Date.now()}`,
            operation: "Dequeue",
            trackTitle: dequeued.track.title,
            artist: dequeued.track.artist,
            track: dequeued.track,
            timestamp: timeStr,
            detail: "Removed from front",
          },
          ...prev,
        ]);

        await fetchState();
        onQueueModified?.();
      } else {
        setQueueResult({
          operation: "Dequeue",
          message: "The queue is empty. No tracks to remove.",
          timestamp: timeStr,
          status: "empty",
        });
      }
    } catch {
      setQueueResult({
        operation: "Dequeue",
        message: "Failed to dequeue track. Backend unreachable.",
        timestamp: timeStr,
        status: "error",
      });
    }
  };

  const handlePeek = async () => {
    const timeStr = getCurrentTime();
    try {
      const front = await sonoraApi.peek();
      if (front) {
        setQueueResult({
          operation: "Peek",
          message: `The front track is "${front.track.title}". The queue was not changed.`,
          timestamp: timeStr,
          status: "success",
        });

        setQueueHistory((prev) => [
          {
            id: `q-${Date.now()}`,
            operation: "Peek",
            trackTitle: front.track.title,
            artist: front.track.artist,
            track: front.track,
            timestamp: timeStr,
            detail: "Front track",
          },
          ...prev,
        ]);
      } else {
        setQueueResult({
          operation: "Peek",
          message: "The queue is empty. Front pointer is null.",
          timestamp: timeStr,
          status: "empty",
        });
      }
    } catch {
      setQueueResult({
        operation: "Peek",
        message: "Failed to peek queue. Backend unreachable.",
        timestamp: timeStr,
        status: "error",
      });
    }
  };

  const handleClearQueue = async () => {
    const timeStr = getCurrentTime();
    try {
      const cleared = await sonoraApi.clearQueue();
      if (cleared) {
        setQueueResult({
          operation: "Clear Queue",
          message: "The queue was cleared.",
          timestamp: timeStr,
          status: "success",
        });

        setQueueHistory((prev) => [
          {
            id: `q-${Date.now()}`,
            operation: "Clear Queue",
            trackTitle: "—",
            timestamp: timeStr,
            detail: "Queue cleared",
          },
          ...prev,
        ]);

        await fetchState();
        onQueueModified?.();
      }
    } catch {
      setQueueResult({
        operation: "Clear Queue",
        message: "Failed to clear queue. Backend unreachable.",
        timestamp: timeStr,
        status: "error",
      });
    }
  };

  // ==========================================
  // DOUBLY LINKED LIST TRAVERSAL HANDLERS
  // ==========================================

  const handlePrevTrack = async () => {
    const timeStr = getCurrentTime();
    // Non-circular traversal to respect linear doubly linked list bounds
    const prev = await sonoraApi.prevPlaylistTrack(false);
    if (prev) {
      setListResult({
        operation: "Previous",
        message: `Moved to previous node: "${prev.title}".`,
        timestamp: timeStr,
        status: "success",
      });

      setListHistory((prevHist) => [
        {
          id: `ll-${Date.now()}`,
          operation: "Previous",
          trackTitle: prev.title,
          artist: prev.artist,
          track: prev,
          timestamp: timeStr,
          detail: `Moved to "${prev.title}"`,
        },
        ...prevHist,
      ]);

      if (onPlayTrack) onPlayTrack(prev);
      await fetchState();
    } else {
      setListResult({
        operation: "Previous",
        message: 'Already at HEAD of playlist. Previous pointer is NULL.',
        timestamp: timeStr,
        status: "empty",
      });
    }
  };

  const handleNextTrack = async () => {
    const timeStr = getCurrentTime();
    // Non-circular traversal to respect linear doubly linked list bounds
    const next = await sonoraApi.nextPlaylistTrack(false);
    if (next) {
      setListResult({
        operation: "Next",
        message: `Moved to next node: "${next.title}".`,
        timestamp: timeStr,
        status: "success",
      });

      setListHistory((prevHist) => [
        {
          id: `ll-${Date.now()}`,
          operation: "Next",
          trackTitle: next.title,
          artist: next.artist,
          track: next,
          timestamp: timeStr,
          detail: `Moved to "${next.title}"`,
        },
        ...prevHist,
      ]);

      if (onPlayTrack) onPlayTrack(next);
      await fetchState();
    } else {
      setListResult({
        operation: "Next",
        message: 'Already at TAIL of playlist. Next pointer is NULL.',
        timestamp: timeStr,
        status: "empty",
      });
    }
  };

  const handleSelectTrack = async (track: Track) => {
    const timeStr = getCurrentTime();
    const success = await sonoraApi.selectPlaylistTrack(track.id);
    if (success) {
      setListResult({
        operation: "Select Node",
        message: `Selected node: "${track.title}".`,
        timestamp: timeStr,
        status: "success",
      });

      setListHistory((prevHist) => [
        {
          id: `ll-${Date.now()}`,
          operation: "Select Node",
          trackTitle: track.title,
          artist: track.artist,
          track,
          timestamp: timeStr,
          detail: `Jumped to "${track.title}"`,
        },
        ...prevHist,
      ]);

      if (onPlayTrack) onPlayTrack(track);
      await fetchState();
    }
  };

  return (
    <div className="w-full h-full flex flex-col justify-between overflow-hidden gap-2.5 sm:gap-3 py-1 select-none font-sans">
      {/* 1. Header Row matching reference */}
      <div className="flex items-center justify-between shrink-0 pt-0.5">
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 text-accent text-[11px] font-mono font-bold uppercase tracking-wider">
            <span className="w-1 h-3 rounded-full bg-accent inline-block" />
            <span>DSA VISUALIZER</span>
          </div>
          <h1 className="text-2xl lg:text-[28px] font-black text-foreground tracking-tight leading-tight mt-0.5">
            DSA VISUALIZER
          </h1>
          <p className="text-xs text-muted font-sans mt-0.5">
            See how SONORA organises and plays your music.
          </p>
        </div>

        {/* Center: Live Backend Connection Status */}
        <div className="flex items-center gap-3">
          {isBackendLive ? (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface border border-border shadow-2xs text-xs font-mono text-foreground">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Connected to Java Backend</span>
              <Cloud className="w-3.5 h-3.5 text-muted ml-0.5" />
            </div>
          ) : (
            <button
              type="button"
              onClick={fetchState}
              disabled={isFetching}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-xs font-mono text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 transition-colors"
            >
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>Backend Offline — Retry</span>
              <RefreshCw
                className={cn("w-3 h-3 ml-0.5", isFetching && "animate-spin")}
              />
            </button>
          )}

          {/* Return to player button */}
          <button
            type="button"
            onClick={onReturnToPlayer}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface border border-border shadow-2xs text-xs font-mono text-muted hover:text-foreground hover:bg-surface-sunken transition-colors cursor-pointer"
            title="Return to Music Player"
          >
            <span>← Return to Player</span>
          </button>

          {/* Right: Quotation from reference */}
          <div className="hidden xl:flex flex-col text-right font-serif italic text-xs text-muted/80 leading-tight">
            <span>“ Same music.</span>
            <span>Different perspective. ”</span>
          </div>
        </div>
      </div>

      {/* 2. Structure Selector Tabs */}
      <div className="flex items-center gap-2.5 shrink-0">
        <button
          type="button"
          onClick={() => setActiveTab("queue")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-[13px] font-semibold transition-all shadow-xs",
            activeTab === "queue"
              ? "bg-accent text-white shadow-xs"
              : "bg-surface border border-border text-foreground hover:bg-surface-sunken"
          )}
        >
          <ListOrdered className="w-4 h-4" />
          <span>Playback Queue</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("linkedlist")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-[13px] font-semibold transition-all shadow-xs",
            activeTab === "linkedlist"
              ? "bg-accent text-white shadow-xs"
              : "bg-surface border border-border text-foreground hover:bg-surface-sunken"
          )}
        >
          <Network className="w-4 h-4" />
          <span>Doubly Linked List</span>
        </button>
      </div>

      {/* 3. Main Interactive Workspace (Two-Column Composition) */}
      <div className="flex-1 min-h-0 flex flex-col md:flex-row gap-3 xl:gap-4 overflow-hidden">
        {/* VIEW A: PLAYBACK QUEUE */}
        {activeTab === "queue" && (
          <>
            {/* Left Column: Playback Queue Main Panel */}
            <div className="flex-1 min-w-0 bg-surface border border-border rounded-2xl p-4 sm:p-5 flex flex-col justify-between gap-3 shadow-xs overflow-hidden">
              {/* Header Row */}
              <div className="flex items-start justify-between gap-3 shrink-0">
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5 text-foreground font-mono font-bold text-sm tracking-wide">
                    <span className="w-1 h-3.5 rounded-full bg-accent inline-block" />
                    <span>PLAYBACK QUEUE</span>
                  </div>
                  <p className="text-xs text-muted mt-1 leading-relaxed">
                    Tracks are added at the rear and removed from the front, following First
                    In, First Out (FIFO).
                  </p>
                </div>

                {/* Queue Size Pill */}
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-alt border border-border shrink-0 shadow-2xs font-mono">
                  <Box className="w-3.5 h-3.5 text-muted" />
                  <span className="text-[11px] text-muted">Queue Size</span>
                  <span className="text-base font-bold text-accent">
                    {queueItems.length}
                  </span>
                </div>
              </div>

              {/* Add Track Controls */}
              <div className="flex flex-col gap-1.5 shrink-0 pt-1">
                <label
                  htmlFor="enqueue-select"
                  className="text-xs font-semibold text-foreground"
                >
                  Add a track to queue
                </label>
                <div className="flex items-center gap-2 max-w-lg">
                  <select
                    id="enqueue-select"
                    value={selectedCatalogId}
                    onChange={(e) => setSelectedCatalogId(e.target.value)}
                    className="flex-1 px-3 py-2 text-xs font-sans bg-surface-alt border border-border rounded-xl text-foreground focus:outline-none focus:ring-1 focus:ring-accent shadow-2xs"
                  >
                    {SAMPLE_TRACKS.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.title} - {t.artist}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={handleEnqueue}
                    className="px-4 py-2 rounded-xl bg-accent hover:bg-accent/90 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs shrink-0 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Enqueue</span>
                  </button>
                </div>
              </div>

              {/* Horizontal Queue Node Chain Visualization */}
              <div className="w-full bg-surface-alt/40 border border-border-subtle rounded-2xl p-4 flex items-center min-h-[145px] overflow-x-auto shrink-0 shadow-2xs">
                {queueItems.length === 0 ? (
                  <div className="w-full flex flex-col items-center justify-center py-6 text-center text-muted font-mono text-xs">
                    <p className="font-bold text-foreground">QUEUE IS EMPTY</p>
                    <p className="text-[11px] text-muted mt-0.5">
                      Select a track from the dropdown above and click &ldquo;+ Enqueue&rdquo; to add it to the rear.
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center gap-2.5 py-1">
                    {queueItems.map((item, idx) => {
                      const isFirst = idx === 0;
                      const isLast = idx === queueItems.length - 1;

                      return (
                        <div key={item.queueId} className="flex items-center gap-2.5 shrink-0">
                          {/* Node with Pointer Tag */}
                          <div className="flex flex-col items-center">
                            {/* Pointer Label above node */}
                            <div className="h-6 flex flex-col items-center justify-end">
                              {queueItems.length === 1 ? (
                                <div className="flex flex-col items-center leading-none text-accent">
                                  <span className="text-[10px] font-mono font-bold tracking-wider uppercase">
                                    FRONT &amp; REAR
                                  </span>
                                  <ArrowDown className="w-3 h-3 stroke-[2.5]" />
                                </div>
                              ) : isFirst ? (
                                <div className="flex flex-col items-center leading-none text-accent">
                                  <span className="text-[10px] font-mono font-bold tracking-wider uppercase">
                                    FRONT
                                  </span>
                                  <ArrowDown className="w-3 h-3 stroke-[2.5]" />
                                </div>
                              ) : isLast ? (
                                <div className="flex flex-col items-center leading-none text-accent">
                                  <span className="text-[10px] font-mono font-bold tracking-wider uppercase">
                                    REAR
                                  </span>
                                  <ArrowDown className="w-3 h-3 stroke-[2.5]" />
                                </div>
                              ) : null}
                            </div>

                            {/* Node Card */}
                            <div className="w-40 sm:w-44 p-2.5 rounded-xl border border-border bg-surface shadow-2xs flex items-center gap-2.5 transition-transform hover:-translate-y-0.5">
                              <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-border/60">
                                <AlbumArtwork
                                  track={item.track}
                                  size="sm"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="text-xs font-bold text-foreground truncate">
                                  {item.track.title}
                                </div>
                                <div className="text-[10.5px] text-muted truncate">
                                  {item.track.artist}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Connecting Arrow */}
                          <ArrowRight className="w-4 h-4 text-muted/60 shrink-0 self-center mt-6" />
                        </div>
                      );
                    })}

                    {/* NULL Termination Node */}
                    <div className="flex flex-col items-center self-center mt-6">
                      <div className="px-3.5 py-3 rounded-xl border border-dashed border-border bg-surface-alt/70 text-muted font-mono text-xs font-bold">
                        NULL
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Queue Action Buttons */}
              <div className="flex items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={handleDequeue}
                  disabled={queueItems.length === 0}
                  className="flex-1 py-2.5 px-3 rounded-xl border border-border bg-surface-alt hover:bg-surface-sunken text-foreground text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-2xs disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <MinusCircle className="w-4 h-4 text-accent" />
                  <span>Dequeue</span>
                </button>

                <button
                  type="button"
                  onClick={handlePeek}
                  disabled={queueItems.length === 0}
                  className="flex-1 py-2.5 px-3 rounded-xl border border-border bg-surface-alt hover:bg-surface-sunken text-foreground text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-2xs disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <Eye className="w-4 h-4 text-accent" />
                  <span>Peek Front</span>
                </button>

                <button
                  type="button"
                  onClick={handleClearQueue}
                  disabled={queueItems.length === 0}
                  className="flex-1 py-2.5 px-3 rounded-xl border border-border bg-surface-alt hover:bg-red-500/10 hover:border-red-500/30 text-foreground hover:text-red-600 text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-2xs disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                  <span>Clear Queue</span>
                </button>
              </div>

              {/* Operation Result Banner */}
              <div className="p-3.5 rounded-xl bg-accent/10 border-l-4 border-accent flex items-center justify-between text-xs shrink-0">
                <div className="flex flex-col">
                  <span className="font-bold font-mono text-[11px] uppercase tracking-wider text-accent">
                    Operation Result
                  </span>
                  <span className="text-foreground font-medium mt-0.5">
                    {queueResult.message}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-muted shrink-0 ml-3">
                  {queueResult.timestamp}
                </span>
              </div>

              {/* Complexity Explanations */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-border-subtle shrink-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-foreground">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                      <span>ENQUEUE</span>
                    </div>
                    <span className="text-[11px] text-muted mt-0.5 leading-snug">
                      Adds a track at the rear of the queue.
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-surface-alt text-[10.5px] font-mono font-bold text-muted border border-border-subtle shrink-0">
                    O(1)
                  </span>
                </div>

                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-foreground">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                      <span>DEQUEUE</span>
                    </div>
                    <span className="text-[11px] text-muted mt-0.5 leading-snug">
                      Removes the track from the front of the queue.
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-surface-alt text-[10.5px] font-mono font-bold text-muted border border-border-subtle shrink-0">
                    O(1)
                  </span>
                </div>

                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-foreground">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                      <span>PEEK</span>
                    </div>
                    <span className="text-[11px] text-muted mt-0.5 leading-snug">
                      Returns the front track without removing it.
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-surface-alt text-[10.5px] font-mono font-bold text-muted border border-border-subtle shrink-0">
                    O(1)
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column: Operation History Panel */}
            <div className="w-full md:w-[280px] lg:w-[310px] xl:w-[330px] shrink-0 bg-surface border border-border rounded-2xl p-4 sm:p-5 flex flex-col gap-3 shadow-xs overflow-hidden">
              <div className="flex items-center justify-between border-b border-border-subtle pb-2.5 shrink-0">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-foreground">
                  <Clock className="w-4 h-4 text-accent" />
                  <span>Operation History</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsHistoryExpanded(!isHistoryExpanded)}
                  className="p-1 text-muted hover:text-foreground transition-colors cursor-pointer"
                  title={isHistoryExpanded ? "Collapse History" : "Expand History"}
                >
                  <ChevronDown
                    className={cn(
                      "w-4 h-4 transition-transform duration-200",
                      !isHistoryExpanded && "-rotate-90"
                    )}
                  />
                </button>
              </div>

              {/* Vertical Timeline List */}
              {isHistoryExpanded && (
                <div className="flex-1 min-h-0 overflow-y-auto pr-1 flex flex-col gap-3">
                  {queueHistory.map((item, idx) => (
                    <div key={item.id} className="relative flex items-start gap-2.5">
                      {/* Timeline connecting line */}
                      {idx < queueHistory.length - 1 && (
                        <div className="absolute left-[7px] top-4 bottom-[-14px] w-[1px] bg-border-subtle" />
                      )}

                      {/* Timeline dot */}
                      <div className="w-3.5 h-3.5 rounded-full bg-accent/20 border border-accent flex items-center justify-center shrink-0 mt-0.5 z-10">
                        <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                      </div>

                      {/* Track thumbnail */}
                      {item.track ? (
                        <div className="w-7 h-7 rounded-md overflow-hidden shrink-0 border border-border/60">
                          <AlbumArtwork
                            track={item.track}
                            size="xs"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-7 h-7 rounded-md bg-surface-alt border border-border/60 flex items-center justify-center text-[10px] font-mono font-bold text-muted shrink-0">
                          —
                        </div>
                      )}

                      {/* Details */}
                      <div className="flex-1 min-w-0 flex items-start justify-between gap-1">
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-bold text-foreground truncate">
                            {item.operation}
                          </span>
                          <span className="text-[11px] text-muted truncate">
                            {item.trackTitle}
                          </span>
                        </div>
                        <div className="flex flex-col items-end text-right shrink-0">
                          <span className="text-[9.5px] font-mono text-muted">
                            {item.timestamp}
                          </span>
                          <span className="text-[10px] text-muted/80">
                            {item.detail}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* VIEW B: DOUBLY LINKED LIST */}
        {activeTab === "linkedlist" && (
          <>
            {/* Left Column: Doubly Linked List Main Panel */}
            <div className="flex-1 min-w-0 bg-surface border border-border rounded-2xl p-4 sm:p-5 flex flex-col justify-between gap-3 shadow-xs overflow-hidden">
              {/* Header Row */}
              <div className="flex items-start justify-between gap-3 shrink-0">
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5 text-foreground font-mono font-bold text-sm tracking-wide">
                    <span className="w-1 h-3.5 rounded-full bg-accent inline-block" />
                    <span>DOUBLY LINKED LIST</span>
                  </div>
                  <p className="text-xs text-muted mt-1 leading-relaxed">
                    Each node links to its previous and next node, allowing traversal in both
                    directions.
                  </p>
                </div>

                {/* Total Nodes Pill */}
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-alt border border-border shrink-0 shadow-2xs font-mono">
                  <Network className="w-3.5 h-3.5 text-muted" />
                  <span className="text-[11px] text-muted">Total Nodes</span>
                  <span className="text-base font-bold text-accent">
                    {playlistItems.length}
                  </span>
                </div>
              </div>

              {/* Horizontal Doubly Linked List Node Chain Diagram */}
              <div className="w-full bg-surface-alt/40 border border-border-subtle rounded-2xl p-4 flex items-center min-h-[165px] overflow-x-auto shrink-0 shadow-2xs">
                <div className="flex items-center gap-2 py-1">
                  {/* Left NULL Node */}
                  <div className="flex flex-col items-center self-center">
                    <div className="px-3.5 py-3 rounded-xl border border-dashed border-border bg-surface-alt/70 text-muted font-mono text-xs font-bold">
                      NULL
                    </div>
                  </div>

                  <ArrowLeftRight className="w-4 h-4 text-muted/60 shrink-0 self-center" />

                  {/* Playlist Nodes */}
                  {playlistItems.map((track, idx) => {
                    const isHead = idx === 0;
                    const isTail = idx === playlistItems.length - 1;
                    const isCurrent = track.id === currentCursorTrack.id;

                    return (
                      <div key={track.id} className="flex items-center gap-2 shrink-0">
                        {/* Node with Pointer Tags */}
                        <div className="flex flex-col items-center">
                          {/* Pointer Label above node: HEAD or TAIL */}
                          <div className="h-6 flex flex-col items-center justify-end">
                            {isHead && (
                              <div className="flex flex-col items-center leading-none text-accent">
                                <span className="text-[10px] font-mono font-bold tracking-wider uppercase">
                                  HEAD
                                </span>
                                <ArrowDown className="w-3 h-3 stroke-[2.5]" />
                              </div>
                            )}
                            {!isHead && isTail && (
                              <div className="flex flex-col items-center leading-none text-accent">
                                <span className="text-[10px] font-mono font-bold tracking-wider uppercase">
                                  TAIL
                                </span>
                                <ArrowDown className="w-3 h-3 stroke-[2.5]" />
                              </div>
                            )}
                          </div>

                          {/* Node Card */}
                          <div
                            ref={isCurrent ? activeNodeRef : undefined}
                            role="button"
                            tabIndex={0}
                            onClick={() => handleSelectTrack(track)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                handleSelectTrack(track);
                              }
                            }}
                            className={cn(
                              "w-36 sm:w-40 p-2.5 rounded-xl border transition-all flex items-center gap-2.5 shadow-2xs cursor-pointer select-none",
                              isCurrent
                                ? "border-2 border-accent bg-accent/10 ring-2 ring-accent/20 -translate-y-0.5"
                                : "border-border bg-surface hover:bg-surface-alt"
                            )}
                          >
                            <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-border/60">
                              <AlbumArtwork
                                track={track}
                                size="sm"
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-xs font-bold text-foreground truncate">
                                {track.title}
                              </div>
                              <div className="text-[10.5px] text-muted truncate">
                                {track.artist}
                              </div>
                            </div>
                          </div>

                          {/* Pointer Label below node: CURRENT NODE */}
                          <div className="h-6 flex flex-col items-center justify-start mt-1">
                            {isCurrent && (
                              <div className="flex flex-col items-center leading-none text-accent">
                                <ArrowUp className="w-3 h-3 stroke-[2.5]" />
                                <span className="text-[9.5px] font-mono font-bold tracking-wider uppercase">
                                  CURRENT NODE
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Bidirectional Arrow */}
                        <ArrowLeftRight className="w-4 h-4 text-muted/60 shrink-0 self-center" />
                      </div>
                    );
                  })}

                  {/* Right NULL Node */}
                  <div className="flex flex-col items-center self-center">
                    <div className="px-3.5 py-3 rounded-xl border border-dashed border-border bg-surface-alt/70 text-muted font-mono text-xs font-bold">
                      NULL
                    </div>
                  </div>
                </div>
              </div>

              {/* Traversal Controls */}
              <div className="flex items-center justify-center gap-4 shrink-0">
                <button
                  type="button"
                  onClick={handlePrevTrack}
                  disabled={cursorIndex === 0}
                  className="px-6 py-2.5 rounded-xl border border-border bg-surface-alt hover:bg-surface-sunken text-foreground text-xs sm:text-sm font-semibold flex items-center gap-2 transition-colors shadow-2xs disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4 text-accent" />
                  <span>Previous</span>
                </button>

                <button
                  type="button"
                  onClick={handleNextTrack}
                  disabled={cursorIndex === playlistItems.length - 1}
                  className="px-6 py-2.5 rounded-xl border border-border bg-surface-alt hover:bg-surface-sunken text-foreground text-xs sm:text-sm font-semibold flex items-center gap-2 transition-colors shadow-2xs disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <span>Next</span>
                  <ArrowRight className="w-4 h-4 text-accent" />
                </button>
              </div>

              {/* Operation Result Banner */}
              <div className="p-3.5 rounded-xl bg-accent/10 border-l-4 border-accent flex items-center justify-between text-xs shrink-0">
                <div className="flex flex-col">
                  <span className="font-bold font-mono text-[11px] uppercase tracking-wider text-accent">
                    Operation Result
                  </span>
                  <span className="text-foreground font-medium mt-0.5">
                    {listResult.message}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-muted shrink-0 ml-3">
                  {listResult.timestamp}
                </span>
              </div>

              {/* Complexity Explanations */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-border-subtle shrink-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-foreground">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                      <span>TRAVERSE PREVIOUS</span>
                    </div>
                    <span className="text-[11px] text-muted mt-0.5 leading-snug">
                      Moves the cursor to the previous node.
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-surface-alt text-[10.5px] font-mono font-bold text-muted border border-border-subtle shrink-0">
                    O(1)
                  </span>
                </div>

                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-foreground">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                      <span>TRAVERSE NEXT</span>
                    </div>
                    <span className="text-[11px] text-muted mt-0.5 leading-snug">
                      Moves the cursor to the next node.
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-surface-alt text-[10.5px] font-mono font-bold text-muted border border-border-subtle shrink-0">
                    O(1)
                  </span>
                </div>

                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-foreground">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                      <span>VIEW CURRENT</span>
                    </div>
                    <span className="text-[11px] text-muted mt-0.5 leading-snug">
                      Displays the current node&apos;s data.
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-surface-alt text-[10.5px] font-mono font-bold text-muted border border-border-subtle shrink-0">
                    O(1)
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column: Current Node Panel + Operation History Panel */}
            <div className="w-full md:w-[280px] lg:w-[310px] xl:w-[330px] shrink-0 flex flex-col gap-3 overflow-hidden">
              {/* Top Card: Current Node Panel */}
              <div className="bg-surface border border-border rounded-2xl p-4 shadow-xs flex flex-col gap-3 shrink-0">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-foreground border-b border-border-subtle pb-2">
                  <span className="w-2 h-2 rounded-full bg-accent" />
                  <span>Current Node</span>
                </div>

                {/* Hero preview of active cursor track */}
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl overflow-hidden shadow-xs border border-border shrink-0">
                    <AlbumArtwork
                      track={currentCursorTrack}
                      size="sm"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-sm sm:text-base text-foreground truncate">
                      {currentCursorTrack.title}
                    </h3>
                    <p className="text-xs text-muted truncate mt-0.5">
                      {currentCursorTrack.artist}
                    </p>
                  </div>
                </div>

                {/* Pointer Node Metadata Table */}
                <div className="flex flex-col gap-1.5 pt-2 border-t border-border-subtle font-mono text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-muted">Previous Node :</span>
                    <span className="font-bold text-foreground truncate max-w-[150px]">
                      {prevNode ? prevNode.title : "NULL"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted">Next Node &nbsp;&nbsp;&nbsp;&nbsp;:</span>
                    <span className="font-bold text-foreground truncate max-w-[150px]">
                      {nextNode ? nextNode.title : "NULL"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted">Position &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;:</span>
                    <span className="font-bold text-accent">
                      {cursorIndex + 1} of {playlistItems.length}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom Card: Linked List Operation History */}
              <div className="bg-surface border border-border rounded-2xl p-4 shadow-xs flex-1 min-h-0 flex flex-col gap-2.5 overflow-hidden">
                <div className="flex items-center justify-between border-b border-border-subtle pb-2 shrink-0">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-foreground">
                    <Clock className="w-4 h-4 text-accent" />
                    <span>Operation History</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsHistoryExpanded(!isHistoryExpanded)}
                    className="p-1 text-muted hover:text-foreground transition-colors cursor-pointer"
                    title={isHistoryExpanded ? "Collapse History" : "Expand History"}
                  >
                    <ChevronDown
                      className={cn(
                        "w-4 h-4 transition-transform duration-200",
                        !isHistoryExpanded && "-rotate-90"
                      )}
                    />
                  </button>
                </div>

                {/* Vertical Timeline List */}
                {isHistoryExpanded && (
                  <div className="flex-1 min-h-0 overflow-y-auto pr-1 flex flex-col gap-3">
                    {listHistory.map((item, idx) => (
                      <div key={item.id} className="relative flex items-start gap-2.5">
                        {/* Timeline connecting line */}
                        {idx < listHistory.length - 1 && (
                          <div className="absolute left-[7px] top-4 bottom-[-14px] w-[1px] bg-border-subtle" />
                        )}

                        {/* Timeline dot */}
                        <div className="w-3.5 h-3.5 rounded-full bg-accent/20 border border-accent flex items-center justify-center shrink-0 mt-0.5 z-10">
                          <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                        </div>

                        {/* Track thumbnail */}
                        {item.track ? (
                          <div className="w-7 h-7 rounded-md overflow-hidden shrink-0 border border-border/60">
                            <AlbumArtwork
                              track={item.track}
                              size="xs"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-7 h-7 rounded-md bg-surface-alt border border-border/60 flex items-center justify-center text-[10px] font-mono font-bold text-muted shrink-0">
                            —
                          </div>
                        )}

                        {/* Details */}
                        <div className="flex-1 min-w-0 flex items-start justify-between gap-1">
                          <div className="flex flex-col min-w-0">
                            <span className="text-xs font-bold text-foreground truncate">
                              {item.operation}
                            </span>
                            <span className="text-[11px] text-muted truncate">
                              {item.detail}
                            </span>
                          </div>
                          <span className="text-[9.5px] font-mono text-muted shrink-0">
                            {item.timestamp}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
