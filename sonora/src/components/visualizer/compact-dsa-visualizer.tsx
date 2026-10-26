"use client";

import { useState, useEffect, useCallback } from "react";
import { ArrowDown, ArrowRight } from "lucide-react";
import { AlbumArtwork } from "@/components/player/album-artwork";
import { sonoraApi, DsaVisualizerState, ApiLogEntry } from "@/lib/api-client";
import { QueueItem, Track } from "@/types/track";
import { SAMPLE_TRACKS } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

interface CompactDsaVisualizerProps {
  currentTrack?: Track;
  queue?: QueueItem[];
  className?: string;
  onOpenFullWorkbench?: () => void;
}

interface LogLine {
  id: string;
  time: string;
  message: string;
}

export function CompactDsaVisualizer({
  queue = [],
  className,
  onOpenFullWorkbench,
}: CompactDsaVisualizerProps) {
  const [activeTab, setActiveTab] = useState<"queue" | "linkedlist">("queue");
  const [dsaState, setDsaState] = useState<DsaVisualizerState | null>(null);
  const [logs, setLogs] = useState<LogLine[]>([
    {
      id: "init-1",
      time: "14:32:01",
      message: 'Enqueue: "Heaven"',
    },
    {
      id: "init-2",
      time: "14:32:01",
      message: "Created new node",
    },
    {
      id: "init-3",
      time: "14:32:01",
      message: "Updated rear pointer",
    },
    {
      id: "init-4",
      time: "14:32:01",
      message: "Queue size: 4",
    },
  ]);

  // Subscribe to API client activity logs and translate to human-readable DSA log messages
  useEffect(() => {
    const unsubscribe = sonoraApi.onLog((apiLog: ApiLogEntry) => {
      let msg = `${apiLog.method} ${apiLog.endpoint}`;
      if (apiLog.endpoint.includes("/enqueue")) {
        msg = `Enqueue node // Updated rear pointer`;
      } else if (apiLog.endpoint.includes("/dequeue")) {
        msg = `Dequeue node // Advanced front pointer`;
      } else if (apiLog.endpoint.includes("/state")) {
        msg = `Synchronized authoritative state`;
      }

      setLogs((prev) => [
        {
          id: apiLog.id,
          time: apiLog.timestamp,
          message: msg,
        },
        ...prev.slice(0, 11),
      ]);
    });
    return unsubscribe;
  }, []);

  // Sync state with Spring Boot backend
  const refreshState = useCallback(async () => {
    try {
      const state = await sonoraApi.getDsaState();
      if (state) {
        setDsaState(state);
      }
    } catch {
      // offline fallback
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      refreshState();
    }, 0);
    const interval = setInterval(refreshState, 4000);
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [refreshState]);

  // Determine items to display in visualization:
  // For Queue: authoritative upcoming tracks from backend queue or props
  const queueDisplayTracks: Track[] = (() => {
    if (dsaState && dsaState.queueItems) {
      return dsaState.queueItems.map((qi) => qi.track).slice(0, 4);
    }
    return queue.map((q) => q.track).slice(0, 4);
  })();

  // For Linked List: actual playlist items from backend or SAMPLE_TRACKS
  const listDisplayTracks: Track[] = (() => {
    if (dsaState && dsaState.playlistItems && dsaState.playlistItems.length > 0) {
      return dsaState.playlistItems.slice(0, 4);
    }
    return SAMPLE_TRACKS.slice(0, 4);
  })();

  const activeTracks = activeTab === "queue" ? queueDisplayTracks : listDisplayTracks;
  const currentSize =
    activeTab === "queue"
      ? (dsaState?.queueSize !== undefined ? dsaState.queueSize : queue.length)
      : (dsaState?.playlistSize !== undefined ? dsaState.playlistSize : (dsaState?.playlistItems?.length ?? SAMPLE_TRACKS.length));

  const handleClearLogs = () => {
    setLogs([]);
  };

  return (
    <div
      className={cn(
        "flex-1 min-h-0 flex flex-col justify-between gap-1.5 p-2.5 sm:p-3 bg-surface border border-border rounded-2xl shadow-xs select-none",
        className
      )}
    >
      {/* 1. Header Bar: DSA VISUALIZER + Toggle Pills */}
      <div className="flex items-center justify-between border-b border-border-subtle pb-1 shrink-0">
        <h3
          onClick={onOpenFullWorkbench}
          className="text-xs sm:text-sm font-mono font-bold tracking-wider text-foreground uppercase cursor-pointer hover:text-accent transition-colors"
          title="Click to open full DSA Workbench"
        >
          DSA VISUALIZER
        </h3>

        {/* QUEUE / LINKED LIST Structure Switcher */}
        <div className="flex items-center gap-1 bg-surface-alt p-0.5 rounded-sm border border-border-subtle">
          <button
            type="button"
            onClick={() => setActiveTab("queue")}
            aria-pressed={activeTab === "queue"}
            className={cn(
              "px-2 py-0.5 rounded-xs text-[9.5px] font-mono font-bold tracking-wider transition-all",
              activeTab === "queue"
                ? "bg-[#161616] text-white dark:bg-white dark:text-[#161616] shadow-2xs"
                : "text-muted hover:text-foreground"
            )}
          >
            QUEUE
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("linkedlist")}
            aria-pressed={activeTab === "linkedlist"}
            className={cn(
              "px-2 py-0.5 rounded-xs text-[9.5px] font-mono font-bold tracking-wider transition-all",
              activeTab === "linkedlist"
                ? "bg-[#161616] text-white dark:bg-white dark:text-[#161616] shadow-2xs"
                : "text-muted hover:text-foreground"
            )}
          >
            LINKED LIST
          </button>
        </div>
      </div>

      {/* 2. Visual Structure Subheading */}
      <div className="flex items-center justify-between text-[10.5px] font-mono shrink-0">
        <span className="font-bold text-foreground">
          {activeTab === "queue" ? "QUEUE (FIFO)" : "DOUBLY LINKED LIST"}
        </span>
        <span className="text-muted">SIZE: {currentSize}</span>
      </div>

      {/* 3. Node Visualizer Flow Diagram or Empty State */}
      {activeTracks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-2.5 px-2 text-center border border-dashed border-border-subtle rounded-lg shrink-0 my-0.5">
          <span className="text-[10px] font-mono font-bold text-foreground">
            {activeTab === "queue" ? "QUEUE IS EMPTY" : "LIST IS EMPTY"}
          </span>
          <span className="text-[8.5px] font-mono text-muted">
            {activeTab === "queue"
              ? "Front & Rear pointers are null (size 0)"
              : "Head & Tail pointers are null (size 0)"}
          </span>
        </div>
      ) : (
        <div className="flex items-start justify-between gap-1 sm:gap-1.5 py-0.5 px-0.5 shrink-0 overflow-x-hidden">
          {activeTracks.map((trk, idx) => {
            const isFirst = idx === 0;
            const isLast = idx === activeTracks.length - 1;

            return (
              <div key={`${trk.id}-${idx}`} className="flex items-center gap-1 sm:gap-1.5 shrink-0">
                {/* Node Card with Pointer Labels */}
                <div className="flex flex-col items-center gap-1 w-12 sm:w-14">
                  {/* Pointer Label: FRONT or REAR */}
                  <div className="h-[18px] flex flex-col items-center justify-end">
                    {activeTab === "queue" && isFirst && (
                      <div className="flex flex-col items-center leading-none text-accent">
                        <span className="text-[7.5px] font-mono font-bold tracking-wider uppercase">
                          FRONT
                        </span>
                        <ArrowDown className="w-2.5 h-2.5 stroke-[2.5] -mt-0.5" />
                      </div>
                    )}

                    {activeTab === "queue" && isLast && (
                      <div className="flex flex-col items-center leading-none text-accent">
                        <span className="text-[7.5px] font-mono font-bold tracking-wider uppercase">
                          REAR
                        </span>
                        <ArrowDown className="w-2.5 h-2.5 stroke-[2.5] -mt-0.5" />
                      </div>
                    )}

                    {activeTab === "linkedlist" && isFirst && (
                      <div className="flex flex-col items-center leading-none text-accent">
                        <span className="text-[7.5px] font-mono font-bold tracking-wider uppercase">
                          HEAD
                        </span>
                        <ArrowDown className="w-2.5 h-2.5 stroke-[2.5] -mt-0.5" />
                      </div>
                    )}

                    {activeTab === "linkedlist" && isLast && (
                      <div className="flex flex-col items-center leading-none text-accent">
                        <span className="text-[7.5px] font-mono font-bold tracking-wider uppercase">
                          TAIL
                        </span>
                        <ArrowDown className="w-2.5 h-2.5 stroke-[2.5] -mt-0.5" />
                      </div>
                    )}
                  </div>

                  {/* Node Box */}
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-lg overflow-hidden border-2 border-[#1C1A17] dark:border-[#383632] shadow-xs shrink-0">
                    <AlbumArtwork
                      track={trk}
                      size="sm"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Track Title */}
                  <span className="text-[9px] font-mono truncate max-w-[56px] text-muted text-center">
                    {trk.title}
                  </span>
                </div>

                {/* Connecting Arrow */}
                {!isLast && (
                  <ArrowRight className="w-3 h-3 text-muted/60 shrink-0 self-center mt-3" />
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* 4. OPERATION LOG Section */}
      <div className="flex-1 min-h-0 flex flex-col gap-1 pt-1.5 border-t border-border-subtle">
        <div className="flex items-center justify-between text-[10px] font-mono font-bold text-muted uppercase tracking-wider shrink-0">
          <span>OPERATION LOG</span>
          <button
            type="button"
            onClick={handleClearLogs}
            className="hover:text-foreground transition-colors"
          >
            CLEAR
          </button>
        </div>

        {/* Log Box with Red Left Border Accent */}
        <div className="border-l-2 border-accent pl-2.5 py-0.5 flex-1 min-h-0 flex flex-col gap-1 font-mono text-[10px] text-foreground/90 overflow-y-auto">
          {logs.length > 0 ? (
            logs.slice(0, 4).map((log) => (
              <div key={log.id} className="flex items-center gap-2">
                <span className="text-muted shrink-0">{log.time}</span>
                <span className="truncate">{log.message}</span>
              </div>
            ))
          ) : (
            <div className="text-muted italic">Log cleared. Ready for next operation.</div>
          )}
        </div>
      </div>
    </div>
  );
}
