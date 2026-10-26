"use client";

import { useState } from "react";
import { GitBranch, ArrowRight, Binary, Layers, X, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface VisualizerEntryProps {
  onOpenVisualizer?: () => void;
  className?: string;
}

export function VisualizerEntry({
  onOpenVisualizer,
  className,
}: VisualizerEntryProps) {
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  const handleClick = () => {
    if (onOpenVisualizer) {
      onOpenVisualizer();
    } else {
      setShowPreviewModal(true);
    }
  };

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        onClick={handleClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleClick();
          }
        }}
        className={cn(
          "group relative flex flex-col gap-3 p-4 bg-gradient-to-br from-surface via-surface to-surface-alt border border-border hover:border-accent/80 rounded-lg shadow-xs hover:shadow-md cursor-pointer transition-all duration-200 select-none overflow-hidden",
          className
        )}
      >
        {/* Subtle Background Circuit Mesh */}
        <div className="absolute -right-4 -bottom-4 w-28 h-28 opacity-[0.06] group-hover:opacity-[0.12] transition-opacity pointer-events-none text-foreground">
          <Binary className="w-full h-full" />
        </div>

        {/* Top Header Row with Linked Node Icon & Status Pill */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-sm bg-accent-muted text-accent border border-accent/20 group-hover:scale-105 transition-transform">
              <GitBranch className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-accent">
                EDUCATIONAL MODULE
              </span>
              <h3 className="text-sm font-mono font-bold text-foreground tracking-tight">
                DSA VISUALIZER
              </h3>
            </div>
          </div>

          {/* Right Arrow Action Indicator */}
          <div className="w-8 h-8 rounded-full bg-surface-alt group-hover:bg-accent group-hover:text-white border border-border text-muted flex items-center justify-center transition-all group-hover:translate-x-0.5">
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-muted leading-relaxed">
          Visualize Queue and Linked List operations in real time.
        </p>

        {/* Micro Structure Badges */}
        <div className="pt-2 border-t border-border-subtle flex items-center justify-between text-[10px] font-mono">
          <div className="flex items-center gap-1.5 text-muted">
            <Layers className="w-3 h-3 text-accent" />
            <span>FIFO // DOUBLY LINKED</span>
          </div>
          <span className="text-accent font-semibold flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            <span>EXPLORE</span>
          </span>
        </div>
      </div>

      {/* Interactive Modal Preview of Future Java Backend Visualizer */}
      {showPreviewModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="visualizer-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150"
          onClick={() => setShowPreviewModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-surface border-2 border-border-strong rounded-lg shadow-lg p-5 sm:p-6 flex flex-col gap-4"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-border-subtle pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-xs bg-accent-muted text-accent border border-accent/30">
                  <GitBranch className="w-4 h-4" />
                </div>
                <div>
                  <h3
                    id="visualizer-modal-title"
                    className="font-mono text-sm font-bold text-foreground"
                  >
                    SONORA // DSA ENGINE PREVIEW
                  </h3>
                  <p className="text-[10px] font-mono text-muted">
                    OBJECT-ORIENTED MEDIA DATA STRUCTURES
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                aria-label="Close dialog"
                className="p-1 rounded-xs hover:bg-surface-alt text-muted hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Visualizer Architecture Overview */}
            <div className="flex flex-col gap-3 text-xs text-muted leading-relaxed font-sans">
              <p>
                In the upcoming development phase, SONORA will connect to a custom{" "}
                <strong className="text-foreground">Java + Spring Boot</strong> backend
                implementing core computer science data structures:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-[11px] pt-1">
                <div className="p-3 rounded-sm bg-surface-alt border border-border-subtle flex flex-col gap-1">
                  <div className="flex items-center justify-between font-bold text-foreground">
                    <span>PlaybackQueue&lt;T&gt;</span>
                    <span className="text-[9px] text-accent">FIFO</span>
                  </div>
                  <p className="text-[10px] text-muted">
                    Bounded circular array &amp; linked queue for sequential audio execution.
                  </p>
                </div>

                <div className="p-3 rounded-sm bg-surface-alt border border-border-subtle flex flex-col gap-1">
                  <div className="flex items-center justify-between font-bold text-foreground">
                    <span>PlaylistList&lt;T&gt;</span>
                    <span className="text-[9px] text-accent">DOUBLY LINKED</span>
                  </div>
                  <p className="text-[10px] text-muted">
                    O(1) insertion, previous/next bidirectional pointer traversal.
                  </p>
                </div>
              </div>

              {/* Graphic Flow Representation */}
              <div className="p-3 bg-surface-sunken/60 border border-border-subtle rounded-sm font-mono text-[10px] text-foreground flex items-center justify-between">
                <span>[HEAD: TRK-01]</span>
                <span className="text-accent">⇄</span>
                <span>[NODE: TRK-02]</span>
                <span className="text-accent">⇄</span>
                <span>[NODE: TRK-06]</span>
                <span className="text-accent">⇄</span>
                <span>[TAIL: TRK-05]</span>
              </div>
            </div>

            {/* Close Button */}
            <div className="pt-2 border-t border-border-subtle flex justify-end">
              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                className="px-4 py-1.5 bg-accent hover:bg-accent-hover text-white font-mono text-xs font-bold rounded-xs transition-colors"
              >
                CLOSE PREVIEW
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
