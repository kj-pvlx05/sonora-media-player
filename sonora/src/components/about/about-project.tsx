"use client";

import { Eye, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface AboutProjectProps {
  onExploreQueue: () => void;
  onExploreLinkedList: () => void;
  className?: string;
}

export function AboutProject({
  onExploreQueue,
  onExploreLinkedList,
  className,
}: AboutProjectProps) {
  return (
    <div
      className={cn(
        "w-full h-full flex flex-col justify-between overflow-y-auto overflow-x-hidden p-1 sm:p-2 font-sans select-none gap-3 xl:gap-4",
        className
      )}
    >
      {/* 1. Header & Project Introduction matching reference */}
      <div className="flex flex-col shrink-0 pt-0.5">
        <div className="flex items-center gap-1.5 text-accent text-[11px] font-mono font-bold uppercase tracking-wider">
          <span className="w-1 h-3 rounded-full bg-accent inline-block" />
          <span>ABOUT PROJECT</span>
        </div>

        <h1 className="text-3xl sm:text-4xl xl:text-5xl font-black text-foreground tracking-tight leading-none mt-1.5">
          SONORA
        </h1>

        <p className="text-sm sm:text-base font-bold text-foreground/90 font-mono tracking-tight mt-1">
          Media Queue Management System
        </p>

        <p className="text-xs sm:text-sm italic font-mono text-muted tracking-tight mt-1">
          &ldquo;A music player that brings data structures to life.&rdquo;
        </p>

        <p className="text-xs sm:text-[13px] text-muted-foreground leading-relaxed mt-2.5 max-w-3xl font-sans">
          SONORA is a music player that demonstrates how classic data structures work in a real application.
          It uses a FIFO playback queue implemented using linked nodes to manage the order of tracks,
          and a separate doubly linked list to store media records and support traversal in both directions.
        </p>
      </div>

      {/* 2. How It Works Section */}
      <div className="flex-1 min-h-0 flex flex-col justify-between">
        <div className="flex items-center gap-1.5 text-accent text-[11px] font-mono font-bold uppercase tracking-wider mb-2 xl:mb-3">
          <span className="w-1 h-3 rounded-full bg-accent inline-block" />
          <span>HOW IT WORKS</span>
        </div>

        {/* 3. Two-Column Interactive Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 xl:gap-4 flex-1 min-h-0">
          {/* Card 1: Playback Queue */}
          <div className="bg-surface border border-border rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-2xs">
            <div>
              {/* Card Title Row */}
              <div className="flex items-baseline gap-3">
                <span className="text-2xl sm:text-3xl font-black font-mono text-accent/80">
                  01
                </span>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-foreground leading-tight">
                    Playback Queue
                  </h2>
                  <p className="text-[10px] font-mono uppercase tracking-wider text-muted font-semibold mt-0.5">
                    FIFO USING LINKED NODES
                  </p>
                </div>
              </div>

              {/* Card Description */}
              <p className="text-xs text-muted leading-relaxed mt-2.5">
                Tracks are added at the rear and removed from the front, following First In, First Out (FIFO).
              </p>

              {/* Visual Diagram Box */}
              <div className="my-3 xl:my-4 p-3.5 sm:p-4 rounded-xl bg-surface-alt/50 border border-border-subtle flex flex-col items-center justify-center">
                <div className="flex items-center justify-center gap-1.5 sm:gap-2">
                  {/* Song A with FRONT pointer */}
                  <div className="flex flex-col items-center">
                    <span className="text-[9px] font-mono font-bold text-accent tracking-wider leading-none mb-0.5">
                      FRONT
                    </span>
                    <span className="text-[11px] text-accent font-bold leading-none mb-1">
                      ↓
                    </span>
                    <div className="px-2.5 sm:px-3 py-1.5 rounded-lg border border-accent/40 bg-accent/15 text-foreground text-xs font-mono font-semibold shadow-2xs">
                      Song A
                    </div>
                  </div>

                  {/* Arrow */}
                  <span className="text-muted-foreground text-sm font-bold pt-4">→</span>

                  {/* Song B */}
                  <div className="flex flex-col items-center pt-4">
                    <div className="px-2.5 sm:px-3 py-1.5 rounded-lg border border-accent/40 bg-accent/15 text-foreground text-xs font-mono font-semibold shadow-2xs">
                      Song B
                    </div>
                  </div>

                  {/* Arrow */}
                  <span className="text-muted-foreground text-sm font-bold pt-4">→</span>

                  {/* Song C with REAR pointer */}
                  <div className="flex flex-col items-center">
                    <span className="text-[9px] font-mono font-bold text-accent tracking-wider leading-none mb-0.5">
                      REAR
                    </span>
                    <span className="text-[11px] text-accent font-bold leading-none mb-1">
                      ↓
                    </span>
                    <div className="px-2.5 sm:px-3 py-1.5 rounded-lg border border-accent/40 bg-accent/15 text-foreground text-xs font-mono font-semibold shadow-2xs">
                      Song C
                    </div>
                  </div>

                  {/* Arrow */}
                  <span className="text-muted-foreground text-sm font-bold pt-4">→</span>

                  {/* NULL */}
                  <div className="flex flex-col items-center pt-4">
                    <div className="px-2.5 sm:px-3 py-1.5 rounded-lg bg-surface-sunken/80 border border-border text-muted text-xs font-mono font-semibold">
                      NULL
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Explore Queue Action Button */}
            <button
              type="button"
              onClick={onExploreQueue}
              className="w-full mt-2 py-2.5 px-4 rounded-xl font-mono text-xs font-bold transition-all flex items-center justify-between bg-accent/15 hover:bg-accent/25 text-foreground border border-accent/30 group cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-accent" />
                <span>Explore Queue</span>
              </span>
              <ArrowRight className="w-4 h-4 text-accent transition-transform group-hover:translate-x-1" />
            </button>
          </div>

          {/* Card 2: Doubly Linked List */}
          <div className="bg-surface border border-border rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-2xs">
            <div>
              {/* Card Title Row */}
              <div className="flex items-baseline gap-3">
                <span className="text-2xl sm:text-3xl font-black font-mono text-accent/80">
                  02
                </span>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-foreground leading-tight">
                    Doubly Linked List
                  </h2>
                  <p className="text-[10px] font-mono uppercase tracking-wider text-muted font-semibold mt-0.5">
                    MEDIA RECORDS
                  </p>
                </div>
              </div>

              {/* Card Description */}
              <p className="text-xs text-muted leading-relaxed mt-2.5">
                Each node links to its previous and next node, allowing traversal in both directions.
              </p>

              {/* Visual Diagram Box */}
              <div className="my-3 xl:my-4 p-3.5 sm:p-4 rounded-xl bg-surface-alt/50 border border-border-subtle flex flex-col items-center justify-center">
                <div className="flex items-center justify-center gap-1.5 sm:gap-2">
                  {/* NULL */}
                  <div className="px-2 sm:px-2.5 py-1.5 rounded-lg bg-surface-sunken/80 border border-border text-muted text-xs font-mono font-semibold">
                    NULL
                  </div>

                  {/* Double Arrow */}
                  <span className="text-muted-foreground text-xs font-bold">⇄</span>

                  {/* Song A */}
                  <div className="px-2.5 sm:px-3 py-1.5 rounded-lg border border-accent/40 bg-accent/15 text-foreground text-xs font-mono font-semibold shadow-2xs">
                    Song A
                  </div>

                  {/* Double Arrow */}
                  <span className="text-muted-foreground text-xs font-bold">⇄</span>

                  {/* Song B */}
                  <div className="px-2.5 sm:px-3 py-1.5 rounded-lg border border-accent/40 bg-accent/15 text-foreground text-xs font-mono font-semibold shadow-2xs">
                    Song B
                  </div>

                  {/* Double Arrow */}
                  <span className="text-muted-foreground text-xs font-bold">⇄</span>

                  {/* Song C */}
                  <div className="px-2.5 sm:px-3 py-1.5 rounded-lg border border-accent/40 bg-accent/15 text-foreground text-xs font-mono font-semibold shadow-2xs">
                    Song C
                  </div>

                  {/* Double Arrow */}
                  <span className="text-muted-foreground text-xs font-bold">⇄</span>

                  {/* NULL */}
                  <div className="px-2 sm:px-2.5 py-1.5 rounded-lg bg-surface-sunken/80 border border-border text-muted text-xs font-mono font-semibold">
                    NULL
                  </div>
                </div>
              </div>
            </div>

            {/* Explore Linked List Action Button */}
            <button
              type="button"
              onClick={onExploreLinkedList}
              className="w-full mt-2 py-2.5 px-4 rounded-xl font-mono text-xs font-bold transition-all flex items-center justify-between bg-accent/15 hover:bg-accent/25 text-foreground border border-accent/30 group cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-accent" />
                <span>Explore Linked List</span>
              </span>
              <ArrowRight className="w-4 h-4 text-accent transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
